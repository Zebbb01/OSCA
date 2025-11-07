// components/reports/ReportGenerator.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateTime } from '@/utils/format';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal';
import { addPdfHeaderAndFooter, getContentBoundaries, addPreparedBySection } from '@/utils/pdf-header-footer';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/axios';

interface ReportGeneratorProps {
  reportTitle: string;
  data: any[];
  reportType: 'monthly-release' | 'government-fund' | 'financial-overview' | 'section-report';
  timePeriod?: string;
  selectedPeriod?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  reportTitle,
  data,
  reportType,
  timePeriod,
  selectedPeriod,
  variant = 'default',
  size = 'default',
  className = '',
  children
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Fetch government fund balance for financial reports
  const { data: fundData } = useQuery({
    queryKey: ['government-fund'],
    queryFn: async () => {
      try {
        return await apiService.get<{ id: number; currentBalance: number }>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/government-fund`
        );
      } catch (error) {
        console.warn('Government fund API not available, using default value');
        return { id: 0, currentBalance: 500000 };
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: reportType === 'financial-overview', // Only fetch when needed
  });

  const initialBalance = fundData?.currentBalance || 500000;

  const generateAndSetPdfBlob = useCallback(async () => {
    setIsLoadingReport(true);
    setPdfReportUrl(null);

    if (data.length === 0) {
      alert('No records to generate report.');
      setIsLoadingReport(false);
      setShowReportModal(false);
      return;
    }

    const doc = new jsPDF();
    doc.setProperties({
      title: reportTitle,
      subject: `${reportTitle} - Generated Report`,
      author: 'Senior Citizen Management System',
    });

    const boundaries = getContentBoundaries();
    let currentY = boundaries.topMargin + 10;

    // Add header and footer to first page
    await addPdfHeaderAndFooter({
      doc,
      pageNumber: 1,
      totalPages: 1,
      title: reportTitle,
      subtitle: `${timePeriod ? `Period: ${selectedPeriod} (${timePeriod}) • ` : ''}Generated: ${formatDateTime(new Date().toISOString())}`
    });

    // Executive Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Executive Summary', boundaries.leftMargin, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Generate summary based on report type
    const summaryData = generateSummaryData();
    summaryData.forEach(item => {
      doc.text(item, boundaries.leftMargin, currentY);
      currentY += 5;
    });

    currentY += 15;

    // Generate tables based on report type
    switch (reportType) {
      case 'monthly-release':
        currentY = await generateMonthlyReleaseTable(doc, currentY, boundaries);
        break;
      case 'government-fund':
        currentY = await generateGovernmentFundTable(doc, currentY, boundaries);
        break;
      case 'financial-overview':
        currentY = await generateFinancialOverviewTable(doc, currentY, boundaries);
        break;
      case 'section-report':
        currentY = await generateSectionReportTable(doc, currentY, boundaries);
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
        subtitle: `${timePeriod ? `Period: ${selectedPeriod} (${timePeriod}) • ` : ''}Generated: ${formatDateTime(new Date().toISOString())}`
      });
    }

    // Add "Prepared by" section on the last page only
    doc.setPage(totalPages);
    addPreparedBySection(doc, 'OSCA Administrator');

    // Output as Blob
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfReportUrl(url);
    setIsLoadingReport(false);
  }, [data, reportTitle, reportType, timePeriod, selectedPeriod, initialBalance]);

  const generateSummaryData = (): string[] => {
    switch (reportType) {
      case 'monthly-release': {
        const totalAmount = data.reduce((sum, item) => sum + (item.totalAmountReleased || item.amount || 0), 0);
        const totalBeneficiaries = data.reduce((sum, item) => sum + (item.numberOfBeneficiaries || 1), 0);
        return [
          `Total Records: ${data.length}`,
          `Total Amount Released: PHP ${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          `Total Beneficiaries: ${totalBeneficiaries}`,
          `Report Period: ${selectedPeriod || 'All Time'}`
        ];
      }
      case 'government-fund': {
        const approvedCount = data.filter(item => item.status?.name === 'APPROVED').length;
        const pendingCount = data.filter(item => item.status?.name === 'PENDING').length;
        const totalFunds = (approvedCount + pendingCount) * 1000; // Changed from 5000 to 1000
        return [
          `Total Applications: ${data.length}`,
          `Approved Applications: ${approvedCount}`,
          `Pending Applications: ${pendingCount}`,
          `Estimated Fund Allocation: PHP ${totalFunds.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
        ];
      }
      case 'financial-overview': {
        // Handle balance overview data structure
        if (data[0] && data[0].currentBalance !== undefined) {
          const item = data[0];
          return [
            `Initial Fund Balance: PHP ${initialBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            `Current Balance: PHP ${item.currentBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            `Total Released: PHP ${item.totalReleased.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            `Total Pending: PHP ${item.totalPending.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            `Total Allocated: PHP ${item.totalAllocated.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
          ];
        }
        // Handle transaction data structure
        const totalReleased = data.filter(item => item.type === 'released').reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalPending = data.filter(item => item.type === 'pending').reduce((sum, item) => sum + (item.amount || 0), 0);
        const currentBalance = initialBalance - totalReleased;
        return [
          `Total Transactions: ${data.length}`,
          `Initial Fund Balance: PHP ${initialBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          `Total Released: PHP ${totalReleased.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          `Total Pending: PHP ${totalPending.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          `Current Balance: PHP ${currentBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
        ];
      }
      case 'section-report': {
        return [
          `Total Records: ${data.length}`,
          `Report Generated: ${formatDateTime(new Date().toISOString())}`,
          `Data Source: Senior Citizen Management System`
        ];
      }
      default:
        return [`Total Records: ${data.length}`];
    }
  };

  const generateMonthlyReleaseTable = async (doc: jsPDF, startY: number, boundaries: any): Promise<number> => {
    const tableColumn = ['Month', 'Release Date', 'Amount', 'Beneficiaries', 'Status'];
    const tableRows = data.map((item, index) => [
      item.month || `Month ${index + 1}`,
      item.releaseDate ? formatDateTime(item.releaseDate) : 'N/A',
      `PHP ${(item.totalAmountReleased || item.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      item.numberOfBeneficiaries || 1,
      item.status || 'N/A'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
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
        bottom: boundaries.bottomMargin + 30,
        left: boundaries.leftMargin
      },
    });

    return (doc as any).lastAutoTable.finalY + 15;
  };

  const generateGovernmentFundTable = async (doc: jsPDF, startY: number, boundaries: any): Promise<number> => {
    const tableColumn = ['Beneficiary Name', 'Benefit', 'Status', 'Applied Date', 'Category'];
    const tableRows = data.slice(0, 20).map(item => [
      `${item.senior?.firstname || item.beneficiaryName || 'N/A'} ${item.senior?.lastname || ''}`,
      item.benefit?.name || item.benefits || 'N/A',
      item.status?.name || item.status || 'N/A',
      item.createdAt ? formatDateTime(item.createdAt) : 'N/A',
      item.category?.name || 'N/A'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
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
        bottom: boundaries.bottomMargin + 30,
        left: boundaries.leftMargin
      },
    });

    return (doc as any).lastAutoTable.finalY + 15;
  };

  const generateFinancialOverviewTable = async (doc: jsPDF, startY: number, boundaries: any): Promise<number> => {
    // Handle balance overview data structure (single summary object)
    if (data[0] && data[0].currentBalance !== undefined) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34);
      doc.text('Financial Balance Breakdown', boundaries.leftMargin, startY);
      startY += 10;

      const item = data[0];
      const tableColumn = ['Financial Metric', 'Amount'];
      const tableRows = [
        ['Initial Fund Balance', `PHP ${initialBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
        ['Current Available Balance', `PHP ${item.currentBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
        ['Total Released', `PHP ${item.totalReleased.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
        ['Total Pending', `PHP ${item.totalPending.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
        ['Total Allocated Funds', `PHP ${item.totalAllocated.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`]
      ];

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startY,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [34, 139, 34],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        },
        margin: {
          top: boundaries.topMargin,
          right: boundaries.rightMargin,
          bottom: boundaries.bottomMargin + 30,
          left: boundaries.leftMargin
        },
      });

      return (doc as any).lastAutoTable.finalY + 15;
    }

    // Handle transaction list data structure
    const tableColumn = ['Date', 'Description', 'Amount', 'Type', 'Senior Name', 'Barangay'];
    const tableRows = data.map(item => [
      formatDateTime(item.date || new Date().toISOString()),
      item.benefits || item.description || 'N/A',
      `PHP ${(item.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      item.type || 'N/A',
      item.seniorName || 'N/A',
      item.barangay || 'N/A'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
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

    return (doc as any).lastAutoTable.finalY + 15;
  };

  const generateSectionReportTable = async (doc: jsPDF, startY: number, boundaries: any): Promise<number> => {
    const tableColumn = ['Name', 'Barangay', 'Status', 'Date'];
    const tableRows = data.slice(0, 20).map(item => {
      let name = 'N/A';
      let barangay = 'N/A';
      let status = 'N/A';
      let date = 'N/A';

      if (item.firstname && item.lastname) {
        name = `${item.firstname} ${item.lastname}`;
        barangay = item.barangay || 'N/A';
        status = item.releasedAt ? 'Released' : 'Pending';
        date = item.releasedAt ? formatDateTime(item.releasedAt) : formatDateTime(item.createdAt);
      } else if (item.benefit && item.senior) {
        name = `${item.senior.firstname} ${item.senior.lastname}`;
        barangay = 'N/A';
        status = item.status?.name || 'N/A';
        date = formatDateTime(item.createdAt);
      } else if (item.barangay) {
        name = `${item.barangay} Summary`;
        barangay = item.barangay;
        status = `Total: ${item.totalRecords || 0}`;
        date = formatDateTime(new Date().toISOString());
      }

      return [name, barangay, status, date];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
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
        bottom: boundaries.bottomMargin + 30,
        left: boundaries.leftMargin
      },
    });

    return (doc as any).lastAutoTable.finalY + 15;
  };

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
      link.download = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${selectedPeriod || 'report'}.pdf`;
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
      <Button
        onClick={handleOpenReportModal}
        variant={variant}
        size={size}
        className={className}
        disabled={data.length === 0}
      >
        {children || (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </>
        )}
      </Button>

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        pdfUrl={pdfReportUrl}
        isLoading={isLoadingReport}
        fileName={`${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${selectedPeriod || 'report'}.pdf`}
        onDownload={handleDownloadFromPreview}
        title={`${reportTitle} Preview`}
        description={
          isLoadingReport ? 'Generating your report, please wait...' : 'The report is ready for review.'
        }
      />
    </>
  );
};