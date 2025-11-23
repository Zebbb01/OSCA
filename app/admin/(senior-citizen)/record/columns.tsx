// app\admin\(senior-citizen)\record\columns.tsx
'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentViewDialog } from '@/components/senior-documents/document-view-dialog';
import { SeniorActionButtons } from '@/components/senior-citizen/senior-action-buttons';
import { ReleaseActionButton } from '@/components/senior-citizen/release-action-button';
import { formatDateOnly, formatDateTime } from '@/utils/format';
import { Seniors } from '@/types/seniors';

// Helper function to truncate text
const truncateText = (text: string | number | null | undefined, limit: number = 20): string | number | null | undefined => {
  if (typeof text === 'string' && text.length > limit) {
    return text.substring(0, limit) + '...';
  }
  return text;
};

// Helper function to render icons
const renderBenefitStatusIcon = (statusName: string | undefined) => {
  if (statusName === 'APPROVED') {
    return <span className="text-green-600 font-bold text-xl ml-2">✔️</span>;
  }
  if (statusName === 'REJECT') {
    return <span className="text-red-600 font-bold text-xl ml-2">❌</span>;
  }
  return null;
};

export const getSeniorRecordsColumns = (
  userRole: string | undefined,
  status: string,
  showDocumentsOnly: boolean = false,
  showReleaseButtonOnlyOnPending: boolean = false,  // Controls release button visibility
  showReleaseButtonInActions: boolean = false  // NEW: Controls whether to show release button at all
): ColumnDef<Seniors>[] => {
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
        const latestApplication = row.original.Applications?.[0];
        const categoryName = latestApplication?.category?.name || 'N/A';

        const categoryStyles: Record<string, string> = {
          'Regular senior citizens': 'bg-green-600 text-white',
          'Special assistance cases': 'bg-yellow-500 text-white',
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
          <div className="flex items-center">
            <span className={textColorClass}>
              {benefitName}
            </span>
            {renderBenefitStatusIcon(statusName)}
          </div>
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
        const statusText = releasedAt ? 'Released' : 'Pending';

        const statusStyles: Record<string, string> = {
          'Released': 'bg-green-500 text-white',
          'Pending': 'bg-gray-500 text-white',
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
        const status = releasedAt ? 'Released' : 'Pending';
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
      accessorKey: 'documents',
      header: 'Documents',
      cell: ({ row }) => {
        const seniorWithRemarksId = {
          ...row.original,
          remarks_id: row.original.remarks_id ?? null,
        };
        return <DocumentViewDialog senior={seniorWithRemarksId} iconOnly={showDocumentsOnly} />;
      },
    },
  ];

  // Add action buttons only if NOT in documents-only mode
  if (!showDocumentsOnly && (userRole === 'ADMIN' || userRole === 'USER')) {
    baseColumns.push({
      id: 'user-actions',
      header: 'Actions',
      cell: ({ row }) => {
        const senior = row.original;
        const queryClient = useQueryClient();
        const latestApplication = senior.Applications?.[0];
        const applicationStatus = latestApplication?.status?.name;
        
        // Determine if release button should be shown based on pending status
        const isPendingRelease = !senior.releasedAt && 
          (applicationStatus === 'APPROVED' || applicationStatus === 'REJECT');
        
        // Show release button only when:
        // 1. showReleaseButtonInActions is true (enables release button feature on this page)
        // 2. If showReleaseButtonOnlyOnPending is true, only show for pending seniors
        const shouldShowReleaseButton = showReleaseButtonInActions && 
          (showReleaseButtonOnlyOnPending ? isPendingRelease : true);

        return (
          <div className="flex gap-2">
            <SeniorActionButtons senior={senior} queryClient={queryClient} userRole={userRole} />
            <ReleaseActionButton 
              userRole={userRole} 
              senior={senior} 
              queryClient={queryClient}
              showReleaseButton={shouldShowReleaseButton}
            />
          </div>
        );
      },
    });
  }

  return baseColumns;
};