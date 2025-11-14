// components/overview/MonitoringOverview.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DataTable } from '../data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DownloadOverviewReport } from './DownloadOverviewReport';
import { DownloadTabReport } from './DownloadTabReport';
import { useOverviewData } from '@/hooks/overview/useOverviewData';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

interface MonitoringOverviewProps {
  userRole: 'admin' | 'staff';
  title?: string;
  description?: string;
  showDownloadButton?: boolean;
}

interface GroupedData {
  barangay: string;
  totalRecords: number;
  releasedCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  regularCount: number;
  specialCount: number;
}

export default function MonitoringOverview({
  userRole,
  title = "Senior Citizens Monitoring Overview",
  description = "Comprehensive view of all senior citizen benefit applications, releases, and categories.",
  showDownloadButton = true
}: MonitoringOverviewProps) {
  const [startDate, setStartDate] = useState<string>(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const {
    activeTab,
    setActiveTab,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
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
  } = useOverviewData({ userRole });

  // Filter data by selected date range
  const filteredData = useMemo(() => {
    const filterByDate = (data: any[], dateField: string = 'createdAt') => {
      if (!startDate || !endDate) return data;

      try {
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));

        return data.filter(item => {
          const itemDate = parseISO(item[dateField]);
          return isWithinInterval(itemDate, { start, end });
        });
      } catch (error) {
        console.error('Date filtering error:', error);
        return data;
      }
    };

    return {
      releasedSeniors: filterByDate(releasedSeniors),
      notReleasedSeniors: filterByDate(notReleasedSeniors),
      allApplicantsData: filterByDate(allApplicantsData),
      regularApplications: filterByDate(regularApplications),
      specialApplications: filterByDate(specialApplications)
    };
  }, [releasedSeniors, notReleasedSeniors, allApplicantsData, regularApplications, specialApplications, startDate, endDate]);

  // Group data by barangay
  const barangayGroupedData = useMemo((): GroupedData[] => {
    const groupedMap = new Map<string, GroupedData>();

    [...filteredData.releasedSeniors, ...filteredData.notReleasedSeniors].forEach(senior => {
      const barangay = senior.barangay || 'Unknown';

      if (!groupedMap.has(barangay)) {
        groupedMap.set(barangay, {
          barangay,
          totalRecords: 0,
          releasedCount: 0,
          pendingCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          regularCount: 0,
          specialCount: 0
        });
      }

      const group = groupedMap.get(barangay)!;
      group.totalRecords++;

      if (senior.releasedAt) {
        group.releasedCount++;
      } else {
        group.pendingCount++;
      }

      const latestApp = senior.Applications?.[0];
      if (latestApp) {
        const status = latestApp.status.name;
        const category = latestApp.category?.name;

        if (status === 'APPROVED') group.approvedCount++;
        if (status === 'REJECT') group.rejectedCount++;

        if (category === 'Regular senior citizens') group.regularCount++;
        if (category === 'Special assistance cases') group.specialCount++;
      }
    });

    return Array.from(groupedMap.values()).sort((a, b) => b.totalRecords - a.totalRecords);
  }, [filteredData]);

  // Remove actions column from seniors columns (for display only)
  const sanitizedSeniorColumns = useMemo(() => {
    return seniorColumns.filter(col =>
      !['actions', 'user-actions'].includes((col as any).id || (col as any).accessorKey)
    );
  }, [seniorColumns]);

  // Create barangay summary columns
  const barangayColumns = useMemo(() => [
    {
      accessorKey: 'barangay',
      header: 'Barangay',
      cell: ({ row }: any) => <div className="font-medium">{row.getValue('barangay')}</div>,
    },
    {
      accessorKey: 'totalRecords',
      header: 'Total Records',
      cell: ({ row }: any) => <div className="text-center font-semibold">{row.getValue('totalRecords')}</div>,
    },
    {
      accessorKey: 'releasedCount',
      header: 'Released',
      cell: ({ row }: any) => <div className="text-center text-green-600">{row.getValue('releasedCount')}</div>,
    },
    {
      accessorKey: 'pendingCount',
      header: 'Pending',
      cell: ({ row }: any) => <div className="text-center text-orange-600">{row.getValue('pendingCount')}</div>,
    },
    {
      accessorKey: 'approvedCount',
      header: 'Approved',
      cell: ({ row }: any) => <div className="text-center text-blue-600">{row.getValue('approvedCount')}</div>,
    },
    {
      accessorKey: 'rejectedCount',
      header: 'Rejected',
      cell: ({ row }: any) => <div className="text-center text-red-600">{row.getValue('rejectedCount')}</div>,
    },
    {
      accessorKey: 'regularCount',
      header: 'Regular',
      cell: ({ row }: any) => <div className="text-center">{row.getValue('regularCount')}</div>,
    },
    {
      accessorKey: 'specialCount',
      header: 'Special Cases',
      cell: ({ row }: any) => <div className="text-center">{row.getValue('specialCount')}</div>,
    },
  ], []);

  const handleTabChange = (value: string) => {
    if (value !== activeTab) {
      setGlobalFilter('');
      setColumnFilters([]);
      setIsFilterDropdownOpen(false);
    }
    setActiveTab(value);
  };

  const renderLoadingState = () => (
    <div className="text-center py-10 text-gray-500 flex items-center justify-center">
      <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading data...
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-10 text-red-500">
      Error loading data. Please try again.
    </div>
  );

  const preparedBy = userRole === 'admin' ? 'System Administrator' : 'OSCA Staff';

  return (
    <div className="container mx-auto p-5 rounded-md mt-8 border border-gray-200 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 text-base mt-1">{description}</p>
        </div>

        {showDownloadButton && (
          <div className="flex-shrink-0">
            <DownloadOverviewReport
              releasedData={filteredData.releasedSeniors}
              notReleasedData={filteredData.notReleasedSeniors}
              categoryData={filteredData.allApplicantsData}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Date Range Filter</CardTitle>
          <CardDescription className="text-sm">
            Select the date range for filtering your monitoring data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="w-[180px] sm:w-[160px]"
              />
            </div>
            <span className="hidden sm:inline-block pb-2 text-gray-400 font-semibold">
              to
            </span>
            <div>
              <label className="block text-sm font-medium mb-1.5">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-[180px] sm:w-[160px]"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Showing data from{" "}
            <span className="font-semibold">
              {format(parseISO(startDate), "MMM dd, yyyy")}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {format(parseISO(endDate), "MMM dd, yyyy")}
            </span>
          </p>
        </CardContent>
      </Card>


      <Tabs defaultValue="barangay-summary" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="barangay-summary">Barangay Summary</TabsTrigger>
          <TabsTrigger value="all-applications">All Applications</TabsTrigger>
          <TabsTrigger value="released">Released Benefits</TabsTrigger>
          <TabsTrigger value="pending">Unreleased Benefits</TabsTrigger>
        </TabsList>

        {isLoading ? (
          renderLoadingState()
        ) : hasError ? (
          renderErrorState()
        ) : (
          <>
            <TabsContent value="barangay-summary">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Summary by Barangay ({barangayGroupedData.length})</h2>
                  <p className="text-gray-500 text-sm">Comprehensive overview of senior citizen records grouped by barangay for the selected period.</p>
                </div>
                <DownloadTabReport
                  tabType="barangay-summary"
                  data={barangayGroupedData}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <DataTable
                columns={barangayColumns}
                data={barangayGroupedData}
                filterableColumns={[]}
                globalFilter=""
                setGlobalFilter={() => { }}
                columnFilters={[]}
                setColumnFilters={() => { }}
                isFilterDropdownOpen={false}
                setIsFilterDropdownOpen={() => { }}
                initialVisibleColumns={['barangay', 'totalRecords', 'releasedCount', 'pendingCount', 'approvedCount', 'rejectedCount', 'regularCount', 'specialCount']}
                showColumnVisibility={false}
              />
            </TabsContent>

            <TabsContent value="all-applications">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">All Applications ({filteredData.allApplicantsData.length})</h2>
                  <p className="text-gray-500 text-sm">Complete list of benefit applications for the selected period.</p>
                </div>
                <DownloadTabReport
                  tabType="all-applications"
                  data={filteredData.allApplicantsData}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <DataTable
                columns={applicationColumns}
                data={filteredData.allApplicantsData}
                filterableColumns={filterableApplicationColumns}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                isFilterDropdownOpen={isFilterDropdownOpen}
                setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                initialVisibleColumns={applicationInitialVisibleColumns}
                showColumnVisibility={false}
              />
            </TabsContent>

            <TabsContent value="released">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Released Benefits ({filteredData.releasedSeniors.length})</h2>
                  <p className="text-gray-500 text-sm">Senior citizens who have successfully received their benefits in the selected period.</p>
                </div>
                <DownloadTabReport
                  tabType="released"
                  data={filteredData.releasedSeniors}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <DataTable
                columns={sanitizedSeniorColumns}
                data={filteredData.releasedSeniors}
                filterableColumns={filterableSeniorColumns}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                isFilterDropdownOpen={isFilterDropdownOpen}
                setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                initialVisibleColumns={seniorInitialVisibleColumns.filter(col => !['actions', 'user-actions'].includes(col))}
                showColumnVisibility={false}
              />
            </TabsContent>

            <TabsContent value="pending">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Pending Benefits ({filteredData.notReleasedSeniors.length})</h2>
                  <p className="text-gray-500 text-sm">Senior citizens awaiting benefit release for the selected period.</p>
                </div>
                <DownloadTabReport
                  tabType="pending"
                  data={filteredData.notReleasedSeniors}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <DataTable
                columns={sanitizedSeniorColumns}
                data={filteredData.notReleasedSeniors}
                filterableColumns={filterableSeniorColumns}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                isFilterDropdownOpen={isFilterDropdownOpen}
                setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                initialVisibleColumns={seniorInitialVisibleColumns.filter(col => !['actions', 'user-actions'].includes(col))}
                showColumnVisibility={false}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Prepared by: <span className="font-semibold">{preparedBy}</span> |
          Generated on: <span className="font-semibold">{format(new Date(), 'MMMM dd, yyyy')}</span>
        </p>
      </div>
    </div>
  );
}