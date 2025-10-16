// src/app/admin/applications/applicants/components/applicant-action-buttons.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PrimaryButton from '@/components/ui/primary-button';
import { ListBoxComponent } from '@/components/listbox-component';

import { useFetchCategoryAndStatus } from '@/hooks/use-fetch-category-status';
import { apiService } from '@/lib/axios';
import { Status } from '@/types/seniors';
import { UpdateStatusData } from '@/types/application';
import { PUTApiResponse } from '@/types/api';

interface ApplicantActionButtonsProps {
  applicant: any;
  queryClient: ReturnType<typeof useQueryClient>;
}

export const ApplicantActionButtons: React.FC<ApplicantActionButtonsProps> = ({
  applicant,
  queryClient,
}) => {
  const { categories, status, isCategoryLoading, isStatusLoading } = useFetchCategoryAndStatus();

  const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionError, setShowRejectionError] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(applicant.status);

  useEffect(() => {
    if (applicant && applicant.status) {
      setSelectedStatus(applicant.status);
      // Pre-fill rejection reason if it exists
      if (applicant.rejectionReason) {
        setRejectionReason(applicant.rejectionReason);
      }
    }
  }, [applicant]);

  // Filter out the "PENDING" status
  const filteredStatus = status?.filter((s) => s.name !== 'PENDING');

  // Check if selected status is "REJECTED" or "REJECT"
  const isRejectedStatus = selectedStatus?.name === 'REJECTED' || selectedStatus?.name === 'REJECT';

  const statusMutation = useMutation({
    mutationFn: async (data: UpdateStatusData & { rejectionReason?: string }) => {
      return await apiService.put<PUTApiResponse>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application/status`, data);
    },
    onSuccess: (resp, variables) => {
      toast.success(resp.msg);
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      queryClient.setQueryData(['applications'], (oldData: any) => {
        if (!oldData) return [];
        return oldData.map((app: any) =>
          app.id === variables.application_id
            ? { ...app, status: selectedStatus, rejectionReason: variables.rejectionReason }
            : app
        );
      });

      setRejectionReason('');
      setShowRejectionError(false);
      setTimeout(() => {
        setShowUpdateDialog(false);
      }, 100);
    },
    onError: (error) => {
      toast.error('Error in Updating Status, please try again!');
      console.error('Error updating status:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return await apiService.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application?application_id=${applicationId}`
      );
    },
    onSuccess: () => {
      toast.success('Application deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      toast.error('Error deleting application, please try again!');
      console.error('Error deleting application:', error);
    },
  });

  const onUpdateApplication = () => {
    // Validate rejection reason if status is REJECTED
    if (isRejectedStatus && !rejectionReason.trim()) {
      setShowRejectionError(true);
      toast.error('Please provide a reason for rejection');
      return;
    }

    const updateStatusData: UpdateStatusData & { rejectionReason?: string } = {
      application_id: applicant.id,
      status_id: selectedStatus.id,
    };

    // Add rejection reason if status is REJECTED
    if (isRejectedStatus) {
      updateStatusData.rejectionReason = rejectionReason.trim();
    }

    statusMutation.mutate(updateStatusData);
  };

  const onDeleteApplication = () => {
    deleteMutation.mutate(applicant.id);
  };

  return (
    <div className="flex gap-2">
      {/* Update Dialog Trigger */}
      <Dialog open={showUpdateDialog} onOpenChange={(open) => {
        setShowUpdateDialog(open);
        if (!open) {
          // Reset to original rejection reason when closing
          setRejectionReason(applicant.rejectionReason || '');
          setShowRejectionError(false);
        } else {
          // Pre-fill when opening
          setRejectionReason(applicant.rejectionReason || '');
        }
      }}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          onFocusOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Update Senior Application</DialogTitle>
            <DialogDescription>
              View category and update status of senior application.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label>Senior Category</Label>
            {isCategoryLoading ? (
              <p className="text-sm text-gray-500">Loading Categories...</p>
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                {applicant.category?.name || 'Not Assigned'}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            {isStatusLoading ? (
              <p className="text-sm text-gray-500">Loading Status...</p>
            ) : (
              <ListBoxComponent
                label=""
                options={filteredStatus}
                selected={selectedStatus}
                onChange={(newStatus) => {
                  setSelectedStatus(newStatus);
                  // Reset rejection reason when status changes
                  if (newStatus.name !== 'REJECTED') {
                    setRejectionReason('');
                    setShowRejectionError(false);
                  }
                }}
                getLabel={(status) => status?.name ?? ''}
                getKey={(status) => status?.id ?? -1}
              />
            )}
          </div>

          {/* Rejection Reason Textarea - Only show when REJECTED is selected */}
          {isRejectedStatus && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="rejectionReason" className="text-sm font-medium">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter the reason for rejection (e.g., 'Rejected due to missing ID')"
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) {
                    setShowRejectionError(false);
                  }
                }}
                className={`min-h-[100px] ${showRejectionError && !rejectionReason.trim() ? 'border-red-500' : ''}`}
              />
              {showRejectionError && !rejectionReason.trim() && (
                <p className="text-sm text-red-500">Rejection reason is required</p>
              )}
            </div>
          )}

          <DialogFooter>
            <PrimaryButton
              className={
                statusMutation.isPending
                  ? '!bg-gray-500 text-white'
                  : ''
              }
              disabled={statusMutation.isPending}
              onClick={onUpdateApplication}
            >
              {statusMutation.isPending
                ? 'Updating...'
                : 'Update Status'}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog Trigger */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
            <Trash className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          onKeyDown={(e: React.KeyboardEvent) => e.preventDefault()}
          onFocusOutside={(e: Event) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the senior application. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteApplication}
              className="!bg-red-600 text-white hover:!bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
