// FILE: src/pages/Admin/Reports.jsx
import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { fetchSystemReports } from '../../Lib/api';
import {
  FaUserMd,
  FaUsers,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
  FaFilePrescription,
  FaTicketAlt,
  FaChartBar,
  FaArrowRight,
  FaDatabase,
} from 'react-icons/fa';

export default function Report() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = {
    id: localStorage.getItem('userId'),
    name:
      localStorage.getItem('userName') ||
      localStorage.getItem('name') ||
      'Admin',
  };

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchSystemReports();
        setReports(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  if (loading)
    return (
      <DashboardLayout role="ADMIN" user={user}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-soft)]">
            Compiling Analytical Telemetry...
          </p>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="ADMIN" user={user}>
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.4em] mb-1">
              Market Logic
            </h2>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
              <FaDatabase className="text-[var(--brand-green)]" /> Operational
              Audit
            </h1>
          </div>
          <div className="bg-[var(--bg-card)] px-5 py-3 rounded-2xl border border-[var(--border)] shadow-sm flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[var(--brand-green)] animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-soft)]">
              Operational Nexus Live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Identity Sub-Grid */}
          <ReportSection title="Account Intelligence">
            <Card
              icon={<FaUsers />}
              title="Total Accounts"
              value={reports?.users?.total}
              color="var(--brand-blue)"
            />
            <Card
              icon={<FaUserMd />}
              title="Active Specialists"
              value={reports?.users?.doctors}
              color="var(--brand-green)"
            />
            <Card
              icon={<FaUsers />}
              title="Subject Patients"
              value={reports?.users?.patients}
              color="var(--brand-orange)"
            />
          </ReportSection>

          {/* Clinical Activity */}
          <ReportSection title="Platform Uplinks">
            <Card
              icon={<FaVideo />}
              title="Total Consults"
              value={reports?.consultations?.total}
              color="var(--brand-blue)"
            />
            <Card
              icon={<FaCheckCircle />}
              title="Finalized Paths"
              value={reports?.consultations?.completed}
              color="var(--brand-green)"
            />
            <Card
              icon={<FaTimesCircle />}
              title="Terminated Nodes"
              value={reports?.consultations?.cancelled}
              color="var(--brand-orange)"
            />
          </ReportSection>

          {/* Records & Support */}
          <ReportSection title="Protocol Manifest">
            <Card
              icon={<FaFilePrescription />}
              title="Clinical Scripts"
              value={reports?.prescriptions?.total}
              color="var(--brand-green)"
            />
            <Card
              icon={<FaTicketAlt />}
              title="Open Support Nodes"
              value={reports?.support?.open}
              color="var(--brand-orange)"
            />
            <Card
              icon={<FaTicketAlt />}
              title="Resolved Issues"
              value={reports?.support?.resolved}
              color="var(--brand-blue)"
            />
          </ReportSection>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ReportSection({ title, children }) {
  return <div className="space-y-4 contents">{children}</div>;
}

function Card({ icon, title, value, color }) {
  return (
    <div className="card group hover:-translate-y-1 transition-all relative overflow-hidden border border-[var(--border)] shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shadow-inner border border-[var(--border)]"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-tight">
          {title}
        </h4>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-black text-[var(--text-main)] tracking-tighter">
          {value ?? 0}
        </p>
        <FaArrowRight
          size={12}
          className="text-[var(--text-muted)] opacity-20 group-hover:translate-x-1 group-hover:opacity-100 transition-all"
        />
      </div>
    </div>
  );
}
