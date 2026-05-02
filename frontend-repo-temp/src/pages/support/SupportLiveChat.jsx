// FILE: src/pages/support/SupportLiveChat.jsx
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  FaComments,
  FaClock,
  FaSatellite,
  FaTerminal,
  FaShieldAlt,
} from 'react-icons/fa';

export default function SupportLiveChat() {
  const role = 'SUPPORT';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Support';

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="h-[calc(100vh-140px)] flex flex-col space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.4em] mb-1">
              Direct Interface
            </h2>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
              <FaComments className="text-[var(--brand-blue)]" /> Live Uplink
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-[var(--bg-card)] px-5 py-3 rounded-2xl border border-[var(--border)] shadow-sm">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-soft)]">
              Protocol Status: Maintenance
            </span>
          </div>
        </div>

        <div className="flex-1 card glass flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
            <div className="absolute top-10 left-10">
              <FaSatellite size={200} />
            </div>
            <div className="absolute bottom-10 right-10">
              <FaTerminal size={200} />
            </div>
          </div>

          <div className="relative z-10 max-w-2xl space-y-8">
            <div className="h-24 w-24 rounded-[3rem] bg-gradient-to-tr from-[var(--brand-blue)] to-[var(--brand-green)] flex items-center justify-center text-[var(--text-main)] text-4xl shadow-2xl mx-auto animate-bounce duration-[3000ms]">
              <FaComments />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">
                Initializing Communication Relay
              </h3>
              <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
                The real-time WebSocket protocol for direct subject interaction
                is currently under synchronization. This module will facilitate
                encrypted live sessions and escalation handovers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 rounded-3xl bg-[var(--bg-main)]/50 border border-[var(--border)] space-y-2">
                <FaClock className="text-[var(--brand-blue)] mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">
                  Low Latency
                </p>
                <p className="text-[8px] font-bold text-[var(--text-soft)] uppercase tracking-widest">
                  Pusher-AES Sync
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-[var(--bg-main)]/50 border border-[var(--border)] space-y-2">
                <FaShieldAlt className="text-[var(--brand-green)] mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">
                  End-to-End
                </p>
                <p className="text-[8px] font-bold text-[var(--text-soft)] uppercase tracking-widest">
                  Protocol Guarded
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-[var(--bg-main)]/50 border border-[var(--border)] space-y-2">
                <FaSatellite className="text-[var(--brand-orange)] mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">
                  Global Reach
                </p>
                <p className="text-[8px] font-bold text-[var(--text-soft)] uppercase tracking-widest">
                  Cloud Relay Active
                </p>
              </div>
            </div>

            <div className="pt-10">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[var(--brand-blue)]/30 text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em]">
                Version 2.0.0-beta.registry
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
