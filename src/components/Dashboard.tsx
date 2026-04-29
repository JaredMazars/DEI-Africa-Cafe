import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, MessageSquare, Calendar, Settings, Building2, TrendingUp, Globe, Search, BookOpen, Briefcase, Target, Award, Clock, MapPin, Languages, ChevronRight, Plus, Filter, Bell, Video, FileText, BarChart3, PieChart, UserCheck, Handshake, Lightbulb, ArrowUpRight, CreditCard as Edit3, Eye, Trash2, CheckCircle, XCircle, AlertTriangle, Download, Upload, RefreshCw, MoreHorizontal, Star, TrendingDown, Activity, DollarSign, Zap, Shield, Database, Mail, Phone, Calendar as CalendarIcon, Flag, Hash, Percent, ArrowUp, ArrowDown } from 'lucide-react';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Comprehensive mock data for admin dashboard
  const adminAnalytics = {
    overview: {
      totalUsers: 2847,
      activeUsers: 1923,
      newUsersThisMonth: 342,
      totalConnections: 1456,
      activeConnections: 1203,
      pendingConnections: 89,
      totalSessions: 3421,
      completedSessions: 2987,
      totalRevenue: 125000,
      monthlyGrowth: 23.5
    },
    userMetrics: {
      mentors: 1124,
      mentees: 1723,
      verifiedExperts: 456,
      premiumUsers: 234,
      usersByCountry: [
        { country: 'Nigeria', count: 789, growth: 15.2 },
        { country: 'South Africa', count: 654, growth: 12.8 },
        { country: 'Kenya', count: 432, growth: 18.5 },
        { country: 'Ghana', count: 321, growth: 22.1 },
        { country: 'Egypt', count: 298, growth: 8.7 },
        { country: 'Morocco', count: 234, growth: 14.3 },
        { country: 'Ethiopia', count: 119, growth: 31.2 }
      ]
    },
    expertiseMetrics: {
      totalQuestions: 1234,
      answeredQuestions: 1089,
      averageResponseTime: '2.3 hours',
      topExperts: [
        { name: 'Dr. Amina Hassan', expertise: 'Fintech Regulation', responses: 89, rating: 4.9 },
        { name: 'John Okafor', expertise: 'Tax Advisory', responses: 76, rating: 4.8 },
        { name: 'Sarah Mwangi', expertise: 'ESG Compliance', responses: 65, rating: 4.9 },
        { name: 'Ahmed El-Sayed', expertise: 'Cross-border Trade', responses: 58, rating: 4.7 }
      ],
      popularTopics: [
        { topic: 'Fintech Regulation', questions: 234, trend: 'up' },
        { topic: 'Tax Advisory', questions: 198, trend: 'up' },
        { topic: 'ESG Compliance', questions: 167, trend: 'stable' },
        { topic: 'Cross-border Trade', questions: 145, trend: 'down' },
        { topic: 'Digital Banking', questions: 123, trend: 'up' }
      ]
    },
    collaborationMetrics: {
      totalOpportunities: 456,
      activeOpportunities: 234,
      completedDeals: 89,
      totalDealValue: 2400000,
      averageDealSize: 26966,
      topSectors: [
        { sector: 'Financial Services', deals: 34, value: 890000 },
        { sector: 'Technology', deals: 28, value: 650000 },
        { sector: 'Healthcare', deals: 15, value: 420000 },
        { sector: 'Energy', deals: 12, value: 440000 }
      ]
    }
  };

  const recentUsers = [
    { id: 1, name: 'Fatima Al-Rashid', email: 'fatima@example.com', role: 'mentor', country: 'Morocco', status: 'active', joinDate: '2024-01-15', connections: 12, rating: 4.8 },
    { id: 2, name: 'David Mwangi', email: 'david@example.com', role: 'mentee', country: 'Kenya', status: 'pending', joinDate: '2024-01-14', connections: 3, rating: 4.2 },
    { id: 3, name: 'Aisha Okafor', email: 'aisha@example.com', role: 'mentor', country: 'Nigeria', status: 'active', joinDate: '2024-01-13', connections: 18, rating: 4.9 },
    { id: 4, name: 'Mohamed Hassan', email: 'mohamed@example.com', role: 'mentee', country: 'Egypt', status: 'inactive', joinDate: '2024-01-12', connections: 1, rating: 3.8 },
    { id: 5, name: 'Grace Nyong', email: 'grace@example.com', role: 'mentor', country: 'Ghana', status: 'active', joinDate: '2024-01-11', connections: 15, rating: 4.7 }
  ];

  const recentConnections = [
    { id: 1, mentor: 'Dr. Amina Hassan', mentee: 'John Smith', status: 'active', created: '2024-01-15', lastActivity: '2 hours ago', sessions: 5 },
    { id: 2, mentor: 'Sarah Okafor', mentee: 'Mary Johnson', status: 'pending', created: '2024-01-14', lastActivity: '1 day ago', sessions: 0 },
    { id: 3, mentor: 'Ahmed El-Sayed', mentee: 'David Wilson', status: 'completed', created: '2024-01-10', lastActivity: '3 days ago', sessions: 12 },
    { id: 4, mentor: 'Fatima Al-Rashid', mentee: 'Lisa Brown', status: 'active', created: '2024-01-09', lastActivity: '5 hours ago', sessions: 8 }
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High server load detected in West Africa region', time: '10 minutes ago', severity: 'medium' },
    { id: 2, type: 'success', message: 'Monthly backup completed successfully', time: '2 hours ago', severity: 'low' },
    { id: 3, type: 'error', message: 'Payment processing issue for 3 users', time: '4 hours ago', severity: 'high' },
    { id: 4, type: 'info', message: 'New feature deployment scheduled for tonight', time: '6 hours ago', severity: 'low' }
  ];

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleStatusChange = (userId, newStatus) => {
    console.log(`Changing user ${userId} status to ${newStatus}`);
    // Implementation would update user status
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#0072CE] text-white -lg hover:bg-[#1A1F5E]">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB] cursor-pointer hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{adminAnalytics.overview.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUp className="w-4 h-4 mr-1" />
                +{adminAnalytics.overview.newUsersThisMonth} this month
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#0072CE]" />
            </div>
          </div>
        </div>

        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB] cursor-pointer hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className="text-3xl font-bold text-gray-900">{adminAnalytics.overview.activeConnections.toLocaleString()}</p>
              <p className="text-sm text-[#0072CE] flex items-center mt-1">
                <Handshake className="w-4 h-4 mr-1" />
                {adminAnalytics.overview.pendingConnections} pending
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 -xl flex items-center justify-center">
              <Handshake className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB] cursor-pointer hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${adminAnalytics.overview.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{adminAnalytics.overview.monthlyGrowth}% growth
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 -xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB] cursor-pointer hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{adminAnalytics.overview.completedSessions.toLocaleString()}</p>
              <p className="text-sm text-[#0072CE] flex items-center mt-1">
                <Video className="w-4 h-4 mr-1" />
                {adminAnalytics.overview.totalSessions - adminAnalytics.overview.completedSessions} scheduled
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -xl flex items-center justify-center">
              <Video className="w-6 h-6 text-[#0072CE]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-[#0072CE]" />
              User Growth by Country
            </h3>
            <button className="text-[#0072CE] hover:text-[#1A1F5E]">
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {adminAnalytics.userMetrics.usersByCountry.slice(0, 5).map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 -full ${index === 0 ? 'bg-[#0072CE]' : index === 1 ? 'bg-green-600' : index === 2 ? 'bg-yellow-600' : index === 3 ? 'bg-[#0072CE]' : 'bg-gray-600'}`}></div>
                  <span className="text-sm font-medium text-gray-900">{country.country}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{country.count}</span>
                  <span className={`text-xs flex items-center ${country.growth > 15 ? 'text-green-600' : country.growth > 10 ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {country.growth > 15 ? <ArrowUp className="w-3 h-3 mr-1" /> : country.growth > 10 ? <ArrowRight className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                    {country.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#0072CE]" />
              System Health
            </h3>
            <button className="text-[#0072CE] hover:text-[#1A1F5E]">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Server Uptime</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 -full"></div>
                <span className="text-sm font-medium">99.9%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Performance</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 -full"></div>
                <span className="text-sm font-medium">Optimal</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Response Time</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 -full"></div>
                <span className="text-sm font-medium">245ms</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#F4F4F4]0 -full"></div>
                <span className="text-sm font-medium">1,234</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-[#0072CE]" />
            System Alerts
          </h3>
          <button className="text-[#0072CE] hover:text-[#1A1F5E] text-sm">View All</button>
        </div>
        <div className="space-y-3">
          {systemAlerts.map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between p-3 -lg border ${
              alert.type === 'error' ? 'bg-red-50 border-red-200' :
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              alert.type === 'success' ? 'bg-green-50 border-green-200' :
              'bg-[#0072CE]/10 border-[#0072CE]/30'
            }`}>
              <div className="flex items-center space-x-3">
                {alert.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {alert.type === 'info' && <Bell className="w-5 h-5 text-[#0072CE]" />}
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#0072CE] text-white -lg hover:bg-[#1A1F5E]">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mentors</p>
              <p className="text-2xl font-bold text-[#0072CE]">{adminAnalytics.userMetrics.mentors}</p>
            </div>
            <Users className="w-8 h-8 text-[#0072CE]" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mentees</p>
              <p className="text-2xl font-bold text-green-600">{adminAnalytics.userMetrics.mentees}</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified Experts</p>
              <p className="text-2xl font-bold text-yellow-600">{adminAnalytics.userMetrics.verifiedExperts}</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Premium Users</p>
              <p className="text-2xl font-bold text-[#0072CE]">{adminAnalytics.userMetrics.premiumUsers}</p>
            </div>
            <Star className="w-8 h-8 text-[#0072CE]" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white -2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connections</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#1A1F5E]/10 -full flex items-center justify-center">
                        <span className="text-[#0072CE] font-medium">{user.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold -full ${
                      user.role === 'mentor' ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`text-xs font-semibold -full px-2 py-1 border-0 ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.connections}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{user.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-[#0072CE] hover:text-[#1A1F5E]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConnectionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Connection Management</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#1A1F5E] text-white -lg hover:opacity-90">
            <CheckCircle className="w-4 h-4" />
            <span>Approve All Pending</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#0072CE] text-white -lg hover:bg-[#1A1F5E]">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Connection Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Connections</p>
              <p className="text-2xl font-bold text-[#0072CE]">{adminAnalytics.overview.totalConnections}</p>
            </div>
            <Handshake className="w-8 h-8 text-[#0072CE]" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{adminAnalytics.overview.activeConnections}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{adminAnalytics.overview.pendingConnections}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-[#0072CE]">87%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#0072CE]" />
          </div>
        </div>
      </div>

      {/* Connections Table */}
      <div className="bg-white -2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Connections</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentConnections.map((connection) => (
                <tr key={connection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#1A1F5E]/10 -full flex items-center justify-center">
                        <span className="text-[#0072CE] text-sm font-medium">{connection.mentor.charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{connection.mentor}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 -full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-medium">{connection.mentee.charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{connection.mentee}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold -full ${
                      connection.status === 'active' ? 'bg-green-100 text-green-800' :
                      connection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      connection.status === 'completed' ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {connection.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{connection.created}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{connection.sessions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{connection.lastActivity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-[#0072CE] hover:text-[#1A1F5E]">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderExpertiseTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Expert Directory Analytics</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#0072CE] text-white -lg hover:bg-[#1A1F5E]">
            <Plus className="w-4 h-4" />
            <span>Add Expert</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#1A1F5E] text-white -lg hover:opacity-90">
            <Upload className="w-4 h-4" />
            <span>Bulk Import</span>
          </button>
        </div>
      </div>

      {/* Expertise Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-[#0072CE]">{adminAnalytics.expertiseMetrics.totalQuestions}</p>
            </div>
            <Lightbulb className="w-8 h-8 text-[#0072CE]" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Answered</p>
              <p className="text-2xl font-bold text-green-600">{adminAnalytics.expertiseMetrics.answeredQuestions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-yellow-600">{adminAnalytics.expertiseMetrics.averageResponseTime}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-[#0072CE]">88%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#0072CE]" />
          </div>
        </div>
      </div>

      {/* Top Experts and Popular Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-[#0072CE]" />
              Top Experts
            </h3>
            <button className="text-[#0072CE] hover:text-[#1A1F5E] text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {adminAnalytics.expertiseMetrics.topExperts.map((expert, index) => (
              <div key={expert.name} className="flex items-center justify-between p-3 -lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 -full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-blue-100' : 'bg-[#1A1F5E]/10'
                  }`}>
                    <span className={`text-sm font-bold ${
                      index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-blue-600' : 'text-[#0072CE]'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{expert.name}</div>
                    <div className="text-xs text-gray-500">{expert.expertise}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">{expert.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500">{expert.responses} responses</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#0072CE]" />
              Popular Topics
            </h3>
            <button className="text-[#0072CE] hover:text-[#1A1F5E] text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {adminAnalytics.expertiseMetrics.popularTopics.map((topic, index) => (
              <div key={topic.topic} className="flex items-center justify-between p-3 -lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#1A1F5E]/10 -full flex items-center justify-center">
                    <Hash className="w-4 h-4 text-[#0072CE]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{topic.topic}</div>
                    <div className="text-xs text-gray-500">{topic.questions} questions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {topic.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
                  {topic.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
                  {topic.trend === 'stable' && <ArrowRight className="w-4 h-4 text-gray-600" />}
                  <button className="text-[#0072CE] hover:text-[#1A1F5E]">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCollaborationTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Collaboration & Deals Analytics</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#0072CE] text-white -lg hover:bg-[#1A1F5E]">
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#1A1F5E] text-white -lg hover:opacity-90">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Collaboration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Opportunities</p>
              <p className="text-2xl font-bold text-[#0072CE]">{adminAnalytics.collaborationMetrics.totalOpportunities}</p>
            </div>
            <Briefcase className="w-8 h-8 text-[#0072CE]" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-green-600">{adminAnalytics.collaborationMetrics.activeOpportunities}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Deals</p>
              <p className="text-2xl font-bold text-yellow-600">{adminAnalytics.collaborationMetrics.completedDeals}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white -xl shadow-lg p-4 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deal Value</p>
              <p className="text-2xl font-bold text-[#0072CE]">${(adminAnalytics.collaborationMetrics.totalDealValue / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="w-8 h-8 text-[#0072CE]" />
          </div>
        </div>
      </div>

      {/* Top Sectors Performance */}
      <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-[#0072CE]" />
            Top Performing Sectors
          </h3>
          <button className="text-[#0072CE] hover:text-[#1A1F5E] text-sm">View Details</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminAnalytics.collaborationMetrics.topSectors.map((sector, index) => (
            <div key={sector.sector} className="p-4 -lg border border-gray-200 hover:border-[#0072CE]/40 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{sector.sector}</h4>
                <span className={`w-3 h-3 -full ${
                  index === 0 ? 'bg-[#0072CE]' : index === 1 ? 'bg-green-600' : index === 2 ? 'bg-yellow-600' : 'bg-[#0072CE]'
                }`}></span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deals:</span>
                  <span className="font-medium">{sector.deals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium">${(sector.value / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Deal:</span>
                  <span className="font-medium">${(sector.value / sector.deals / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-[#1A1F5E] bg-clip-text text-transparent">
                  DEI Cafe
                </h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 -full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#1A1F5E]/10 -full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#0072CE]" />
                </div>
                <span className="text-gray-700 font-medium">Admin</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'connections', label: 'Connections', icon: Handshake },
              { id: 'expertise', label: 'Expert Directory', icon: BookOpen },
              { id: 'collaboration', label: 'Collaboration', icon: Briefcase }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0072CE] text-[#0072CE]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'connections' && renderConnectionsTab()}
        {activeTab === 'expertise' && renderExpertiseTab()}
        {activeTab === 'collaboration' && renderCollaborationTab()}
      </main>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white -2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  defaultValue={selectedUser.name}
                  className="w-full px-3 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  defaultValue={selectedUser.email}
                  className="w-full px-3 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  defaultValue={selectedUser.role}
                  className="w-full px-3 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                >
                  <option value="mentor">Mentor</option>
                  <option value="mentee">Mentee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  defaultValue={selectedUser.status}
                  className="w-full px-3 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-[#0072CE] text-white -lg hover:bg-[#1A1F5E]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
