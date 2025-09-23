// components/senior-citizen/PdfViewerModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { addPdfHeaderAndFooter, getContentBoundaries } from '@/utils/pdf-header-footer';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  senior: Seniors;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ isOpen, onClose, senior }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);

  const generatePdfContent = useCallback(async () => {
    if (!senior) return;

    setIsLoadingPdf(true);
    const doc = new jsPDF();

    doc.setProperties({
      title: `Senior Benefit Receipt - ${senior.firstname} ${senior.lastname}`,
      subject: 'Benefit Distribution Receipt for Senior Citizen',
      author: 'OSCA System',
    });

    const boundaries = getContentBoundaries();
    const contentWidth = doc.internal.pageSize.width - boundaries.leftMargin - boundaries.rightMargin;
    const rightAlignX = doc.internal.pageSize.width - boundaries.rightMargin;
    const labelX = boundaries.leftMargin;

    // Add header and footer
    await addPdfHeaderAndFooter({
      doc,
      pageNumber: 1,
      totalPages: 1,
      title: 'Senior Citizen Benefit Distribution Receipt',
      subtitle: `Generated: ${formatDateTime(new Date().toISOString())}`
    });

    let yPos = boundaries.topMargin + 10;
    const lineHeight = 5;

    // Helper function to print a label on left and data on right
    const printLabelAndData = (label: string, data: string | number | null | undefined) => {
      doc.setTextColor(0, 0, 0); // Ensure black text
      doc.setFontSize(10);
      doc.text(label, labelX, yPos);
      doc.text(String(data || 'N/A'), rightAlignX, yPos, { align: 'right' });
      yPos += lineHeight;
    };

    // --- Senior Citizen Details Section ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34); // Green color for section headers
    doc.text('Senior Citizen Details', labelX, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
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
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Distribution Details', labelX, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    printLabelAndData('Release Date:', senior.releasedAt ? formatDateOnly(senior.releasedAt) : 'N/A');
    printLabelAndData('Status:', statusName);
    printLabelAndData('Benefit Type:', benefitName);
    printLabelAndData('Amount:', 'PHP 1,000.00');
    yPos += 15;

    // --- Financial Statement Summary Table ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
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
      margin: { 
        top: boundaries.topMargin, 
        right: boundaries.rightMargin, 
        bottom: boundaries.bottomMargin, 
        left: boundaries.leftMargin 
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Note section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Note: This is a summary. For detailed statements, please contact the OSCA office.', labelX, yPos);
    
    // Thank you message
    yPos += 10;
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your service to the community.', doc.internal.pageSize.width / 2, yPos, { align: 'center' });

    // Output as Blob and create a URL for the iframe
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setIsLoadingPdf(false);
  }, [senior]);

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
        setPdfBlobUrl(null);
        setIsLoadingPdf(true);
      }
    };
  }, [pdfBlobUrl]);

  const handleDownloadPdf = () => {
    if (!senior || isLoadingPdf || !pdfBlobUrl) {
      toast.error('PDF not ready for download yet.');
      return;
    }

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
      <DialogContent className="!max-w-4xl h-[90vh] flex flex-col">
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
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Generating PDF preview...</p>
            </div>
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
            disabled={isLoadingPdf || !pdfBlobUrl}
          >
            <DownloadIcon className="w-4 h-4" /> Download Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};