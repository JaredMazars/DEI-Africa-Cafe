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
    
    // Check if admin credentials
    if (email === 'admin@deiafrica.com' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-token-' + Date.now());
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
      return;
    }
    
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 px-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Forvis_Mazars_logo.svg/320px-Forvis_Mazars_logo.svg.png" 
                alt="Forvis Mazars"
                className="h-10"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              One Africa Hub
            </h1>
            <p className="text-xl text-gray-700 max-w-md mx-auto lg:mx-0">
              Connecting minds across Africa. Where mentors meet mentees to shape the continent's future.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">10K+</span>
              </div>
              <h3 className="font-semibold text-gray-800">Active Members</h3>
              <p className="text-sm text-gray-600">Across Africa</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">54</span>
              </div>
              <h3 className="font-semibold text-gray-800">Countries</h3>
              <p className="text-sm text-gray-600">Connected</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">5K+</span>
              </div>
              <h3 className="font-semibold text-gray-800">Connections</h3>
              <p className="text-sm text-gray-600">Made</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to continue your journey</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create Account
                </Link>
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link 
                  to="/admin/login"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Admin Portal Login
                </Link>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p className="font-semibold mb-2">Demo Credentials:</p>
                <div className="space-y-2">
                  <div className="font-mono bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="text-blue-700 font-semibold mb-1">Expert Account:</p>
                    <p>Email: expert@oneafrica.com<br />
                    Password: expert123</p>
                  </div>
                  <div className="font-mono bg-blue-50 p-2 rounded border border-purple-200">
                    <p className="text-blue-700 font-semibold mb-1">Admin Account:</p>
                    <p>Email: admin@deiafrica.com<br />
                    Password: admin123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
