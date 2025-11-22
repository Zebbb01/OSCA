// components/applicants/applicant-action-buttons.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PrimaryButton from '@/components/ui/primary-button';
import { ListBoxComponent } from '@/components/listbox-component';

import { useFetchCategoryAndStatus } from '@/hooks/use-fetch-category-status';
import { apiService } from '@/lib/axios';
import { Status } from '@/types/seniors';
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

  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
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

  // Filter out the "PENDING" status for the update dialog
  const filteredStatus = status?.filter((s) => s.name !== 'PENDING');

  // Check if selected status is "REJECTED" or "REJECT"
  const isRejectedStatus = selectedStatus?.name === 'REJECTED' || selectedStatus?.name === 'REJECT';

  // Mutation for updating status
  const statusMutation = useMutation({
    mutationFn: async (data: { application_id: number; status_id: number; rejectionReason?: string }) => {
      return await apiService.put<PUTApiResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application/status`,
        data
      );
    },
    onSuccess: (resp, variables) => {
      toast.success(resp.msg);
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      // Update local cache
      queryClient.setQueryData(['applications'], (oldData: any) => {
        if (!oldData) return [];
        return oldData.map((app: any) =>
          app.id === variables.application_id
            ? { ...app, status: selectedStatus, rejectionReason: variables.rejectionReason }
            : app
        );
      });

      // Close all dialogs and reset state
      setShowRejectDialog(false);
      setShowApproveDialog(false);
      setShowUpdateDialog(false);
      setRejectionReason('');
      setShowRejectionError(false);
    },
    onError: (error) => {
      toast.error('Error updating status, please try again!');
      console.error('Error updating status:', error);
    },
  });

  const handleApprove = async () => {
    try {
      const statusResponse = await apiService.get<Array<{ id: number; name: string }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application/status`
      );
      
      const approvedStatus = statusResponse.find((s) => s.name === 'APPROVED');
      
      if (!approvedStatus) {
        toast.error('Approved status not found in system');
        return;
      }

      // Update the selected status to APPROVED
      const approvedStatusObj = status?.find((s) => s.name === 'APPROVED');
      if (approvedStatusObj) {
        setSelectedStatus(approvedStatusObj);
      }

      statusMutation.mutate({
        application_id: applicant.id,
        status_id: approvedStatus.id,
      });
    } catch (error) {
      toast.error('Failed to fetch status information');
      console.error('Error fetching status:', error);
    }
  };

  const handleReject = async () => {
    try {
      const statusResponse = await apiService.get<Array<{ id: number; name: string }>>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application/status`
      );
      
      const rejectedStatus = statusResponse.find((s) => s.name === 'REJECT' || s.name === 'REJECTED');
      
      if (!rejectedStatus) {
        toast.error('Rejected status not found in system');
        return;
      }

      // Update the selected status to REJECTED
      const rejectedStatusObj = status?.find((s) => s.name === 'REJECT' || s.name === 'REJECTED');
      if (rejectedStatusObj) {
        setSelectedStatus(rejectedStatusObj);
      }

      statusMutation.mutate({
        application_id: applicant.id,
        status_id: rejectedStatus.id,
        rejectionReason: rejectionReason.trim() || undefined,
      });
    } catch (error) {
      toast.error('Failed to fetch status information');
      console.error('Error fetching status:', error);
    }
  };

  const onUpdateApplication = () => {
    // Validate rejection reason if status is REJECTED
    if (isRejectedStatus && !rejectionReason.trim()) {
      setShowRejectionError(true);
      toast.error('Please provide a reason for rejection');
      return;
    }

    const updateStatusData: { application_id: number; status_id: number; rejectionReason?: string } = {
      application_id: applicant.id,
      status_id: selectedStatus.id,
    };

    // Add rejection reason if status is REJECTED
    if (isRejectedStatus) {
      updateStatusData.rejectionReason = rejectionReason.trim();
    }

    statusMutation.mutate(updateStatusData);
  };

  const currentStatus = applicant.status.name;

  // Show Check/X icons only for PENDING status
  if (currentStatus === 'PENDING') {
    return (
      <div className="flex gap-2">
        {/* Approve Button with Confirmation Dialog */}
        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => setShowApproveDialog(true)}
            title="Approve Application"
          >
            <Check className="w-5 h-5" />
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this application for{' '}
                <span className="font-semibold">
                  {applicant.senior.firstname} {applicant.senior.lastname}
                </span>
                ? This action will mark the application as approved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? 'Approving...' : 'Approve'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Button with Reason Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowRejectDialog(true)}
            title="Reject Application"
          >
            <X className="w-5 h-5" />
          </Button>

          <DialogContent onFocusOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                You are about to reject the application for{' '}
                <span className="font-semibold">
                  {applicant.senior.firstname} {applicant.senior.lastname}
                </span>
                . Please provide a reason (optional).
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2 py-4">
              <Label htmlFor="rejectionReason" className="text-sm font-medium">
                Rejection Reason <span className="text-gray-500">(Optional)</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter the reason for rejection (e.g., 'Missing required documents', 'Does not meet eligibility criteria')"
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) {
                    setShowRejectionError(false);
                  }
                }}
                className={`min-h-[100px] ${
                  showRejectionError && !rejectionReason.trim() ? 'border-red-500' : ''
                }`}
              />
              {showRejectionError && !rejectionReason.trim() && (
                <p className="text-sm text-red-500">Rejection reason is required</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                You can leave this empty if no specific reason needs to be recorded.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                  setShowRejectionError(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? 'Rejecting...' : 'Reject Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show Edit (Pencil) icon for APPROVED or REJECTED status
  if (currentStatus === 'APPROVED' || currentStatus === 'REJECT' || currentStatus === 'REJECTED') {
    return (
      <div className="flex gap-2">
        {/* Update Dialog with Edit Button */}
        <Dialog open={showUpdateDialog} onOpenChange={(open) => {
          setShowUpdateDialog(open);
          if (!open) {
            // Reset to original values when closing
            setSelectedStatus(applicant.status);
            setRejectionReason(applicant.rejectionReason || '');
            setShowRejectionError(false);
          } else {
            // Pre-fill when opening
            setSelectedStatus(applicant.status);
            setRejectionReason(applicant.rejectionReason || '');
          }
        }}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowUpdateDialog(true)}
            title="Edit Application Status"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          <DialogContent onFocusOutside={(e) => e.preventDefault()}>
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
                    if (newStatus.name !== 'REJECTED' && newStatus.name !== 'REJECT') {
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
                <Label htmlFor="rejectionReasonUpdate" className="text-sm font-medium">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReasonUpdate"
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
      </div>
    );
  }

  return null;
};