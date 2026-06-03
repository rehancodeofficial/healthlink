// FILE: src/pages/superadmin/SuperadminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getSuperadminStats } from '../../Lib/api';
import {
  FaUsers,
  FaUserShield,
  FaUserMd,
  FaUser,
  FaHeadset,
  FaClipboardList,
  FaComments,
  FaTicketAlt,
  FaVideo,
  FaChartLine,
  FaServer,
  FaGlobe,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

export default function SuperadminDashboard() {
  const [stats, setStats] = useState({});
  const user = {
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('name'),
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSuperadminStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout role="SUPERADMIN" user={user}>
      <div className="space-y-10">
        {/* Intelligence Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.4em] mb-2 animate-in fade-in slide-in-from-left-4 duration-500">
              System Status
            </h2>
            <h1 className="text-4xl lg:text-6xl font-black text-[var(--text-main)] tracking-tighter leading-none animate-in fade-in slide-in-from-left-4 duration-700">
              Main <span className="text-gradient">Dashboard</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
            <StatusBadge
              icon={<FaServer />}
              label="System: OK"
              color="var(--brand-green)"
            />
            <StatusBadge
              icon={<FaGlobe />}
              label="Active Now"
              color="var(--brand-blue)"
            />
            <div className="px-5 py-2.5 rounded-2xl glass border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">
              Up: 99.98%
            </div>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <AdminCard
            label="Total Users"
            value={stats.totalUsers}
            icon={<FaUsers />}
            trend="+12%"
            color="var(--brand-blue)"
            subtext="All accounts"
          />
          <AdminCard
            label="Doctors"
            value={stats.totalDoctors}
            icon={<FaUserMd />}
            trend="+5%"
            color="var(--brand-green)"
            subtext="Licensed doctors"
          />
          <AdminCard
            label="Patients"
            value={stats.totalPatients}
            icon={<FaUser />}
            trend="+18%"
            color="var(--brand-orange)"
            subtext="Registered patients"
          />
          <AdminCard
            label="Total Calls"
            value={stats.totalConsultations}
            icon={<FaVideo />}
            trend="+24%"
            color="var(--brand-blue)"
            subtext="Calls today"
          />
        </div>

        {/* Deep Insights Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 card !p-8 border-l-[8px] border-[var(--brand-blue)]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight uppercase flex items-center gap-3">
                <FaChartLine className="text-[var(--brand-blue)]" /> Latest
                Activities
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-blue)] hover:underline">
                View More
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              <MetricItem
                label="Total Subscriptions"
                value={stats.totalSubscriptions}
                icon={<FaChartLine />}
              />
              <MetricItem
                label="Tickets"
                value={stats.totalTickets}
                icon={<FaTicketAlt />}
              />
              <MetricItem
                label="Messages"
                value={stats.totalMessages}
                icon={<FaComments />}
              />
              <MetricItem
                label="Prescriptions"
                value={stats.totalPrescriptions}
                icon={<FaClipboardList />}
              />
            </div>
          </div>

          <div className="card !bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] text-[var(--text-main)] !p-10 flex flex-col justify-between border border-[var(--border)] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-orange)] opacity-10 blur-[60px] group-hover:opacity-20 transition-opacity"></div>
            <div className="space-y-6 relative z-10">
              <div className="h-14 w-14 rounded-3xl bg-[var(--bg-glass)] flex items-center justify-center text-2xl shadow-inner border border-[var(--border)]">
                <FaUserShield />
              </div>
              <div>
                <h4 className="text-2xl font-black tracking-tight leading-none mb-3 uppercase">
                  Admin <br /> Settings
                </h4>
                <p className="text-[var(--text-main)]/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed italic">
                  Manage users and settings from here.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/superadmin/manage-admins')}
              className="w-full bg-[var(--brand-orange)] text-[var(--text-main)] font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-[2rem] hover:bg-orange-600 transition-all mt-10 shadow-xl shadow-orange-500/20 relative z-10"
            >
              Manage Admins
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AdminCard({ label, value, icon, trend, color, subtext }) {
  return (
    <div
      className="card !p-6 group hover:-translate-y-1 transition-all border-l-2 relative overflow-hidden"
      style={{ borderLeftColor: color }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {label}
          </p>
          <p className="text-4xl font-black text-[var(--text-main)] tracking-tighter">
            {value ?? 0}
          </p>
        </div>
        <div
          className="h-10 w-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-lg shadow-inner"
          style={{ color }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--text-soft)] uppercase tracking-widest">
          {subtext}
        </span>
        <div className="flex items-center gap-1 text-[var(--brand-green)] font-black text-[10px]">
          <FaArrowUp /> {trend}
        </div>
      </div>
      <div
        className="absolute -bottom-8 -right-8 h-20 w-20 rounded-full blur-2xl opacity-[0.05]"
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
}

function StatusBadge({ icon, label, color }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] shadow-sm transition-all hover:bg-[var(--bg-glass)]">
      <span style={{ color }}>{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-soft)]">
        {label}
      </span>
      <div
        className="h-1 w-1 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
}

function MetricItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-5 group">
      <div className="h-12 w-12 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-xl text-[var(--text-muted)] group-hover:text-[var(--brand-blue)] group-hover:scale-110 transition-all shadow-inner border border-[var(--border)]">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-[var(--text-main)] tracking-tighter">
          {value ?? 0}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-soft)] transition-colors">
          {label}
        </p>
      </div>
    </div>
  );
}
