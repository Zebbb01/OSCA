// app\auth\verification-error\page.tsx
'use client';

import Link from 'next/link';
import { XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const VerificationErrorPage = () => {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('message');
  const [message, setMessage] = useState('An unexpected error occurred during email verification.');

  useEffect(() => {
    switch (errorCode) {
      case 'token_not_found':
        setMessage('Verification link not found or already used.');
        break;
      case 'already_verified':
        setMessage('Your email has already been verified.');
        break;
      case 'token_expired':
        setMessage('The verification link has expired. Please sign up again or request a new one.');
        break;
      case 'invalid_token':
        setMessage('Invalid verification token provided.');
        break;
      case 'unexpected_error':
      default:
        setMessage('An unexpected error occurred during email verification. Please try again.');
        break;
    }
  }, [errorCode]);

  const handleRequestNewLink = () => {
    alert('Logic to request a new verification link would go here!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl text-center transform transition-all duration-500 ease-in-out hover:scale-[1.01] hover:shadow-3xl">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6 animate-bounce-in">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 leading-tight">
          Verification Failed 😔
        </h2>

        <p className="mt-3 text-lg text-gray-700 max-w-sm mx-auto">
          {message}
        </p>

        {errorCode === 'token_expired' && (
          <button
            onClick={handleRequestNewLink}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
          >
            <div className="flex items-center justify-center space-x-2">
              <RotateCcw className="w-5 h-5" />
              <span>Request New Link</span>
            </div>
          </button>
        )}

        <Link href="/" passHref>
          <button className="mt-4 w-full px-6 py-3 bg-gray-100 text-gray-700 text-xl font-semibold rounded-lg shadow-lg hover:bg-gray-200 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-75">
            Back to Login
          </button>
        </Link>

        <p className="mt-6 text-sm text-gray-500">
          Need assistance? Visit our <Link href="/support" className="text-blue-600 hover:underline">support page</Link>.
        </p>
      </div>
    </div>
  );
};

export default VerificationErrorPage;