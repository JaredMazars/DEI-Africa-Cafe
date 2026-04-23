import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Loader, ArrowLeft } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Your email has been successfully verified!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { state: { emailVerified: true } });
        }, 3000);
      } else {
        if (data.error === 'Token expired') {
          setStatus('expired');
          setMessage('Your verification link has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Email verification failed. Please try again.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      console.error('Email verification error:', error);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Email address not found. Please try registering again.');
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        setMessage('A new verification email has been sent. Please check your inbox.');
        setStatus('verifying');
      } else {
        alert(data.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
      console.error('Resend verification error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/assets/forvis-mazars-logo.png.png" 
            alt="Forvis Mazars"
            className="h-10 sm:h-14 lg:h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verification</h1>
          <p className="text-gray-600">DEI Cafe</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1A1F5E]/10 rounded-full mb-6">
                <Loader className="w-10 h-10 text-[#0072CE] animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Redirecting you to login page in 3 seconds...
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#0072CE] text-white rounded-lg hover:bg-[#1A1F5E] transition-colors font-medium"
              >
                Go to Login Now
              </Link>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
                <Mail className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              {resendSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    ✓ New verification email sent! Please check your inbox.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full px-6 py-3 bg-[#0072CE] text-white rounded-lg hover:bg-[#1A1F5E] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mb-4"
                >
                  {resendLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              )}

              <Link
                to="/login"
                className="inline-flex items-center justify-center text-[#0072CE] hover:text-[#1A1F5E] font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                {email && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full px-6 py-3 bg-[#0072CE] text-white rounded-lg hover:bg-[#1A1F5E] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {resendLoading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                )}
                
                <Link
                  to="/register"
                  className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                >
                  Register Again
                </Link>
                
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center text-[#0072CE] hover:text-[#1A1F5E] font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@forvismazars.com" className="text-[#0072CE] hover:text-[#1A1F5E] font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
