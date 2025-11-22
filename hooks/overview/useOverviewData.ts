// hooks/overview/useOverviewData.ts
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ColumnFiltersState } from '@tanstack/react-table';

import { apiService } from '@/lib/axios';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';
import { getSeniorRecordsColumns } from '@/app/admin/(senior-citizen)/record/columns';
import { getApplicantsColumns } from '@/app/admin/(applications)/applicants/columns';

interface UseOverviewDataProps {
  userRole: 'admin' | 'staff';
  hideAdminActions?: boolean;
}

export const useOverviewData = ({ userRole, hideAdminActions = false }: UseOverviewDataProps) => {
  const { data: session, status: sessionStatus } = useSession();
  const currentUserRole = (session?.user as any)?.role || 'USER';

  const [activeTab, setActiveTab] = useState<string>('released');
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [globalFilter]);

  const resetFilters = useCallback(() => {
    setGlobalFilter('');
    setDebouncedGlobalFilter('');
    setColumnFilters([]);
    setIsFilterDropdownOpen(false);
  }, []);

  const generateQueryParams = useMemo(() => {
    return (filters: ColumnFiltersState) => {
      const params: any = {};
      filters.forEach(filter => {
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          const value = filter.value[0];

          if (['released', 'pending'].includes(activeTab)) {
            switch (filter.id) {
              case 'gender':
                if (value === 'Male' || value === 'Female') {
                  params.gender = value.toLowerCase();
                }
                break;
              case 'purok':
                params.purok = value;
                break;
              case 'barangay':
                params.barangay = value;
                break;
              case 'remarks':
                params.remarks = value;
                break;
            }
          } else if (['all-applications', 'regular', 'special'].includes(activeTab)) {
            switch (filter.id) {
              case 'applied_benefit':
                params.benefitName = value;
                break;
              case 'senior_category':
                params.categoryName = value;
                break;
              case 'status':
                params.statusName = value;
                break;
            }
          }
        }
      });
      return params;
    };
  }, [activeTab]);

  const currentQueryParams = generateQueryParams(columnFilters);

  const seniorQuery = useQuery<Seniors[]>({
    queryKey: ['seniors', debouncedGlobalFilter, currentQueryParams, userRole],
    queryFn: async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`, window.location.origin);

      if (debouncedGlobalFilter) {
        url.searchParams.append('name', debouncedGlobalFilter);
      }

      Object.entries(currentQueryParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, String(value));
        }
      });

      if (userRole === 'staff') {
        url.searchParams.append('staffView', 'true');
      }

      const response = await apiService.get<Seniors[]>(url.toString());
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const benefitApplicationQuery = useQuery<BenefitApplicationData[]>({
    queryKey: ['applications', debouncedGlobalFilter, currentQueryParams, userRole],
    queryFn: async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application`, window.location.origin);

      if (debouncedGlobalFilter) {
        url.searchParams.append('seniorName', debouncedGlobalFilter);
      }

      Object.entries(currentQueryParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, String(value));
        }
      });

      const respData = await apiService.get<BenefitApplicationData[]>(url.toString());
      return respData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const releasedSeniors = useMemo(() => {
    if (seniorQuery.data) {
      return seniorQuery.data.filter(senior => senior.releasedAt !== null);
    }
    return [];
  }, [seniorQuery.data]);

  const notReleasedSeniors = useMemo(() => {
    if (seniorQuery.data) {
      return seniorQuery.data.filter(senior => senior.releasedAt === null);
    }
    return [];
  }, [seniorQuery.data]);

  const allApplicantsData = benefitApplicationQuery.data ?? [];

  const regularApplications = useMemo(() => {
    return allApplicantsData.filter(app => app.category?.name === 'Regular senior citizens');
  }, [allApplicantsData]);

  const specialApplications = useMemo(() => {
    return allApplicantsData.filter(app => app.category?.name === 'Special assistance cases');
  }, [allApplicantsData]);

  // Pass true as third parameter to show only document icon (no action buttons)
  const seniorColumns = useMemo(() => {
    return getSeniorRecordsColumns(currentUserRole, sessionStatus, true);
  }, [currentUserRole, sessionStatus]);

  const applicationColumns = useMemo(() => {
    return getApplicantsColumns(
      hideAdminActions ? undefined : currentUserRole,
      sessionStatus,
      hideAdminActions
    );
  }, [currentUserRole, sessionStatus, hideAdminActions]);

  const filterableSeniorColumns = useMemo(() => {
    const seniorsData = seniorQuery.data ?? [];

    const uniqueBarangays = Array.from(new Set(seniorsData.map(senior => senior.barangay)))
      .filter(Boolean)
      .sort()
      .map(barangay => ({ value: barangay, label: barangay }));

    const uniquePuroks = Array.from(new Set(seniorsData.map(senior => senior.purok)))
      .filter(Boolean)
      .sort()
      .map(purok => ({ value: purok, label: purok }));

    return [
      { id: 'gender', title: 'Gender', type: 'select' as const, options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] },
      { id: 'purok', title: 'Purok', type: 'select' as const, options: uniquePuroks },
      { id: 'barangay', title: 'Barangay', type: 'select' as const, options: uniqueBarangays },
    ];
  }, [seniorQuery.data]);

  const filterableApplicationColumns = useMemo(() => {
    const benefitOptions = Array.from(new Set(allApplicantsData.map(app => app.benefit?.name)))
      .filter(Boolean)
      .map(name => ({ value: name, label: name }));

    const categoryOptions = Array.from(new Set(allApplicantsData.map(app => app.category?.name || 'N/A')))
      .filter(name => name !== 'N/A')
      .map(name => ({ value: name, label: name }));

    const statusOptions = Array.from(new Set(allApplicantsData.map(app => app.status.name)))
      .filter(Boolean)
      .map(name => ({ value: name, label: name }));

    return [
      { id: 'applied_benefit', title: 'Applied Benefit', type: 'select' as const, options: benefitOptions },
      { id: 'senior_category', title: 'Category', type: 'select' as const, options: categoryOptions },
      { id: 'status', title: 'Status', type: 'select' as const, options: statusOptions },
    ];
  }, [allApplicantsData]);

  const seniorInitialVisibleColumns = [
    'fullname', 'contact_no', 'barangay', 'purok', 'gender', 'senior_category', 'benefits', 'releaseStatus', 'documents'
  ];

  const applicationInitialVisibleColumns = [
    'fullname', 'applied_benefit', 'senior_category', 'status', 'createdAt', 'actions'
  ];

  const isLoading = seniorQuery.isLoading || benefitApplicationQuery.isLoading || sessionStatus === 'loading';
  const hasError = seniorQuery.isError || benefitApplicationQuery.isError;

  return {
    activeTab,
    setActiveTab,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    resetFilters,
    releasedSeniors,
    notReleasedSeniors,
    allApplicantsData,
    regularApplications,
    specialApplications,
    seniorColumns,
    applicationColumns,
    filterableSeniorColumns,
    filterableApplicationColumns,
    seniorInitialVisibleColumns,
    applicationInitialVisibleColumns,
    isLoading,
    hasError,
  };
};