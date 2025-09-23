// components\overview\DownloadOverviewReport.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, FileText } from 'lucide-react';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal';
import { useOverviewReport } from '@/hooks/overview/useOverviewReport'; // Import the new hook

interface DownloadOverviewReportProps {
  releasedData: Seniors[];
  notReleasedData: Seniors[];
  categoryData: BenefitApplicationData[];
}

export const DownloadOverviewReport: React.FC<DownloadOverviewReportProps> = ({
  releasedData,
  notReleasedData,
  categoryData
}) => {
  const {
    showReportModal,
    pdfReportUrl,
    isLoadingReport,
    handleOpenReportModal,
    handleCloseReportModal,
    handleDownloadFromPreview,
  } = useOverviewReport({ releasedData, notReleasedData, categoryData }); // Use the hook and pass data

  return (
    <>
      <Button
        onClick={handleOpenReportModal}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
        size="default"
      >
        <FileText className="h-4 w-4" />
        <DownloadIcon className="h-4 w-4" />
        Download Report
      </Button>

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        pdfUrl={pdfReportUrl}
        isLoading={isLoadingReport}
        fileName="senior_citizens_overview_report.pdf"
        onDownload={handleDownloadFromPreview}
        title="Senior Citizens Overview Report Preview"
        description={
          isLoadingReport
            ? 'Generating comprehensive overview report, please wait...'
            : 'Complete overview report is ready for review and download.'
        }
      />
    </>
  );
};