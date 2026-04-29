import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  User, 
  Bell,
  Settings,
  LogOut,
  Trophy,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import NotificationCenter from './NotificationCenter';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useSimpleAuth();
  const { unreadCount } = useNotifications();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const displayName = currentUser?.profile?.name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'User');
  const displayInitial = displayName.charAt(0).toUpperCase();
  const userRole: string = (currentUser as any)?.role || '';
  const isMentor = userRole === 'mentor' || userRole === 'both';
  const isMentee = userRole === 'mentee' || userRole === 'both' || !userRole;

  useEffect(() => {
    if (!isMentor || !currentUser?.id) return;
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/connections', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const all = data.data?.connections || [];
        const count = all.filter((c: any) => c.mentor_user_id === currentUser.id && c.status === 'pending').length;
        setPendingCount(count);
      } catch { /* silent */ }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [isMentor, currentUser?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/home', label: 'Home' },
    { path: '/mentors', label: 'Mentor Discovery' },
    { path: '/experts', label: 'Expert Directory' },
    { path: '/collaboration', label: 'Collaboration Hub' },
    { path: '/resources', label: 'Resource Library' },
    { path: '/discussion', label: 'Discussion' },
    { path: '/calendar', label: 'Calendar' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16">

        {/* Top bar */}
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link to="/home" className="flex items-center flex-shrink-0">
            <img
              src="/assets/forvis-mazars-logo.png.png"
              alt="Forvis Mazars"
              className="h-9 sm:h-11 object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center h-full">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative h-full flex items-center px-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap
                  ${isActive(item.path)
                    ? 'text-[#1A1F5E] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#E83E2D] after:-t'
                    : 'text-[#333333] hover:text-[#1A1F5E]'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side: search, bell, profile */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search icon */}
            <button className="p-2 text-[#333333] hover:text-[#1A1F5E] hover:bg-[#F4F4F4] -lg transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#333333] hover:text-[#1A1F5E] hover:bg-[#F4F4F4] -lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#E83E2D] -full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-[#E5E7EB] mx-1" />

            {/* Profile dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 -lg hover:bg-[#F4F4F4] transition-colors"
              >
                <div className="w-8 h-8 bg-[#1A1F5E] -full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">{displayInitial}</span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-[#1A1F5E] leading-tight max-w-[120px] truncate">{displayName}</div>
                  <div className="text-xs text-[#8C8C8C] capitalize leading-tight">{userRole || 'Member'}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#8C8C8C] hidden md:block flex-shrink-0" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-1 w-56 bg-white -2xl shadow-xl border border-[#E5E7EB] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#E5E7EB] mb-1">
                    <p className="text-sm font-semibold text-[#1A1F5E] truncate">{displayName}</p>
                    <p className="text-xs text-[#8C8C8C] capitalize">{userRole || 'Member'}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#333333] hover:bg-[#F4F4F4] transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-4 h-4 text-[#8C8C8C]" />
                    <span>Profile</span>
                  </Link>
                  {isMentee && (
                    <Link
                      to="/mentorship-activities"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#333333] hover:bg-[#F4F4F4] transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Trophy className="w-4 h-4 text-[#0072CE]" />
                      <span>My Mentors</span>
                    </Link>
                  )}
                  {isMentor && (
                    <Link
                      to="/my-mentees"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#333333] hover:bg-[#F4F4F4] transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Users className="w-4 h-4 text-[#0072CE]" />
                      <span className="flex-1">My Mentees</span>
                      {pendingCount > 0 && (
                        <span className="ml-auto min-w-[20px] h-5 bg-[#E83E2D] -full flex items-center justify-center text-white text-xs font-bold px-1">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <Link
                    to="/preferences"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#333333] hover:bg-[#F4F4F4] transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="w-4 h-4 text-[#8C8C8C]" />
                    <span>Preferences</span>
                  </Link>
                  <hr className="my-1 border-[#E5E7EB]" />
                  <button
                    onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E83E2D] hover:bg-[#E83E2D]/5 w-full text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav row */}
        <div className="lg:hidden border-t border-[#E5E7EB] overflow-x-auto">
          <div className="flex items-center py-2 gap-1 min-w-max">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 -lg text-xs font-medium whitespace-nowrap transition-colors
                  ${isActive(item.path)
                    ? 'bg-[#1A1F5E] text-white'
                    : 'text-[#333333] hover:bg-[#F4F4F4] hover:text-[#1A1F5E]'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showProfileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
      )}

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </nav>
  );
};

export default Navigation;