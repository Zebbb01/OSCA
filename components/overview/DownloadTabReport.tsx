// components/overview/DownloadTabReport.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal';
import { useTabReport } from '@/hooks/overview/useTabReport';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';

interface DownloadTabReportProps {
  tabType: 'barangay-summary' | 'all-applications' | 'released' | 'pending';
  data: Seniors[] | BenefitApplicationData[] | any[];
  startDate: string;
  endDate: string;
}

export function DownloadTabReport({ tabType, data, startDate, endDate }: DownloadTabReportProps) {
  const {
    showReportModal,
    pdfReportUrl,
    isLoadingReport,
    handleOpenReportModal,
    handleCloseReportModal,
    handleDownloadFromPreview,
  } = useTabReport({ tabType, data, startDate, endDate });

  const getTabTitle = () => {
    switch (tabType) {
      case 'barangay-summary':
        return 'Barangay Summary';
      case 'all-applications':
        return 'All Applications';
      case 'released':
        return 'Released Benefits';
      case 'pending':
        return 'Pending Benefits';
      default:
        return 'Report';
    }
  };

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    return `${tabType.replace('-', '_')}_report_${date}.pdf`;
  };

  return (
    <>
      <Button
        onClick={handleOpenReportModal}
        variant="outline"
        className="bg-blue-600 hover:bg-blue-700 text-white border-none"
      >
        <Download className="mr-2 h-4 w-4" />
        Download {getTabTitle()} Report
      </Button>

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        pdfUrl={pdfReportUrl}
        isLoading={isLoadingReport}
        fileName={getFileName()}
        onDownload={handleDownloadFromPreview}
        title={`${getTabTitle()} Report Preview`}
        description={`Generating ${getTabTitle().toLowerCase()} report...`}
      />
    </>
  );
}