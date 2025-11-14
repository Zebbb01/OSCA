// src/app/admin/applications/applicants/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { formatDateTime } from '@/utils/format';
import { DocumentViewDialog } from '@/components/senior-documents/document-view-dialog';
import { MessageSquare } from 'lucide-react';
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
            {/* Documents Icon - Always visible */}
            <DocumentViewDialog senior={seniorWithRemarksId} iconOnly={true} />
            
            {/* Rejection Reason Icon - Only for rejected applications */}
            {(status === 'REJECT' || status === 'REJECTED') && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            
            {/* Admin Actions - Only for admin users */}
            {userRole === 'ADMIN' && (
              <ApplicantActionButtons applicant={applicant} queryClient={queryClient} />
            )}
          </div>
        );
      },
    },
  ];

  return baseColumns;
};