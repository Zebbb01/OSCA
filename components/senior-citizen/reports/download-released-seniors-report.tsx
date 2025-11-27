// components/senior-citizen/reports/download-released-seniors-report.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Seniors } from '@/types/seniors';
import { formatDateTime } from '@/utils/format';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal';
import { addPdfHeaderAndFooter, getContentBoundaries, addPreparedBySection } from '@/utils/pdf-header-footer';

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

    if (data.length === 0) {
      alert('No senior citizen records to generate report.');
      setIsLoadingReport(false);
      setShowReportModal(false);
      return;
    }

    const doc = new jsPDF();
    doc.setProperties({
      title: 'Senior Citizens Report',
      subject: 'Report of senior citizens by age category',
      author: 'Senior Citizen Management System',
    });

    const boundaries = getContentBoundaries();
    let currentY = boundaries.topMargin + 10;

    await addPdfHeaderAndFooter({
      doc,
      pageNumber: 1,
      totalPages: 1,
      title: 'Senior Citizens Report',
      subtitle: `Comprehensive Analysis • Generated: ${formatDateTime(new Date().toISOString())}`
    });

    // Executive Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Executive Summary', boundaries.leftMargin, currentY);
    currentY += 10;

    // Group seniors by age-based category
    const seniorsByCategory: Record<string, Seniors[]> = {};
    data.forEach(senior => {
      const categoryName = senior.Applications?.[0]?.category?.name || 'Regular (Below 80)';
      if (!seniorsByCategory[categoryName]) {
        seniorsByCategory[categoryName] = [];
      }
      seniorsByCategory[categoryName].push(senior);
    });

    const regularCount = seniorsByCategory['Regular (Below 80)']?.length || 0;
    const octogenarianCount = seniorsByCategory['Octogenarian (80-89)']?.length || 0;
    const nonagenariCount = seniorsByCategory['Nonagenarian (90-99)']?.length || 0;
    const centenarianCount = seniorsByCategory['Centenarian (100+)']?.length || 0;
    const releasedCount = data.filter(s => s.releasedAt).length;
    const pendingCount = data.filter(s => !s.releasedAt).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const summaryData = [
      `Total Released Benefits: ${releasedCount}`,
      `Total Pending Benefits: ${pendingCount}`,
      `Total Applications: ${data.length}`,
      `Regular Senior Citizens (Below 80): ${regularCount}`,
      `Octogenarian (80-89): ${octogenarianCount}`,
      `Nonagenarian (90-99): ${nonagenariCount}`,
      `Centenarian (100+): ${centenarianCount}`,
    ];

    summaryData.forEach(item => {
      doc.text(item, boundaries.leftMargin, currentY);
      currentY += 5;
    });

    currentY += 15;

    // Sort categories by age order
    const categoryOrder = [
      'Centenarian (100+)',
      'Nonagenarian (90-99)',
      'Octogenarian (80-89)',
      'Regular (Below 80)'
    ];
    
    const sortedCategories = Object.keys(seniorsByCategory).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });

    // Generate table for each category
    for (const catName of sortedCategories) {
      const catSeniors = seniorsByCategory[catName];
      
      if (currentY > 220) {
        doc.addPage();
        currentY = boundaries.topMargin + 10;
      }

      // Add category section title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34);
      doc.text(`${catName}`, boundaries.leftMargin, currentY);
      currentY += 8;

      const tableColumn = [
        'Full Name',
        'Age',
        'Contact No.',
        'Barangay',
        'Purok',
        'Gender',
        'Benefit Type',
        'Status',
        'Registered At',
      ];

      const tableRows = catSeniors.map(senior => {
        const fullName = [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ');
        const benefitName = senior.Applications?.[0]?.benefit.name || 'N/A';
        const statusName = senior.Applications?.[0]?.status.name || 'N/A';
        const dateValue = formatDateTime(senior.createdAt);

        return [
          fullName,
          senior.age || 'N/A',
          senior.contact_no || 'N/A',
          senior.barangay || 'N/A',
          senior.purok || 'N/A',
          senior.gender || 'N/A',
          benefitName,
          statusName,
          dateValue,
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: currentY,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
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
          bottom: boundaries.bottomMargin + 30,
          left: boundaries.leftMargin
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      await addPdfHeaderAndFooter({
        doc,
        pageNumber: i,
        totalPages: totalPages,
        title: 'Senior Citizens Report',
        subtitle: `Age-Based Category Analysis • Generated: ${formatDateTime(new Date().toISOString())}`
      });
    }

    doc.setPage(totalPages);
    addPreparedBySection(doc, 'OSCA Administrator');

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
      link.download = 'senior_citizens_report.pdf';
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
        fileName="senior_citizens_report.pdf"
        onDownload={handleDownloadFromPreview}
        title="Senior Citizens Report Preview"
        description={
          isLoadingReport ? 'Generating your report, please wait...' : 'The report is ready for review.'
        }
      />
    </>
  );
};