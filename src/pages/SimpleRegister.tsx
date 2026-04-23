import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, Mail, Lock, Users, Globe, Network } from 'lucide-react';

const SimpleRegister: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      sessionStorage.setItem('registrationEmail', email);
      sessionStorage.setItem('registrationPassword', password);
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Members', sub: 'Across Africa' },
    { icon: Globe, value: '54', label: 'Countries', sub: 'Connected' },
    { icon: Network, value: '5K+', label: 'Connections', sub: 'Made' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] px-4 py-12">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Side – Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Forvis_Mazars_logo.svg/320px-Forvis_Mazars_logo.svg.png"
              alt="Forvis Mazars"
              className="h-10 mx-auto lg:mx-0"
            />
            <div className="h-1 w-12 bg-[#E83E2D] rounded-full mx-auto lg:mx-0" />
            <h1 className="text-4xl font-bold text-[#1A1F5E]">DEI Cafe</h1>
            <p className="text-xl text-[#333333] max-w-md mx-auto lg:mx-0 leading-relaxed">
              Join thousands of professionals across Africa in meaningful mentorship connections.
            </p>
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-4">
            {stats.map(({ icon: Icon, value, label, sub }) => (
              <div key={label} className="text-center p-5 rounded-3xl bg-white shadow-xl border border-[#E5E7EB]">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1A1F5E] to-[#0072CE] rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-bold text-[#1A1F5E]">{value}</p>
                <p className="text-sm font-semibold text-[#333333]">{label}</p>
                <p className="text-xs text-[#8C8C8C]">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side – Register Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-t-[#1A1F5E] border border-[#E5E7EB]">
            <div className="text-center mb-8">
              <div className="h-1 w-12 bg-[#E83E2D] rounded-full mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-[#1A1F5E] mb-2">Create Account</h2>
              <p className="text-[#8C8C8C]">Join the DEI Cafe community</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-4 rounded-2xl">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C8C8C]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all duration-200"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C8C8C]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all duration-200"
                    placeholder="Create a strong password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#333333] transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C8C8C]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all duration-200"
                    placeholder="Confirm your password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#333333] transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white py-3 rounded-full font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
              >
                {loading ? (
                  <><Loader className="w-5 h-5 animate-spin mr-2" />Creating Account...</>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#8C8C8C]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0072CE] underline hover:text-[#E83E2D] font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimpleRegister;
