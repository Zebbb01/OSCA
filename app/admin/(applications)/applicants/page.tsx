// app/admin/applicants/page.tsx

import MonitoringOverview from '@/components/overview/MonitoringOverview';

export default function AdminApplicants() {
  return (
    <MonitoringOverview 
      userRole="admin"
      title="Benefit Applicants"
      description="Manage and review all benefit applications from senior citizens."
      showDownloadButton={true}
      defaultTab="all-applications"
      availableTabs={["all-applications"]} // Only show All Applications tab
      hideAdminActions={false} // Show approve/reject buttons
    />
  );
}