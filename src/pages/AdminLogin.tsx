import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid admin credentials.');
        return;
      }

      localStorage.setItem('adminToken', data.data.token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminUser', email);
      navigate('/admin');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F5E] via-[#0d1240] to-[#1A1F5E] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0072CE] rounded-full filter blur-3xl opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#E83E2D] rounded-full filter blur-3xl opacity-10" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#E83E2D] to-[#c0321f] rounded-2xl shadow-2xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-white/60">DEI Cafe Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-[#E83E2D]/20 border border-[#E83E2D]/40 rounded-2xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#E83E2D] shrink-0" />
                <p className="text-white text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/30 transition-all"
                  placeholder="admin@deiafrica.com"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/30 transition-all"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white font-semibold py-3 px-4 rounded-full shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Authenticating...</span></>
              ) : (
                <><Shield className="w-5 h-5" /><span>Sign In to Admin Panel</span></>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            ΓåÉ Back to Main Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
