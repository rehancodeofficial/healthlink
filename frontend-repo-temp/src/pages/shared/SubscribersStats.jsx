// FILE: src/pages/shared/SubscribersStats.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import {
  FaChartLine,
  FaArrowRight,
  FaUsers,
  FaUserMd,
  FaHospital,
  FaChartPie,
  FaChartArea,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from 'recharts';

export default function SubscribersStats({ base = '/admin', role = 'ADMIN' }) {
  const userName =
    localStorage.getItem('userName') || localStorage.getItem('name') || role;
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setError('');
        const res = await api.get('/subscribers/stats');
        setStats(res.data?.data || null);
      } catch (e) {
        setError('Failed to load telemetry data.');
      }
    })();
  }, []);

  const distributionData = [
    {
      name: 'Doctors',
      value: stats?.doctorsActive || 0,
      color: 'var(--brand-green)',
    },
    {
      name: 'Patients',
      value: stats?.patientsActive || 0,
      color: 'var(--brand-blue)',
    },
    {
      name: 'Pharmacy',
      value: stats?.pharmacyActive || 0,
      color: 'var(--brand-orange)',
    },
  ];

  const growthData = [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 210 },
    { month: 'Mar', count: 190 },
    { month: 'Apr', count: 400 },
    { month: 'May', count: 350 },
    { month: 'Jun', count: stats?.totalActive || 520 },
  ];

  const Card = ({ label, value, to, icon: Icon }) => (
    <div className="card group hover:-translate-y-1 transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
        {Icon ? <Icon size={60} /> : <FaChartLine size={60} />}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
        {label}
      </p>
      <div className="text-4xl font-black text-[var(--text-main)] tracking-tighter mb-6">
        {value ?? 0}
      </div>
      {to && (
        <Link
          to={to}
          className="inline-flex items-center gap-2 text-[var(--brand-blue)] text-[9px] font-black uppercase tracking-[0.2em] hover:translate-x-1 transition-all"
        >
          Inspect Protocol <FaArrowRight />
        </Link>
      )}
    </div>
  );

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.4em] mb-1">
              System Telemetry
            </h2>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase">
              Market Intelligence
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-[var(--bg-card)] px-4 py-2 rounded-2xl border border-[var(--border)] shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[var(--brand-green)] animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">
              Live Satellite Uplink
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">
              {error}
            </p>
          </div>
        )}

        {/* Primary Metrics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            label="Ecosystem Total"
            value={stats?.totalActive}
            to={`${base}/subscribers/doctors`}
            icon={FaUsers}
          />
          <Card
            label="Medical Specialists"
            value={stats?.doctorsActive}
            to={`${base}/subscribers/doctors`}
            icon={FaUserMd}
          />
          <Card
            label="Identity Registry"
            value={stats?.patientsActive}
            to={`${base}/subscribers/patients`}
            icon={FaUsers}
          />
          <Card
            label="Clinical Nodes"
            value={stats?.pharmacyActive}
            to={`${base}/subscribers/pharmacy`}
            icon={FaHospital}
          />
        </div>

        {/* Intelligence Graphs */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Growth Area Chart */}
          <div className="card !p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FaChartArea className="text-[var(--brand-blue)] text-xl" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                  Growth Trajectory
                </h3>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--brand-blue)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--brand-blue)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-muted)"
                    fontSize={10}
                    fontWeight="black"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={10}
                    fontWeight="black"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                    labelStyle={{
                      color: 'var(--text-main)',
                      fontWeight: 'black',
                      textTransform: 'uppercase',
                      fontSize: '10px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--brand-blue)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="card !p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FaChartPie className="text-[var(--brand-green)] text-xl" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                  Sector Distribution
                </h3>
              </div>
            </div>
            <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
              <div className="flex-1 h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-48 space-y-4">
                {distributionData.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between group cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      ></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)] group-hover:text-[var(--text-main)] transition-colors">
                        {d.name}
                      </span>
                    </div>
                    <span className="text-xs font-black text-[var(--text-main)]">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tier Intelligence */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card hover:border-[var(--brand-blue)]/50 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
                <FaChartLine size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Tier: Monthly Synchronicity
                </h4>
                <p className="text-2xl font-black text-[var(--text-main)] tracking-tighter">
                  {stats?.monthlyActive || 0}
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--brand-blue)] rounded-full"
                style={{
                  width: `${
                    (stats?.monthlyActive / stats?.totalActive) * 100 || 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="card hover:border-[var(--brand-green)]/50 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
                <FaChartLine size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Tier: Annual Synchronicity
                </h4>
                <p className="text-2xl font-black text-[var(--text-main)] tracking-tighter">
                  {stats?.yearlyActive || 0}
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--brand-green)] rounded-full"
                style={{
                  width: `${
                    (stats?.yearlyActive / stats?.totalActive) * 100 || 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
