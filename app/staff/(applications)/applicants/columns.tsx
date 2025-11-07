// src/app/admin/applications/applicants/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { formatDateTime } from '@/utils/format';
import { DocumentViewDialog } from '@/components/senior-documents/document-view-dialog';

import { ApplicantActionButtons } from '@/components/applicants/applicant-action-buttons';

export const getApplicantsColumns = (userRole: string | undefined, status: string): ColumnDef<any>[] => {
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
      filterFn: 'includesString', // This is good for global search
    },
    {
      accessorKey: 'applied_benefit',
      header: 'Applied Benefit',
      cell: ({ row }) => {
        const benefit = row.original.benefit.name || '';
        return <div>{benefit}</div>;
      },
      accessorFn: (row) => row.benefit.name,
    },
    {
      accessorKey: 'senior_category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category;
        const categoryName = category ? category.name : 'N/A';
        const categoryStyles: Record<string, string> = {
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
    },
    {
      accessorKey: 'rejectionReason',
      header: 'Rejection Reason',
      cell: ({ row }) => {
        const reason = row.original.rejectionReason;
        const status = row.original.status.name;
        
        // Only show if status is REJECT
        if (status === 'REJECT' || status === 'REJECTED') {
          return (
            <div className="max-w-xs">
              <span className="text-sm text-gray-700">
                {reason || 'No reason provided'}
              </span>
            </div>
          );
        }
        return <span className="text-gray-400 text-sm">N/A</span>;
      },
      accessorFn: (row) => row.rejectionReason || '',
    },
    {
      accessorKey: 'createdAt',
      header: 'Applied Date',
      cell: ({ row }) => {
        return formatDateTime(row.getValue('createdAt'));
      },
    },
  ];

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

  return baseColumns;
};
