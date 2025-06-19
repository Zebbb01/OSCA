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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash } from 'lucide-react';
import { Seniors } from '@/types/seniors';
import { useSeniorMutations } from '@/hooks/mutations/use-senior-mutations';
import { SeniorViewDialog } from './SeniorViewDialog'; // Import the new component

interface SeniorActionButtonsProps {
  senior: Seniors;
  queryClient: QueryClient;
}

export const SeniorActionButtons: React.FC<SeniorActionButtonsProps> = ({ 
  senior, 
  queryClient 
}) => {
  const [showEdit, setShowEdit] = React.useState(false);
  const [editData, setEditData] = React.useState({
    email: senior.email,
    contact_no: senior.contact_no,
    emergency_no: senior.emergency_no,
    barangay: senior.barangay,
    purok: senior.purok,
    pwd: senior.pwd,
  });

  const { deleteSeniorMutation, updateSeniorMutation } = useSeniorMutations(queryClient);

  const handleDelete = () => {
    deleteSeniorMutation.mutate(senior.id);
  };

  const handleUpdate = () => {
    updateSeniorMutation.mutate({ id: senior.id, ...editData });
  };

  return (
    <div className="flex gap-2">
      {/* View Dialog - Now using the separate component */}
      <SeniorViewDialog senior={senior} />

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Information</DialogTitle>
            <DialogDescription>
              Update contact and location information of the senior.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="contact_no">Contact Number</Label>
              <Input
                id="contact_no"
                value={editData.contact_no}
                onChange={(e) => setEditData({ ...editData, contact_no: e.target.value })}
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <Label htmlFor="emergency_no">Emergency Contact</Label>
              <Input
                id="emergency_no"
                value={editData.emergency_no}
                onChange={(e) => setEditData({ ...editData, emergency_no: e.target.value })}
                placeholder="Enter emergency contact"
              />
            </div>
            <div>
              <Label htmlFor="barangay">Barangay</Label>
              <Input
                id="barangay"
                value={editData.barangay}
                onChange={(e) => setEditData({ ...editData, barangay: e.target.value })}
                placeholder="Enter barangay"
              />
            </div>
            <div>
              <Label htmlFor="purok">Purok</Label>
              <Input
                id="purok"
                value={editData.purok}
                onChange={(e) => setEditData({ ...editData, purok: e.target.value })}
                placeholder="Enter purok"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="pwd">PWD Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pwd"
                  checked={editData.pwd}
                  onCheckedChange={(checked) => setEditData({ ...editData, pwd: !!checked })}
                />
                <label
                  htmlFor="pwd"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Are you a PWD?
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              onClick={handleUpdate} 
              disabled={updateSeniorMutation.isPending}
            >
              {updateSeniorMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 cursor-pointer">
            <Trash className="w-4 h-4" />
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