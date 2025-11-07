// app/staff/applications/overview/page.tsx

import MonitoringOverview from '@/components/overview/MonitoringOverview';

export default function StaffMonitoringOverview() {
  return (
    <MonitoringOverview 
      userRole="staff"
      title="Staff - Senior Citizens Monitoring Overview"
      description="Staff view of senior citizen benefit applications and status monitoring."
      showDownloadButton={true}
    />
  );
}