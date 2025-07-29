// components\senior-citizen\reports\download-released-seniors-report.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Import necessary hooks
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react'; // Assuming you have lucide-react for icons
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Seniors } from '@/types/seniors';
import { formatDateTime, formatDateOnly } from '@/utils/format';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal'; // Import the new reusable modal

interface DownloadReleasedSeniorsReportProps {
  data: Seniors[]; // The full data set from your table
}

export const DownloadReleasedSeniorsReport: React.FC<DownloadReleasedSeniorsReportProps> = ({ data }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Function to generate the PDF content as a Blob and set its URL for preview
  const generateAndSetPdfBlob = useCallback(() => {
    setIsLoadingReport(true); // Start loading state
    setPdfReportUrl(null); // Clear any previous PDF URL

    const releasedSeniors = data.filter(senior => senior.releasedAt);

    if (releasedSeniors.length === 0) {
      alert('No released senior citizen records to generate report.');
      setIsLoadingReport(false);
      setShowReportModal(false); // Close modal if no data
      return;
    }

    const doc = new jsPDF();

    doc.setProperties({
      title: 'Released Senior Citizens Report',
      subject: 'Report of senior citizens who have been released',
      author: 'Senior Citizen Management System',
    });

    // Add a title
    doc.setFontSize(18);
    doc.text('Released Senior Citizens Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Date Generated: ${formatDateTime(new Date().toISOString())}`, 14, 26);

    // Prepare table headers and data
    const tableColumn = [
      'Full Name',
      'Contact No.',
      'Barangay',
      'Purok',
      'Gender',
      // 'PWD',
      'Category',
      'Benefit Type',
      'Status',
      // 'Birthdate',
      'Released At',
    ];

    const tableRows = releasedSeniors.map(senior => {
      const fullName = [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ');
      const categoryName = senior.Applications?.[0]?.category?.name || 'N/A';
      const benefitName = senior.Applications?.[0]?.benefit.name || 'N/A';
      const statusName = senior.Applications?.[0]?.status.name || 'N/A';
      const releasedDate = senior.releasedAt ? formatDateTime(senior.releasedAt) : 'N/A';
      const pwdStatus = senior.pwd ? 'Yes' : 'No';

      return [
        fullName,
        senior.contact_no || 'N/A',
        senior.barangay || 'N/A',
        senior.purok || 'N/A',
        senior.gender || 'N/A',
        // pwdStatus,
        categoryName,
        benefitName,
        statusName,
        // formatDateOnly(senior.birthdate),
        releasedDate,
      ];
    });

    // Generate table using jspdf-autotable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: 255,
        fontStyle: 'bold',
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: function (data) {
        // Footer - page number
        doc.setFontSize(8);
        const pageCount = doc.internal.pages.length;
        doc.text(`Page ${data.pageNumber} of ${pageCount - 1}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
      }
    });

    // Output as Blob and create a URL for the iframe preview
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfReportUrl(url);
    setIsLoadingReport(false); // End loading state
  }, [data, formatDateTime, formatDateOnly]); // Dependencies for useCallback

  // Effect to generate PDF when the modal opens
  useEffect(() => {
    if (showReportModal) {
      generateAndSetPdfBlob();
    }
  }, [showReportModal, generateAndSetPdfBlob]);

  const handleOpenReportModal = () => {
    setShowReportModal(true);
    // PDF generation will be handled by the useEffect once modal is open
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    // The cleanup of pdfReportUrl is handled inside ReportPreviewModal's useEffect
    // No need to revoke here explicitly, but state reset is good practice
    setPdfReportUrl(null);
    setIsLoadingReport(true); // Reset for next time
  };

  const handleDownloadFromPreview = () => {
    if (pdfReportUrl) {
      // Create a temporary link to trigger download using the blob URL
      const link = document.createElement('a');
      link.href = pdfReportUrl;
      link.download = 'released_senior_citizens_report.pdf'; // Desired file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Report downloaded!'); // You can replace this with a sonner toast if preferred
    } else {
      alert('PDF not available for download.');
    }
  };

  return (
    <>
      <Button onClick={handleOpenReportModal} variant="outline" size="sm" className="h-8">
        <DownloadIcon className="mr-2 h-4 w-4" />
        Download Report
      </Button>

      {/* Render the reusable ReportPreviewModal */}
      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        pdfUrl={pdfReportUrl}
        isLoading={isLoadingReport}
        fileName="released_senior_citizens_report.pdf" // Pass the desired download name
        onDownload={handleDownloadFromPreview}
        title="Released Senior Citizens Report Preview"
        description={
          isLoadingReport ? 'Generating your report, please wait...' : 'The report is ready for review.'
        }
      />
    </>
  );
};