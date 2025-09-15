// app/admin/senior-citizen/record/columns.tsx
'use client';

import React from 'react'; // Import React for JSX elements in cell
import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentViewDialog } from '@/components/senior-documents/document-view-dialog';
import { SeniorActionButtons } from '@/components/senior-citizen/senior-action-buttons';
import { ReleaseActionButton } from '@/components/senior-citizen/release-action-button';
import { formatDateOnly, formatDateTime } from '@/utils/format';
import { Seniors } from '@/types/seniors';

// Helper function to truncate text (kept for other columns)
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
    {
      accessorKey: 'contact_no',
      header: 'Contact No.',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
    },
    {
      accessorKey: 'purok',
      header: 'Purok',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
    },
    {
      accessorKey: 'barangay',
      header: 'Barangay',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
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
    },

    {
      accessorKey: 'senior_category',
      header: 'Category',
      cell: ({ row }) => {
        const latestApplication = row.original.Applications?.[0]; // Assuming latest application is at index 0
        const categoryName = latestApplication?.category?.name || 'N/A';

        const categoryStyles: Record<string, string> = {
          'Regular senior citizens': 'bg-green-600 text-white',
          'Special assistance cases': 'bg-yellow-500 text-black',
          'Low income assistance': 'bg-blue-500 text-white',
          'Combined assistance cases': 'bg-purple-600 text-white',
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
      accessorFn: (row) => row.Applications?.[0]?.category?.name || 'N/A',
      filterFn: (row, columnId, filterValue) => {
        const latestCategoryName = row.original.Applications?.[0]?.category?.name;
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true;
        }
        return (filterValue as string[]).includes(latestCategoryName || '');
      },
    },
    {
      accessorKey: 'benefits',
      header: 'Benefit(s)',
      cell: ({ row }) => {
        // Grab the latest application (assuming index 0 = latest)
        const latestApplication = row.original.Applications?.[0];
        const benefitName = latestApplication?.benefit?.name;
        const statusName = latestApplication?.status?.name;

        if (!benefitName) return 'N/A';

        let textColorClass = '';
        if (statusName === 'APPROVED') {
          textColorClass = 'text-green-600 font-medium';
        } else if (statusName === 'REJECT') {
          textColorClass = 'text-red-600 font-medium';
        }

        return (
          <span className={textColorClass}>
            {benefitName}
          </span>
        );
      },
      accessorFn: (row) => row.Applications?.[0]?.benefit?.name || 'N/A',
    },

    {
      id: 'releaseStatus',
      accessorKey: 'releaseStatus',
      header: 'Released Status',
      cell: ({ row }) => {
        const releasedAt = row.original.releasedAt;
        const statusText = releasedAt ? 'Released' : 'Unreleased';

        const statusStyles: Record<string, string> = {
          'Released': 'bg-green-500 text-white',
          'Unreleased': 'bg-red-500 text-white',
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
      filterFn: (row, columnId, filterValue) => {
        const releasedAt = row.original.releasedAt;
        const status = releasedAt ? 'Released' : 'Unreleased';
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true;
        }
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
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => <div className="text-right">{row.getValue('age')}</div>,
    },
    {
      accessorKey: 'emergency_no',
      header: 'Emergency Contact',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ cell }) => truncateText(cell.getValue() as string | number | null | undefined),
    },
    {
      accessorKey: 'birthdate',
      header: 'Birthdate',
      cell: ({ row }) => formatDateOnly(row.getValue('birthdate')),
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

  if (userRole === 'ADMIN' || userRole === 'USER') {
    baseColumns.push({
      id: 'user-actions',
      header: 'Actions',
      cell: ({ row }) => {
        const senior = row.original;
        const queryClient = useQueryClient();
        // Find the latest application for the senior
        const latestApplication = senior.Applications?.[0];

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