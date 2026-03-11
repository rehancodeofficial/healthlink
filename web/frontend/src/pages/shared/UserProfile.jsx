// FILE: src/pages/shared/UserProfile.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import {
  FaUserShield,
  FaEnvelope,
  FaCalendarAlt,
  FaIdBadge,
  FaGlobe,
  FaShieldAlt,
} from "react-icons/fa";

export default function UserProfile() {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role") || "USER";
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "User";

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        // Generic endpoint to get user info by ID
        const res = await api.get(`/users/${userId}`);
        setUserData(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to load user intelligence:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchUserData();
  }, [userId]);

  const InfoCard = ({ icon: Icon, label, value, color = "var(--brand-blue)" }) => (
    <div className="card glass flex items-center gap-6 group hover:translate-x-1 transition-all">
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}
        style={{ backgroundColor: color }}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">
          {label}
        </p>
        <p className="text-sm font-black text-[var(--text-main)]">{value || "DATA_NOT_SYNCED"}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout role={role} user={{ name: userName }}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 border-4 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-green)] animate-pulse">
              Initializing Intelligence Link...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-[3rem] bg-gradient-to-tr from-[var(--brand-green)] to-[var(--brand-blue)] flex items-center justify-center text-[var(--text-main)] font-black text-5xl shadow-2xl relative z-10">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -inset-4 bg-[var(--brand-green)]/10 blur-2xl rounded-full"></div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.4em] mb-2">
              Subject Credentials
            </h2>
            <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-4">
              {userName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 rounded-full bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 text-[var(--brand-blue)] text-[10px] font-black uppercase tracking-widest">
                {role} CLEARANCE
              </span>
              <span className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest">
                SYSTEM_ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard icon={FaIdBadge} label="Identity ID" value={userId} color="var(--brand-blue)" />
          <InfoCard
            icon={FaEnvelope}
            label="Communication Hub"
            value={userData?.email || "syncing..."}
            color="var(--brand-green)"
          />
          <InfoCard
            icon={FaShieldAlt}
            label="Authorization Status"
            value="Verified Protocol"
            color="var(--brand-orange)"
          />
          <InfoCard
            icon={FaCalendarAlt}
            label="Registry Date"
            value={
              userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : "PREHISTORIC"
            }
            color="var(--brand-blue)"
          />
        </div>

        <div className="card glass relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FaGlobe size={150} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--brand-blue)] mb-6 flex items-center gap-3">
            <FaIdBadge /> Access Log & Telemetry
          </h3>
          <div className="space-y-4 text-xs font-bold text-[var(--text-soft)]">
            <p className="flex justify-between items-center border-b border-[var(--border)] pb-4">
              <span className="uppercase tracking-widest opacity-60">Neural Link Status</span>
              <span className="text-[var(--brand-green)]">ESTABLISHED_SECURE</span>
            </p>
            <p className="flex justify-between items-center border-b border-[var(--border)] pb-4">
              <span className="uppercase tracking-widest opacity-60">Encryption Standard</span>
              <span className="text-[var(--text-main)]">AES-256 GCM PROTOCOL</span>
            </p>
            <p className="flex justify-between items-center pb-4">
              <span className="uppercase tracking-widest opacity-60">Global Authorization</span>
              <span className="text-[var(--text-main)] underline">VIEW_CERTIFICATES</span>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
