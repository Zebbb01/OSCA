'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, DownloadIcon, DollarSign } from 'lucide-react';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal';
import { BenefitApplicationData } from '@/types/application';

// Helper function to generate government fund report content
const generateGovernmentFundReportContent = (
  benefitData: BenefitApplicationData[],
  categoryData: BenefitApplicationData[],
  timePeriod: string,
  selectedPeriod: string,
  fundType: string
): string => {
  const header = `Government Fund ${fundType.toUpperCase()} Report
Generated: ${new Date().toLocaleString()}
Period: ${selectedPeriod} (${timePeriod})
Fund Type: ${fundType}

${'='.repeat(60)}

`;

  // Calculate summary statistics
  const totalBenefits = benefitData.length;
  const totalCategories = [...new Set(categoryData.map(item => item.category?.name))].length;
  const approvedBenefits = benefitData.filter(item => item.status.name === 'APPROVED').length;
  const pendingBenefits = benefitData.filter(item => item.status.name === 'PENDING').length;
  const rejectedBenefits = benefitData.filter(item => item.status.name === 'REJECT').length;

  let content = `EXECUTIVE SUMMARY:
Total Benefit Applications: ${totalBenefits}
Total Categories: ${totalCategories}
Approved Applications: ${approvedBenefits}
Pending Applications: ${pendingBenefits}
Rejected Applications: ${rejectedBenefits}

FINANCIAL OVERVIEW:
Estimated Total Fund Allocation: ₱${((approvedBenefits + pendingBenefits) * 5000).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
Released Funds: ₱${(approvedBenefits * 5000).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
Pending Disbursement: ₱${(pendingBenefits * 5000).toLocaleString('en-PH', { minimumFractionDigits: 2 })}

${'='.repeat(60)}

DETAILED BREAKDOWN:

`;

  // Benefits breakdown
  if (fundType === 'benefits' || fundType === 'combined') {
    content += `BENEFITS ANALYSIS:
`;
    const benefitTypes = [...new Set(benefitData.map(item => item.benefit.name))];
    benefitTypes.forEach(benefitType => {
      const benefitCount = benefitData.filter(item => item.benefit.name === benefitType).length;
      const approvedCount = benefitData.filter(item => item.benefit.name === benefitType && item.status.name === 'APPROVED').length;
      content += `• ${benefitType}: ${benefitCount} applications (${approvedCount} approved)
`;
    });
    content += '\n';
  }

  // Category breakdown
  if (fundType === 'category' || fundType === 'combined') {
    content += `CATEGORY ANALYSIS:
`;
    const categories = [...new Set(categoryData.map(item => item.category?.name).filter(Boolean))];
    categories.forEach(category => {
      const categoryCount = categoryData.filter(item => item.category?.name === category).length;
      const approvedCount = categoryData.filter(item => item.category?.name === category && item.status.name === 'APPROVED').length;
      content += `• ${category}: ${categoryCount} applications (${approvedCount} approved)
`;
    });
    content += '\n';
  }

  // Recent applications
  content += `RECENT APPLICATIONS (Last 10):
`;
  const recentApplications = [...benefitData, ...categoryData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  recentApplications.forEach((app, index) => {
    content += `${index + 1}. ${app.senior.firstname} ${app.senior.lastname}
   Benefit: ${app.benefit.name}
   Category: ${app.category?.name || 'N/A'}
   Status: ${app.status.name}
   Applied: ${new Date(app.createdAt).toLocaleDateString()}
   ${app.scheduledDate ? `Scheduled: ${new Date(app.scheduledDate).toLocaleDateString()}` : ''}

`;
  });

  return header + content + '\n\nEnd of Government Fund Report';
};

interface GovernmentFundReportButtonProps {
  benefitData: BenefitApplicationData[];
  categoryData: BenefitApplicationData[];
  timePeriod: string;
  selectedPeriod: string;
  fundType: 'benefits' | 'category' | 'combined';
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

export const GovernmentFundReportButton: React.FC<GovernmentFundReportButtonProps> = ({
  benefitData,
  categoryData,
  timePeriod,
  selectedPeriod,
  fundType,
  variant = 'default',
  size = 'default'
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfReportUrl, setPdfReportUrl] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleOpenReportModal = async () => {
    setShowReportModal(true);
    setIsLoadingReport(true);

    try {
      // Generate government fund report content
      const reportContent = generateGovernmentFundReportContent(
        benefitData,
        categoryData,
        timePeriod,
        selectedPeriod,
        fundType
      );
      
      // Create a blob with the report content
      const blob = new Blob([reportContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfReportUrl(url);
    } catch (error) {
      console.error('Error generating government fund report:', error);
      // Create a fallback simple text report
      const fallbackContent = `Government Fund ${fundType} Report\n\nPeriod: ${selectedPeriod}\nGenerated: ${new Date().toLocaleString()}\n\nBenefit Applications: ${benefitData.length}\nCategory Data: ${categoryData.length}`;
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
      link.download = `government_fund_${fundType}_report_${selectedPeriod}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper functions to calculate fund amounts
  const calculateTotalFundAmount = (benefits: BenefitApplicationData[], categories: BenefitApplicationData[]) => {
    // This would be calculated based on your business logic
    // For now, return a mock calculation
    return (benefits.length + categories.length) * 5000; // Mock calculation
  };

  const calculateReleasedFundAmount = (benefits: BenefitApplicationData[], categories: BenefitApplicationData[]) => {
    const releasedBenefits = benefits.filter(item => 
      item.status.name === 'APPROVED' || item.status.name === 'RELEASED'
    );
    const releasedCategories = categories.filter(item => 
      item.status.name === 'APPROVED' || item.status.name === 'RELEASED'
    );
    return (releasedBenefits.length + releasedCategories.length) * 5000; // Mock calculation
  };

  const calculatePendingFundAmount = (benefits: BenefitApplicationData[], categories: BenefitApplicationData[]) => {
    const pendingBenefits = benefits.filter(item => 
      item.status.name === 'PENDING' || item.status.name === 'PROCESSING'
    );
    const pendingCategories = categories.filter(item => 
      item.status.name === 'PENDING' || item.status.name === 'PROCESSING'
    );
    return (pendingBenefits.length + pendingCategories.length) * 5000; // Mock calculation
  };

  const getReportTitle = () => {
    switch (fundType) {
      case 'benefits':
        return 'Government Fund Benefits Report';
      case 'category':
        return 'Government Fund Category Report';
      case 'combined':
        return 'Government Fund Comprehensive Report';
      default:
        return 'Government Fund Report';
    }
  };

  const getReportDescription = () => {
    const totalData = benefitData.length + categoryData.length;
    return isLoadingReport
      ? `Generating government fund ${fundType} report for ${selectedPeriod}, please wait...`
      : `Government fund ${fundType} report for ${selectedPeriod} with ${totalData} records is ready for review and download.`;
  };

  return (
    <>
      <Button
        onClick={handleOpenReportModal}
        variant={variant}
        size={size}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        disabled={benefitData.length === 0 && categoryData.length === 0}
      >
        <DollarSign className="h-4 w-4" />
        <FileText className="h-4 w-4" />
        <DownloadIcon className="h-4 w-4" />
        Generate Fund Report
      </Button>

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        pdfUrl={pdfReportUrl}
        isLoading={isLoadingReport}
        fileName={`government_fund_${fundType}_report_${selectedPeriod}.pdf`}
        onDownload={handleDownloadFromPreview}
        title={getReportTitle()}
        description={getReportDescription()}
      />
    </>
  );
};
