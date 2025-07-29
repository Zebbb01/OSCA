// app\admin\senior-citizen\record\page.tsx
'use client';

import { useSession } from 'next-auth/react';
import SeniorRecordsPageContent from '@/components/page/SeniorRecordsPageContent';

const AdminRecordPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = (session?.user as any)?.role || 'ADMIN'; // Default to USER if not authenticated

  // Render the shared content component, passing the userRole
  return <SeniorRecordsPageContent userRole={userRole} />;
};

export default AdminRecordPage;
