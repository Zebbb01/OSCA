// components/senior-citizen/reports/download-released-seniors-report.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Seniors } from '@/types/seniors';
import { formatDateTime, formatDateOnly } from '@/utils/format';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal';
import { addPdfHeaderAndFooter, getContentBoundaries } from '@/utils/pdf-header-footer';

interface DownloadReleasedSeniorsReportProps {
  data: Seniors[];
}

export const DownloadReleasedSeniorsReport: React.FC<DownloadReleasedSeniorsReportProps> = ({ data }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const generateAndSetPdfBlob = useCallback(async () => {
    setIsLoadingReport(true);
    setPdfReportUrl(null);

    const releasedSeniors = data.filter(senior => senior.releasedAt);

    if (releasedSeniors.length === 0) {
      alert('No released senior citizen records to generate report.');
      setIsLoadingReport(false);
      setShowReportModal(false);
      return;
    }

    const doc = new jsPDF();

    doc.setProperties({
      title: 'Released Senior Citizens Report',
      subject: 'Report of senior citizens who have been released',
      author: 'Senior Citizen Management System',
    });

    const boundaries = getContentBoundaries();

    // Add header and footer to first page
    await addPdfHeaderAndFooter({
      doc,
      pageNumber: 1,
      totalPages: 1, // Will be updated after table generation
      title: 'Released Senior Citizens Report',
      subtitle: `Report Generated: ${formatDateTime(new Date().toISOString())}`
    });

    let yPos = boundaries.topMargin + 10;

    // Summary section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Summary', boundaries.leftMargin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Released Senior Citizens: ${releasedSeniors.length}`, boundaries.leftMargin, yPos);
    yPos += 5;
    doc.text(`Report Period: All time`, boundaries.leftMargin, yPos);
    yPos += 15;

    // Prepare table headers and data
    const tableColumn = [
      'Full Name',
      'Contact No.',
      'Barangay',
      'Purok',
      'Gender',
      'Category',
      'Benefit Type',
      'Status',
      'Released At',
    ];

    const tableRows = releasedSeniors.map(senior => {
      const fullName = [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ');
      const categoryName = senior.Applications?.[0]?.category?.name || 'N/A';
      const benefitName = senior.Applications?.[0]?.benefit.name || 'N/A';
      const statusName = senior.Applications?.[0]?.status.name || 'N/A';
      const releasedDate = senior.releasedAt ? formatDateTime(senior.releasedAt) : 'N/A';

      return [
        fullName,
        senior.contact_no || 'N/A',
        senior.barangay || 'N/A',
        senior.purok || 'N/A',
        senior.gender || 'N/A',
        categoryName,
        benefitName,
        statusName,
        releasedDate,
      ];
    });

    // Generate table using jspdf-autotable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
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
      margin: { 
        top: boundaries.topMargin, 
        right: boundaries.rightMargin, 
        bottom: boundaries.bottomMargin, 
        left: boundaries.leftMargin 
      },
    });

    // After table generation, add headers/footers to additional pages
    const totalPages = doc.internal.pages.length - 1;
    if (totalPages > 1) {
      // Add headers and footers to pages 2 and beyond
      for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
        doc.setPage(pageNum);
        await addPdfHeaderAndFooter({
          doc,
          pageNumber: pageNum,
          totalPages: totalPages,
          title: 'Released Senior Citizens Report',
          subtitle: 'Continued...'
        });
      }
      
      // Update the first page with correct total page count
      doc.setPage(1);
      await addPdfHeaderAndFooter({
        doc,
        pageNumber: 1,
        totalPages: totalPages,
        title: 'Released Senior Citizens Report',
        subtitle: `Report Generated: ${formatDateTime(new Date().toISOString())}`
      });
    }

    // Output as Blob and create a URL for the iframe preview
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfReportUrl(url);
    setIsLoadingReport(false);
  }, [data]);

  useEffect(() => {
    if (showReportModal) {
      generateAndSetPdfBlob();
    }
  }, [showReportModal, generateAndSetPdfBlob]);

  const handleOpenReportModal = () => {
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setPdfReportUrl(null);
    setIsLoadingReport(true);
  };

  const handleDownloadFromPreview = () => {
    if (pdfReportUrl) {
      const link = document.createElement('a');
      link.href = pdfReportUrl;
      link.download = 'released_senior_citizens_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Report downloaded!');
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

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        pdfUrl={pdfReportUrl}
        isLoading={isLoadingReport}
        fileName="released_senior_citizens_report.pdf"
        onDownload={handleDownloadFromPreview}
        title="Released Senior Citizens Report Preview"
        description={
          isLoadingReport ? 'Generating your report, please wait...' : 'The report is ready for review.'
        }
      />
    </>
  );
};