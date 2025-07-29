// src/app/admin/applications/applicants/components/applicant-action-buttons.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash, FileText } from 'lucide-react';
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
import PrimaryButton from '@/components/ui/primary-button';
import { ListBoxComponent } from '@/components/listbox-component';

import { useFetchCategoryAndStatus } from '@/hooks/use-fetch-category-status';
import { apiService } from '@/lib/axios';
import { Categories, Status } from '@/types/seniors';
import { UpdateCategoryData, UpdateStatusData } from '@/types/application';
import { PUTApiResponse } from '@/types/api';

import { DocumentUploadForm } from './document-upload-form';

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

  // Initialize selectedStatus with the current applicant's status
  // and update it whenever the applicant prop changes.
  const [selectedStatus, setSelectedStatus] = useState<Status>(applicant.status);

  useEffect(() => {
    // This useEffect will run when the `applicant` prop changes.
    // It ensures that `selectedStatus` is always in sync with the `applicant.status`
    // that is passed down, especially after a data re-fetch.
    if (applicant && applicant.status) {
      setSelectedStatus(applicant.status);
    }
  }, [applicant]); // Dependency array: re-run when 'applicant' object reference changes

  // Filter out the "PENDING" status
  const filteredStatus = status?.filter((s) => s.name !== 'PENDING');

  const statusMutation = useMutation({
    mutationFn: async (data: UpdateStatusData) => {
      return await apiService.put<PUTApiResponse>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application/status`, data);
    },
    onSuccess: (resp, variables) => {
      toast.success(resp.msg);
      // Invalidate queries to refetch data for the entire table.
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      // Optimistic update for the specific applicant if you want more immediate feedback
      // (This is an optional addition, invalidateQueries handles the eventual consistency)
      queryClient.setQueryData(['applications'], (oldData: any) => {
        if (!oldData) return [];
        return oldData.map((app: any) =>
          app.id === variables.application_id
            ? { ...app, status: selectedStatus } // Use selectedStatus as it's the new state
            : app
        );
      });

      // Close the dialog after a short delay
      setTimeout(() => {
        setShowUpdateDialog(false);
      }, 100); // Reduced delay for better UX
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
    const updateStatusData: UpdateStatusData = {
      application_id: applicant.id,
      status_id: selectedStatus.id,
    };

    statusMutation.mutate(updateStatusData);
  };

  const onDeleteApplication = () => {
    deleteMutation.mutate(applicant.id);
  };

  return (
    <div className="flex gap-2">
      {/* Update Dialog Trigger */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          onKeyDown={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Update Senior Application</DialogTitle>
            <DialogDescription>
              View category and update status of senior application.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col">
            <h1>Senior Category</h1>
            {isCategoryLoading ? (
              <h1>Loading Categories...</h1>
            ) : (
              <div id="category-display" className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                {/* Display the selected category name or a placeholder if none is set */}
                {applicant.category?.name || 'Not Assigned'}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1>Status</h1>
            {isStatusLoading ? (
              <h1>Loading Status...</h1>
            ) : (
              <ListBoxComponent
                label=""
                options={filteredStatus}
                selected={selectedStatus}
                onChange={setSelectedStatus}
                getLabel={(status) => status?.name ?? ''}
                getKey={(status) => status?.id ?? -1}
              />
            )}
          </div>

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
          onKeyDown={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
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