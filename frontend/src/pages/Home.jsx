import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  FaCalendarCheck, 
  FaVideo, 
  FaPrescription, 
  FaUserCheck, 
  FaShieldAlt, 
  FaHistory, 
  FaClock, 
  FaArrowRight, 
  FaStethoscope, 
  FaHeartbeat, 
  FaChild, 
  FaUserMd, 
  FaBrain, 
  FaAppleAlt, 
  FaUserNurse, 
  FaHeadphones 
} from "react-icons/fa";
import Navbar from "../components/navbar/Navbar";
import Hero from "../components/hero/Hero";
import DarkStatsBanner from "../components/hero/DarkStatsBanner";

export default function Home() {
  const navigate = useNavigate();

  const specialties = [
    { name: "General Physician", desc: "Fevers, infections, everyday illness", icon: <FaStethoscope className="text-[var(--hb-red)]" /> },
    { name: "Dermatology", desc: "Skin, hair, and nail concerns", icon: <FaHeartbeat className="text-emerald-500" /> },
    { name: "Pediatrics", desc: "Child health, from newborns to teens", icon: <FaChild className="text-blue-500" /> },
    { name: "Gynecology", desc: "Women's health, private and judgment-free", icon: <FaUserNurse className="text-purple-500" /> },
    { name: "Mental Health", desc: "Therapy and psychiatric consultations", icon: <FaBrain className="text-indigo-500" /> },
    { name: "Nutrition", desc: "Diet plans built around your health goals", icon: <FaAppleAlt className="text-amber-500" /> },
    { name: "Internal Medicine", desc: "Chronic condition management", icon: <FaUserMd className="text-teal-500" /> },
    { name: "ENT", desc: "Ear, nose, throat, and sinus issues", icon: <FaHeadphones className="text-rose-500" /> }
  ];

  const whyUs = [
    { title: "Verified specialists", text: "Every doctor is licensed, credentialed, and reviewed before joining the platform.", icon: <FaUserCheck className="text-[var(--hb-red)]" /> },
    { title: "Real-time video consultations", text: "HD, encrypted video and audio consults with zero lag.", icon: <FaVideo className="text-emerald-500" /> },
    { title: "Digital prescriptions", text: "E-prescriptions sent directly to your preferred pharmacy.", icon: <FaPrescription className="text-blue-500" /> },
    { title: "Complete medical history", text: "All your visits, prescriptions, and reports in one secure dashboard.", icon: <FaHistory className="text-purple-500" /> },
    { title: "Round-the-clock access", text: "Talk to a doctor at 2 AM or 2 PM — we don't close.", icon: <FaClock className="text-amber-500" /> }
  ];

  const faqs = [
    { q: "Is a video consultation as effective as an in-person visit?", a: "For most non-emergency concerns — consultations, prescriptions, follow-ups, and specialist advice — yes. Doctors will always recommend in-person care when needed." },
    { q: "Are my prescriptions valid at any pharmacy?", a: "Yes, e-prescriptions issued through HealthLink are valid at any licensed pharmacy." },
    { q: "Is my health data private?", a: "Yes. All consultations and records are encrypted with bank-grade security and accessible only to you and your treating doctor." },
    { q: "How fast can I see a doctor?", a: "Average wait time from booking to consultation is under 5 minutes for general care." }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>

      <div className="blur-blob-red top-[-100px] left-[-50px]"></div>
      <div className="blur-blob-green top-[250px] right-[-100px]"></div>

      <Navbar />

      <Hero />

      <DarkStatsBanner />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative bg-[var(--bg-main)] border-t border-[var(--border)]">
        <div className="page-container max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.4em]">
              Simple Workflow
            </h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
              Get care in 3 simple steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-clay p-8 rounded-3xl space-y-4 relative hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[var(--hb-red)]/10 text-[var(--hb-red)] font-black text-xl flex items-center justify-center border border-[var(--hb-red)]/20">
                1
              </div>
              <h4 className="text-xl font-bold tracking-tight">Book your slot</h4>
              <p className="text-sm text-[var(--text-soft)] leading-relaxed font-medium">
                Choose a doctor by specialty, availability, or rating, and pick a time that works for you.
              </p>
            </div>

            <div className="glass-clay p-8 rounded-3xl space-y-4 relative hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 font-black text-xl flex items-center justify-center border border-emerald-500/20">
                2
              </div>
              <h4 className="text-xl font-bold tracking-tight">Consult online</h4>
              <p className="text-sm text-[var(--text-soft)] leading-relaxed font-medium">
                Join a secure video call from any device. No downloads, no waiting rooms.
              </p>
            </div>

            <div className="glass-clay p-8 rounded-3xl space-y-4 relative hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 font-black text-xl flex items-center justify-center border border-blue-500/20">
                3
              </div>
              <h4 className="text-xl font-bold tracking-tight">Get treated</h4>
              <p className="text-sm text-[var(--text-soft)] leading-relaxed font-medium">
                Receive your diagnosis, e-prescription, and follow-up plan instantly in your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Image Banner — below How It Works */}
        <div className="mt-14 h-[380px] rounded-3xl overflow-hidden border border-[var(--border)] relative bg-cover bg-center" style={{ backgroundImage: "url('/images/consultation-video.png')" }}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
          <div className="relative z-10 h-full flex items-center justify-center p-8">
            <p className="text-white text-xl sm:text-2xl font-black tracking-tight text-center drop-shadow-lg max-w-lg">
              See how a real consultation works in under 60 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Specialties Preview */}
      <section id="specialties" className="py-24 bg-[var(--bg-glass)] backdrop-blur-sm border-t border-[var(--border)]">
        <div className="page-container max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em] mb-2">
                Specialist Care
              </h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
                Care for what's actually going on
              </h3>
            </div>
            <button
              onClick={() => navigate("/doctors")}
              className="px-6 py-3 rounded-2xl border-2 border-[var(--hb-ink)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--hb-ink)] hover:text-white transition-all flex items-center gap-2 self-start"
            >
              <span>View All Doctors</span>
              <FaArrowRight size={10} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(item.name)}`)}
                className="glass-clay p-6 rounded-3xl hover:-translate-y-1.5 transition-all cursor-pointer group border border-[var(--border)]"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-base font-bold tracking-tight mb-1">{item.name}</h4>
                <p className="text-xs text-[var(--text-soft)] opacity-80 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HealthLink */}
      <section id="why-us" className="py-24 bg-[var(--bg-main)] border-t border-[var(--border)]">
        <div className="page-container max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              Why HealthLink
            </h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              Care built around you
            </h3>
            <p className="text-base text-[var(--text-soft)] leading-relaxed font-medium">
              We've re-engineered the telemedicine workflow from the ground up. HealthLink isn't just a video tool; it's a complete medical ecosystem built around what actually slows people down.
            </p>

            <div className="space-y-4">
              {whyUs.map((item, idx) => (
                <div key={idx} className="glass-clay p-4 rounded-2xl flex items-start gap-4 border border-[var(--border)]">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">{item.title}</h4>
                    <p className="text-xs text-[var(--text-soft)] leading-relaxed font-medium mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 w-full h-[520px] rounded-[2.5rem] overflow-hidden border border-[var(--border)] shadow-2xl relative bg-slate-100">
            <img
              src="/images/service-general.jpg"
              alt="Doctor consultation"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Testimonial Strip */}
      <section className="py-20 bg-[var(--hb-ink)] text-white relative overflow-hidden select-none">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--hb-red)]">
            Trusted by Thousands of Patients
          </h2>
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
            "I got a same-day consultation and my prescription was at the pharmacy before I even left my chair."
          </blockquote>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--hb-ink-soft)]">
            Verified Patient Review
          </p>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-[var(--bg-main)] border-t border-[var(--border)]">
        <div className="page-container max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              FAQ Preview
            </h2>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter">
              Common questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-clay p-6 rounded-3xl space-y-2 border border-[var(--border)]">
                <h4 className="text-base font-bold text-[var(--hb-ink)] tracking-tight">{faq.q}</h4>
                <p className="text-xs text-[var(--text-soft)] leading-relaxed font-medium opacity-90">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/resources")}
              className="text-xs font-black uppercase tracking-widest text-[var(--hb-red)] hover:underline inline-flex items-center gap-2"
            >
              <span>See All FAQs in Resources</span>
              <FaArrowRight size={10} />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Band — with background image */}
      <section className="relative border-t border-[var(--border)] overflow-hidden bg-cover bg-center py-28" style={{ backgroundImage: "url('/images/clinic-lobby.png')" }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 space-y-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight text-white">
            Your next doctor's visit doesn't need a waiting room
          </h2>
          <p className="text-base sm:text-lg text-white/80 font-medium max-w-xl mx-auto">
            Book a consultation in under 2 minutes. No app download required — book from any browser.
          </p>
          <motion.button
            onClick={() => navigate("/appointments")}
            className="btn-clay-primary px-10 py-4 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Book Your First Consultation</span>
            <FaArrowRight size={14} />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 border-t border-[var(--border)]">
        <div className="page-container max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t border-[var(--border)] pt-12">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="clay-pressed p-1.5 rounded-full shadow-sm border border-[var(--border)] overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 mix-blend-multiply" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">
                HEALTH<span className="text-[var(--hb-red)]">LINK</span>
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] md:ml-4">
              &copy; 2026 HEALTHLINK. ALL RIGHTS RESERVED.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            <a href="/about" className="hover:text-[var(--hb-red)] transition-colors">
              About
            </a>
            <a href="/services" className="hover:text-[var(--hb-red)] transition-colors">
              Services
            </a>
            <a href="/doctors" className="hover:text-[var(--hb-red)] transition-colors">
              Doctors
            </a>
            <a href="/appointments" className="hover:text-[var(--hb-red)] transition-colors">
              Appointments
            </a>
            <a href="/resources" className="hover:text-[var(--hb-red)] transition-colors">
              Resources
            </a>
            <a href="/contact" className="hover:text-[var(--hb-red)] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
