// FILE: src/pages/patient/PatientDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Lib/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  FaCalendarAlt,
  FaPrescription,
  FaVideo,
  FaUserMd,
  FaHeartbeat,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalPrescriptions: 0,
    totalConsultations: 0,
    totalDoctors: 0,
  });

  const patientId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/patient/stats`, { params: { patientId } });
        const data = res?.data?.data ?? res?.data ?? null;
        if (data) setStats(data);
      } catch (err) {
        console.error("Error fetching patient stats:", err);
      }
    };
    if (patientId) fetchStats();
  }, [patientId]);

  return (
    <DashboardLayout role="PATIENT">
      <div className="space-y-8 h-full">
        {/* Compact Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.3em] mb-1">
              Wellness Hub
            </h2>
            <h1 className="text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tighter leading-none">
              Hello, {userName.split(" ")[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl glass border-orange-500/20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">
              <FaHeartbeat className="text-[var(--brand-orange)]" />
              Vitals Nominal
            </div>
          </div>
        </div>

        {/* Dense Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Scheduled Visits"
            value={stats.totalAppointments}
            icon={<FaCalendarAlt />}
            color="--brand-green"
            subtext="Track sessions"
            onClick={() => navigate("/patient/my-appointments")}
          />
          <StatCard
            title="Active Scripts"
            value={stats.totalPrescriptions}
            icon={<FaPrescription />}
            color="--brand-blue"
            subtext="Records"
            onClick={() => navigate("/patient/prescriptions")}
          />
          <StatCard
            title="Video Sessions"
            value={stats.totalConsultations}
            icon={<FaVideo />}
            color="--brand-orange"
            subtext="History"
            onClick={() => navigate("/patient/video-consultation")}
          />
          <StatCard
            title="Medical Team"
            value={stats.totalDoctors}
            icon={<FaUserMd />}
            color="--brand-green"
            subtext="Active"
            onClick={() => navigate("/patient/doctors/my")}
          />
        </div>

        {/* Action Center - Unified Panels */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 card !p-6">
            <h3 className="text-sm font-black text-[var(--text-main)] mb-6 flex items-center gap-3 uppercase tracking-widest">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]"></div>
              Intelligent Navigation
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <QuickLink
                icon={<FaUserMd className="text-[var(--brand-green)]" />}
                title="Find Specialist"
                desc="Licensed doctors by category"
                onClick={() => navigate("/patient/doctors/list")}
              />
              <QuickLink
                icon={<FaVideo className="text-[var(--brand-blue)]" />}
                title="Join Consult"
                desc="Encrypted high-speed video"
                onClick={() => navigate("/patient/video-consultation")}
              />
            </div>
          </div>

          <div className="lg:col-span-4 card !bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-green)] text-[var(--text-main)] !p-8 h-full border-0 shadow-green-500/20 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                <FaCheckCircle />
              </div>
              <div>
                <h4 className="font-black text-lg tracking-tight">Premium Care</h4>
                <p className="text-[var(--text-main)]/70 text-[11px] font-bold leading-relaxed italic">
                  Systems normalized. Healthcare optimized for efficiency.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/patient/support")}
              className="w-full bg-white text-[var(--brand-blue)] font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:bg-gray-100 transition-all shadow-xl mt-6"
            >
              Help Desk
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color, subtext, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card !p-6 group hover:-translate-y-1 transition-all cursor-pointer border-l-4 relative overflow-hidden"
      style={{ borderLeftColor: `var(${color})` }}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            {title}
          </p>
          <p className="text-3xl font-black text-[var(--text-main)] tracking-tighter">{value}</p>
        </div>
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-inner bg-[var(--bg-main)]"
          style={{ color: `var(${color})` }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] font-bold text-[var(--text-soft)]">{subtext}</span>
        <FaArrowRight className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--brand-green)] group-hover:translate-x-1 transition-all" />
      </div>
      <div
        className="absolute -top-12 -right-12 h-24 w-24 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: `var(${color})` }}
      ></div>
    </div>
  );
}

function QuickLink({ icon, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-5 rounded-3xl bg-[var(--bg-main)]/50 border border-[var(--border)] hover:border-[var(--brand-green)] cursor-pointer transition-all group"
    >
      <div className="h-10 w-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="font-black text-[var(--text-main)] text-xs mb-0.5">{title}</p>
        <p className="text-[10px] font-bold text-[var(--text-muted)] truncate">{desc}</p>
      </div>
    </div>
  );
}
