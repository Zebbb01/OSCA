// app\staff\senior-citizen\record\page.tsx
'use client';

import { useSession } from 'next-auth/react';
import SeniorRecordsPageContent from '@/components/page/SeniorRecordsPageContent';

const StaffRecordPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = (session?.user as any)?.role || 'USER'; // Default to USER if not authenticated

  // Render the shared content component, passing the userRole
  return <SeniorRecordsPageContent userRole={userRole} />;
};

export default StaffRecordPage;
