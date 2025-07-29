// app/admin/senior-citizen/record/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentViewDialog } from '@/components/senior-documents/document-view-dialog';
import { SeniorActionButtons } from '@/components/senior-citizen/senior-action-buttons';
import { ReleaseActionButton } from '@/components/senior-citizen/release-action-button';
import { formatDateOnly, formatDateTime } from '@/utils/format';
import { Seniors } from '@/types/seniors';

// Helper function to truncate text (can be moved to a utils file if used elsewhere)
const truncateText = (text: string | number | null | undefined, limit: number = 20): string | number | null | undefined => {
  if (typeof text === 'string' && text.length > limit) {
    return text.substring(0, limit) + '...';
  }
  return text;
};

// ---
// Column Definitions
// ---

export const getSeniorRecordsColumns = (userRole: string | undefined, status: string): ColumnDef<Seniors>[] => {
  console.log('Current User Role:', userRole);
  if (status === 'loading') {
    return [{
      id: 'loading',
      header: 'Loading...',
      cell: () => 'Loading user data...',
    }];
  }

  const baseColumns: ColumnDef<Seniors>[] = [
    {
      accessorKey: 'fullname',
      header: 'Full Name',
      accessorFn: (row) => [row.firstname, row.middlename, row.lastname].filter(Boolean).join(' '),
      cell: ({ row }) => {
        const { firstname, middlename, lastname } = row.original;
        const fullName = [firstname, middlename, lastname].filter(Boolean).join(' ');
        return <div>{truncateText(fullName)}</div>;
      },
      // Keep filterFn for fullname as it's part of the global filter (client-side)
      filterFn: 'includesString',
    },
    {
      accessorKey: 'contact_no',
      header: 'Contact No.',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      // No filterFn needed here if filtering is only server-side
    },
    {
      accessorKey: 'purok',
      header: 'Purok',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      // REMOVED filterFn: 'equals' -> filtering is handled by API
    },
    {
      accessorKey: 'barangay',
      header: 'Barangay',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      // REMOVED filterFn: 'equals' -> filtering is handled by API
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      // Retain custom filterFn for gender as it expects array and is consistent
      filterFn: (row, columnId, filterValue) => {
        const rowGender = row.getValue(columnId) as string;
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true;
        }
        return (filterValue as string[]).includes(rowGender);
      },
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => truncateText(row.original.remarks?.name || 'N/A'),
      accessorFn: (row) => row.remarks?.name || 'N/A',
      // REMOVED filterFn: 'equals' -> filtering is handled by API
    },

    // --- NEWLY ADDED COLUMNS ---
    {
      accessorKey: 'senior_category',
      header: 'Category',
      cell: ({ row }) => {
        const latestApplication = row.original.Applications?.[0]; // Assuming latest application is at index 0
        const categoryName = latestApplication?.category?.name || 'N/A';

        const categoryStyles: Record<string, string> = {
          'Regular senior citizens': 'bg-green-600 text-white',
          'Special assistance cases': 'bg-yellow-500 text-black', // Changed text to black for yellow background for better contrast
        };

        return (
          <div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-semibold ${categoryStyles[categoryName] || 'bg-gray-400 text-white'
                }`}
            >
              {truncateText(categoryName)}
            </span>
          </div>
        );
      },
      accessorFn: (row) => row.Applications?.[0]?.category?.name || 'N/A', // Ensure this matches your data structure
      filterFn: (row, columnId, filterValue) => { // Adapted for potential array filter from DataTable
        const latestCategoryName = row.original.Applications?.[0]?.category?.name;
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true; // No filter applied, show all
        }
        // Assuming filterValue will be an array like ['Low-income seniors'] from DataTable's select filter
        return (filterValue as string[]).includes(latestCategoryName || '');
      },
    },
    {
      id: 'releaseStatus',
      accessorKey: 'releaseStatus', // Keep accessorKey for easy access if needed
      header: 'Release Status',
      cell: ({ row }) => {
        const releasedAt = row.original.releasedAt;
        const statusText = releasedAt ? 'Released' : 'Not Released';

        const statusStyles: Record<string, string> = {
          'Released': 'bg-green-500 text-white',
          'Not Released': 'bg-red-500 text-white',
        };

        return (
          <div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-semibold ${statusStyles[statusText] || 'bg-gray-400 text-white'
                }`}
            >
              {statusText}
            </span>
          </div>
        );
      },
      // Adjust filterFn for releaseStatus to handle array for consistency with DataTable's single-select logic
      filterFn: (row, columnId, filterValue) => {
        const releasedAt = row.original.releasedAt;
        const status = releasedAt ? 'Released' : 'Not Released';
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true; // No filter applied, show all
        }
        // filterValue should be an array like ['Released'] or ['Not Released']
        return (filterValue as string[]).includes(status);
      },
    },
    {
      id: 'releasedAt',
      accessorKey: 'releasedAt',
      header: 'Released Date',
      cell: ({ row }) => {
        const releasedAt = row.original.releasedAt;
        return releasedAt ? formatDateTime(releasedAt) : 'N/A';
      },
      // No filterFn needed here as this is primarily a display column
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => <div className="text-right">{row.getValue('age')}</div>,
      // No filterFn here if filtering is only server-side, if client-side needed, use 'equals'
    },
    {
      accessorKey: 'emergency_no',
      header: 'Emergency Contact',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      // No filterFn here if filtering is only server-side
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      // REMOVED filterFn: 'equals' -> filtering is handled by API
    },
    {
      accessorKey: 'birthdate',
      header: 'Birthdate',
      cell: ({ row }) => formatDateOnly(row.getValue('birthdate')),
      // No filterFn here if filtering is only server-side, if client-side needed, use 'includesString' for dates
    },
    {
      id: 'documents',
      header: 'Documents',
      cell: ({ row }) => {
        const senior = row.original;
        return <DocumentViewDialog senior={senior} />;
      },
    },
    // --- END NEWLY ADDED COLUMNS ---
  ];


  if (userRole === 'ADMIN' || userRole === 'USER') {
    baseColumns.push({
      id: 'user-actions',
      header: 'Actions',
      cell: ({ row }) => {
        const senior = row.original;
        const queryClient = useQueryClient();
        // Find the latest application for the senior
        const latestApplication = senior.Applications?.[0]; // Assuming applications are ordered by createdAt DESC

        // Check the status of the latest application
        const applicationStatus = latestApplication?.status?.name;
        const showReleaseButton = applicationStatus === 'APPROVED' || applicationStatus === 'REJECT';

        return (
          <div className="flex gap-2">
            <SeniorActionButtons senior={senior} queryClient={queryClient} userRole={userRole} />
            {showReleaseButton && <ReleaseActionButton userRole={userRole} senior={senior} queryClient={queryClient} />}
          </div>
        );
      },
    });
  }

  return baseColumns;
};