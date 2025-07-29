// components/overview/MonitoringOverview.tsx
'use client';

import React from 'react';
import { DataTable } from '../data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DownloadOverviewReport } from './DownloadOverviewReport';
import { useOverviewData } from '@/hooks/overview/useOverviewData'; // Import the new hook

interface MonitoringOverviewProps {
  userRole: 'admin' | 'staff';
  title?: string;
  description?: string;
  showDownloadButton?: boolean;
}

export default function MonitoringOverview({
  userRole,
  title = "Senior Citizens Monitoring Overview",
  description = "Comprehensive view of all senior citizen benefit applications, releases, and categories.",
  showDownloadButton = true
}: MonitoringOverviewProps) {
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
  } = useOverviewData({ userRole }); // Use the hook

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

  return (
    <div className="container mx-auto p-5 rounded-md mt-8 border border-gray-200 shadow-sm">
      {/* Header with Download Button */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 text-base mt-1">{description}</p>
        </div>

        {/* Conditional Download Button */}
        {showDownloadButton && (
          <div className="flex-shrink-0">
            <DownloadOverviewReport
              releasedData={releasedSeniors}
              notReleasedData={notReleasedSeniors}
              categoryData={allApplicantsData}
            />
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="released" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="released">Released Benefits</TabsTrigger>
          <TabsTrigger value="not-released">Pending Benefits</TabsTrigger>
          <TabsTrigger value="all-applications">All Applications</TabsTrigger>
          <TabsTrigger value="regular">Regular Citizens</TabsTrigger>
          <TabsTrigger value="special">Special Cases</TabsTrigger>
        </TabsList>

        {isLoading ? (
          renderLoadingState()
        ) : hasError ? (
          renderErrorState()
        ) : (
          <>
            {/* Released Benefits Tab */}
            <TabsContent value="released">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Released Benefits ({releasedSeniors.length})</h2>
                <p className="text-gray-500 text-sm">Senior citizens who have successfully received their benefits.</p>
              </div>
              {releasedSeniors.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No released benefits found.</div>
              ) : (
                <DataTable
                  columns={seniorColumns}
                  data={releasedSeniors}
                  filterableColumns={filterableSeniorColumns}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                  isFilterDropdownOpen={isFilterDropdownOpen}
                  setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                  initialVisibleColumns={seniorInitialVisibleColumns}
                />
              )}
            </TabsContent>

            {/* Not Released Benefits Tab */}
            <TabsContent value="not-released">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Pending Benefits ({notReleasedSeniors.length})</h2>
                <p className="text-gray-500 text-sm">Senior citizens awaiting benefit release.</p>
              </div>
              {notReleasedSeniors.length === 0 ? (
                <div className="text-center py-10 text-gray-500">All benefits have been released!</div>
              ) : (
                <DataTable
                  columns={seniorColumns}
                  data={notReleasedSeniors}
                  filterableColumns={filterableSeniorColumns}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                  isFilterDropdownOpen={isFilterDropdownOpen}
                  setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                  initialVisibleColumns={seniorInitialVisibleColumns}
                />
              )}
            </TabsContent>

            {/* All Applications Tab */}
            <TabsContent value="all-applications">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">All Applications ({allApplicantsData.length})</h2>
                <p className="text-gray-500 text-sm">Complete list of benefit applications across all categories.</p>
              </div>
              {allApplicantsData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No applications found.</div>
              ) : (
                <DataTable
                  columns={applicationColumns}
                  data={allApplicantsData}
                  filterableColumns={filterableApplicationColumns}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                  isFilterDropdownOpen={isFilterDropdownOpen}
                  setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                  initialVisibleColumns={applicationInitialVisibleColumns}
                />
              )}
            </TabsContent>

            {/* Regular Citizens Tab */}
            <TabsContent value="regular">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Regular Senior Citizens ({regularApplications.length})</h2>
                <p className="text-gray-500 text-sm">Applications from regular senior citizen category.</p>
              </div>
              {regularApplications.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No regular citizen applications found.</div>
              ) : (
                <DataTable
                  columns={applicationColumns}
                  data={regularApplications}
                  filterableColumns={filterableApplicationColumns}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                  isFilterDropdownOpen={isFilterDropdownOpen}
                  setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                  initialVisibleColumns={applicationInitialVisibleColumns}
                />
              )}
            </TabsContent>

            {/* Special Cases Tab */}
            <TabsContent value="special">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Special Assistance Cases ({specialApplications.length})</h2>
                <p className="text-gray-500 text-sm">Applications requiring special assistance.</p>
              </div>
              {specialApplications.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No special assistance cases found.</div>
              ) : (
                <DataTable
                  columns={applicationColumns}
                  data={specialApplications}
                  filterableColumns={filterableApplicationColumns}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  columnFilters={columnFilters}
                  setColumnFilters={setColumnFilters}
                  isFilterDropdownOpen={isFilterDropdownOpen}
                  setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                  initialVisibleColumns={applicationInitialVisibleColumns}
                />
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}