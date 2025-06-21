// src/app/admin/applications/applicants/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { formatDateTime } from '@/utils/format';
import { DocumentViewDialog } from '@/components/senior-documents/document-view-dialog';

import { ApplicantActionButtons } from '@/components/applicants/applicant-action-buttons';

// Change the export to a function that accepts userRole and status
export const getApplicantsColumns = (userRole: string | undefined, status: string): ColumnDef<any>[] => {
  // Handle loading state for columns
  if (status === 'loading') {
    return [{
      id: 'loading',
      header: 'Loading...',
      cell: () => 'Loading user data...',
    }];
  }

  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'fullname',
      header: 'Full Name',
      accessorFn: (row) =>
        [row.senior.firstname, row.senior.middlename, row.senior.lastname]
          .filter(Boolean)
          .join(' '),
      cell: ({ row }) => {
        const first = row.original.senior.firstname || '';
        const middle = row.original.senior.middlename || '';
        const last = row.original.senior.lastname || '';
        const fullName = [first, middle, last].filter(Boolean).join(' ');
        return <div>{fullName}</div>;
      },
      filterFn: 'includesString',
    },
    {
      accessorKey: 'applied_benefit',
      header: 'Applied Benefit',
      cell: ({ row }) => {
        const benefit = row.original.benefit.name || '';
        return <div>{benefit}</div>;
      },
      accessorFn: (row) => row.benefit.name,
      filterFn: 'equals',
    },
    {
      accessorKey: 'senior_category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category;
        const categoryName = category ? category.name : 'N/A';
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
              {categoryName}
            </span>
          </div>
        );
      },
      accessorFn: (row) => row.category?.name || 'N/A',
      filterFn: 'equals',
    },
    {
      id: 'documents',
      accessorKey: 'documents',
      header: 'Documents',
      cell: ({ row }) => {
        const seniorDataForDialog = row.original.senior;
        const seniorWithRemarksId = {
          ...seniorDataForDialog,
          remarks_id: row.original.remarks_id ?? null,
        };
        return <DocumentViewDialog senior={seniorWithRemarksId} />;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status.name;
        const statusStyles: Record<string, string> = {
          PENDING: 'bg-yellow-500 text-white',
          APPROVED: 'bg-green-600 text-white',
          REJECT: 'bg-red-600 text-white',
        };
        return (
          <div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                statusStyles[status] || 'bg-gray-400 text-white'
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
      accessorFn: (row) => row.status.name,
      filterFn: 'equals',
    },
    {
      accessorKey: 'createdAt',
      header: 'Applied Date',
      cell: ({ row }) => {
        return formatDateTime(row.getValue('createdAt'));
      },
      filterFn: (row, columnId, filterValue) => {
        const date = formatDateTime(row.getValue(columnId));
        return date.includes(filterValue as string);
      },
    },
  ];

  // Conditionally add the 'actions' column based on userRole
  if (userRole === 'ADMIN') {
    baseColumns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const applicant = row.original;
        const queryClient = useQueryClient();
        return <ApplicantActionButtons applicant={applicant} queryClient={queryClient} />;
      },
    });
  }

  // If a USER should have different actions, you can add another if condition here
  // For now, based on your request, only ADMINs will see the ApplicantActionButtons
  // assuming 'USER' shouldn't have any actions on applicants.
  // If 'USER' should see some *other* actions, add another 'if (userRole === 'USER')' block
  // with a different set of action components.

  return baseColumns;
};