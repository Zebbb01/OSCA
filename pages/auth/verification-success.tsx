// pages/auth/verification-success.tsx
'use client'

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const VerificationSuccessPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Email Verified Successfully!</h2>
        <p className="mt-2 text-gray-600">Your account is now active. You can proceed to log in.</p>
        <Link href="/" passHref>
          <button className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-2 text-lg font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-emerald-700">
            Go to Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default VerificationSuccessPage;