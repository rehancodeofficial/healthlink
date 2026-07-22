import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";
import { 
  FaCalendarCheck, 
  FaVideo, 
  FaPhoneAlt, 
  FaHistory, 
  FaShieldAlt, 
  FaClock, 
  FaExclamationTriangle, 
  FaArrowRight 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Appointments() {
  const navigate = useNavigate();

  const flowSteps = [
    { num: "1", title: "Select a specialty or doctor", desc: "Browse verified practitioners by specialty, language, or rating." },
    { num: "2", title: "Choose date & time", desc: "Real-time calendar availability with instant reservation slotting." },
    { num: "3", title: "Add visit details", desc: "Briefly describe your symptoms or reason for your virtual consultation." },
    { num: "4", title: "Confirm & pay", desc: "Encrypted checkout with instant appointment confirmation." }
  ];

  const types = [
    { title: "Video Consultation", desc: "Face-to-face care from your laptop, tablet, or mobile device.", icon: <FaVideo className="text-[var(--hb-red)]" /> },
    { title: "Audio Consultation", desc: "For patients with limited bandwidth or a preference for voice-only calls.", icon: <FaPhoneAlt className="text-emerald-500" /> },
    { title: "Follow-up Visit", desc: "Quick check-ins for ongoing treatment and progress monitoring.", icon: <FaHistory className="text-blue-500" /> }
  ];

  const expectations = [
    "Instant email & SMS appointment confirmation",
    "Automated reminder notifications before your consultation slot",
    "A private, encrypted video room link generated exclusively for your visit",
    "Digital prescription and visit summary saved directly to your records dashboard"
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>

      <div className="blur-blob-red top-[-100px] left-[-50px]"></div>
      <div className="blur-blob-green top-[300px] right-[-100px]"></div>

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-36 pb-24 space-y-20">
        {/* Emergency Notice */}
        <section className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex items-start gap-4 text-amber-900 dark:text-amber-200">
          <FaExclamationTriangle className="text-2xl text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wider">Medical Emergency Notice</h4>
            <p className="text-xs leading-relaxed font-medium">
              HealthLink is not equipped for medical emergencies. If you or someone with you is experiencing a life-threatening condition, call your local emergency number or go to the nearest emergency room immediately.
            </p>
          </div>
        </section>

        {/* Hero */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="clay-pressed inline-block px-4 py-1.5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-widest text-[var(--hb-red)]">
            Virtual Scheduling
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[var(--hb-ink)] leading-[1.1]">
            Book your consultation
          </h1>
          <p className="text-lg sm:text-xl text-[var(--hb-ink-soft)] max-w-3xl mx-auto leading-relaxed font-medium">
            Pick a doctor, choose a time, and consult from anywhere — appointments take less than 2 minutes to schedule.
          </p>
        </section>

        {/* Booking Flow with background image */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-cover bg-center" style={{ backgroundImage: "url('/images/booking-flow-bg.png')" }}>
          <div className="absolute inset-0 bg-[var(--hb-ink)]/85 backdrop-blur-[2px]" />
          <div className="relative z-10 p-10 sm:p-14 space-y-10">
            <div className="text-center space-y-2 text-white relative z-10">
              <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
                Simple Process
              </h2>
              <h3 className="text-3xl font-black tracking-tighter">
                Booking Flow
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {flowSteps.map((s, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-[var(--hb-ink)]/80 backdrop-blur-md border border-white/10 space-y-3 text-white shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-[var(--hb-red)] text-white font-black text-xs flex items-center justify-center">
                    {s.num}
                  </div>
                  <h4 className="text-base font-bold tracking-tight">{s.title}</h4>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Appointment Types */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              Consultation Formats
            </h2>
            <h3 className="text-3xl font-black tracking-tighter">
              Appointment Types
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {types.map((t, idx) => (
              <div key={idx} className="glass-clay p-8 rounded-3xl space-y-4 border border-[var(--border)] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-xl">
                  {t.icon}
                </div>
                <h4 className="text-xl font-bold tracking-tight">{t.title}</h4>
                <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed font-medium">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What to Expect & Cancellation */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-clay p-8 sm:p-10 rounded-[2rem] border border-[var(--border)] space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-[var(--hb-ink)] mb-4">What to Expect</h3>
              <ul className="space-y-3">
                {expectations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-medium text-[var(--hb-ink-soft)] leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-[var(--hb-red)] mt-1.5 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 h-[160px] w-full rounded-2xl overflow-hidden border border-[var(--border)] relative bg-slate-100">
              <img
                src="/images/webcam-setup.png"
                alt="Webcam setup"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

          <div className="glass-clay p-8 sm:p-10 rounded-[2rem] border border-[var(--border)] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <FaClock className="text-2xl" />
                <h3 className="text-2xl font-black tracking-tight text-[var(--hb-ink)]">Cancellation Policy</h3>
              </div>
              <p className="text-sm text-[var(--hb-ink-soft)] leading-relaxed font-medium">
                Reschedule or cancel free of charge up to 2 hours before your scheduled appointment time directly inside your patient portal.
              </p>
            </div>

            <button
              onClick={() => navigate("/patient/book-appointment")}
              className="btn-clay-primary w-full py-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Book Appointment Now</span>
              <FaArrowRight size={10} />
            </button>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-8 glass-clay p-12 rounded-[2.5rem] border border-[var(--border)] max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">
            Your health can't wait for a walk-in slot
          </h2>
          <button
            onClick={() => navigate("/patient/book-appointment")}
            className="btn-clay-primary px-10 py-4 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-3"
          >
            <span>Book Now</span>
            <FaArrowRight size={12} />
          </button>
        </section>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-xs font-bold text-[var(--hb-ink-soft)] uppercase tracking-widest">
        &copy; 2026 HealthLink. All Rights Reserved.
      </footer>
    </div>
  );
}
