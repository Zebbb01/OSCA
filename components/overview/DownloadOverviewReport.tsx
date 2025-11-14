// components/overview/DownloadOverviewReport.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ReportPreviewModal } from '@/components/senior-citizen/ReportPreviewModal';
import { useOverviewReport } from '@/hooks/overview/useOverviewReport';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';

interface DownloadOverviewReportProps {
  releasedData: Seniors[];
  notReleasedData: Seniors[];
  categoryData: BenefitApplicationData[];
  startDate: string;
  endDate: string;
}

export function DownloadOverviewReport({
  releasedData,
  notReleasedData,
  categoryData,
  startDate,
  endDate,
}: DownloadOverviewReportProps) {
  const {
    showReportModal,
    pdfReportUrl,
    isLoadingReport,
    handleOpenReportModal,
    handleCloseReportModal,
    handleDownloadFromPreview,
  } = useOverviewReport({
    releasedData,
    notReleasedData,
    categoryData,
    startDate,
    endDate,
  });

  return (
    <>
      <Button
        onClick={handleOpenReportModal}
        variant="outline"
        className="bg-green-600 hover:bg-green-700 text-white border-none"
      >
        <Download className="mr-2 h-4 w-4" />
        Download Complete Overview Report
      </Button>

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        pdfUrl={pdfReportUrl}
        isLoading={isLoadingReport}
        fileName={`senior_citizens_overview_report_${new Date().toISOString().split('T')[0]}.pdf`}
        onDownload={handleDownloadFromPreview}
        title="Complete Overview Report Preview"
        description="Generating comprehensive overview report..."
      />
    </>
  );
}