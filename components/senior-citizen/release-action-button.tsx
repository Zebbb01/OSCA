// components\senior-citizen\release-action-button.tsx
'use client';

import React, { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Seniors } from '@/types/seniors';
import { useSeniorMutations } from '@/hooks/mutations/use-senior-mutations';
import { PaperPlaneIcon, DownloadIcon } from '@radix-ui/react-icons';
import { PdfViewerModal } from './PdfViewerModal';

interface ReleaseActionButtonProps {
    senior: Seniors;
    queryClient: QueryClient;
    userRole: 'ADMIN' | 'USER';
}

export const ReleaseActionButton: React.FC<ReleaseActionButtonProps> = ({ userRole, senior, queryClient }) => {
    const { releaseSeniorMutation } = useSeniorMutations(queryClient);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [seniorDataForPdf, setSeniorDataForPdf] = useState<Seniors | null>(null);

    const handleRelease = () => {
        if (senior.releasedAt) {
            toast.info('Senior is already marked as released.');
            return;
        }

        releaseSeniorMutation.mutate(senior.id, {
            onSuccess: (updatedSenior) => {
                setSeniorDataForPdf(updatedSenior);
                setShowPdfModal(true);
                toast.success('Senior successfully marked as released!');

                // --- IMPORTANT: Invalidate the notifications query ---
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                // If you also have a query for individual senior details that might
                // be affected, you should invalidate that too.
                queryClient.invalidateQueries({ queryKey: ['seniors', updatedSenior.id] });
                queryClient.invalidateQueries({ queryKey: ['seniors'] }); // Invalidate all seniors list
            },
            onError: (error) => {
                toast.error(`Failed to release senior: ${error.message || 'An unexpected error occurred.'}`);
            },
        });
    };

    const handleDownloadPdf = () => {
        setSeniorDataForPdf(senior);
        setShowPdfModal(true);
    };

    const showReleaseButton = !senior.releasedAt && userRole !== 'ADMIN';
    const showDownloadButton = senior.releasedAt;

    return (
        <>
            {showDownloadButton && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-500 hover:text-blue-600"
                    onClick={handleDownloadPdf}
                    title="Download Benefit Receipt"
                >
                    <DownloadIcon className="w-4 h-4" />
                </Button>
            )}

            {showReleaseButton && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-500 hover:text-orange-600"
                            disabled={releaseSeniorMutation.isPending}
                            title="Release Senior Benefit"
                        >
                            <PaperPlaneIcon className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Release</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to mark <span className='font-semibold'>{senior.firstname} {senior.lastname}</span> as released? This action will record the current date and time as their release date.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRelease} disabled={releaseSeniorMutation.isPending}>
                                {releaseSeniorMutation.isPending ? 'Releasing...' : 'Release Senior'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {showPdfModal && seniorDataForPdf && (
                <PdfViewerModal
                    isOpen={showPdfModal}
                    onClose={() => setShowPdfModal(false)}
                    senior={seniorDataForPdf}
                />
            )}
        </>
    );
};