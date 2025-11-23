// components/senior-citizen/release-action-button.tsx
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
import { Info } from "lucide-react"

interface ReleaseActionButtonProps {
    senior: Seniors;
    queryClient: QueryClient;
    userRole: 'ADMIN' | 'USER';
    showReleaseButton?: boolean;
}

export const ReleaseActionButton: React.FC<ReleaseActionButtonProps> = ({ 
    userRole, 
    senior, 
    queryClient,
    showReleaseButton: showReleaseButtonProp = true
}) => {
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

                // Invalidate all relevant queries
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                queryClient.invalidateQueries({ queryKey: ['notificationStatus'] }); // NEW: Invalidate status
                queryClient.invalidateQueries({ queryKey: ['seniors', updatedSenior.id] });
                queryClient.invalidateQueries({ queryKey: ['seniors'] });
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

    const shouldShowReleaseButton = showReleaseButtonProp && !senior.releasedAt && userRole !== 'USER';
    const shouldShowDownloadButton = senior.releasedAt;

    return (
        <>
            {shouldShowDownloadButton && (
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

            {shouldShowReleaseButton && (
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
                            <AlertDialogTitle className="text-xl text-black">
                                Are you sure you want to mark <span className='font-bold'>{senior.firstname} {senior.lastname}</span> as released?
                            </AlertDialogTitle>

                            <AlertDialogDescription className="mt-4 flex items-start gap-2 text-sm">
                                <Info className="text-red-600 min-w-5 min-h-5" />
                                <span>
                                    This will record the current date and time as the senior's official release.
                                </span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleRelease}
                                disabled={releaseSeniorMutation.isPending}
                            >
                                {releaseSeniorMutation.isPending ? "Releasing..." : "Released"}
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