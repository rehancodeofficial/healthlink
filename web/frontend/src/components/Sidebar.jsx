// FILE: src/components/Sidebar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaUserMd,
  FaUsers,
  FaChartBar,
  FaCogs,
  FaSignOutAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaChevronDown,
  FaUserShield,
  FaInbox,
  FaVideo,
  FaTicketAlt,
  FaComments,
  FaEnvelope,
  FaPaperPlane,
  FaIdCard,
  FaPills,
  FaListUl,
  FaCircle,
  FaTimes,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import api, { getNotifications } from '../Lib/api';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ role: propRole, isMobileMenuOpen, setIsMobileMenuOpen }) {

  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [open, setOpen] = useState(true);
  const [openMessages, setOpenMessages] = useState(false);
  const [openManageUsers, setOpenManageUsers] = useState(false);
  const [showPatientMsg, setShowPatientMsg] = useState(false);
  const [showPatientDoctors, setShowPatientDoctors] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [patientMsgCount, setPatientMsgCount] = useState(0);
  const [openSubscribers, setOpenSubscribers] = useState(false);
  const [openPharmacy, setOpenPharmacy] = useState(false);

  const role = propRole || localStorage.getItem('role') || 'PATIENT';
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    let mounted = true;
    async function loadCounters() {
      try {
        if (!userId) return;
        if (role === 'PATIENT') {
          const n = await getNotifications(userId);
          if (mounted) setPatientMsgCount(Number(n) || 0);
        } else {
          const res = await api.get(`/messages/unread-count`, {
            params: { userId },
          });
          const count = res?.data?.count ?? 0;
          if (mounted) setUnreadCount(Number(count) || 0);
        }
      } catch {
        // silent
      }
    }
    loadCounters();
    const t = setInterval(loadCounters, 30000);
    const handleMessagesRead = () => {
      if (role === 'PATIENT') setPatientMsgCount(0);
      else setUnreadCount(0);
    };
    window.addEventListener('messages:read', handleMessagesRead);
    return () => {
      mounted = false;
      clearInterval(t);
      window.removeEventListener('messages:read', handleMessagesRead);
    };
  }, [role, userId]);

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon, label, badge }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen?.(false)} // Close mobile menu on navigation
      className={`flex items-center gap-3 px-4 py-3.5 min-h-[44px] rounded-2xl transition-all duration-200 group relative ${
        isActive(to)
          ? 'bg-white text-[var(--brand-green)] shadow-lg'
          : 'text-emerald-100 hover:bg-white/10 hover:text-white'
      }`}
    >
      <div
        className={`text-lg transition-transform group-hover:scale-110 ${
          isActive(to) ? 'text-[var(--brand-green)]' : ''
        }`}
      >
        {icon}
      </div>
      {open && (
        <span className="font-bold text-sm tracking-tight flex-1">{label}</span>
      )}
      {badge > 0 && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--brand-orange)] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
      {isActive(to) && open && (
        <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 h-8 w-1.5 bg-white rounded-r-full" />
      )}
    </Link>
  );

  const DropdownItem = ({ icon, label, isOpen, onClick, children, badge }) => (
    <div className="space-y-1">
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 min-h-[44px] rounded-2xl transition-all duration-200 group ${
          isOpen
            ? 'text-white bg-white/10'
            : 'text-emerald-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="text-lg group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {open && (
            <span className="font-bold text-sm tracking-tight">{label}</span>
          )}
          {badge > 0 && !isOpen && (
            <span className="bg-[var(--brand-orange)] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-auto">
              {badge}
            </span>
          )}
        </div>
        {open && (
          <FaChevronDown
            className={`transition-transform duration-300 text-[10px] ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
      {isOpen && open && (
        <div className="ml-6 pl-4 border-l-2 border-white/20 space-y-1 animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );

  const SubItem = ({ to, label, icon }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen?.(false)} // Close mobile menu on navigation
      className={`flex items-center gap-3 px-3 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all ${
        isActive(to)
          ? 'bg-white text-[var(--brand-green)] shadow-md'
          : 'text-emerald-100 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`h-screen sticky top-0 border-r border-white/10 transition-all duration-500 ease-in-out flex flex-col z-[60] ${
          open ? 'w-72' : 'w-24'
        } bg-gradient-to-b from-green-700 via-emerald-800 to-green-900 shadow-xl
        
        ${/* Mobile responsive classes */ ''}
        fixed lg:sticky
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Logo Section */}
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3">
            {/* Mobile Close Button - Only visible on mobile when menu is open */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white shrink-0"
              aria-label="Close menu"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            <div
              className="bg-white/10 p-2 rounded-xl shadow-lg cursor-pointer shrink-0 border border-white/10 backdrop-blur-sm"
              onClick={() => setOpen(!open)}
            >
              <img src="/images/logo/Asset3.png" alt="Logo" className="w-8 h-8" />
            </div>
            {open && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <p className="text-xl font-black tracking-tighter text-white">
                  Cure<span className="text-blue-200">Virtual</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <FaCircle className="text-white text-[6px] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                    {role} PANEL
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>


      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto scrollbar-hide">
        {/* SUPERADMIN */}
        {role === 'SUPERADMIN' && (
          <>
            <NavItem
              to="/superadmin/dashboard"
              icon={<FaChartBar />}
              label="Dashboard"
            />
            <NavItem
              to="/superadmin/manage-admins"
              icon={<FaUserShield />}
              label="Admins"
            />
            <DropdownItem
              icon={<FaUsers />}
              label="Subscribers"
              isOpen={openSubscribers}
              onClick={() => setOpenSubscribers(!openSubscribers)}
            >
              <SubItem
                to="/superadmin/subscribers"
                label="Statistics"
                icon={<FaChartBar />}
              />
              <SubItem
                to="/superadmin/subscribers/doctors"
                label="Doctors"
                icon={<FaUserMd />}
              />
              <SubItem
                to="/superadmin/subscribers/patients"
                label="Patients"
                icon={<FaUsers />}
              />
              <SubItem
                to="/superadmin/subscribers/pharmacy"
                label="Pharmacies"
                icon={<FaIdCard />}
              />
            </DropdownItem>
            <NavItem
              to="/superadmin/system-reports"
              icon={<FaChartBar />}
              label="System Audit"
            />
            <NavItem
              to="/superadmin/settings"
              icon={<FaCogs />}
              label="Global Config"
            />
            <NavItem
              to="/superadmin/activity-logs"
              icon={<FaListUl />}
              label="Security Flux"
            />
            <DropdownItem
              icon={<FaEnvelope />}
              label="Messages"
              isOpen={openMessages}
              onClick={() => setOpenMessages(!openMessages)}
              badge={unreadCount}
            >
              <SubItem
                to="/superadmin/messages/inbox"
                label="Inbox"
                icon={<FaInbox />}
              />
              <SubItem
                to="/superadmin/messages/send"
                label="Compose"
                icon={<FaPaperPlane />}
              />
            </DropdownItem>
          </>
        )}

        {/* ADMIN */}
        {role === 'ADMIN' && (
          <>
            <NavItem
              to="/admin/dashboard"
              icon={<FaChartBar />}
              label="Overview"
            />
            <DropdownItem
              icon={<FaUsers />}
              label="Identity Hub"
              isOpen={openManageUsers}
              onClick={() => setOpenManageUsers(!openManageUsers)}
            >
              <SubItem
                to="/admin/users-list"
                label="User Registry"
                icon={<FaListUl />}
              />
              <SubItem
                to="/admin/manage-users"
                label="Provision Identity"
                icon={<FaUserShield />}
              />
              <SubItem
                to="/admin/reports"
                label="Operational Audit"
                icon={<FaChartBar />}
              />
            </DropdownItem>
            <DropdownItem
              icon={<FaUsers />}
              label="Subscribers"
              isOpen={openSubscribers}
              onClick={() => setOpenSubscribers(!openSubscribers)}
            >
              <SubItem
                to="/admin/subscribers"
                label="Market Stats"
                icon={<FaChartBar />}
              />
              <SubItem
                to="/admin/subscribers/doctors"
                label="Medical Staff"
                icon={<FaUserMd />}
              />
              <SubItem
                to="/admin/subscribers/patients"
                label="Patients"
                icon={<FaUsers />}
              />
            </DropdownItem>
            <NavItem
              to="/admin/subscription"
              icon={<FaCogs />}
              label="Billing"
            />
            <DropdownItem
              icon={<FaEnvelope />}
              label="Mailbox"
              isOpen={openMessages}
              onClick={() => setOpenMessages(!openMessages)}
              badge={unreadCount}
            >
              <SubItem
                to="/admin/messages/inbox"
                label="Incoming"
                icon={<FaInbox />}
              />
              <SubItem
                to="/admin/messages/send"
                label="New Message"
                icon={<FaPaperPlane />}
              />
            </DropdownItem>
          </>
        )}

        {/* DOCTOR */}
        {role === 'DOCTOR' && (
          <>
            <NavItem
              to="/doctor/dashboard"
              icon={<FaChartBar />}
              label="Clinical Desk"
            />
            <NavItem
              to="/doctor/appointments"
              icon={<FaCalendarAlt />}
              label="Appointments"
            />
            <NavItem
              to="/doctor/schedule"
              icon={<FaCalendarAlt />}
              label="My Schedule"
            />
            <NavItem
              to="/doctor/prescriptions"
              icon={<FaClipboardList />}
              label="Medical Audit"
            />
            <NavItem
              to="/doctor/patients"
              icon={<FaUsers />}
              label="Patient Pool"
            />
            <NavItem
              to="/doctor/video-consultation"
              icon={<FaVideo />}
              label="Virtual Room"
            />
            <NavItem
              to="/doctor/subscription"
              icon={<FaCogs />}
              label="Packages"
            />
            <DropdownItem
              icon={<FaEnvelope />}
              label="Communications"
              isOpen={openMessages}
              onClick={() => setOpenMessages(!openMessages)}
              badge={unreadCount}
            >
              <SubItem
                to="/doctor/messages/inbox"
                label="Inbox"
                icon={<FaInbox />}
              />
              <SubItem
                to="/doctor/messages/send"
                label="Broadcast"
                icon={<FaPaperPlane />}
              />
            </DropdownItem>
            <NavItem
              to="/doctor/view-profile"
              icon={<FaIdCard />}
              label="Public Profile"
            />
          </>
        )}

        {/* PATIENT */}
        {role === 'PATIENT' && (
          <>
            <NavItem
              to="/patient/dashboard"
              icon={<FaChartBar />}
              label="Wellness Hub"
            />
            <NavItem
              to="/patient/my-appointments"
              icon={<FaCalendarAlt />}
              label="My Visits"
            />
            <NavItem
              to="/patient/prescriptions"
              icon={<FaClipboardList />}
              label="Health Records"
            />
            <NavItem
              to="/patient/video-consultation"
              icon={<FaVideo />}
              label="Join Room"
            />
            <DropdownItem
              icon={<FaUserMd />}
              label="Doctors"
              isOpen={showPatientDoctors}
              onClick={() => setShowPatientDoctors(!showPatientDoctors)}
            >
              <SubItem
                to="/patient/doctors/list"
                label="Find Doctors"
                icon={<FaListUl />}
              />
              <SubItem
                to="/patient/doctors/my"
                label="My Specialists"
                icon={<FaUsers />}
              />
            </DropdownItem>
            <DropdownItem
              icon={<FaPills />}
              label="Pharmacy"
              isOpen={openPharmacy}
              onClick={() => setOpenPharmacy(!openPharmacy)}
            >
              <SubItem
                to="/patient/pharmacy/list"
                label="Local Pharmacies"
                icon={<FaListUl />}
              />
              <SubItem
                to="/patient/my-pharmacy"
                label="Preferred"
                icon={<FaPills />}
              />
            </DropdownItem>
            <DropdownItem
              icon={<FaEnvelope />}
              label="Support Mail"
              isOpen={showPatientMsg}
              onClick={() => setShowPatientMsg(!showPatientMsg)}
              badge={patientMsgCount}
            >
              <SubItem
                to="/patient/messages"
                label="Replies"
                icon={<FaInbox />}
              />
              <SubItem
                to="/patient/messages/send"
                label="Ask Doctor"
                icon={<FaPaperPlane />}
              />
            </DropdownItem>
            <NavItem
              to="/patient/subscription"
              icon={<FaCogs />}
              label="Membership"
            />
            <NavItem
              to="/patient/profile/view-profile"
              icon={<FaIdCard />}
              label="My Account"
            />
          </>
        )}

        {/* PHARMACY */}
        {role === 'PHARMACY' && (
          <>
            <NavItem
              to="/pharmacy/dashboard"
              icon={<FaChartBar />}
              label="Inventory Desk"
            />
            <NavItem
              to="/pharmacy/prescriptions"
              icon={<FaClipboardList />}
              label="Orders"
            />
            <NavItem
              to="/pharmacy/subscription"
              icon={<FaCogs />}
              label="Store Plan"
            />
            <DropdownItem
              icon={<FaEnvelope />}
              label="Chat"
              isOpen={openMessages}
              onClick={() => setOpenMessages(!openMessages)}
              badge={unreadCount}
            >
              <SubItem
                to="/pharmacy/messages/inbox"
                label="Inquiries"
                icon={<FaInbox />}
              />
              <SubItem
                to="/pharmacy/messages/send"
                label="Respond"
                icon={<FaPaperPlane />}
              />
            </DropdownItem>
            <NavItem
              to="/pharmacy/view-profile"
              icon={<FaIdCard />}
              label="Store Profile"
            />
          </>
        )}

        {/* SUPPORT */}
        {role === 'SUPPORT' && (
          <>
            <NavItem
              to="/support/dashboard"
              icon={<FaChartBar />}
              label="Help Center"
            />
            <DropdownItem
              icon={<FaUsers />}
              label="Directory"
              isOpen={openSubscribers}
              onClick={() => setOpenSubscribers(!openSubscribers)}
            >
              <SubItem
                to="/support/subscribers/doctors"
                label="Doctors"
                icon={<FaUserMd />}
              />
              <SubItem
                to="/support/subscribers/patients"
                label="Patients"
                icon={<FaUsers />}
              />
              <SubItem
                to="/support/subscribers/pharmacy"
                label="Pharmacies"
                icon={<FaIdCard />}
              />
            </DropdownItem>
            <NavItem
              to="/support/tickets"
              icon={<FaTicketAlt />}
              label="Tickets"
            />
            <NavItem
              to="/support/live-chat"
              icon={<FaComments />}
              label="Live Support"
            />
          </>
        )}
      </nav>

      {/* Footer / User Profile Summary */}
      <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
        {open && (
          <div className="flex items-center gap-3 px-2 py-3 rounded-2xl bg-white/10 border border-white/10 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[var(--brand-green)] font-black text-lg">
              {localStorage.getItem('name')?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-white truncate">
                {localStorage.getItem('name') || 'User Account'}
              </p>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
                {role}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
