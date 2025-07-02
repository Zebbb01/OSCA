// src/components/senior-citizen/senior-action-buttons.tsx
'use client';

import React from 'react';
import { QueryClient } from '@tanstack/react-query';
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
import { Trash } from 'lucide-react';
import { Seniors } from '@/types/seniors';
import { useSeniorMutations } from '@/hooks/mutations/use-senior-mutations';
import { SeniorViewDialog } from './SeniorViewDialog';
import { SeniorEditDialog } from './SeniorEditDialog'; // Import the new edit dialog

interface SeniorActionButtonsProps {
  senior: Seniors;
  queryClient: QueryClient;
}

export const SeniorActionButtons: React.FC<SeniorActionButtonsProps> = ({
  senior,
  queryClient
}) => {
  const { deleteSeniorMutation } = useSeniorMutations(queryClient);

  const handleDelete = () => {
    deleteSeniorMutation.mutate(senior.id);
  };

  return (
    <div className="flex gap-2">
      {/* View Dialog */}
      <SeniorViewDialog senior={senior} />

      {/* Edit Dialog - Now using the separate component */}
      <SeniorEditDialog senior={senior} queryClient={queryClient} />

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md bg-background cursor-pointer text-sm ring-offset-background text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Trash className="h-5 w-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the senior record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSeniorMutation.isPending}
            >
              {deleteSeniorMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};