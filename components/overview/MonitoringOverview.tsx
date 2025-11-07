// components/overview/MonitoringOverview.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DataTable } from '../data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadOverviewReport } from './DownloadOverviewReport';
import { useOverviewData } from '@/hooks/overview/useOverviewData';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, subQuarters, subYears } from 'date-fns';

interface MonitoringOverviewProps {
  userRole: 'admin' | 'staff';
  title?: string;
  description?: string;
  showDownloadButton?: boolean;
}

type TimePeriod = 'monthly' | 'quarterly' | 'annual';

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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(format(new Date(), 'yyyy-MM'));

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

  // Generate period options based on selected time period
  const periodOptions = useMemo(() => {
    const now = new Date();
    const options = [];

    if (timePeriod === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const date = subMonths(now, i);
        options.push({
          value: format(date, 'yyyy-MM'),
          label: format(date, 'MMMM yyyy')
        });
      }
    } else if (timePeriod === 'quarterly') {
      for (let i = 0; i < 8; i++) {
        const date = subQuarters(now, i);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        options.push({
          value: format(date, 'yyyy-') + `Q${quarter}`,
          label: `Q${quarter} ${format(date, 'yyyy')}`
        });
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const date = subYears(now, i);
        options.push({
          value: format(date, 'yyyy'),
          label: format(date, 'yyyy')
        });
      }
    }

    return options;
  }, [timePeriod]);

  // Filter data by selected time period
  const filteredData = useMemo(() => {
    const filterByDate = (data: any[], dateField: string = 'createdAt') => {
      if (!selectedPeriod) return data;

      return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        let startDate: Date;
        let endDate: Date;

        if (timePeriod === 'monthly') {
          const [year, month] = selectedPeriod.split('-');
          startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
          endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));
        } else if (timePeriod === 'quarterly') {
          const [year, quarter] = selectedPeriod.split('-Q');
          const quarterNum = parseInt(quarter);
          const quarterMonth = (quarterNum - 1) * 3;
          startDate = startOfQuarter(new Date(parseInt(year), quarterMonth));
          endDate = endOfQuarter(new Date(parseInt(year), quarterMonth));
        } else {
          startDate = startOfYear(new Date(parseInt(selectedPeriod), 0));
          endDate = endOfYear(new Date(parseInt(selectedPeriod), 0));
        }

        return itemDate >= startDate && itemDate <= endDate;
      });
    };

    return {
      releasedSeniors: filterByDate(releasedSeniors),
      notReleasedSeniors: filterByDate(notReleasedSeniors),
      allApplicantsData: filterByDate(allApplicantsData),
      regularApplications: filterByDate(regularApplications),
      specialApplications: filterByDate(specialApplications)
    };
  }, [releasedSeniors, notReleasedSeniors, allApplicantsData, regularApplications, specialApplications, selectedPeriod, timePeriod]);

  // Group data by barangay
  const barangayGroupedData = useMemo((): GroupedData[] => {
    const groupedMap = new Map<string, GroupedData>();

    // Process seniors data
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

      // Count by category from latest application
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

  // Remove actions column from seniors columns
  const sanitizedSeniorColumns = useMemo(() => {
    return seniorColumns.filter(col => 
      !['actions', 'user-actions'].includes((col as any).id || (col as any).accessorKey)
    );
  }, [seniorColumns]);

  // Remove actions column from application columns  
  const sanitizedApplicationColumns = useMemo(() => {
    return applicationColumns.filter(col => 
      !['actions', 'user-actions'].includes((col as any).id || (col as any).accessorKey)
    );
  }, [applicationColumns]);

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

  // Update selected period when time period changes
  useEffect(() => {
    if (timePeriod === 'monthly') {
      setSelectedPeriod(format(new Date(), 'yyyy-MM'));
    } else if (timePeriod === 'quarterly') {
      const quarter = Math.floor(new Date().getMonth() / 3) + 1;
      setSelectedPeriod(format(new Date(), 'yyyy-') + `Q${quarter}`);
    } else {
      setSelectedPeriod(format(new Date(), 'yyyy'));
    }
  }, [timePeriod]);

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
      {/* Header */}
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
            />
          </div>
        )}
      </div>

      {/* Time Period Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Time Period Selection</CardTitle>
          <CardDescription>Select the time period and specific range for your monitoring overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Period Type</label>
              <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Specific Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs defaultValue="barangay-summary" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="barangay-summary">Barangay Summary</TabsTrigger>
          <TabsTrigger value="all-applications">All Applications</TabsTrigger>
          <TabsTrigger value="released">Released Benefits</TabsTrigger>
          <TabsTrigger value="pending">Unreleased Benefits</TabsTrigger>
          <TabsTrigger value="regular">Regular Citizens</TabsTrigger>
          <TabsTrigger value="special">Special Cases</TabsTrigger>
        </TabsList>

        {isLoading ? (
          renderLoadingState()
        ) : hasError ? (
          renderErrorState()
        ) : (
          <>
            {/* Barangay Summary Tab */}
            <TabsContent value="barangay-summary">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Summary by Barangay ({barangayGroupedData.length})</h2>
                <p className="text-gray-500 text-sm">Comprehensive overview of senior citizen records grouped by barangay for the selected period.</p>
              </div>
              <DataTable
                columns={barangayColumns}
                data={barangayGroupedData}
                filterableColumns={[]}
                globalFilter=""
                setGlobalFilter={() => {}}
                columnFilters={[]}
                setColumnFilters={() => {}}
                isFilterDropdownOpen={false}
                setIsFilterDropdownOpen={() => {}}
                initialVisibleColumns={['barangay', 'totalRecords', 'releasedCount', 'pendingCount', 'approvedCount', 'rejectedCount', 'regularCount', 'specialCount']}
              />
            </TabsContent>

            {/* All Applications */}
            <TabsContent value="all-applications">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">All Applications ({filteredData.allApplicantsData.length})</h2>
                <p className="text-gray-500 text-sm">Complete list of benefit applications for the selected period.</p>
              </div>
              <DataTable
                columns={sanitizedApplicationColumns}
                data={filteredData.allApplicantsData}
                filterableColumns={filterableApplicationColumns}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                isFilterDropdownOpen={isFilterDropdownOpen}
                setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                initialVisibleColumns={applicationInitialVisibleColumns.filter(col => !['actions', 'user-actions'].includes(col))}
              />
            </TabsContent>

            {/* Released Benefits */}
            <TabsContent value="released">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Released Benefits ({filteredData.releasedSeniors.length})</h2>
                <p className="text-gray-500 text-sm">Senior citizens who have successfully received their benefits in the selected period.</p>
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
              />
            </TabsContent>

            {/* Pending Benefits */}
            <TabsContent value="pending">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Pending Benefits ({filteredData.notReleasedSeniors.length})</h2>
                <p className="text-gray-500 text-sm">Senior citizens awaiting benefit release for the selected period.</p>
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
              />
            </TabsContent>

            {/* Regular Citizens */}
            <TabsContent value="regular">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Regular Senior Citizens ({filteredData.regularApplications.length})</h2>
                <p className="text-gray-500 text-sm">Applications from regular senior citizen category for the selected period.</p>
              </div>
              <DataTable
                columns={sanitizedApplicationColumns}
                data={filteredData.regularApplications}
                filterableColumns={filterableApplicationColumns}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                isFilterDropdownOpen={isFilterDropdownOpen}
                setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                initialVisibleColumns={applicationInitialVisibleColumns.filter(col => !['actions', 'user-actions'].includes(col))}
              />
            </TabsContent>

            {/* Special Cases */}
            <TabsContent value="special">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Special Assistance Cases ({filteredData.specialApplications.length})</h2>
                <p className="text-gray-500 text-sm">Applications requiring special assistance for the selected period.</p>
              </div>
              <DataTable
                columns={sanitizedApplicationColumns}
                data={filteredData.specialApplications}
                filterableColumns={filterableApplicationColumns}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                isFilterDropdownOpen={isFilterDropdownOpen}
                setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                initialVisibleColumns={applicationInitialVisibleColumns.filter(col => !['actions', 'user-actions'].includes(col))}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Prepared By Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Prepared by: <span className="font-semibold">{preparedBy}</span> | 
          Generated on: <span className="font-semibold">{format(new Date(), 'MMMM dd, yyyy')}</span>
        </p>
      </div>
    </div>
  );
}
