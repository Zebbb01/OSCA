// app/admin/overview/page.tsx

import MonitoringOverview from '@/components/overview/MonitoringOverview';

export default function AdminMonitoringOverview() {
  return (
    <MonitoringOverview 
      userRole="admin"
      title="Admin - Senior Citizens Monitoring Overview"
      description="Administrative view of all senior citizen benefit applications, releases, and categories."
      showDownloadButton={true}
      defaultTab="barangay-summary"
      availableTabs={["barangay-summary", "all-applications", "released", "pending"]} // All tabs
      hideAdminActions={true} // Hide approve/reject, show only document view and delete
    />
  );
}