'use client';

import React from 'react'; // Import React
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'; // Import ColumnFiltersState
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { apiService } from '@/lib/axios';
import { Seniors } from '@/types/seniors';

// Define columns for the DataTable
const archivedSeniorColumns: ColumnDef<Seniors>[] = [
  {
    accessorKey: 'firstname',
    header: 'First Name',
  },
  {
    accessorKey: 'middlename',
    header: 'Middle Name',
  },
  {
    accessorKey: 'lastname',
    header: 'Last Name',
  },
  {
    accessorKey: 'contact_no',
    header: 'Contact No.',
  },
  {
    accessorKey: 'purok',
    header: 'Purok',
  },
  {
    accessorKey: 'barangay',
    header: 'Barangay',
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
  },
  {
    accessorKey: 'deletedAt',
    header: 'Archived On',
    cell: ({ row }) => {
      const date = row.original.deletedAt ? new Date(row.original.deletedAt) : null;
      return date ? date.toLocaleString() : 'N/A';
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const senior = row.original;
      const queryClient = useQueryClient();

      const restoreMutation = useMutation({
        mutationFn: async (id: number) => {
          await apiService.put(`/api/seniors?id=${id}&action=restore`);
        },
        onSuccess: () => {
          toast.success('Senior record restored successfully.');
          queryClient.invalidateQueries({ queryKey: ['archivedSeniors'] });
          queryClient.invalidateQueries({ queryKey: ['seniors'] });
        },
        onError: (error) => {
          toast.error(`Failed to restore record: ${error.message}`);
        },
      });

      const deletePermanentlyMutation = useMutation({
        mutationFn: async (id: number) => {
          await apiService.delete(`/api/seniors?id=${id}&action=permanent`);
        },
        onSuccess: () => {
          toast.success('Senior record permanently deleted.');
          queryClient.invalidateQueries({ queryKey: ['archivedSeniors'] });
        },
        onError: (error) => {
          toast.error(`Failed to permanently delete record: ${error.message}`);
        },
      });

      return (
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="size-4" /> Restore
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to restore?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will restore the senior record of{' '}
                  <span className="font-semibold">
                    {senior.firstname} {senior.lastname}
                  </span>{' '}
                  to the active records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => restoreMutation.mutate(senior.id)}>
                  Restore
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-800"
              >
                <FontAwesomeIcon icon={faTrashCan} className="size-4" /> Delete Permanently
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the senior record of{' '}
                  <span className="font-semibold">
                    {senior.firstname} {senior.lastname}
                  </span>{' '}
                  from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deletePermanentlyMutation.mutate(senior.id)}>
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];

const ArchivePage = () => {
  // State for DataTable filtering and visibility
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);

  const {
    data: archivedSeniors,
    isLoading,
    isError,
    error,
  } = useQuery<Seniors[]>({
    queryKey: ['archivedSeniors'],
    queryFn: async () => {
      return await apiService.get<Seniors[]>('/api/seniors/archived');
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Define filterable columns for the DataTable
  // You can dynamically generate options if needed, but for now, we'll hardcode some examples.
  const filterableArchivedColumns = React.useMemo(() => [
    {
      id: 'gender',
      title: 'Gender',
      type: 'select' as const, // Use 'as const' for literal type
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
      ],
    },
    {
      id: 'barangay',
      title: 'Barangay',
      type: 'select' as const,
      options: Array.from(new Set((archivedSeniors || []).map(senior => senior.barangay)))
        .filter(Boolean) // Filter out any undefined/null barangays
        .sort()
        .map(barangay => ({ value: barangay, label: barangay })),
    },
    // Add more filterable columns as needed
  ], [archivedSeniors]); // Re-memoize if archivedSeniors changes for dynamic options

  const initialVisibleArchivedColumns = [
    'firstname',
    'lastname',
    'contact_no',
    'purok',
    'barangay',
    'gender',
    'deletedAt',
    'actions'
  ];

  return (
    <div className="container mx-auto p-5 rounded-md mt-8 border border-gray-200 shadow-sm">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Archived Senior Citizen Records</h1>
        <p className="text-gray-600 text-base mt-1">
          View, restore, or permanently delete soft-deleted senior citizen records.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Archived Records...
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Error loading archived records: {error?.message || 'An unexpected error occurred.'}
        </div>
      ) : archivedSeniors && archivedSeniors.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No archived senior citizen records found.</div>
      ) : (
        <DataTable
          columns={archivedSeniorColumns}
          data={archivedSeniors || []}
          filterableColumns={filterableArchivedColumns}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          isFilterDropdownOpen={isFilterDropdownOpen}
          setIsFilterDropdownOpen={setIsFilterDropdownOpen}
          initialVisibleColumns={initialVisibleArchivedColumns}
        />
      )}
    </div>
  );
};

export default ArchivePage;