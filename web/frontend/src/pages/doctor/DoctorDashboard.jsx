// FILE: src/pages/doctor/DoctorDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Lib/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  FaCalendarCheck,
  FaPrescription,
  FaEnvelopeOpenText,
  FaUserInjured,
  FaCheckCircle,
  FaArrowRight,
  FaVideo,
  FaClock,
  FaExclamationTriangle,
  FaFileSignature,
  FaFlask,
} from 'react-icons/fa';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalPrescriptions: 0,
    totalMessages: 0,
    activePatients: 0,
    urgentFlags: {
        urgentLabs: 0,
        unsignedNotes: 0,
        lateAppointments: 0,
    }
  });

  const [waitingPatients, setWaitingPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const doctorId = localStorage.getItem('userId');
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Doctor';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, waitingRes] = await Promise.all([
            api.get(`/doctor/stats`, { params: { doctorId } }),
            api.get(`/doctor/waiting-patients`, { params: { doctorId } })
        ]);
        
        if (statsRes?.data) setStats(statsRes.data);
        if (waitingRes?.data) setWaitingPatients(waitingRes.data);
      } catch (err) {
        console.error('Error fetching clinical desk data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchData();
  }, [doctorId]);

  return (
    <DashboardLayout role="DOCTOR">
      <div className="space-y-8 h-full">
        {/* Compact Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.3em] mb-1">
              Clinical Desk
            </h2>
            <h1 className="text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tighter leading-none">
              Welcome, Dr. {userName.split(' ')[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl glass border-green-500/20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">
              <FaCheckCircle className="text-[var(--brand-green)]" />
              Active Operations
            </div>
            <button
              onClick={() => navigate('/doctor/video-consultation')}
              className="btn btn-primary !py-3 !px-6 shadow-green-500/30"
            >
              <FaVideo /> Virtual Room
            </button>
          </div>
        </div>

        {/* Clinical Alerts / Urgent Flags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AlertCard 
                icon={<FaClock />} 
                label="Late Starts" 
                count={stats.urgentFlags?.lateAppointments} 
                color="text-red-500"
                bg="bg-red-500/10"
                onClick={() => navigate('/doctor/appointments')}
            />
            <AlertCard 
                icon={<FaFileSignature />} 
                label="Unsigned Notes" 
                count={stats.urgentFlags?.unsignedNotes} 
                color="text-orange-500"
                bg="bg-orange-500/10"
                onClick={() => navigate('/doctor/appointments')}
            />
             <AlertCard 
                icon={<FaFlask />} 
                label="Urgent Labs" 
                count={stats.urgentFlags?.urgentLabs} 
                color="text-blue-500" 
                bg="bg-blue-500/10"
                onClick={() => navigate('/doctor/appointments')}
            />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Visits"
            value={stats.totalAppointments}
            icon={<FaCalendarCheck />}
            color="--brand-green"
            subtext={`${stats.pendingAppointments} pending`}
            onClick={() => navigate('/doctor/appointments')}
          />
          <StatCard
            title="Prescriptions"
            value={stats.totalPrescriptions}
            icon={<FaPrescription />}
            color="--brand-blue"
            subtext="Clinical records"
            onClick={() => navigate('/doctor/prescriptions')}
          />
          <StatCard
            title="Care Inbox"
            value={stats.totalMessages}
            icon={<FaEnvelopeOpenText />}
            color="--brand-orange"
            subtext="Internal comms"
            onClick={() => navigate('/doctor/messages/inbox')}
          />
          <StatCard
            title="Patient Pool"
            value={stats.activePatients}
            icon={<FaUserInjured />}
            color="--brand-green"
            subtext="Active EMRs"
            onClick={() => navigate('/doctor/patients')}
          />
        </div>

        {/* Main Operational Area */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="card !p-0 overflow-hidden min-h-[400px]">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-sm font-black text-[var(--text-main)] flex items-center gap-3 uppercase tracking-widest">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)] animate-pulse"></div>
                  Patients Waiting Room
                </h3>
                <span className="text-[10px] font-bold text-[var(--text-soft)] uppercase">
                    Queue: {waitingPatients.length}
                </span>
              </div>
              
              <div className="divide-y divide-[var(--border)]">
                {waitingPatients.length > 0 ? (
                    waitingPatients.map((apt) => (
                        <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-main)]/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-[var(--brand-blue)]/10 flex items-center justify-center text-[var(--brand-blue)] font-black">
                                    {apt.patient?.user?.firstName?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-[var(--text-main)]">
                                        {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                                    </p>
                                    <p className="text-[10px] font-bold text-[var(--text-soft)]">
                                        {apt.reason || "General Consultation"} • Waiting since {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/doctor/video-consultation?appointmentId=${apt.id}`)}
                                className="px-4 py-2 rounded-xl bg-[var(--brand-green)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                            >
                                Start Visit
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <FaUserInjured className="mx-auto text-4xl text-[var(--border)] mb-4" />
                        <p className="text-sm font-bold text-[var(--text-soft)] uppercase tracking-widest">
                            Waiting room is empty
                        </p>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* AI / Clinical Assistant Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="card !bg-[var(--brand-blue)] text-white !p-8 flex flex-col justify-between border-0 shadow-blue-500/20">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                  <FaVideo />
                </div>
                <div>
                  <h4 className="font-black text-lg tracking-tight">
                    Quick Connect
                  </h4>
                  <p className="text-xs font-bold text-white/70 leading-relaxed italic">
                    "Secure, HIPAA-compliant telehealth bridge active."
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/doctor/video-consultation')}
                className="w-full bg-white text-[var(--brand-blue)] font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:bg-gray-100 transition-all mt-6 shadow-xl"
              >
                Join Virtual Lobby
              </button>
            </div>

            <div className="card !p-6 flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-orange)] mb-4">
                    Clinical Assistant
                </h4>
                <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border)]">
                        <p className="text-xs font-bold text-[var(--text-soft)] leading-relaxed">
                            <FaExclamationTriangle className="inline mr-2 text-[var(--brand-orange)]" />
                            Dr. {userName.split(' ')[0]}, you have {stats.urgentFlags?.unsignedNotes} notes pending for more than 24 hours. Consider signing them to maintain compliance.
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AlertCard({ icon, label, count, color, bg, onClick }) {
    return (
        <div onClick={onClick} className={`p-4 rounded-3xl ${bg} flex items-center justify-between cursor-pointer hover:brightness-95 transition-all border border-transparent hover:border-white/20`}>
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-lg ${color} shadow-sm`}>
                    {icon}
                </div>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>
                        {label}
                    </p>
                    <p className="text-lg font-black text-[var(--text-main)]">
                         {count} Items
                    </p>
                </div>
            </div>
            <FaArrowRight className={`text-[10px] ${color}`} />
        </div>
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
          <p className="text-3xl font-black text-[var(--text-main)] tracking-tighter">
            {value}
          </p>
        </div>
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-inner bg-[var(--bg-main)]"
          style={{ color: `var(${color})` }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] font-bold text-[var(--text-soft)]">
          {subtext}
        </span>
        <FaArrowRight className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--brand-green)] group-hover:translate-x-1 transition-all" />
      </div>
      <div
        className="absolute -top-12 -right-12 h-24 w-24 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: `var(${color})` }}
      ></div>
    </div>
  );
}
