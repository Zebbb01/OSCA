// app/admin/senior-citizen/record/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query'; // Keep useQueryClient for passing to action components
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
      filterFn: 'includesString',
    },
    // {
    //   accessorKey: 'email',
    //   header: 'Email',
    //   cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
    //   filterFn: 'includesString',
    // },
    {
      accessorKey: 'contact_no',
      header: 'Contact No.',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'barangay',
      header: 'Barangay',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      filterFn: 'equals',
    },
    {
      accessorKey: 'purok',
      header: 'Purok',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      filterFn: 'equals',
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      filterFn: 'equals',
    },
    {
      accessorKey: 'pwd',
      header: 'PWD',
      cell: ({ row }) => (row.original.pwd ? 'Yes' : 'No'),
      filterFn: (row, columnId, filterValue) => {
        const pwdStatus = row.original.pwd ? 'Yes' : 'No';
        return (filterValue as string[]).includes(pwdStatus);
      },
    },
    {
      accessorKey: 'senior_category',
      header: 'Category',
      cell: ({ row }) => {
        const latestApplication = row.original.Applications?.[0];
        const categoryName = latestApplication?.category?.name || 'N/A';

        const categoryStyles: Record<string, string> = {
          'Low-income seniors': 'bg-blue-600 text-white',
          'Regular senior citizens': 'bg-green-600 text-white',
          'Special assistance cases': 'bg-yellow-500 text-white',
        };

        return (
          <div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                categoryStyles[categoryName] || 'bg-gray-400 text-white'
              }`}
            >
              {truncateText(categoryName)}
            </span>
          </div>
        );
      },
      accessorFn: (row) => row.Applications?.[0]?.category?.name || 'N/A',
      filterFn: (row, columnId, value) => {
        const latestCategoryName = row.original.Applications?.[0]?.category?.name;
        return latestCategoryName === value;
      },
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => <div className="text-right">{row.getValue('age')}</div>,
      filterFn: 'equals',
    },
    {
      accessorKey: 'emergency_no',
      header: 'Emergency Contact',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'birthdate',
      header: 'Birthdate',
      cell: ({ row }) => formatDateOnly(row.getValue('birthdate')),
      filterFn: (row, columnId, filterValue) => {
        const date = formatDateOnly(row.getValue(columnId));
        return date.includes(filterValue as string);
      },
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => truncateText(row.original.remarks?.name || 'N/A'),
      accessorFn: (row) => row.remarks?.name || 'N/A',
      filterFn: 'equals',
    },
  {
      id: 'releaseStatus',
      accessorKey: 'releaseStatus',
      header: 'Release Status',
      cell: ({ row }) => {
        const releasedAt = row.original.releasedAt;
        const statusText = releasedAt ? 'Released' : 'Not Released';

        // Define styles for each status
        const statusStyles: Record<string, string> = {
          'Released': 'bg-green-500 text-white',       // Green background for Released
          'Not Released': 'bg-red-500 text-white',     // Red background for Not Released
        };

        return (
          <div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                statusStyles[statusText] || 'bg-gray-400 text-white' // Fallback style
              }`}
            >
              {statusText}
            </span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const releasedAt = row.original.releasedAt;
        const status = releasedAt ? 'Released' : 'Not Released';
        return status === filterValue;
      },
    },
    {
      id: 'releasedAt', 
      accessorKey: 'releasedAt',
      header: 'Released Date',
      cell: ({ row }) => {
        const releasedAt = row.original.releasedAt;
        return releasedAt ? formatDateTime(releasedAt) : 'N/A'; // Changed to 'N/A' as "Release Status" handles the "Not Released"
      },
      filterFn: (row, columnId, filterValue) => {
        const releasedAt = row.original.releasedAt;
        if (!releasedAt && filterValue === 'N/A') return true; // Allows filtering by N/A for this column
        if (releasedAt) {
          const date = formatDateTime(releasedAt);
          return date.includes(filterValue as string);
        }
        return false;
      },
    },
    {
      id: 'documents',
      header: 'Documents',
      cell: ({ row }) => {
        const senior = row.original;
        return <DocumentViewDialog senior={senior} />;
      },
    },
  ];

  // Conditionally add the 'actions' column based on userRole
  if (userRole === 'ADMIN') {
    baseColumns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const senior = row.original;
        const queryClient = useQueryClient();
        return (
          <div className="flex gap-2">
            <SeniorActionButtons senior={senior} queryClient={queryClient} />
          </div>
        );
      },
    });
  }

  if (userRole === 'USER') {
    baseColumns.push({
      id: 'user-actions', // Use a distinct ID for user actions column
      header: 'Actions',
      cell: ({ row }) => {
        const senior = row.original;
        console.log(`Senior ${senior.id} releasedAt:`, senior.releasedAt);
        const queryClient = useQueryClient();
        return (
          <div className="flex gap-2">
            <SeniorActionButtons senior={senior} queryClient={queryClient} />
            <ReleaseActionButton senior={senior} queryClient={queryClient} />
          </div>
        );
      },
    });
  }

  return baseColumns;
};