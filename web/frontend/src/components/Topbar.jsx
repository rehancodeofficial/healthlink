// FILE: src/components/Topbar.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
  FaSun,
  FaMoon,
  FaClock,
  FaBars,
} from 'react-icons/fa';
import api from '../Lib/api';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ userName, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;

      try {
        if (role === 'PATIENT') {
          const res = await api.get(`/notifications/count/${userId}`);
          setNotificationCount(res.data?.notifications || 0);
        } else {
          const res = await api.get('/messages/unread-count', {
            params: { userId },
          });
          setNotificationCount(res.data?.count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, role]);

  const handleNotificationClick = () => {
    if (role === 'PATIENT') navigate('/patient/messages');
    else if (role === 'DOCTOR') navigate('/doctor/messages/inbox');
    else if (role === 'ADMIN') navigate('/admin/messages/inbox');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfile = () => {
    if (role === 'PATIENT') navigate('/patient/profile/view-profile');
    else if (role === 'DOCTOR') navigate('/doctor/view-profile');
    else if (role === 'PHARMACY') navigate('/pharmacy/view-profile');
    else if (role === 'ADMIN') navigate('/admin/profile');
    else if (role === 'SUPERADMIN') navigate('/superadmin/profile');
    else if (role === 'SUPPORT') navigate('/support/profile');
    setShowUserMenu(false);
  };

  return (
    <header className={`sticky top-0 z-50 h-[70px] md:h-[80px] flex items-center justify-between px-4 md:px-8 backdrop-blur-xl border-b border-white/20 shadow-sm ${
      theme === 'light' ? 'bg-gradient-to-r from-green-700 via-emerald-800 to-green-900' : 'bg-[var(--bg-glass)]'
    }`}>
      {/* Hamburger Menu Button - Mobile Only */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-3 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Logo and Welcome - Desktop */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-3">
        <img src="/images/logo/Asset3.png" alt="Logo" className="w-8 h-8" />
        <h1 className="text-xl font-black tracking-tighter text-white animate-in fade-in slide-in-from-left-4 duration-500">
          Welcome back,{' '}
          <span className="text-emerald-300">
            {userName ? userName.split(' ')[0] : 'User'}
          </span>
        </h1>
      </div>

      {/* Mobile Logo - Center aligned on mobile */}
      <div className="flex-1 flex md:hidden items-center justify-center">
        <img src="/images/logo/Asset3.png" alt="Logo" className="w-8 h-8" />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Clock - Hidden on tablets and mobile */}
        <div className="hidden xl:flex flex-col items-end pr-6 border-r border-white/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
            Current Time
          </span>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FaClock className="text-emerald-300" />
            {time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 md:p-3 rounded-2xl bg-white/10 border border-white/10 text-white hover:text-emerald-300 transition-all shadow-sm active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Toggle Theme"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <FaMoon className="w-4 h-4" /> : <FaSun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div
          className="relative cursor-pointer p-2.5 md:p-3 rounded-2xl bg-white/10 border border-white/10 text-white hover:text-emerald-300 transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={handleNotificationClick}
          role="button"
          aria-label="Notifications"
          tabIndex={0}
        >
          <FaBell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--brand-orange)] text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-orange-500/20">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </div>

        {/* User Menu */}
        <div className="relative ml-1 md:ml-2">
          <button
            className="flex items-center gap-2 md:gap-3 p-1.5 pr-2 md:pr-4 rounded-2xl bg-white/10 border border-white/10 hover:border-emerald-300 transition-all active:scale-95 shadow-sm min-h-[44px]"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-white text-[var(--brand-green)] flex items-center justify-center font-black text-base md:text-lg">
              {userName ? userName.charAt(0).toUpperCase() : <FaUserCircle />}
            </div>
            <div className="hidden md:flex flex-col items-start whitespace-nowrap">
              <span className="text-sm font-black text-white truncate max-w-[120px]">
                {userName ? userName.split(' ')[0] : 'User'}
              </span>
              <span className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">
                {role || 'ACCESS'}
              </span>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 glass !p-2 !rounded-3xl z-50 animate-in zoom-in-95 fade-in duration-200 shadow-2xl">
              <button
                onClick={handleProfile}
                className="w-full px-4 py-3 text-left rounded-2xl hover:bg-[var(--bg-main)] flex items-center gap-3 text-[var(--text-soft)] transition-all group"
              >
                <div className="p-2 rounded-xl bg-[var(--brand-green)]/10 text-[var(--brand-green)] group-hover:scale-110 transition-transform">
                  <FaUser />
                </div>
                <span className="font-bold text-sm tracking-tight">
                  View Profile
                </span>
              </button>
              <div className="my-1 border-t border-[var(--border)] mx-2" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left rounded-2xl hover:bg-red-500/10 flex items-center gap-3 text-red-500 transition-all group"
              >
                <div className="p-2 rounded-xl bg-red-500/10 group-hover:scale-110 transition-transform">
                  <FaSignOutAlt />
                </div>
                <span className="font-bold text-sm tracking-tight">
                  System Logout
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
