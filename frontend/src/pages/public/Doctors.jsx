import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";

export default function Doctors() {
  const doctorsList = [
    {
      name: "Dr. Amara Khan",
      specialty: "Cardiology",
      desc: "Expert in clinical cardiovascular medicine and preventive care.",
    },
    {
      name: "Dr. Bilal Ahmed",
      specialty: "Pediatrics",
      desc: "Dedicated to comprehensive primary healthcare services for children.",
    },
    {
      name: "Dr. Farhan Yousaf",
      specialty: "General Physician",
      desc: "Focused on health diagnostics and personalized medicine strategies.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-36 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <span className="clay-pressed inline-block px-4 py-1.5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-wider text-[var(--hb-ink-soft)]">
            Our Medical Panel
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--hb-ink)]">
            Meet Our Specialist Doctors
          </h1>
          <p className="text-lg text-[var(--hb-ink-soft)] max-w-2xl mx-auto leading-relaxed">
            Consult with certified practitioners committed to empirical, compassionate healthcare
            delivery.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {doctorsList.map((doc, idx) => (
              <div key={idx} className="glass-clay p-8 text-left space-y-4">
                <div className="h-40 w-full bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center text-slate-400 font-bold border border-[var(--border)]">
                  {/* Generic avatar placeholders */}
                  <span className="text-sm font-black uppercase text-[var(--hb-ink-soft)]">
                    {doc.name.split(" ").slice(1).join(" ")}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--hb-ink)]">{doc.name}</h3>
                  <span className="text-[10px] font-black text-[var(--hb-red)] uppercase tracking-wider block mt-0.5">
                    {doc.specialty}
                  </span>
                </div>
                <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed">{doc.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-xs text-[var(--hb-ink-soft)]">
        &copy; 2025 Health Link. All Rights Reserved.
      </footer>
    </div>
  );
}
