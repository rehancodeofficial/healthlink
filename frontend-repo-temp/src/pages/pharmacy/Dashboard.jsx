// FILE: src/pages/pharmacy/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Lib/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  FaBoxOpen,
  FaClipboardCheck,
  FaTruckLoading,
  FaCheckCircle,
  FaArrowRight,
  FaFilePrescription,
  FaHistory,
  FaWarehouse,
} from 'react-icons/fa';

export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const role = 'PHARMACY';
  const userId = localStorage.getItem('userId');
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Pharmacy';

  const [counts, setCounts] = useState({
    incoming: 0,
    ack: 0,
    ready: 0,
    dispensed: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/pharmacy/prescriptions', {
          params: { userId },
        });
        const list = res.data?.data || res.data || [];

        const ack = list.filter(
          (x) => x.dispatchStatus === 'ACKNOWLEDGED'
        ).length;
        const ready = list.filter((x) => x.dispatchStatus === 'READY').length;
        const dispensed = list.filter(
          (x) => x.dispatchStatus === 'DISPENSED'
        ).length;
        const incoming = list.filter((x) =>
          ['NONE', 'SENT'].includes(String(x.dispatchStatus))
        ).length;

        setCounts({ incoming, ack, ready, dispensed });
      } catch (e) {
        console.error('Failed to load pharmacy prescriptions:', e);
      }
    })();
  }, [userId]);

  return (
    <DashboardLayout role={role}>
      <div className="space-y-10">
        {/* Fulfillment Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.4em] mb-2 font-mono">
              Registry: Digital Dispensary
            </h2>
            <h1 className="text-4xl lg:text-5xl font-black text-[var(--text-main)] tracking-tighter leading-none uppercase">
              Fulfillment{' '}
              <span className="text-[var(--brand-blue)]">Tracker</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 rounded-2xl glass border-[var(--border)] flex items-center gap-3 shadow-sm">
              <FaWarehouse className="text-[var(--brand-green)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">
                Unit: Online
              </span>
            </div>
            <button
              onClick={() => navigate('/pharmacy/prescriptions')}
              className="btn btn-primary !py-3 !px-6 shadow-green-500/20"
            >
              <FaBoxOpen /> Dispatch Queue
            </button>
          </div>
        </div>

        {/* Fulfillment Pipeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Incoming"
            value={counts.incoming}
            icon={<FaFilePrescription />}
            color="var(--brand-orange)"
            onClick={() => navigate('/pharmacy/prescriptions?status=INCOMING')}
          />
          <StatusCard
            title="Acknowledged"
            value={counts.ack}
            icon={<FaClipboardCheck />}
            color="var(--brand-blue)"
            onClick={() =>
              navigate('/pharmacy/prescriptions?status=ACKNOWLEDGED')
            }
          />
          <StatusCard
            title="Processing"
            value={counts.ready}
            icon={<FaTruckLoading />}
            color="var(--brand-green)"
            onClick={() => navigate('/pharmacy/prescriptions?status=READY')}
          />
          <StatusCard
            title="Dispensed"
            value={counts.dispensed}
            icon={<FaCheckCircle />}
            color="var(--brand-blue)"
            onClick={() => navigate('/pharmacy/prescriptions?status=DISPENSED')}
          />
        </div>

        {/* Logistics Support Row */}
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 card !p-8 border-l-[12px] border-[var(--brand-green)]">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--border)]">
              <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight flex items-center gap-3 italic">
                <FaHistory className="text-[var(--brand-green)]" /> Operational
                Logistics Audit
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] animate-pulse">
                Sync Active
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              <LogosticItem
                icon={<FaBoxOpen />}
                label="Queue Volume"
                value={`${counts.incoming + counts.ack} items`}
              />
              <LogosticItem
                icon={<FaTruckLoading />}
                label="Ready Hub"
                value={`${counts.ready} ready`}
              />
              <LogosticItem
                icon={<FaCheckCircle />}
                label="Historical total"
                value={`${counts.dispensed} units`}
              />
              <LogosticItem
                icon={<FaClipboardCheck />}
                label="Compliance"
                value="100.0%"
              />
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="card !bg-[var(--brand-blue)] text-[var(--text-main)] !p-8 h-full flex flex-col justify-between border-0 shadow-xl shadow-blue-500/20 group hover:-translate-y-1 transition-all">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner border border-[var(--border)]">
                  <FaClipboardCheck />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight leading-none">
                  Global <br /> Protocols
                </h4>
              </div>
              <button className="w-full bg-white text-[var(--brand-blue)] font-black uppercase tracking-[0.2em] text-[9px] py-4 rounded-2xl mt-8">
                Standards Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusCard({ title, value, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card !p-6 group hover:-translate-y-1 transition-all cursor-pointer bg-[var(--bg-card)] border-b-4 relative overflow-hidden text-center"
      style={{ borderBottomColor: color }}
    >
      <div
        className="h-12 w-12 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-2xl mx-auto mb-6 shadow-inner group-hover:scale-110 transition-transform"
        style={{ color }}
      >
        {icon}
      </div>
      <p className="text-4xl font-black text-[var(--text-main)] tracking-tighter mb-1">
        {value ?? 0}
      </p>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-soft)] transition-colors">
        {title}
      </p>
      <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <FaArrowRight className="text-[10px] text-[var(--text-muted)]" />
      </div>
    </div>
  );
}

function LogosticItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="h-10 w-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-xl text-[var(--text-muted)] group-hover:text-[var(--brand-green)] group-hover:scale-110 transition-all shadow-inner border border-[var(--border)]">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-sm font-black text-[var(--text-main)] truncate">
          {value}
        </p>
        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}
