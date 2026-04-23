import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await axios.post('/api/auth/verify-email', { token });
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          
          // Enable login for this user
          const pendingData = localStorage.getItem('pendingVerification');
          if (pendingData) {
            const { email, password, profile } = JSON.parse(pendingData);
            // Store verified user credentials
            localStorage.setItem('verifiedUser', JSON.stringify({ email, password, profile }));
            localStorage.removeItem('pendingVerification');
          }
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-[#E5E7EB] text-center">
          {status === 'verifying' && (
            <>
              <Loader className="w-16 h-16 text-[#0072CE] animate-spin mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifying Your Email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Redirecting you to login page in a few seconds...
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Go to Login Now
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  The verification link may be invalid or expired.
                </p>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Register Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
