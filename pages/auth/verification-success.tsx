// pages/auth/verification-success.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, MailCheck } from 'lucide-react'; // Added MailCheck for an alternative icon

const VerificationSuccessPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl text-center transform transition-all duration-500 ease-in-out hover:scale-[1.01] hover:shadow-3xl">
        {/* Icon with subtle animation */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce-in">
          <CheckCircle className="h-10 w-10 text-green-600" />
          {/* Or you could use MailCheck for a different feel: */}
          {/* <MailCheck className="h-10 w-10 text-green-600" /> */}
        </div>

        {/* Main Heading */}
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 leading-tight">
          Email Verified Successfully! 🎉
        </h2>

        {/* Subtitle/Description */}
        <p className="mt-3 text-lg text-gray-700 max-w-sm mx-auto">
          Fantastic! Your account is now active and ready to go.
        </p>
        <p className="mt-1 text-md text-gray-600">
          You can now log in and start exploring.
        </p>

        {/* Action Button */}
        <Link href="/" passHref>
          <button className="mt-8 w-full px-6 py-3 bg-emerald-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-emerald-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-75">
             Go to Login
          </button>
        </Link>

        {/* Optional: Add a small helpful tip or link */}
        <p className="mt-6 text-sm text-gray-500">
          Having trouble? Visit our <Link href="/support" className="text-blue-600 hover:underline">support page</Link>.
        </p>
      </div>
    </div>
  );
};

export default VerificationSuccessPage;