// pages/auth/verify-email.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const VerifyEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyAccount = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      setVerificationStatus('verifying');
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        // If the API redirects, the response will not be JSON, just a redirect status.
        // We handle the redirect directly in the API route, so we just check for success here.
        if (response.ok) {
          setVerificationStatus('success');
          setMessage('Your email has been successfully verified! You can now log in.');
        } else {
          const result = await response.json();
          setVerificationStatus('error');
          setMessage(result.message || 'Failed to verify email. The link might be invalid or expired.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('An unexpected error occurred during verification. Please try again later.');
      }
    };

    if (token) {
      verifyAccount();
    }
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
        {verificationStatus === 'verifying' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">Verifying Your Account...</h2>
            <p className="mt-2 text-gray-600">Please wait while we confirm your email address.</p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">Verification Successful!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <Link href="/" passHref>
              <button className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-2 text-lg font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-emerald-700">
                Go to Login
              </button>
            </Link>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <Link href="/auth/signup" passHref>
              <button className="mt-6 w-full rounded-md bg-red-600 px-4 py-2 text-lg font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700">
                Try Signing Up Again
              </button>
            </Link>
             <button
              onClick={() => router.push('/')}
              className="mt-4 w-full rounded-md border border-gray-300 px-4 py-2 text-lg font-semibold text-gray-700 shadow-sm transition duration-300 ease-in-out hover:bg-gray-50"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;