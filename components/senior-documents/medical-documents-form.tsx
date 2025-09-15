// components\senior-documents\medical-documents-form.tsx:
'use client';

import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/axios';
import { toast } from 'sonner';
import { Seniors } from '@/types/seniors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface UploadMedicalDocumentsFormProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void; // Add this new prop
}

export const UploadMedicalDocumentsForm: React.FC<UploadMedicalDocumentsFormProps> = ({
    isOpen,
    onClose,
    onUploadSuccess, // Destructure the new prop
}) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedSeniorId, setSelectedSeniorId] = useState<string | null>(null);
    const [medicalFiles, setMedicalFiles] = useState<File[]>([]);

    const {
        data: seniors,
        isLoading: isLoadingSeniors,
        isError: isErrorSeniors,
        error: seniorsError,
    } = useQuery<Seniors[]>({
        queryKey: ['allSeniorsForMedicalUpload'],
        queryFn: async () => {
            const response = await apiService.get<Seniors[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`);
            console.log('Seniors response:', response);
            return response.filter((s) => s.firstname && s.lastname);
        },
        staleTime: 10 * 60 * 1000,
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await apiService.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`, formData);
            console.log('Upload response:', res);
            return (res as { data: any }).data;
        },
        onSuccess: () => {
            toast.success('Medical documents uploaded successfully!', {
                description: 'The files have been securely saved for the selected senior.',
            });
            // Invalidate relevant queries to refetch updated data in the main table
            queryClient.invalidateQueries({ queryKey: ['seniors'] });
            queryClient.invalidateQueries({ queryKey: ['seniors-documents'] });
            onUploadSuccess(); // Call the callback from parent
            resetForm();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'An unknown error occurred during upload.';
            toast.error('Failed to upload documents.', {
                description: errorMessage,
            });
            console.error('Upload error:', error);
        },
    });

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setMedicalFiles(Array.from(event.target.files));
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setMedicalFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
        if (fileInputRef.current && medicalFiles.length === 1 && indexToRemove === 0) {
            fileInputRef.current.value = '';
        }
    };

    const resetForm = () => {
        setSelectedSeniorId(null);
        setMedicalFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedSeniorId) {
            toast.error('Validation Error', {
                description: 'Please select a senior citizen from the list.',
            });
            return;
        }
        if (medicalFiles.length === 0) {
            toast.error('Validation Error', {
                description: 'Please select at least one medical document to upload.',
            });
            return;
        }

        const formData = new FormData();
        formData.append('id', selectedSeniorId);
        medicalFiles.forEach((file) => {
            formData.append('medical_assistance', file);
        });

        uploadMutation.mutate(formData);
    };

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold"> Upload Additional Documents</DialogTitle>
                    <DialogDescription>
                        Attach relevant benefit assistance documents for the selected senior citizen.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 items-center gap-2">
                        <Label htmlFor="senior" className="text-sm font-medium text-gray-700">
                            Select Senior Citizen:
                        </Label>
                        <Select
                            onValueChange={setSelectedSeniorId}
                            value={selectedSeniorId || ''}
                            disabled={isLoadingSeniors || uploadMutation.isPending}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={
                                        isLoadingSeniors
                                            ? 'Loading seniors...'
                                            : isErrorSeniors
                                                ? `Error: ${seniorsError?.message || 'Failed to load'}`
                                                : 'Select a senior'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {seniors?.length === 0 && (
                                    <div className="py-2 px-3 text-sm text-gray-500">No seniors available.</div>
                                )}
                                {seniors?.map((senior) => (
                                    <SelectItem key={senior.id} value={String(senior.id)}>
                                        {senior.firstname} {senior.middlename ? senior.middlename + ' ' : ''}
                                        {senior.lastname}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isErrorSeniors && (
                            <p className="text-red-500 text-sm mt-1">
                                Failed to load senior list. Please try again.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="medical_documents" className="text-sm font-medium text-gray-700">
                            Upload Documents:
                        </Label>
                        <Input
                            id="medical_documents"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-green-600 file:text-white hover:file:bg-green-700"
                            disabled={uploadMutation.isPending}
                            ref={fileInputRef}
                        />
                        {medicalFiles.length > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                                <p className="font-semibold mb-1">Selected Files ({medicalFiles.length}):</p>
                                <ul className="space-y-1">
                                    {medicalFiles.map((file, index) => (
                                        <li key={file.name + index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
                                            <span className="flex items-center gap-2 truncate pr-4">
                                                <FontAwesomeIcon icon={faFileAlt} className="text-green-500" />
                                                <span className="truncate">{file.name}</span>
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(index)}
                                                disabled={uploadMutation.isPending}
                                                className="text-gray-400 hover:text-red-500 p-1 h-auto"
                                            >
                                                <FontAwesomeIcon icon={faTimesCircle} className="size-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={uploadMutation.isPending}
                            className="px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                uploadMutation.isPending ||
                                !selectedSeniorId ||
                                medicalFiles.length === 0
                            }
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                            {uploadMutation.isPending ? 'Uploading...' : 'Upload Documents'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};