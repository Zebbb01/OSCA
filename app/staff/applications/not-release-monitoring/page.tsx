// app\admin\applications\not-release-monitoring\page.tsx
'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { DataTable } from '../../../../components/data-table';
import { getSeniorRecordsColumns } from '../../senior-citizen/record/columns'; // Re-use the existing columns
import { apiService } from '@/lib/axios';
import { Seniors } from '@/types/seniors';

const NotReleaseMonitoringPage = () => {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role || 'USER';

  // Fetching all senior records
  const seniorQuery = useQuery<Seniors[]>({
    queryKey: ['seniors'],
    queryFn: async () => {
      const response = await apiService.get<Seniors[]>('/api/seniors');
      // No console.log here as it can be noisy, but kept for debugging if needed.
      // console.log('Fetched seniors data for Not Received Monitoring: ', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Filter the data for 'Not Received' seniors
  const notReceivedSeniors = useMemo(() => {
    if (seniorQuery.data) {
      return seniorQuery.data.filter(senior => senior.releasedAt === null);
    }
    return [];
  }, [seniorQuery.data]);

  // Memoize the columns to prevent unnecessary re-renders of DataTable
  const columns = useMemo(() => {
    return getSeniorRecordsColumns(userRole, status);
  }, [userRole, status]);

  return (
    <div className="container mx-auto p-5 rounded-md mt-8 border border-gray-200 shadow-sm">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Not Received Benefits Monitoring</h1>
        <p className="text-gray-600 text-base mt-1">
          View all senior citizens who have not yet received their benefits.
        </p>
      </div>

      {seniorQuery.isLoading || status === 'loading' ? (
        <div className="text-center py-10 text-gray-500 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
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
        <div className="text-center py-10 text-gray-500">All senior citizens have received their benefits!</div>
      ) : (
        <DataTable columns={columns} data={notReceivedSeniors} />
      )}
    </div>
  );
};

export default NotReleaseMonitoringPage;