import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";
import { 
  FaUserMd, 
  FaStethoscope, 
  FaBrain, 
  FaChild, 
  FaHeartbeat, 
  FaPrescription, 
  FaVial, 
  FaNotesMedical, 
  FaArrowRight 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();

  const servicesList = [
    {
      title: "General Consultations",
      desc: "Talk to a licensed general physician for everyday health concerns — fevers, infections, prescriptions, referrals, and general advice.",
      icon: <FaStethoscope className="text-[var(--hb-red)]" />
    },
    {
      title: "Specialist Consultations",
      desc: "Connect with cardiologists, dermatologists, gynecologists, ENT specialists, and more — no referral wait times.",
      icon: <FaUserMd className="text-emerald-500" />
    },
    {
      title: "Mental Health Support",
      desc: "Confidential video sessions with licensed therapists and psychiatrists for anxiety, stress, depression, and ongoing mental wellness care.",
      icon: <FaBrain className="text-purple-500" />
    },
    {
      title: "Pediatric Care",
      desc: "Child-friendly consultations for infants through teens, with pediatricians experienced in remote care.",
      icon: <FaChild className="text-blue-500" />
    },
    {
      title: "Chronic Disease Management",
      desc: "Ongoing monitoring and consultations for diabetes, hypertension, asthma, and other long-term conditions.",
      icon: <FaHeartbeat className="text-rose-500" />
    },
    {
      title: "Prescription & Refill Services",
      desc: "Get new prescriptions or refills reviewed and issued digitally, sent straight to your pharmacy.",
      icon: <FaPrescription className="text-teal-500" />
    },
    {
      title: "Lab Test Recommendations",
      desc: "Doctors can recommend and interpret lab work, with results reviewed in a dedicated follow-up call.",
      icon: <FaVial className="text-amber-500" />
    },
    {
      title: "Second Opinions",
      desc: "Already have a diagnosis? Get a fast, independent second opinion from another licensed specialist.",
      icon: <FaNotesMedical className="text-indigo-500" />
    }
  ];

  const steps = [
    { num: "1", title: "Choose your service or specialty", text: "Select from general medicine to specialized clinical care." },
    { num: "2", title: "Book an available time slot", text: "Real-time doctor calendar availability with zero double-booking." },
    { num: "3", title: "Consult via secure video call", text: "Encrypted HD video/audio room accessible directly in browser." },
    { num: "4", title: "Receive treatment & prescription", text: "Digital prescription and visit summary saved to your medical records." }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>

      <div className="blur-blob-red top-[-100px] left-[-50px]"></div>
      <div className="blur-blob-green top-[300px] right-[-100px]"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-36 pb-24 space-y-24">
        {/* Hero */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="clay-pressed inline-block px-4 py-1.5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-widest text-[var(--hb-red)]">
            Our Services
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[var(--hb-ink)] leading-[1.1]">
            Every consultation you need, in one place
          </h1>
          <p className="text-lg sm:text-xl text-[var(--hb-ink-soft)] max-w-3xl mx-auto leading-relaxed font-medium">
            From routine checkups to specialist care, HealthLink brings the clinic to your screen.
          </p>
        </section>

        {/* Services Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesList.map((service, idx) => (
            <div
              key={idx}
              className="glass-clay p-6 rounded-3xl space-y-4 border border-[var(--border)] hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-xl">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold tracking-tight text-[var(--hb-ink)]">{service.title}</h3>
                <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed font-medium opacity-90">{service.desc}</p>
              </div>

              <button
                onClick={() => navigate("/doctors")}
                className="text-xs font-bold uppercase tracking-wider text-[var(--hb-red)] hover:underline inline-flex items-center gap-1.5 pt-2"
              >
                <span>Find Specialist</span>
                <FaArrowRight size={10} />
              </button>
            </div>
          ))}
        </section>

        {/* How Services Work */}
        <section className="glass-clay p-10 sm:p-14 rounded-[2.5rem] border border-[var(--border)] space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              Process
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">
              How Services Work
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[var(--bg-main)]/60 border border-[var(--border)] space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--hb-red)] text-white font-black text-sm flex items-center justify-center">
                  {step.num}
                </div>
                <h4 className="text-base font-bold tracking-tight">{step.title}</h4>
                <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed font-medium">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-8 glass-clay p-12 rounded-[2.5rem] border border-[var(--border)] max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">
            Not sure which service you need?
          </h2>
          <p className="text-base text-[var(--hb-ink-soft)] font-medium max-w-xl mx-auto">
            Start with a general consultation — we'll route you to the right specialist if needed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/doctors")}
              className="btn-clay-primary px-9 py-4 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Browse All Doctors</span>
              <FaArrowRight size={12} />
            </button>
            <button
              onClick={() => navigate("/appointments")}
              className="px-9 py-4 text-sm font-semibold uppercase tracking-wider border-2 border-[var(--hb-red)] text-[var(--hb-red)] rounded-2xl hover:bg-[var(--hb-red)]/10 transition-all"
            >
              Book General Consult
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
