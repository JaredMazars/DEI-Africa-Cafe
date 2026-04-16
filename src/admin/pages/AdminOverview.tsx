import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCog,
  FileText,
  Briefcase,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import { getData, STORAGE_KEYS } from '../../services/dataStore';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalMentors: number;
  totalContent: number;
  totalOpportunities: number;
  totalResources: number;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  entity: string;
  details: string;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMentors: 0,
    totalContent: 0,
    totalOpportunities: 0,
    totalResources: 0
  });
  const [recentAudits, setRecentAudits] = useState<AuditEntry[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentAudits();
  }, []);

  const loadStats = () => {
    const users = getData(STORAGE_KEYS.USERS, []);
    const mentors = getData(STORAGE_KEYS.MENTORS, []);
    const videos = getData(STORAGE_KEYS.VIDEOS, []);
    const articles = getData(STORAGE_KEYS.ARTICLES, []);
    const opportunities = getData(STORAGE_KEYS.OPPORTUNITIES, []);
    const resources = getData(STORAGE_KEYS.RESOURCES, []);

    setStats({
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.status === 'active').length,
      totalMentors: mentors.length,
      totalContent: videos.length + articles.length,
      totalOpportunities: opportunities.length,
      totalResources: resources.length
    });
  };

  const loadRecentAudits = () => {
    const audits = getData(STORAGE_KEYS.AUDIT_LOG, []) as AuditEntry[];
    setRecentAudits(audits.slice(-10).reverse());
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', subtext: `${stats.activeUsers} active` },
    { label: 'Mentors', value: stats.totalMentors, icon: UserCog, color: 'blue', subtext: 'Verified experts' },
    { label: 'Content Items', value: stats.totalContent, icon: FileText, color: 'green', subtext: 'Videos & Articles' },
    { label: 'Opportunities', value: stats.totalOpportunities, icon: Briefcase, color: 'orange', subtext: 'Jobs & Events' },
    { label: 'Resources', value: stats.totalResources, icon: Activity, color: 'pink', subtext: 'Library items' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Platform statistics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-2 sm:p-3 rounded-lg bg-${stat.color}-100 mb-2 sm:mb-3`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`} />
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-xl font-bold mb-2 text-base text-white">Welcome, Admin!</h2>
        <p className="text-sm sm:text-base text-blue-100">
          You have full access to manage all platform features. Use the sidebar to navigate to different sections.
        </p>
      </div>

      {/* Recent Audit Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Latest admin actions across the platform</p>
            </div>
            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentAudits.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm sm:text-base">No recent activity. Start managing the platform!</p>
            </div>
          ) : (
            recentAudits.map((audit) => (
              <div key={audit.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{audit.admin}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-xs sm:text-sm text-gray-600">
                        {new Date(audit.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 break-words">
                      <span className="font-medium text-blue-600">{audit.action}</span>{' '}
                      <span className="text-gray-500">{audit.entity}</span> - {audit.details}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

