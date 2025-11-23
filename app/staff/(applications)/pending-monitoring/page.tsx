// app\admin\(applications)\pending-monitoring\page.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ColumnFiltersState } from '@tanstack/react-table';

import { DataTable } from '../../../../components/data-table';
import { getSeniorRecordsColumns } from '../../(senior-citizen)/record/columns';
import { apiService } from '@/lib/axios';
import { Seniors } from '@/types/seniors';

interface SeniorQueryParams {
  name?: string;
  gender?: 'male' | 'female';
  purok?: string;
  barangay?: string;
  remarks?: string;
}

const NotReleaseMonitoringPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = (session?.user as any)?.role || 'USER';

  // State for DataTable filtering and visibility
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Debouncing globalFilter
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [globalFilter]);

  // Memoize the columns to prevent unnecessary re-renders of DataTable
  const columns = useMemo(() => {
    return getSeniorRecordsColumns(
      userRole,
      sessionStatus,
      false,               // showDocumentsOnly
      true,                // showReleaseButtonOnlyOnPending - Show release only for pending
      true                 // showReleaseButtonInActions - ENABLE release button feature
    );
  }, [userRole, sessionStatus]);

  // Generate query parameters based on column filters
  const generateQueryParams = useMemo(() => {
    return (filters: ColumnFiltersState): SeniorQueryParams => {
      const params: SeniorQueryParams = {};
      filters.forEach(filter => {
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          const value = filter.value[0];

          switch (filter.id) {
            case 'gender':
              if (value === 'Male' || value === 'Female') {
                params.gender = value.toLowerCase() as 'male' | 'female';
              }
              break;
            case 'purok':
              params.purok = value as string;
              break;
            case 'barangay':
              params.barangay = value as string;
              break;
            case 'remarks':
              params.remarks = value as string;
              break;
          }
        }
      });
      return params;
    };
  }, []);

  const currentQueryParams = generateQueryParams(columnFilters);

  // Fetching all senior records
  const seniorQuery = useQuery<Seniors[]>({
    queryKey: ['seniors', debouncedGlobalFilter, currentQueryParams],
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

      console.log('Fetching pending seniors with URL:', url.toString());
      const response = await apiService.get<Seniors[]>(url.toString());
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Filter the data for 'Not Received' seniors (client-side filtering)
  // Exclude seniors with rejected benefits
  const notReceivedSeniors = useMemo(() => {
    if (seniorQuery.data) {
      return seniorQuery.data.filter(senior => {
        // Check if senior has not been released
        if (senior.releasedAt !== null) {
          return false;
        }
        
        // Check if the latest application status is not REJECT
        const latestApplication = senior.Applications?.[0];
        const applicationStatus = latestApplication?.status?.name;
        
        // Exclude if status is REJECT
        if (applicationStatus === 'REJECT') {
          return false;
        }
        
        return true;
      });
    }
    return [];
  }, [seniorQuery.data]);

  // Define filterable columns for this DataTable
  const filterableNotReleasedColumns = useMemo(() => {
    const seniorsData = seniorQuery.data ?? [];

    const uniqueBarangays = Array.from(new Set(seniorsData.map(senior => senior.barangay)))
      .filter(Boolean)
      .sort()
      .map(barangay => ({ value: barangay, label: barangay }));

    const uniquePuroks = Array.from(new Set(seniorsData.map(senior => senior.purok)))
      .filter(Boolean)
      .sort()
      .map(purok => ({ value: purok, label: purok }));

    const uniqueRemarks = Array.from(new Set(seniorsData.map(senior => senior.remarks?.name)))
      .filter(Boolean)
      .sort()
      .map(remark => ({ value: remark, label: remark }));

    return [
      { id: 'gender', title: 'Gender', type: 'select' as const, options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }] },
      { id: 'purok', title: 'Purok', type: 'select' as const, options: uniquePuroks },
      { id: 'barangay', title: 'Barangay', type: 'select' as const, options: uniqueBarangays },
    ];
  }, [seniorQuery.data]);

  // Define initial visible columns for this DataTable
  const initialVisibleNotReleasedColumns = useMemo(() => {
    return [
      'fullname',
      'contact_no',
      'barangay',
      'purok',
      'gender',
      'senior_category',
      'releaseStatus',
      'benefits',
      'documents',
      'user-actions',
    ];
  }, []);

  return (
    <div className="container mx-auto p-5 rounded-md mt-8 border border-gray-200 shadow-sm">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pending Benefits of Releasing</h1>
        <p className="text-gray-600 text-base mt-1">
          View all senior citizens who have not yet released their benefits.
        </p>
      </div>

      {seniorQuery.isLoading || sessionStatus === 'loading' ? (
        <div className="text-center py-10 text-gray-500 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 mr-3 text-green-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Senior Records...
        </div>
      ) : seniorQuery.isError ? (
        <div className="text-center py-10 text-red-500">
          Error loading records: {seniorQuery.error?.message || 'An unexpected error occurred.'}
        </div>
      ) : notReceivedSeniors.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No pending benefits for release. All approved seniors have received their benefits or are awaiting approval!
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={notReceivedSeniors}
          filterableColumns={filterableNotReleasedColumns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          isFilterDropdownOpen={isFilterDropdownOpen}
          setIsFilterDropdownOpen={setIsFilterDropdownOpen}
          initialVisibleColumns={initialVisibleNotReleasedColumns}
        />
      )}
    </div>
  );
};

export default NotReleaseMonitoringPage;