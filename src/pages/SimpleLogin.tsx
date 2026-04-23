import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

const SimpleLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useSimpleAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] px-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <img 
                src="/assets/forvis-mazars-logo.png.png" 
                alt="Forvis Mazars"
                className="h-10 sm:h-14 lg:h-20 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-[#1A1F5E]">
              DEI Cafe
            </h1>
            <p className="text-xl text-gray-700 max-w-md mx-auto lg:mx-0">
              Connecting minds across Africa. Where mentors meet mentees to shape the continent's future.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 bg-[#1A1F5E] rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">10K+</span>
              </div>
              <h3 className="font-semibold text-[#333333]">Active Members</h3>
              <p className="text-sm text-gray-600">Across Africa</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 bg-[#1A1F5E] rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">54</span>
              </div>
              <h3 className="font-semibold text-[#333333]">Countries</h3>
              <p className="text-sm text-gray-600">Connected</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 bg-[#1A1F5E] rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">5K+</span>
              </div>
              <h3 className="font-semibold text-[#333333]">Connections</h3>
              <p className="text-sm text-gray-600">Made</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-t-[#1A1F5E] border border-[#E5E7EB]">
            <div className="text-center mb-8">
              <div className="h-1 w-12 bg-[#E83E2D] rounded-full mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-[#1A1F5E] mb-2">Welcome Back</h2>
              <p className="text-[#8C8C8C]">Sign in to continue your journey</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-4 rounded-2xl">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all duration-200"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all duration-200 pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#333333] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white py-3 rounded-full font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#8C8C8C]">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#0072CE] underline hover:text-[#E83E2D] font-medium">
                  Create Account
                </Link>
              </p>
              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-2 text-sm text-[#1A1F5E] hover:text-[#E83E2D] font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Admin Portal Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
