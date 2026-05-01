// FILE: src/pages/support/SupportDashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import {
  FaTicketAlt,
  FaSpinner,
  FaUserMd,
  FaUserInjured,
  FaClinicMedical,
  FaHeadset,
  FaArrowRight,
  FaExclamationCircle,
  FaHistory,
} from 'react-icons/fa';

export default function SupportDashboard() {
  const role = 'SUPPORT';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Support';

  const [ticketStats, setTicketStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
  });
  const [userStats, setUserStats] = useState({
    doctors: 0,
    patients: 0,
    pharmacy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/tickets');
      const items = res?.data?.data || res?.data || [];
      setTicketStats({
        total: items.length,
        open: items.filter((t) => t.status === 'OPEN').length,
        inProgress: items.filter((t) => t.status === 'IN_PROGRESS').length,
      });
    } catch (e) {
      setError('Sync failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserCounts = useCallback(async () => {
    try {
      const res = await api
        .get('/support/stats')
        .catch(() => api.get('/admin/users/counts'));
      const data = res?.data?.data || res?.data || {};
      setUserStats({
        doctors: Number(data.totalDoctors || data.DOCTOR || 0),
        patients: Number(data.totalPatients || data.PATIENT || 0),
        pharmacy: Number(data.totalPharmacy || data.PHARMACY || 0),
      });
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadTickets();
    loadUserCounts();
  }, [loadTickets, loadUserCounts]);

  return (
    <DashboardLayout role={role}>
      <div className="space-y-10">
        {/* Support Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.4em] mb-2 px-1 border-l-2 border-[var(--brand-blue)]">
              Connectivity Registry
            </h2>
            <h1 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-none uppercase">
              Resolution{' '}
              <span className="text-[var(--brand-orange)]">Center</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 rounded-2xl glass border-[var(--border)] flex items-center gap-3 shadow-sm select-none">
              <div className="h-2 w-2 rounded-full bg-[var(--brand-green)] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">
                Agent: Active
              </span>
            </div>
            <button className="btn btn-primary !py-3 !px-6 shadow-green-500/20 text-[10px]">
              <FaHeadset /> System Help
            </button>
          </div>
        </div>

        {/* Support Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SupportCard
            label="Awaiting Response"
            value={ticketStats.open}
            icon={<FaExclamationCircle />}
            color="var(--brand-orange)"
            subtext="Critical priorities"
          />
          <SupportCard
            label="Active Sessions"
            value={ticketStats.inProgress}
            icon={<FaSpinner className={loading ? 'animate-spin' : ''} />}
            color="var(--brand-blue)"
            subtext="Tickets currently being handled"
          />
          <SupportCard
            label="Platform Ecology"
            value={ticketStats.total}
            icon={<FaTicketAlt />}
            color="var(--brand-green)"
            subtext="All-time ticket registry"
          />
        </div>

        {/* User Ecosystem Row */}
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 card !p-8 !bg-[var(--bg-main)]/30 border border-[var(--border)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-[var(--border)]">
              <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.2em] flex items-center gap-3">
                <FaHistory className="text-[var(--brand-blue)]" /> Ecosystem
                Footprint
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-blue)] hover:underline">
                Full Stats
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              <EcologyMetric
                icon={<FaUserMd />}
                label="Clinicians"
                value={userStats.doctors}
                color="var(--brand-blue)"
              />
              <EcologyMetric
                icon={<FaUserInjured />}
                label="Patients"
                value={userStats.patients}
                color="var(--brand-green)"
              />
              <EcologyMetric
                icon={<FaClinicMedical />}
                label="Pharmacies"
                value={userStats.pharmacy}
                color="var(--brand-orange)"
              />
            </div>
            <div className="absolute top-0 right-0 p-4">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)] animate-ping"></div>
            </div>
          </div>

          <div className="lg:col-span-4 card !bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-[var(--text-main)] !p-8 flex flex-col justify-between border-0 shadow-2xl relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-[var(--bg-glass)] flex items-center justify-center text-xl shadow-inner border border-[var(--border)]">
                <FaTicketAlt />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight leading-none mb-2">
                Knowledge Base
              </h4>
              <p className="text-[var(--text-main)]/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed italic">
                Access technical documentation and escalation protocols.
              </p>
            </div>
            <button className="w-full bg-white text-[var(--brand-blue)] font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-2xl mt-12 hover:bg-gray-100 transition-all shadow-lg active:scale-95">
              Audit Docs
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SupportCard({ label, value, icon, color, subtext }) {
  return (
    <div
      className="card !p-8 group hover:-translate-y-1 transition-all border-t-4 bg-[var(--bg-card)] relative overflow-hidden"
      style={{ borderTopColor: color }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] line-clamp-1">
            {label}
          </p>
          <p className="text-5xl font-black text-[var(--text-main)] tracking-tighter">
            {value ?? 0}
          </p>
        </div>
        <div
          className="h-10 w-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-xl shadow-inner"
          style={{ color }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-2">
        <span className="text-[9px] font-bold text-[var(--text-soft)] uppercase tracking-widest">
          {subtext}
        </span>
        <FaArrowRight className="text-[10px] text-[var(--text-muted)] group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

function EcologyMetric({ icon, label, value, color }) {
  return (
    <div className="text-center group">
      <div
        className="h-14 w-14 rounded-3xl bg-[var(--bg-card)] flex items-center justify-center text-2xl mx-auto mb-4 border border-[var(--border)] shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all"
        style={{ color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-[var(--text-main)] tracking-tighter">
        {value ?? 0}
      </p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">
        {label}
      </p>
    </div>
  );
}
