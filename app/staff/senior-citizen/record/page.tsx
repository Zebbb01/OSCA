// app\admin\senior-citizen\record\page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react'; // Import useEffect
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useSession } from 'next-auth/react';
import { ColumnFiltersState } from '@tanstack/react-table';

import { DataTable } from '../../../../components/data-table';
import { getSeniorRecordsColumns } from './columns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RegisterFormComponents from '@/components/senior-citizen/registerForm/RegisterForm';
import { UploadMedicalDocumentsForm } from '@/components/senior-documents/medical-documents-form';
import { apiService } from '@/lib/axios';
import { Seniors } from '@/types/seniors';
import { DownloadReleasedSeniorsReport } from '@/components/senior-citizen/download-released-seniors-report';

interface SeniorQueryParams {
  name?: string; // This will now be explicitly for the global search
  gender?: 'male' | 'female';
  purok?: string;
  barangay?: string;
  remarks?: string;
  releaseStatus?: 'Released' | 'Not Released';
}

const RecordPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = (session?.user as any)?.role || 'USER';

  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
  const [showUploadMedicalModal, setShowUploadMedicalModal] = useState<boolean>(false);

  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState(''); // NEW: Debounced state for search

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // NEW: Debounce effect for globalFilter
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [globalFilter]);


  const columns = useMemo(() => {
    return getSeniorRecordsColumns(userRole, sessionStatus);
  }, [userRole, sessionStatus]);

  const generateQueryParams = useMemo(() => {
    return (filters: ColumnFiltersState): SeniorQueryParams => {
      const params: SeniorQueryParams = {};
      filters.forEach(filter => {
        // Keep this logic for column-specific filters
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          const value = filter.value[0]; // Assuming single-select for these filters, adjust if multi-select is needed for API

          switch (filter.id) {
            case 'gender':
              if (value === 'male' || value === 'female') {
                params.gender = value;
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
            case 'releaseStatus':
              if (value === 'Released' || value === 'Not Released') {
                params.releaseStatus = value;
              }
              break;
          }
        }
      });
      return params;
    };
  }, []);

  const currentQueryParams = generateQueryParams(columnFilters);

  const seniorQuery = useQuery<Seniors[]>({
    queryKey: ['seniors', debouncedGlobalFilter, currentQueryParams], // Use debounced filter here
    queryFn: async () => {
      const url = new URL('/api/seniors', window.location.origin);

      if (debouncedGlobalFilter) { // Use debounced filter for API call
        url.searchParams.append('name', debouncedGlobalFilter);
      }

      Object.entries(currentQueryParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, String(value));
        }
      });

      console.log('Fetching seniors with URL:', url.toString());
      const response = await apiService.get<Seniors[]>(url.toString());
      console.log('Fetched seniors data with filters: ', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const isUser = userRole === 'USER';

  const filterableColumns = useMemo(() => {
    const seniorsData = seniorQuery.data ?? [];

    return [
      // Removed 'fullname' as a column filter, it's now handled by global search
      { id: 'gender', title: 'Gender', type: 'select' as const, options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] },
      {
        id: 'purok',
        title: 'Purok',
        type: 'select' as const,
        options: Array.from(new Set(seniorsData.map(s => s.purok))).filter(Boolean).map(purok => ({ value: purok, label: purok }))
      },
      {
        id: 'barangay',
        title: 'Barangay',
        type: 'select' as const,
        options: Array.from(new Set(seniorsData.map(s => s.barangay))).filter(Boolean).map(barangay => ({ value: barangay, label: barangay }))
      },
      {
        id: 'remarks',
        title: 'Remarks',
        type: 'select' as const,
        options: Array.from(new Set(seniorsData.map(s => s.remarks?.name || 'N/A'))).filter(r => r !== 'N/A').map(remark => ({ value: remark, label: remark }))
      },
      { id: 'releaseStatus', title: 'Release Status', type: 'select' as const, options: [{ value: 'Released', label: 'Released' }, { value: 'Not Released', label: 'Not Released' }] },
    ];
  }, [seniorQuery.data]);

  return (
    <div className="container mx-auto p-5 rounded-md mt-8 border border-gray-200 shadow-sm">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Senior Citizen Records</h1>
        <p className="text-gray-600 text-base mt-1">
          Efficiently manage and view comprehensive records of registered senior citizens.
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-8 mb-6">
        {userRole === 'ADMIN' && seniorQuery.data && (
          <DownloadReleasedSeniorsReport data={seniorQuery.data} />
        )}

        {isUser && (
          <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200">
                <FontAwesomeIcon icon={faCirclePlus} className="size-4" />
                Register New
              </Button>
            </DialogTrigger>

            <DialogContent
              onEscapeKeyDown={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
              className="!max-w-3xl overflow-y-auto max-h-[90vh]"
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">Register New Senior Citizen</DialogTitle>
                <DialogDescription>
                  Complete the form below to register a new senior citizen into the system.
                </DialogDescription>
              </DialogHeader>
              <RegisterFormComponents setShowRegistrationModal={setShowRegistrationModal} />
            </DialogContent>
          </Dialog>
        )}

        {isUser && (
          <Button
            onClick={() => setShowUploadMedicalModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faPlus} className="size-4" />
            Upload Medical Documents
          </Button>
        )}

        <UploadMedicalDocumentsForm
          isOpen={showUploadMedicalModal}
          onClose={() => setShowUploadMedicalModal(false)}
        />
      </div>

      {seniorQuery.isLoading || sessionStatus === 'loading' ? (
        <div className="text-center py-10 text-gray-500 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Senior Records...
        </div>
      ) : seniorQuery.isError ? (
        <div className="text-center py-10 text-red-500">
          Error loading records: {seniorQuery.error.message || 'An unexpected error occurred.'}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={seniorQuery.data ?? []}
          globalFilter={globalFilter} // Pass non-debounced filter to DataTable for immediate input update
          setGlobalFilter={setGlobalFilter}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          filterableColumns={filterableColumns}
          isFilterDropdownOpen={isFilterDropdownOpen}
          setIsFilterDropdownOpen={setIsFilterDropdownOpen}
        />
      )}
    </div>
  );
};

export default RecordPage;