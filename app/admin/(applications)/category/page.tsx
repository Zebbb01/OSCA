// src/app/admin/applications/category/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ColumnFiltersState } from '@tanstack/react-table';

import { DataTable } from '@/components/data-table';
import { getApplicantsColumns } from '../applicants/columns';
import { apiService } from '@/lib/axios';
import { BenefitApplicationData } from '@/types/application';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const CategoryPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = (session?.user as any)?.role || 'USER';

  const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'octogenarian', 'nonagenarian', 'centenarian', 'regular'
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);

  const applicantInitialVisibleColumns = [
    'fullname',
    'applied_benefit',
    'senior_category',
    'status',
    'createdAt',
    'documents',
    'actions',
  ];

  const benefitApplicationQuery = useQuery<BenefitApplicationData[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const respData = await apiService.get<BenefitApplicationData[]>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application`
      );
      return respData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const allApplicantsData = benefitApplicationQuery.data ?? [];

  // Filter data based on active tab
  const filteredData = useMemo(() => {
    if (activeTab === 'octogenarian') {
      return allApplicantsData.filter(app => app.category?.name === 'Octogenarian (80-89)');
    } else if (activeTab === 'nonagenarian') {
      return allApplicantsData.filter(app => app.category?.name === 'Nonagenarian (90-99)');
    } else if (activeTab === 'centenarian') {
      return allApplicantsData.filter(app => app.category?.name === 'Centenarian (100+)');
    } else if (activeTab === 'regular') {
      return allApplicantsData.filter(app => !app.category); // No category means regular (below 80)
    }
    return allApplicantsData; // 'all' tab
  }, [activeTab, allApplicantsData]);

  const columns = useMemo(() => {
    return getApplicantsColumns(userRole, sessionStatus);
  }, [userRole, sessionStatus]);

  const filterableColumns = useMemo(() => {
    // Extract unique benefit names
    const benefitOptions = Array.from(new Set(allApplicantsData.map(app => app.benefit.name)))
      .filter(Boolean)
      .map(name => ({ value: name, label: name }));

    // Extract unique category names (for the 'All Applicants' tab's filter)
    const categoryOptions = Array.from(
      new Set(
        allApplicantsData.map(app => app.category?.name || 'Regular (Below 80)')
      )
    ).map(name => ({ value: name, label: name }));

    // Extract unique status names
    const statusOptions = Array.from(new Set(allApplicantsData.map(app => app.status.name)))
      .filter(Boolean)
      .map(name => ({ value: name, label: name }));

    return [
      {
        id: 'applied_benefit',
        title: 'Applied Benefit',
        type: 'select' as const,
        options: benefitOptions,
      },
      {
        id: 'senior_category',
        title: 'Age Category',
        type: 'select' as const,
        options: categoryOptions,
      },
      {
        id: 'status',
        title: 'Status',
        type: 'select' as const,
        options: statusOptions,
      },
    ];
  }, [allApplicantsData]);

  // Helper function to render the DataTable
  const renderDataTable = (dataToDisplay: BenefitApplicationData[]) => {
    return (
      <DataTable
        columns={columns}
        data={dataToDisplay}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        filterableColumns={filterableColumns}
        isFilterDropdownOpen={isFilterDropdownOpen}
        setIsFilterDropdownOpen={setIsFilterDropdownOpen}
        initialVisibleColumns={applicantInitialVisibleColumns}
      />
    );
  };

  return (
    <div className="container mx-auto border-1 border-gray-400 p-5 rounded-md mt-8">
      <div className="flex flex-col justify-center mb-6">
        <h1 className="text-2xl text-gray-600">Senior Citizen Applicants by Age Category</h1>
        <p className="text-gray-500 text-sm">
          View and manage applications categorized by senior citizen age groups.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="regular">Regular (Below 80)</TabsTrigger>
          <TabsTrigger value="octogenarian">Octogenarian (80-89)</TabsTrigger>
          <TabsTrigger value="nonagenarian">Nonagenarian (90-99)</TabsTrigger>
          <TabsTrigger value="centenarian">Centenarian (100+)</TabsTrigger>
        </TabsList>

        {benefitApplicationQuery.isLoading || sessionStatus === 'loading' ? (
          <div className="py-10 text-gray-500 text-lg flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading applications...
          </div>
        ) : benefitApplicationQuery.isError ? (
          <div className="py-10 text-red-500 text-lg text-center">
            Failed to load application data: {benefitApplicationQuery.error.message || 'An unexpected error occurred.'}
          </div>
        ) : filteredData && filteredData.length === 0 ? (
          <div className="py-10 text-gray-400 text-lg text-center">No application records found for this category.</div>
        ) : (
          <>
            <TabsContent value="all">
              {renderDataTable(filteredData)}
            </TabsContent>
            <TabsContent value="regular">
              {renderDataTable(filteredData)}
            </TabsContent>
            <TabsContent value="octogenarian">
              {renderDataTable(filteredData)}
            </TabsContent>
            <TabsContent value="nonagenarian">
              {renderDataTable(filteredData)}
            </TabsContent>
            <TabsContent value="centenarian">
              {renderDataTable(filteredData)}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default CategoryPage;