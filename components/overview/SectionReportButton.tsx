'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, DownloadIcon } from 'lucide-react';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';

// Helper function to generate report content
const generateReportContent = (
  sectionName: string,
  data: any[],
  timePeriod: string,
  selectedPeriod: string,
  reportType: string
): string => {
  const header = `${sectionName} Report
Generated: ${new Date().toLocaleString()}
Period: ${selectedPeriod} (${timePeriod})
Report Type: ${reportType}
Total Records: ${data.length}

${'='.repeat(50)}

`;

  let content = '';
  
  if (reportType === 'financial') {
    // Financial report content
    const totalReleased = data.filter(item => item.type === 'released').reduce((sum, item) => sum + item.amount, 0);
    const totalPending = data.filter(item => item.type === 'pending').reduce((sum, item) => sum + item.amount, 0);
    
    content += `FINANCIAL SUMMARY:
Total Released: ₱${totalReleased.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
Total Pending: ₱${totalPending.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
Current Balance: ₱${(500000 - totalReleased + totalPending).toLocaleString('en-PH', { minimumFractionDigits: 2 })}

TRANSACTION DETAILS:
`;
    
    data.forEach((transaction, index) => {
      content += `${index + 1}. ${transaction.benefits || transaction.description || 'N/A'}
   Date: ${transaction.date}
   Amount: ₱${transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
   Type: ${transaction.type}
   Category: ${transaction.category || 'N/A'}
   ${transaction.seniorName ? `Senior: ${transaction.seniorName}` : ''}
   ${transaction.barangay ? `Barangay: ${transaction.barangay}` : ''}

`;
    });
  } else {
    // Generic report content for other types
    content += `DATA SUMMARY:
`;
    
    data.slice(0, 20).forEach((item, index) => { // Limit to first 20 items
      content += `${index + 1}. `;
      if (item.firstname && item.lastname) {
        content += `${item.firstname} ${item.lastname}`;
        if (item.barangay) content += ` - ${item.barangay}`;
        if (item.releasedAt) content += ` (Released: ${new Date(item.releasedAt).toLocaleDateString()})`;
      } else if (item.benefit && item.senior) {
        content += `${item.senior.firstname} ${item.senior.lastname} - ${item.benefit.name}`;
        if (item.status) content += ` (${item.status.name})`;
      } else if (item.barangay) {
        content += `${item.barangay} - Total: ${item.totalRecords || 0}`;
      } else {
        content += JSON.stringify(item).substring(0, 100) + '...';
      }
      content += '\n';
    });
    
    if (data.length > 20) {
      content += `\n... and ${data.length - 20} more records\n`;
    }
  }

  return header + content + '\n\nEnd of Report';
};

interface SectionReportButtonProps {
  sectionName: string;
  data: any[];
  timePeriod: 'monthly' | 'quarterly' | 'annual';
  selectedPeriod: string;
  reportType: 'seniors' | 'applications' | 'barangay-summary' | 'financial';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const SectionReportButton: React.FC<SectionReportButtonProps> = ({
  sectionName,
  data,
  timePeriod,
  selectedPeriod,
  reportType,
  variant = 'outline',
  size = 'sm'
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleOpenReportModal = async () => {
    setShowReportModal(true);
    setIsLoadingReport(true);

    try {
      // Generate a simple PDF content using jsPDF or similar approach
      // For now, we'll create a simple text-based PDF content
      const reportContent = generateReportContent(sectionName, data, timePeriod, selectedPeriod, reportType);
      
      // Create a blob with PDF-like content
      const blob = new Blob([reportContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfReportUrl(url);
    } catch (error) {
      console.error('Error generating report:', error);
      // Create a fallback simple text report
      const fallbackContent = `${sectionName} Report\n\nPeriod: ${selectedPeriod}\nGenerated: ${new Date().toLocaleString()}\n\nData Count: ${data.length} records`;
      const blob = new Blob([fallbackContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      setPdfReportUrl(url);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    if (pdfReportUrl) {
      URL.revokeObjectURL(pdfReportUrl);
      setPdfReportUrl(null);
    }
  };

  const handleDownloadFromPreview = () => {
    if (pdfReportUrl) {
      const link = document.createElement('a');
      link.href = pdfReportUrl;
      link.download = `${sectionName.toLowerCase().replace(/\s+/g, '_')}_report_${selectedPeriod}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenReportModal}
        variant={variant}
        size={size}
        className="flex items-center gap-2"
        disabled={data.length === 0}
      >
        <FileText className="h-4 w-4" />
        <DownloadIcon className="h-4 w-4" />
        Generate Report
      </Button>

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        pdfUrl={pdfReportUrl}
        isLoading={isLoadingReport}
        fileName={`${sectionName.toLowerCase().replace(/\s+/g, '_')}_report_${selectedPeriod}.pdf`}
        onDownload={handleDownloadFromPreview}
        title={`${sectionName} Report Preview`}
        description={
          isLoadingReport
            ? `Generating ${sectionName.toLowerCase()} report for ${selectedPeriod}, please wait...`
            : `${sectionName} report for ${selectedPeriod} is ready for review and download.`
        }
      />
    </>
  );
};
