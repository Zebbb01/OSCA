// src/app/staff/(applications)/applicants/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { formatDateTime } from '@/utils/format';
import { DocumentViewDialog } from '@/components/senior-documents/document-view-dialog';
import { MessageSquare, Trash2 } from 'lucide-react';
import { ApplicantActionButtons } from '@/components/applicants/applicant-action-buttons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const getApplicantsColumns = (
  userRole: string | undefined,
  status: string,
  hideAdminActions: boolean = false
): ColumnDef<any>[] => {
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
      header: 'Name',
      accessorFn: (row) =>
        [row.senior.firstname, row.senior.middlename, row.senior.lastname]
          .filter(Boolean)
          .join(' '),
      cell: ({ row }) => {
        const first = row.original.senior.firstname || '';
        const middle = row.original.senior.middlename || '';
        const last = row.original.senior.lastname || '';
        const fullName = [first, middle, last].filter(Boolean).join(' ');
        return <div className="font-medium">{fullName}</div>;
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
    },
    {
      accessorKey: 'senior_category',
      header: 'Age Category',
      cell: ({ row }) => {
        const category = row.original.category;
        const categoryName = category ? category.name : 'Regular (Below 80)';
        
        // Updated category styles for age-based categories
        const categoryStyles: Record<string, string> = {
          'Octogenarian (80-89)': 'bg-blue-600 text-white',
          'Nonagenarian (90-99)': 'bg-amber-500 text-white',
          'Centenarian (100+)': 'bg-red-600 text-white',
          'Regular (Below 80)': 'bg-green-600 text-white',
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
      accessorFn: (row) => row.category?.name || 'Regular (Below 80)',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status.name;
        const statusStyles: Record<string, string> = {
          PENDING: 'bg-gray-500 text-white',
          APPROVED: 'bg-green-600 text-white',
          REJECT: 'bg-red-600 text-white',
          REJECTED: 'bg-red-600 text-white',
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
      accessorKey: 'createdAt',
      header: 'Applied Date',
      cell: ({ row }) => {
        return formatDateTime(row.getValue('createdAt'));
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const applicant = row.original;
        const seniorDataForDialog = applicant.senior;
        const seniorWithRemarksId = {
          ...seniorDataForDialog,
          remarks_id: applicant.remarks_id ?? null,
        };
        const reason = applicant.rejectionReason;
        const status = applicant.status.name;
        const queryClient = useQueryClient();

        return (
          <div className="flex items-center gap-1">
            {/* View Documents */}
            <DocumentViewDialog senior={seniorWithRemarksId} iconOnly={true} />

            {/* Rejection Reason - Show only if rejected */}
            {(status === 'REJECT' || status === 'REJECTED') && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    title="View Rejection Reason"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rejection Reason</DialogTitle>
                    <DialogDescription>
                      Details about why this application was rejected
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">
                      {reason || 'No reason provided'}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Delete Action (only when hideAdminActions = true and user is ADMIN) */}
            {hideAdminActions && userRole === 'ADMIN' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => console.log('Delete application:', applicant.id)}
                title="Delete Application"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {/* Admin Approve/Reject Actions (Check/X Icons) */}
            {!hideAdminActions && userRole === 'ADMIN' && (
              <ApplicantActionButtons applicant={applicant} queryClient={queryClient} />
            )}
          </div>
        );
      },
    },
  ];

  return baseColumns;
};