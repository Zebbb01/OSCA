// hooks/overview/useTabReport.ts
'use client';

import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';
import { formatDateTime } from '@/utils/format';
import { addPdfHeaderAndFooter, getContentBoundaries } from '@/utils/pdf-header-footer';
import { format, parseISO } from 'date-fns';

interface UseTabReportProps {
  tabType: 'barangay-summary' | 'all-applications' | 'released' | 'pending';
  data: Seniors[] | BenefitApplicationData[] | any[];
  startDate: string;
  endDate: string;
}

export const useTabReport = ({ tabType, data, startDate, endDate }: UseTabReportProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const generateBarangaySummaryReport = useCallback((doc: jsPDF, currentY: number) => {
    const boundaries = getContentBoundaries();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Barangay Summary Report', boundaries.leftMargin, currentY);
    currentY += 8;

    const tableColumn = [
      'Barangay',
      'Total',
      'Released',
      'Pending',
      'Approved',
      'Rejected',
      'Regular',
      'Special'
    ];

    const tableRows = data.map((item: any) => [
      item.barangay || 'N/A',
      item.totalRecords?.toString() || '0',
      item.releasedCount?.toString() || '0',
      item.pendingCount?.toString() || '0',
      item.approvedCount?.toString() || '0',
      item.rejectedCount?.toString() || '0',
      item.regularCount?.toString() || '0',
      item.specialCount?.toString() || '0',
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: currentY,
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

    return (doc as any).lastAutoTable.finalY;
  }, [data]);

  const generateAllApplicationsReport = useCallback((doc: jsPDF, currentY: number) => {
    const boundaries = getContentBoundaries();
    const applicationsData = data as BenefitApplicationData[];

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 123, 255);
    doc.text('All Applications Report', boundaries.leftMargin, currentY);
    currentY += 8;

    const tableColumn = [
      'Name',
      'Applied Benefit',
      'Category',
      'Status',
      'Application Date',
    ];

    const tableRows = applicationsData.map(app => {
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
        fillColor: [0, 123, 255],
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

    return (doc as any).lastAutoTable.finalY;
  }, [data]);

  const generateReleasedReport = useCallback((doc: jsPDF, currentY: number) => {
    const boundaries = getContentBoundaries();
    const seniorsData = data as Seniors[];

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Released Benefits Report', boundaries.leftMargin, currentY);
    currentY += 8;

    const tableColumn = [
      'Name',
      'Contact No.',
      'Barangay',
      'Purok',
      'Gender',
      'Category',
      'Benefit Type',
      'Released At',
    ];

    const tableRows = seniorsData.map(senior => {
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
        bottom: boundaries.bottomMargin,
        left: boundaries.leftMargin
      },
    });

    return (doc as any).lastAutoTable.finalY;
  }, [data]);

  const generatePendingReport = useCallback((doc: jsPDF, currentY: number) => {
    const boundaries = getContentBoundaries();
    const seniorsData = data as Seniors[];

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69);
    doc.text('Pending Benefits Report', boundaries.leftMargin, currentY);
    currentY += 8;

    const tableColumn = [
      'Name',
      'Contact No.',
      'Barangay',
      'Purok',
      'Gender',
      'Category',
      'Benefit Type',
      'Status',
    ];

    const tableRows = seniorsData.map(senior => {
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
        fillColor: [220, 53, 69],
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

    return (doc as any).lastAutoTable.finalY;
  }, [data]);

  const getReportTitle = useCallback(() => {
    switch (tabType) {
      case 'barangay-summary':
        return 'Barangay Summary Report';
      case 'all-applications':
        return 'All Applications Report';
      case 'released':
        return 'Released Benefits Report';
      case 'pending':
        return 'Pending Benefits Report';
      default:
        return 'Report';
    }
  }, [tabType]);

  const generateAndSetPdfBlob = useCallback(async () => {
    setIsLoadingReport(true);
    setPdfReportUrl(null);

    const doc = new jsPDF();
    const reportTitle = getReportTitle();

    // Set document properties
    doc.setProperties({
      title: reportTitle,
      subject: `${reportTitle} - Senior Citizen Management System`,
      author: 'Senior Citizen Management System',
    });

    const boundaries = getContentBoundaries();
    let currentY = boundaries.topMargin + 10;

    // Add header and footer to first page
    const dateRange = `${format(parseISO(startDate), 'MMMM dd, yyyy')} - ${format(parseISO(endDate), 'MMMM dd, yyyy')}`;
    await addPdfHeaderAndFooter({
      doc,
      pageNumber: 1,
      totalPages: 1,
      title: reportTitle,
      subtitle: `Date Range: ${dateRange} • Generated: ${format(new Date(), 'MMMM dd, yyyy')}`
    });

    // Summary Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Report Summary', boundaries.leftMargin, currentY);
    currentY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Records: ${data.length}`, boundaries.leftMargin, currentY);
    currentY += 5;
    doc.text(`Date Range: ${dateRange}`, boundaries.leftMargin, currentY);
    currentY += 10;

    // Generate specific report based on tab type
    switch (tabType) {
      case 'barangay-summary':
        currentY = generateBarangaySummaryReport(doc, currentY);
        break;
      case 'all-applications':
        currentY = generateAllApplicationsReport(doc, currentY);
        break;
      case 'released':
        currentY = generateReleasedReport(doc, currentY);
        break;
      case 'pending':
        currentY = generatePendingReport(doc, currentY);
        break;
    }

    // Update total pages for all pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      await addPdfHeaderAndFooter({
        doc,
        pageNumber: i,
        totalPages: totalPages,
        title: reportTitle,
        subtitle: `Date Range: ${dateRange} • Generated: ${format(new Date(), 'MMMM dd, yyyy')}`
      });
    }

    // Output as Blob and create URL for preview
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfReportUrl(url);
    setIsLoadingReport(false);
  }, [tabType, data, startDate, endDate, getReportTitle, generateBarangaySummaryReport, generateAllApplicationsReport, generateReleasedReport, generatePendingReport]);

  const handleOpenReportModal = () => {
    setShowReportModal(true);
    generateAndSetPdfBlob();
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
      const fileName = `${tabType.replace('-', '_')}_report_${format(new Date(), 'yyyy_MM_dd')}.pdf`;
      link.download = fileName;
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