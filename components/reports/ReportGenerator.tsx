'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, DownloadIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/utils/format';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const generateReportContent = (): string => {
    const timestamp = new Date().toLocaleString();
    const header = `${reportTitle}
Generated: ${timestamp}
${timePeriod ? `Period: ${selectedPeriod} (${timePeriod})` : ''}
Total Records: ${data.length}

${'='.repeat(60)}

`;

    let content = '';

    switch (reportType) {
      case 'monthly-release':
        content = generateMonthlyReleaseContent();
        break;
      case 'government-fund':
        content = generateGovernmentFundContent();
        break;
      case 'financial-overview':
        content = generateFinancialOverviewContent();
        break;
      case 'section-report':
        content = generateSectionReportContent();
        break;
      default:
        content = generateGenericContent();
    }

    return header + content + '\n\nEnd of Report';
  };

  const generateMonthlyReleaseContent = (): string => {
    const totalAmount = data.reduce((sum, item) => sum + (item.totalAmountReleased || item.amount || 0), 0);
    const totalBeneficiaries = data.reduce((sum, item) => sum + (item.numberOfBeneficiaries || 1), 0);

    return `MONTHLY RELEASE SUMMARY:
Total Amount Released: ₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
Total Beneficiaries: ${totalBeneficiaries}

MONTHLY BREAKDOWN:
${data.map((item, index) => `
${index + 1}. ${item.month || `Month ${index + 1}`}
   Release Date: ${item.releaseDate ? formatDateTime(item.releaseDate) : 'N/A'}
   Amount: ₱${(item.totalAmountReleased || item.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
   Beneficiaries: ${item.numberOfBeneficiaries || 1}
   Status: ${item.status || 'N/A'}
`).join('')}
`;
  };

  const generateGovernmentFundContent = (): string => {
    const approvedCount = data.filter(item => item.status?.name === 'APPROVED').length;
    const pendingCount = data.filter(item => item.status?.name === 'PENDING').length;
    const totalFunds = (approvedCount + pendingCount) * 5000;

    return `GOVERNMENT FUND ANALYSIS:
Total Applications: ${data.length}
Approved Applications: ${approvedCount}
Pending Applications: ${pendingCount}
Estimated Fund Allocation: ₱${totalFunds.toLocaleString('en-PH', { minimumFractionDigits: 2 })}

RECENT APPLICATIONS:
${data.slice(0, 10).map((item, index) => `
${index + 1}. ${item.senior?.firstname || item.beneficiaryName || 'N/A'} ${item.senior?.lastname || ''}
   Benefit: ${item.benefit?.name || item.benefits || 'N/A'}
   Status: ${item.status?.name || item.status || 'N/A'}
   Applied: ${item.createdAt ? formatDateTime(item.createdAt) : 'N/A'}
`).join('')}
`;
  };

  const generateFinancialOverviewContent = (): string => {
    const totalReleased = data.filter(item => item.type === 'released').reduce((sum, item) => sum + item.amount, 0);
    const totalPending = data.filter(item => item.type === 'pending').reduce((sum, item) => sum + item.amount, 0);

    return `FINANCIAL OVERVIEW:
Total Released: ₱${totalReleased.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
Total Pending: ₱${totalPending.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
Current Balance: ₱${(500000 - totalReleased + totalPending).toLocaleString('en-PH', { minimumFractionDigits: 2 })}

TRANSACTION DETAILS:
${data.map((item, index) => `
${index + 1}. ${item.benefits || item.description || 'N/A'}
   Date: ${item.date || 'N/A'}
   Amount: ₱${item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
   Type: ${item.type || 'N/A'}
   ${item.seniorName ? `Senior: ${item.seniorName}` : ''}
`).join('')}
`;
  };

  const generateSectionReportContent = (): string => {
    return `SECTION REPORT DATA:
${data.slice(0, 20).map((item, index) => {
      let line = `${index + 1}. `;
      if (item.firstname && item.lastname) {
        line += `${item.firstname} ${item.lastname}`;
        if (item.barangay) line += ` - ${item.barangay}`;
        if (item.releasedAt) line += ` (Released: ${formatDateTime(item.releasedAt)})`;
      } else if (item.benefit && item.senior) {
        line += `${item.senior.firstname} ${item.senior.lastname} - ${item.benefit.name}`;
        if (item.status) line += ` (${item.status.name})`;
      } else if (item.barangay) {
        line += `${item.barangay} - Total: ${item.totalRecords || 0}`;
      } else {
        line += 'Data record';
      }
      return line;
    }).join('\n')}

${data.length > 20 ? `\n... and ${data.length - 20} more records` : ''}
`;
  };

  const generateGenericContent = (): string => {
    return `DATA SUMMARY:
Total records: ${data.length}

SAMPLE DATA:
${data.slice(0, 5).map((item, index) => `${index + 1}. ${JSON.stringify(item).substring(0, 100)}...`).join('\n')}
`;
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Generate report content
      const reportContent = generateReportContent();
      
      // Create blob with the report content
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      setReportUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (reportUrl) {
      const link = document.createElement('a');
      link.href = reportUrl;
      link.download = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${selectedPeriod || 'report'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    if (reportUrl) {
      URL.revokeObjectURL(reportUrl);
      setReportUrl(null);
    }
  };

  return (
    <>
      <Button
        onClick={handleGenerateReport}
        variant={variant}
        size={size}
        className={className}
        disabled={isGenerating || data.length === 0}
      >
        {children || (
          <>
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </>
        )}
      </Button>

      <Dialog open={showPreview} onOpenChange={handleClosePreview}>
        <DialogContent className="!max-w-4xl h-[95vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-800">
              {reportTitle} Preview
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Report generated successfully. You can download it using the button below.
            </DialogDescription>
          </DialogHeader>

          {/* Report Preview */}
          <div className="flex-grow relative w-full bg-gray-100 rounded-md overflow-hidden my-4 p-4">
            <div className="h-full overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {reportUrl && generateReportContent()}
              </pre>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
