// app/admin/applications/overview/page.tsx

import MonitoringOverview from '@/components/overview/MonitoringOverview';

export default function AdminMonitoringOverview() {
  return (
    <MonitoringOverview 
      userRole="admin"
      title="Admin - Senior Citizens Monitoring Overview"
      description="Administrative view of all senior citizen benefit applications, releases, and categories."
      showDownloadButton={true}
    />
  );
}