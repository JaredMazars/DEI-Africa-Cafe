import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Globe, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/forvis-mazars-logo.png.png" 
                alt="Forvis Mazars"
                className="h-8 sm:h-10 lg:h-12 object-contain"
              />
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-bold text-gray-800">
                DEI Cafe
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-[#0072CE] font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect. Learn. Grow.
            <span className="block text-[#0072CE]">Across Africa.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join DEI Cafe, the premier mentorship platform connecting professionals 
            across the continent. Share knowledge, build networks, and shape Africa's future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="border border-[#0072CE] text-[#0072CE] hover:bg-[#1A1F5E]/5 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <Users className="w-12 h-12 text-[#0072CE] mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900">10,000+</h3>
            <p className="text-gray-600">Active Members</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <Globe className="w-12 h-12 text-[#0072CE] mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900">54</h3>
            <p className="text-gray-600">Countries Connected</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <Building2 className="w-12 h-12 text-[#0072CE] mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900">5,000+</h3>
            <p className="text-gray-600">Successful Connections</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;