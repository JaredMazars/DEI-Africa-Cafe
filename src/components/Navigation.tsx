import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  User, 
  Bell,
  Settings,
  Briefcase,
  Award,
  LogOut,
  Trophy
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import NotificationCenter from './NotificationCenter';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useSimpleAuth();
  const { unreadCount } = useNotifications();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/home', icon: Home, label: 'Home' },
    // { path: '/dashboard', icon: Target, label: 'Dashboard' },
    { path: '/mentors', icon: Users, label: 'Mentor Discovery' },
    { path: '/experts', icon: Award, label: 'Expert Directory' },
    { path: '/collaboration', icon: Briefcase, label: 'Collaboration Hub' },
    { path: '/resources', icon: BookOpen, label: 'Resource Library' },
    { path: '/discussion', icon: MessageSquare, label: 'Discussion' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#1A1F5E] shadow-2xl sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-6 min-w-0 flex-shrink">
            <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <img 
                src="/assets/forvis-mazars-logo.png.png" 
                alt="Forvis Mazars"
                className="h-8 sm:h-10 object-contain flex-shrink-0"
              />
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 whitespace-nowrap truncate">
                  DEI Cafe
                </h1>
                <p className="text-xs text-gray-500">Forvis Mazars</p>
              </div>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white font-semibold border-b-2 border-[#E83E2D]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 min-w-0 justify-end">
            {/* Search */}
            {/* <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] text-sm w-64"
              />
            </div> */}

            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div 
                  data-profile-icon
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-white font-medium text-xs sm:text-sm">
                    U
                  </span>
                </div>
                <div className="hidden md:block text-left min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    User
                  </div>
                  <div className="text-xs text-white/60 truncate">
                    Mentee
                  </div>
                </div>
                <Settings className="w-4 h-4 text-white/60 hidden sm:block flex-shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/mentorship-activities"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Trophy className="w-4 h-4 text-[#0072CE]" />
                    <span>My Mentors</span>
                  </Link>
                  <Link
                    to="/my-mentees"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Users className="w-4 h-4 text-[#0072CE]" />
                    <span>My Mentees</span>
                  </Link>
                  <Link
                    to="/preferences"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Preferences</span>
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-white/20 py-2 sm:py-3 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2 pb-1 min-w-max px-3 sm:px-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white font-semibold bg-white/10 border-b-2 border-[#E83E2D]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </nav>
  );
};

export default Navigation;