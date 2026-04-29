import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';

const VerificationPending: React.FC = () => {
  const email = sessionStorage.getItem('registrationEmail') || 
                localStorage.getItem('pendingVerification') ? 
                JSON.parse(localStorage.getItem('pendingVerification') || '{}').email : 
                'your email';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white -2xl shadow-2xl p-8 border border-[#E5E7EB] text-center">
          <div className="w-20 h-20 bg-[#1A1F5E]/10 -full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-[#0072CE]" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>
          
          <div className="mb-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              We've sent a verification link to:
            </p>
            <p className="text-[#0072CE] font-semibold text-lg mb-4">
              {email}
            </p>
            <p className="text-gray-600 text-sm">
              Click the link in the email to verify your account and complete your registration.
            </p>
          </div>

          <div className="bg-[#F4F4F4] border border-[#0072CE]/30 -lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Next Steps:</strong>
            </p>
            <ol className="text-sm text-gray-600 text-left mt-2 space-y-1 list-decimal list-inside">
              <li>Check your inbox for the verification email</li>
              <li>Click the verification link in the email</li>
              <li>Once verified, you can log in to your account</li>
            </ol>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            <p>Didn't receive the email? Check your spam folder.</p>
          </div>

          <Link
            to="/login"
            className="inline-block w-full bg-[#1A1F5E] text-white py-3 -lg font-semibold hover:opacity-90 transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
