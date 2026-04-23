// FILE: src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaUserMd,
  FaUserShield,
  FaUserCog,
  FaClipboardList,
  FaComments,
  FaCogs,
  FaTicketAlt,
  FaVideo,
  FaArrowRight,
  FaChartPie,
  FaUserPlus,
} from 'react-icons/fa';
import api from '../../Lib/api';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalSupport: 0,
    totalSubscriptions: 0,
    totalMessages: 0,
    totalTickets: 0,
    totalConsultations: 0,
    totalPrescriptions: 0,
  });

  const userName = localStorage.getItem('userName') || 'Admin';
  const role = localStorage.getItem('role') || 'ADMIN';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-10">
        {/* Operations Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.4em] mb-3">
              Facility Operations Hub
            </h2>
            <h1 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-none">
              Control <span className="text-[var(--brand-blue)]">Center</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/manage-users')}
              className="btn btn-primary !py-3 !px-6 text-[10px] shadow-green-500/20"
            >
              <FaUserPlus /> Management
            </button>
            <button
              onClick={() => navigate('/admin/subscription')}
              className="btn btn-glass !py-3 !px-6 text-[10px] text-[var(--text-main)]"
            >
              <FaCogs /> Billing
            </button>
          </div>
        </div>

        {/* Operational Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OpCard
            label="Clinical Pipeline"
            value={stats.totalDoctors}
            icon={<FaUserMd />}
            color="var(--brand-blue)"
            onClick={() => navigate('/admin/users-list')}
          />
          <OpCard
            label="Patient Inflow"
            value={stats.totalPatients}
            icon={<FaUsers />}
            color="var(--brand-green)"
            onClick={() => navigate('/admin/users-list')}
          />
          <OpCard
            label="Support Capacity"
            value={stats.totalSupport}
            icon={<FaUserCog />}
            color="var(--brand-orange)"
            onClick={() => navigate('/admin/users-list')}
          />
          <OpCard
            label="Core Admins"
            value={stats.totalAdmins}
            icon={<FaUserShield />}
            color="var(--brand-blue)"
            onClick={() => navigate('/admin/manage-users?role=admin')}
          />
        </div>

        {/* Management Panels */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card !p-6 border-t-4 border-[var(--brand-green)]">
            <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-6">
              <div>
                <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
                  <FaChartPie className="text-[var(--brand-green)]" /> Service
                  Statistics
                </h3>
                <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">
                  Operational throughput for today
                </p>
              </div>
              <button className="text-[10px] font-black text-[var(--brand-blue)] tracking-[0.2em] uppercase">
                Export Audit
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <ServiceMetric
                icon={<FaVideo />}
                label="Total Consultations"
                value={stats.totalConsultations}
              />
              <ServiceMetric
                icon={<FaClipboardList />}
                label="Prescriptions Issued"
                value={stats.totalPrescriptions}
              />
              <ServiceMetric
                icon={<FaTicketAlt />}
                label="Active Support Tickets"
                value={stats.totalTickets}
              />
              <ServiceMetric
                icon={<FaComments />}
                label="Encrypted Comms"
                value={stats.totalMessages}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card !p-8 !bg-[var(--brand-orange)] text-[var(--text-main)] border-0 shadow-xl shadow-orange-500/20 group cursor-pointer hover:scale-[1.02] transition-all">
              <FaCogs className="text-4xl mb-6 opacity-40 group-hover:rotate-45 transition-transform" />
              <h4 className="text-xl font-black tracking-tight mb-2 uppercase">
                Billing Management
              </h4>
              <p className="text-[var(--text-main)]/70 text-xs font-bold uppercase tracking-widest italic mb-6">
                Manage subscription tiers and payments.
              </p>
              <button
                onClick={() => navigate('/admin/subscription')}
                className="w-full bg-white text-[var(--brand-orange)] font-black uppercase tracking-widest text-[9px] py-4 rounded-2xl shadow-lg"
              >
                Enter Billing
              </button>
            </div>

            <div className="card !p-8 !bg-[var(--brand-blue)] text-[var(--text-main)] border-0 shadow-xl shadow-blue-500/20 group cursor-pointer hover:scale-[1.02] transition-all">
              <FaUsers className="text-4xl mb-6 opacity-40" />
              <h4 className="text-xl font-black tracking-tight mb-2 uppercase">
                User Registry
              </h4>
              <p className="text-[var(--text-main)]/70 text-xs font-bold uppercase tracking-widest italic mb-6">
                Directory of all ecosystem actors.
              </p>
              <button
                onClick={() => navigate('/admin/users-list')}
                className="w-full bg-white text-[var(--brand-blue)] font-black uppercase tracking-widest text-[9px] py-4 rounded-2xl shadow-lg"
              >
                Browse Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function OpCard({ label, value, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card !p-5 group hover:-translate-y-1 transition-all cursor-pointer bg-[var(--bg-card)] border-l-4 relative overflow-hidden"
      style={{ borderLeftColor: color }}
    >
      <div className="flex justify-between items-center">
        <div className="h-10 w-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-lg text-[var(--text-muted)] group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[var(--text-main)] tracking-tighter">
            {value ?? 0}
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            {label}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-black uppercase text-[var(--text-soft)] tracking-widest">
          Open Management
        </span>
        <FaArrowRight className="text-[9px] text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

function ServiceMetric({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border)] group hover:bg-[var(--bg-card)] transition-all">
      <div className="h-10 w-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-lg text-[var(--text-muted)] group-hover:text-[var(--brand-green)] group-hover:scale-110 transition-all shadow-inner border border-[var(--border)]">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
          {label}
        </p>
        <p className="text-sm font-black text-[var(--text-main)]">
          {value ?? 0}
        </p>
      </div>
    </div>
  );
}
