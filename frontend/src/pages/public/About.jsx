import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";
import { FaShieldAlt, FaHeart, FaUserLock, FaSmile, FaArrowRight, FaUserMd } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const values = [
    { title: "Accessibility First", desc: "Care should never depend on your zip code or your schedule.", icon: <FaHeart className="text-[var(--hb-red)]" /> },
    { title: "Clinical Integrity", desc: "Every doctor on our platform is independently verified and held to strict care standards.", icon: <FaUserMd className="text-emerald-500" /> },
    { title: "Privacy by Design", desc: "Your health data is encrypted, private, and yours alone.", icon: <FaUserLock className="text-blue-500" /> },
    { title: "Human-Centered Tech", desc: "Technology should make care simpler, not colder.", icon: <FaSmile className="text-purple-500" /> }
  ];

  const stats = [
    { value: "500+", label: "Verified Doctors across 12+ Specialties" },
    { value: "50,000+", label: "Consultations Delivered" },
    { value: "98%", label: "Patient Satisfaction Rate" },
    { value: "< 5 mins", label: "Average Wait Time" }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>
      
      <div className="blur-blob-red top-[-100px] left-[-50px]"></div>
      <div className="blur-blob-green top-[300px] right-[-100px]"></div>

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-36 pb-24 space-y-24">
        {/* Hero */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="clay-pressed inline-block px-4 py-1.5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-widest text-[var(--hb-red)]">
            About HealthLink
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[var(--hb-ink)] leading-[1.1]">
            Healthcare shouldn't be hard to reach
          </h1>
          <p className="text-lg sm:text-xl text-[var(--hb-ink-soft)] max-w-3xl mx-auto leading-relaxed font-medium">
            HealthLink connects patients with trusted doctors through a secure, simple, always-on telemedicine platform.
          </p>
        </section>

        {/* Our Story */}
        <section className="glass-clay p-8 sm:p-12 rounded-[2.5rem] border border-[var(--border)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-6">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              Why We Built HealthLink
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">
              Removing barriers to care
            </h3>
            <p className="text-base text-[var(--hb-ink-soft)] leading-relaxed font-medium">
              Millions of people delay care because of distance, cost, or time — not because they don't need it. HealthLink was built to remove those barriers, giving patients direct, affordable access to licensed doctors from wherever they are, and giving doctors a platform to practice medicine without the overhead of a physical clinic.
            </p>
          </div>
          <div className="md:col-span-5 h-[280px] rounded-3xl overflow-hidden border border-[var(--border)] shadow-xl relative bg-slate-100">
            <img
              src="/images/clinicians.jpg"
              alt="Medical team meeting"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-clay p-8 sm:p-10 rounded-[2rem] space-y-4 border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--hb-red)]/10 text-[var(--hb-red)] font-black flex items-center justify-center">
              M
            </div>
            <h3 className="text-2xl font-black tracking-tight">Our Mission</h3>
            <p className="text-base text-[var(--hb-ink-soft)] leading-relaxed font-medium">
              To make quality healthcare accessible to everyone, everywhere, at any time.
            </p>
          </div>

          <div className="glass-clay p-8 sm:p-10 rounded-[2rem] space-y-4 border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 font-black flex items-center justify-center">
              V
            </div>
            <h3 className="text-2xl font-black tracking-tight">Our Vision</h3>
            <p className="text-base text-[var(--hb-ink-soft)] leading-relaxed font-medium">
              A world where distance and scheduling never stand between a patient and the care they need.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              Core Principles
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">
              Our Values
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, idx) => (
              <div key={idx} className="glass-clay p-6 rounded-3xl space-y-3 border border-[var(--border)] hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-lg">
                  {v.icon}
                </div>
                <h4 className="text-lg font-bold tracking-tight">{v.title}</h4>
                <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed font-medium">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* By the Numbers */}
        <section className="bg-[var(--hb-ink)] text-white p-10 sm:p-14 rounded-[2.5rem] select-none shadow-2xl space-y-10">
          <div className="text-center">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              Impact & Reach
            </h2>
            <h3 className="text-3xl font-black tracking-tighter mt-1">
              By the Numbers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-4xl sm:text-5xl font-black tracking-tighter text-white">{s.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--hb-ink-soft)]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Image Banner */}
        <div className="relative h-[280px] rounded-[2.5rem] overflow-hidden border border-[var(--border)] bg-cover bg-center" style={{ backgroundImage: "url('/images/doctors-header.jpg')" }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center space-y-2 max-w-lg mx-auto">
            <p className="text-white font-black text-2xl tracking-tight drop-shadow-lg">
              Built by people who care about care
            </p>
            <p className="text-white/80 text-sm font-medium">
              Engineers, clinicians, and healthcare operators working toward one goal.
            </p>
          </div>
        </div>

        {/* Team / Leadership */}
        <section className="glass-clay p-10 sm:p-12 rounded-[2.5rem] border border-[var(--border)] text-center space-y-6">
          <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
            Leadership
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">
            Built by people who care about care
          </h3>
          <p className="text-base text-[var(--hb-ink-soft)] max-w-2xl mx-auto leading-relaxed font-medium">
            HealthLink is developed by a team of engineers, clinicians, and healthcare operators led by Founder & CEO <strong>Rehan Hussain</strong>, focused on one goal: making the doctor's visit simpler for everyone involved.
          </p>
        </section>

        {/* Compliance & Data Security */}
        <section className="glass-clay p-8 sm:p-10 rounded-[2rem] border border-[var(--border)] space-y-6">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-2xl text-[var(--hb-red)]" />
            <h3 className="text-2xl font-black tracking-tight">How we protect your information</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-[var(--hb-ink-soft)]">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--hb-red)]"></span>
              <span>Data encrypted in transit and at rest</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Bank-grade security standards</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Records only accessible to you and your treating doctor</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Strict compliance with health data privacy guidelines</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center space-y-8 glass-clay p-12 rounded-[2.5rem] border border-[var(--border)]">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">
            Ready to experience healthcare that works around you?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/appointments")}
              className="btn-clay-primary px-8 py-4 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Book Your First Consultation</span>
              <FaArrowRight size={12} />
            </button>
            <button
              onClick={() => navigate("/doctors")}
              className="px-8 py-4 text-sm font-semibold uppercase tracking-wider border-2 border-[var(--hb-red)] text-[var(--hb-red)] rounded-2xl hover:bg-[var(--hb-red)]/10 transition-all"
            >
              Apply as a Doctor
            </button>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-xs font-bold text-[var(--hb-ink-soft)] uppercase tracking-widest">
        &copy; 2026 HealthLink. All Rights Reserved.
      </footer>
    </div>
  );
}
