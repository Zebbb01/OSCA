// components/senior-citizen/ReportPreviewModal.tsx
'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react'; // Assuming you use lucide-react for icons

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  isLoading: boolean;
  fileName: string; // The suggested file name for download
  onDownload: () => void; // Callback function for the download button
  title: string; // Title for the modal
  description: string; // Description for the modal (can change with loading state)
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  isLoading,
  fileName,
  onDownload,
  title,
  description,
}) => {
  // Clean up the Blob URL when the modal closes or component unmounts
  // This is crucial to prevent memory leaks from temporary URLs
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]); // Re-run effect if pdfUrl changes (e.g., new report generated)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl h-[90vh] flex flex-col"> {/* Increased modal size for PDF preview */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
          <DialogDescription>
            {isLoading ? description : "Review the report below. You can download it using the button."}
          </DialogDescription>
        </DialogHeader>

        {/* PDF Viewer Area */}
        <div className="flex-grow flex justify-center items-center bg-gray-100 rounded-md overflow-hidden my-4">
          {isLoading ? (
            <p>Loading PDF preview...</p>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={fileName}
              width="100%"
              height="100%"
              className="border-none"
            />
          ) : (
            <p className="text-red-500">Failed to load PDF preview.</p> // Error message if URL is null
          )}
        </div>

        {/* Download Button */}
        <div className="flex justify-end py-4 border-t">
          <Button
            onClick={onDownload}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading || !pdfUrl} // Disable if still loading or no PDF URL
          >
            <DownloadIcon className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};