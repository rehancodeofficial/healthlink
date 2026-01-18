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
} from 'react-icons/fa';
import api from '../Lib/api';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ userName }) {
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
    <header className={`sticky top-0 z-50 h-[80px] flex items-center justify-between px-8 backdrop-blur-xl border-b border-white/20 shadow-sm ${
      theme === 'light' ? 'bg-gradient-to-r from-green-700 via-emerald-800 to-green-900' : 'bg-[var(--bg-glass)]'
    }`}>
      {/* Search / Breadcrumbs Area */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-3">
        <img src="/images/logo/Asset3.png" alt="Logo" className="w-8 h-8" />
        <h1 className="text-xl font-black tracking-tighter text-white animate-in fade-in slide-in-from-left-4 duration-500">
          Welcome back,{' '}
          <span className="text-emerald-300">
            {userName ? userName.split(' ')[0] : 'User'}
          </span>
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="hidden lg:flex flex-col items-end pr-6 border-r border-white/20">
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
          className="p-3 rounded-2xl bg-white/10 border border-white/10 text-white hover:text-emerald-300 transition-all shadow-sm active:scale-95"
          title="Toggle Theme"
        >
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        {/* Notifications */}
        <div
          className="relative cursor-pointer p-3 rounded-2xl bg-white/10 border border-white/10 text-white hover:text-emerald-300 transition-all active:scale-95"
          onClick={handleNotificationClick}
        >
          <FaBell />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--brand-orange)] text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-orange-500/20">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </div>

        {/* User Menu */}
        <div className="relative ml-2">
          <button
            className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white/10 border border-white/10 hover:border-emerald-300 transition-all active:scale-95 shadow-sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="h-9 w-9 rounded-xl bg-white text-[var(--brand-green)] flex items-center justify-center font-black text-lg">
              {userName ? userName.charAt(0).toUpperCase() : <FaUserCircle />}
            </div>
            <div className="hidden sm:flex flex-col items-start whitespace-nowrap">
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
