
// 

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Mail, Shield, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

const VerifyEmailPage = () => {
  // Simulating the router and search params for demo
  const [token] = useState('demo-token');
  
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const verifyAccount = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      setVerificationStatus('verifying');
      
      // Simulate API call delay
      setTimeout(() => {
        // For demo, randomly show success or error
        const isSuccess = Math.random() > 0.3;
        if (isSuccess) {
          setVerificationStatus('success');
          setMessage('Your email has been successfully verified! You can now log in.');
        } else {
          setVerificationStatus('error');
          setMessage('Failed to verify email. The link might be invalid or expired.');
        }
      }, 2000);
    };

    if (token) {
      verifyAccount();
    }
  }, [token]);

  const handleRetry = () => {
    setVerificationStatus('verifying');
    setTimeout(() => {
      setVerificationStatus('success');
      setMessage('Your email has been successfully verified! You can now log in.');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div 
          className={`w-full max-w-lg transform transition-all duration-1000 ease-out ${
            isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
          }`}
        >
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-gray-500/5 rounded-3xl"></div>
            
            <div className="relative z-10 text-center">
              {/* Verifying State */}
              {verificationStatus === 'verifying' && (
                <div className="space-y-6">
                  {/* Loading icon with animated rings */}
                  <div className="relative mx-auto mb-8">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                    <div className="absolute inset-2 rounded-full bg-emerald-400/10 animate-ping delay-300"></div>
                    <Mail className="absolute -top-2 -right-2 w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-gray-700 bg-clip-text text-transparent mb-4">
                      Verifying Your Account
                    </h2>
                    <p className="text-lg text-gray-600 mb-2">
                      Please wait while we confirm your email address
                    </p>
                    <p className="text-sm text-gray-500">
                      This usually takes just a few seconds...
                    </p>
                  </div>

                  {/* Progress indicator */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {verificationStatus === 'success' && (
                <div className="space-y-6">
                  <div className="relative mx-auto mb-8">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg transform transition-transform duration-300 hover:scale-110">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                    <Shield className="absolute -top-2 -right-2 w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-gray-700 bg-clip-text text-transparent mb-4">
                      Verification Successful!
                    </h2>
                    <p className="text-lg text-gray-600 mb-2">
                      {message}
                    </p>
                  </div>

                  {/* Feature highlight */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-center space-x-3">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-800 font-medium">Your account is now secure and active</span>
                    </div>
                  </div>

                  <button className="group w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      <span>Go to Login</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </button>
                </div>
              )}

              {/* Error State */}
              {verificationStatus === 'error' && (
                <div className="space-y-6">
                  <div className="relative mx-auto mb-8">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                      <XCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping"></div>
                    <AlertTriangle className="absolute -top-2 -right-2 w-6 h-6 text-red-600 animate-pulse" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-gray-700 bg-clip-text text-transparent mb-4">
                      Verification Failed
                    </h2>
                    <p className="text-lg text-gray-600 mb-2">
                      {message}
                    </p>
                  </div>

                  {/* Error info box */}
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                    <div className="text-red-800 text-sm">
                      <p className="font-medium mb-1">Common reasons:</p>
                      <ul className="text-left space-y-1 ml-4">
                        <li>• Link has expired</li>
                        <li>• Token is invalid</li>
                        <li>• Email already verified</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleRetry}
                      className="group w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center space-x-2">
                        <RotateCcw className="w-5 h-5" />
                        <span>Try Again</span>
                      </div>
                    </button>

                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-2xl font-medium transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-300/50">
                      Sign Up Again
                    </button>

                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-medium transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300/50">
                      Back to Login
                    </button>
                  </div>
                </div>
              )}

              {/* Help section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Need assistance? 
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium ml-1 hover:underline transition-colors duration-200">
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;