'use client';

import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';
import { formatDateTime } from '@/utils/format';

interface UseOverviewReportProps {
  releasedData: Seniors[];
  notReleasedData: Seniors[];
  categoryData: BenefitApplicationData[];
}

export const useOverviewReport = ({
  releasedData,
  notReleasedData,
  categoryData,
}: UseOverviewReportProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const generateAndSetPdfBlob = useCallback(() => {
    setIsLoadingReport(true);
    setPdfReportUrl(null);

    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: 'Senior Citizens Overview Report',
      subject: 'Comprehensive report of senior citizens benefits monitoring and applications',
      author: 'Senior Citizen Management System',
    });

    // Title Page
    doc.setFontSize(22);
    doc.text('Senior Citizens Overview Report', 14, 25);
    doc.setFontSize(12);
    doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, 14, 35);

    // Summary Statistics
    doc.setFontSize(16);
    doc.text('Executive Summary', 14, 50);
    doc.setFontSize(10);
    doc.text(`Total Released Benefits: ${releasedData.length}`, 14, 60);
    doc.text(`Total Pending Benefits: ${notReleasedData.length}`, 14, 65);
    doc.text(`Total Applications: ${categoryData.length}`, 14, 70);

    const regularApplications = categoryData.filter(app => app.category?.name === 'Regular senior citizens').length;
    const specialApplications = categoryData.filter(app => app.category?.name === 'Special assistance cases').length;

    doc.text(`Regular Senior Citizens Applications: ${regularApplications}`, 14, 75);
    doc.text(`Special Assistance Cases: ${specialApplications}`, 14, 80);

    let currentY = 95;

    // SECTION 1: RELEASED BENEFITS
    if (releasedData.length > 0) {
      doc.setFontSize(16);
      doc.text('Released Benefits Report', 10, currentY);
      currentY += 5;

      const releasedTableColumn = [
        'Full Name',
        'Contact No.',
        'Barangay',
        'Purok',
        'Gender',
        'Category',
        'Benefit Type',
        'Released At',
      ];

      const releasedTableRows = releasedData.map(senior => {
        const fullName = [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ');
        const categoryName = senior.Applications?.[0]?.category?.name || 'N/A';
        const benefitName = senior.Applications?.[0]?.benefit.name || 'N/A';
        const releasedDate = senior.releasedAt ? formatDateTime(senior.releasedAt) : 'N/A';

        return [
          fullName,
          senior.contact_no || 'N/A',
          senior.barangay || 'N/A',
          senior.purok || 'N/A',
          senior.gender || 'N/A',
          categoryName,
          benefitName,
          releasedDate,
        ];
      });

      autoTable(doc, {
        head: [releasedTableColumn],
        body: releasedTableRows,
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
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 20;
    }

    // Add new page for next sections if needed
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    // SECTION 2: NOT RELEASED BENEFITS
    if (notReleasedData.length > 0) {
      doc.setFontSize(16);
      doc.text('Pending Benefits Report', 10, currentY);
      currentY += 5;

      const notReleasedTableColumn = [
        'Full Name',
        'Contact No.',
        'Barangay',
        'Purok',
        'Gender',
        'Category',
        'Benefit Type',
        'Status',
      ];

      const notReleasedTableRows = notReleasedData.map(senior => {
        const fullName = [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ');
        const categoryName = senior.Applications?.[0]?.category?.name || 'N/A';
        const benefitName = senior.Applications?.[0]?.benefit.name || 'N/A';
        const statusName = senior.Applications?.[0]?.status.name || 'N/A';

        return [
          fullName,
          senior.contact_no || 'N/A',
          senior.barangay || 'N/A',
          senior.purok || 'N/A',
          senior.gender || 'N/A',
          categoryName,
          benefitName,
          statusName,
        ];
      });

      autoTable(doc, {
        head: [notReleasedTableColumn],
        body: notReleasedTableRows,
        startY: currentY,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: 255,
          fontStyle: 'bold',
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 20;
    }

    // Add new page for category section if needed
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    // SECTION 3: APPLICATIONS BY CATEGORY
    if (categoryData.length > 0) {
      doc.setFontSize(16);
      doc.text('Applications by Category Report', 10, currentY);
      currentY += 5;

      const categoryTableColumn = [
        'Full Name',
        'Applied Benefit',
        'Category',
        'Status',
        'Application Date',
      ];

      const categoryTableRows = categoryData.map(app => {
        const senior = app.senior;
        const fullName = senior ? [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ') : 'N/A';
        const applicationDate = formatDateTime(app.createdAt);

        return [
          fullName,
          app.benefit.name || 'N/A',
          app.category?.name || 'N/A',
          app.status.name || 'N/A',
          applicationDate,
        ];
      });

      autoTable(doc, {
        head: [categoryTableColumn],
        body: categoryTableRows,
        startY: currentY,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [0, 123, 255],
          textColor: 255,
          fontStyle: 'bold',
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        didDrawPage: function (data) {
          // Footer - page number
          doc.setFontSize(8);
          const pageCount = doc.internal.pages.length;
          doc.text(
            `Page ${data.pageNumber} of ${pageCount - 1}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          );
        }
      });
    }

    // Output as Blob and create URL for preview
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfReportUrl(url);
    setIsLoadingReport(false);
  }, [releasedData, notReleasedData, categoryData]); // Dependencies for useCallback

  const handleOpenReportModal = () => {
    setShowReportModal(true);
    generateAndSetPdfBlob();
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setPdfReportUrl(null);
    setIsLoadingReport(true); // Reset loading state for next generation
  };

  const handleDownloadFromPreview = () => {
    if (pdfReportUrl) {
      const link = document.createElement('a');
      link.href = pdfReportUrl;
      link.download = 'senior_citizens_overview_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    showReportModal,
    pdfReportUrl,
    isLoadingReport,
    handleOpenReportModal,
    handleCloseReportModal,
    handleDownloadFromPreview,
  };
};