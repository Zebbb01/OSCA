// hooks/overview/useOverviewReport.ts
'use client';

import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';
import { formatDateTime } from '@/utils/format';
import { addPdfHeaderAndFooter, getContentBoundaries } from '@/utils/pdf-header-footer';
import { format, parseISO } from 'date-fns';

interface UseOverviewReportProps {
  releasedData: Seniors[];
  notReleasedData: Seniors[];
  categoryData: BenefitApplicationData[];
  startDate: string;
  endDate: string;
}

export const useOverviewReport = ({
  releasedData,
  notReleasedData,
  categoryData,
  startDate,
  endDate,
}: UseOverviewReportProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const generateAndSetPdfBlob = useCallback(async () => {
    setIsLoadingReport(true);
    setPdfReportUrl(null);

    const doc = new jsPDF();

    doc.setProperties({
      title: 'Senior Citizens Overview Report',
      subject: 'Comprehensive report of senior citizens benefits monitoring and applications',
      author: 'Senior Citizen Management System',
    });

    const boundaries = getContentBoundaries();
    let currentY = boundaries.topMargin + 10;

    const dateRange = `${format(parseISO(startDate), 'MMMM dd, yyyy')} - ${format(parseISO(endDate), 'MMMM dd, yyyy')}`;
    await addPdfHeaderAndFooter({
      doc,
      pageNumber: 1,
      totalPages: 1,
      title: 'Senior Citizens Overview Report',
      subtitle: `Date Range: ${dateRange} • Generated: ${format(new Date(), 'MMMM dd, yyyy')}`
    });

    // Executive Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Executive Summary', boundaries.leftMargin, currentY);
    currentY += 10;

    // Count by age-based categories
    const regularApplications = categoryData.filter(app => 
      !app.category || app.category.name === 'Regular (Below 80)'
    ).length;
    
    const octogenarianApplications = categoryData.filter(app => 
      app.category?.name === 'Octogenarian (80-89)'
    ).length;
    
    const nonagenariApplications = categoryData.filter(app => 
      app.category?.name === 'Nonagenarian (90-99)'
    ).length;
    
    const centenarianApplications = categoryData.filter(app => 
      app.category?.name === 'Centenarian (100+)'
    ).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const summaryData = [
      `Report Period: ${dateRange}`,
      `Total Released Benefits: ${releasedData.length}`,
      `Total Pending Benefits: ${notReleasedData.length}`,
      `Total Applications: ${categoryData.length}`,
      `Regular Senior Citizens (Below 80): ${regularApplications}`,
      `Octogenarian (80-89): ${octogenarianApplications}`,
      `Nonagenarian (90-99): ${nonagenariApplications}`,
      `Centenarian (100+): ${centenarianApplications}`,
    ];

    summaryData.forEach(item => {
      doc.text(item, boundaries.leftMargin, currentY);
      currentY += 5;
    });

    currentY += 15;

    // SECTION 1: RELEASED BENEFITS
    if (releasedData.length > 0) {
      if (currentY > 200) {
        doc.addPage();
        currentY = boundaries.topMargin + 10;
        await addPdfHeaderAndFooter({
          doc,
          pageNumber: doc.internal.pages.length - 1,
          totalPages: 1,
          title: 'Senior Citizens Overview Report',
          subtitle: 'Released Benefits Section'
        });
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34);
      doc.text('Released Benefits Report', boundaries.leftMargin, currentY);
      currentY += 8;

      const releasedTableColumn = [
        'Name',
        'Age',
        'Contact No.',
        'Barangay',
        'Purok',
        'Gender',
        'Age Category',
        'Benefit Type',
        'Released At',
      ];

      const releasedTableRows = releasedData.map(senior => {
        const fullName = [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ');
        const categoryName = senior.Applications?.[0]?.category?.name || 'Regular (Below 80)';
        const benefitName = senior.Applications?.[0]?.benefit.name || 'N/A';
        const releasedDate = senior.releasedAt ? formatDateTime(senior.releasedAt) : 'N/A';

        return [
          fullName,
          senior.age || 'N/A',
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
          fontSize: 6,
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

      currentY = (doc as any).lastAutoTable.finalY + 20;
    }

    // SECTION 2: PENDING BENEFITS
    if (notReleasedData.length > 0) {
      if (currentY > 200) {
        doc.addPage();
        currentY = boundaries.topMargin + 10;
        await addPdfHeaderAndFooter({
          doc,
          pageNumber: doc.internal.pages.length - 1,
          totalPages: 1,
          title: 'Senior Citizens Overview Report',
          subtitle: 'Pending Benefits Section'
        });
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 53, 69);
      doc.text('Pending Benefits Report', boundaries.leftMargin, currentY);
      currentY += 8;

      const notReleasedTableColumn = [
        'Name',
        'Age',
        'Contact No.',
        'Barangay',
        'Purok',
        'Gender',
        'Age Category',
        'Benefit Type',
        'Status',
      ];

      const notReleasedTableRows = notReleasedData.map(senior => {
        const fullName = [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ');
        const categoryName = senior.Applications?.[0]?.category?.name || 'Regular (Below 80)';
        const benefitName = senior.Applications?.[0]?.benefit.name || 'N/A';
        const statusName = senior.Applications?.[0]?.status.name || 'N/A';

        return [
          fullName,
          senior.age || 'N/A',
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
          fontSize: 6,
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

      currentY = (doc as any).lastAutoTable.finalY + 20;
    }

    // SECTION 3: APPLICATIONS BY CATEGORY
    if (categoryData.length > 0) {
      if (currentY > 200) {
        doc.addPage();
        currentY = boundaries.topMargin + 10;
        await addPdfHeaderAndFooter({
          doc,
          pageNumber: doc.internal.pages.length - 1,
          totalPages: 1,
          title: 'Senior Citizens Overview Report',
          subtitle: 'Applications by Age Category Section'
        });
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 123, 255);
      doc.text('Applications by Age Category Report', boundaries.leftMargin, currentY);
      currentY += 8;

      const categoryTableColumn = [
        'Name',
        'Age',
        'Applied Benefit',
        'Age Category',
        'Status',
        'Application Date',
      ];

      const categoryTableRows = categoryData.map(app => {
        const senior = app.senior;
        const fullName = senior ? [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ') : 'N/A';
        const categoryName = app.category?.name || 'Regular (Below 80)';
        const applicationDate = formatDateTime(app.createdAt);
        const age = (senior as any)?.age || 'N/A';

        return [
          fullName,
          age,
          app.benefit.name || 'N/A',
          categoryName,
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
        margin: { 
          top: boundaries.topMargin, 
          right: boundaries.rightMargin, 
          bottom: boundaries.bottomMargin, 
          left: boundaries.leftMargin 
        },
      });
    }

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      let subtitle = '';
      if (i === 1) {
        subtitle = `Date Range: ${dateRange} • Generated: ${format(new Date(), 'MMMM dd, yyyy')}`;
      } else if (i === 2) {
        subtitle = 'Released Benefits Section';
      } else if (i === 3) {
        subtitle = 'Pending Benefits Section';
      } else {
        subtitle = 'Applications by Age Category Section';
      }

      await addPdfHeaderAndFooter({
        doc,
        pageNumber: i,
        totalPages: totalPages,
        title: 'Senior Citizens Overview Report',
        subtitle: subtitle
      });
    }

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfReportUrl(url);
    setIsLoadingReport(false);
  }, [releasedData, notReleasedData, categoryData, startDate, endDate]);

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
      link.download = `senior_citizens_overview_report_${format(new Date(), 'yyyy_MM_dd')}.pdf`;
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