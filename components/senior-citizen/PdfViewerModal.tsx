// components\senior-citizen\PdfViewerModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useRef and useCallback
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Seniors } from '@/types/seniors';
import { formatDateTime, formatDateOnly } from '@/utils/format';
import { DownloadIcon } from '@radix-ui/react-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  senior: Seniors;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ isOpen, onClose, senior }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);

  // A ref to store the jsPDF instance if we want to avoid recreating it
  // for both preview and download, though recreating is often simpler for small PDFs.
  // For this example, we'll recreate the doc for download for simplicity,
  // but generating the blob once and using it for both is also an option.

  const generatePdfContent = useCallback(() => {
    if (!senior) return; // Ensure senior data is available before generating

    setIsLoadingPdf(true); // Start loading state
    const doc = new jsPDF();

    doc.setProperties({
      title: `Senior Benefit Receipt - ${senior.firstname} ${senior.lastname}`,
      subject: 'Benefit Distribution Receipt for Senior Citizen',
      author: 'OSCA System',
    });

    const pageMargin = 14;
    const rightAlignX = doc.internal.pageSize.width - pageMargin;
    const labelX = pageMargin;

    let yPos = 20;
    const lineHeight = 5;

    // --- Header ---
    doc.setFontSize(18);
    doc.text('Senior Citizen Benefit Distribution Receipt', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(10);
    doc.text('Date:', labelX, yPos);
    doc.text(formatDateTime(new Date().toISOString()), rightAlignX, yPos, { align: 'right' });
    yPos += 15;

    // Helper function to print a label on left and data on right
    const printLabelAndData = (label: string, data: string | number | null | undefined) => {
      doc.text(label, labelX, yPos);
      doc.text(String(data || 'N/A'), rightAlignX, yPos, { align: 'right' });
      yPos += lineHeight;
    };

    // --- Senior Citizen Details Section ---
    doc.setFontSize(14);
    doc.text('Senior Citizen Details', labelX, yPos);
    yPos += 7;
    doc.setFontSize(10);
    printLabelAndData('Full Name:', `${senior.firstname} ${senior.middlename || ''} ${senior.lastname}`);
    printLabelAndData('OSCA ID:', senior.id);
    printLabelAndData('Birthdate:', formatDateOnly(senior.birthdate));
    printLabelAndData('Gender:', senior.gender);
    printLabelAndData('Address:', `${senior.purok}, ${senior.barangay}`);
    printLabelAndData('Contact No:', senior.contact_no);
    printLabelAndData('Category:', senior.Applications?.[0]?.category?.name);
    yPos += 10;

    // --- Distribution Details Section ---
    const benefitName = senior.Applications?.[0]?.benefit.name || 'N/A';
    const statusName = senior.Applications?.[0]?.status.name || 'N/A';

    doc.setFontSize(14);
    doc.text('Distribution Details', labelX, yPos);
    yPos += 7;
    doc.setFontSize(10);
    printLabelAndData('Release Date:', senior.releasedAt ? formatDateOnly(senior.releasedAt) : 'N/A');
    printLabelAndData('Status:', statusName);
    printLabelAndData('Benefit Type:', benefitName);
    printLabelAndData('Amount:', 'PHP 1,000.00 (Mock Data)');
    yPos += 15;

    // --- Financial Statement Summary Table ---
    doc.setFontSize(14);
    doc.text('Financial Statement Summary', labelX, yPos);
    yPos += 7;

    const tableColumn = ['Item', 'Description', 'Amount', 'Date'];
    const tableRows = [
      ['Initial Balance', 'Starting funds', 'PHP 5,000.00', formatDateOnly(new Date().toISOString())],
      ['Stipend Received', 'Regular monthly benefit', 'PHP 1,000.00', formatDateOnly(senior.releasedAt || new Date().toISOString())],
      ['Current Balance', 'Total funds after distribution', 'PHP 6,000.00', formatDateOnly(new Date().toISOString())],
    ];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: 255,
        fontStyle: 'bold',
      },
      margin: { top: 10, right: pageMargin, bottom: 10, left: pageMargin },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        const pageCount = doc.internal.pages.length;
        doc.text(`Page ${data.pageNumber} of ${pageCount - 1}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text('Note: This is a summary. For detailed statements, please contact the OSCA office.', labelX, yPos);
    yPos += 15;

    // --- Footer ---
    doc.setFontSize(8);
    doc.text('Thank you for your service to the community.', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: 'center' });

    // Output as Blob and create a URL for the iframe
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setIsLoadingPdf(false); // End loading state
  }, [senior, formatDateTime, formatDateOnly]); // Depend on senior and utility functions

  useEffect(() => {
    if (isOpen && senior) {
      generatePdfContent();
    }
  }, [isOpen, senior, generatePdfContent]);

  // Clean up the Blob URL when the component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null); // Reset URL on close
        setIsLoadingPdf(true); // Reset loading state for next open
      }
    };
  }, [pdfBlobUrl]);

  const handleDownloadPdf = () => {
    if (!senior || isLoadingPdf || !pdfBlobUrl) {
      toast.error('PDF not ready for download yet.');
      return;
    }

    // You can recreate the PDF and save it, or use the existing Blob URL
    // For simplicity and to use jsPDF's built-in save, we'll re-generate.
    // If performance is critical for very large PDFs, save the doc instance or use the blob directly.
    const docToDownload = new jsPDF();
    // Re-run the same content generation logic to populate docToDownload
    // (This is a simplified approach. In a real app, you might abstract content creation.)
    // For brevity, I'm omitting the full content recreation here, assuming generatePdfContent
    // would be split into two parts: one to build doc, one to output.
    // The simplest way to download the *exact* previewed PDF is using the blob URL:

    const link = document.createElement('a');
    link.href = pdfBlobUrl;
    link.download = `senior_benefit_receipt_${senior.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!senior) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl h-[90vh] flex flex-col"> {/* Increased modal size */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Senior Benefit Receipt Preview</DialogTitle>
          <DialogDescription>
            {isLoadingPdf
              ? `Generating receipt for ${senior.firstname} ${senior.lastname}...`
              : `Review the receipt below. You can download it using the button.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow flex justify-center items-center bg-gray-100 rounded-md overflow-hidden">
          {isLoadingPdf ? (
            <p>Loading PDF preview...</p> // Simple loading indicator
          ) : pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              title={`Benefit Receipt for ${senior.firstname}`}
              width="100%"
              height="100%"
              className="border-none"
            />
          ) : (
            <p className="text-red-500">Failed to load PDF preview.</p>
          )}
        </div>

        <div className="flex justify-end py-4 border-t mt-4">
          <Button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoadingPdf || !pdfBlobUrl} // Disable if still loading or no PDF URL
          >
            <DownloadIcon className="w-4 h-4" /> Download PDF Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};