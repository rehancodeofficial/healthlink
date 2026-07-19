import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";

export default function Resources() {
  const guides = [
    { title: "Managing Clinic Workflow", category: "Guides", read: "5 min read" },
    { title: "HIPAA Security Best Practices", category: "Security", read: "8 min read" },
    { title: "Telehealth Compliance Checklist", category: "Compliance", read: "12 min read" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-36 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <span className="clay-pressed inline-block px-4 py-1.5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-wider text-[var(--hb-ink-soft)]">
            Knowledge Center
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--hb-ink)]">
            Helpful Guides & Resources
          </h1>
          <p className="text-lg text-[var(--hb-ink-soft)] max-w-2xl mx-auto leading-relaxed">
            Read medical insights, compliance reports, and system optimization tutorials written by
            clinical specialists.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            {guides.map((item, idx) => (
              <div
                key={idx}
                className="glass-clay p-6 text-left space-y-4 hover:-translate-y-1 transition-transform cursor-pointer"
              >
                <span className="text-[9px] font-black uppercase text-[var(--hb-red)] tracking-widest">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-[var(--hb-ink)] leading-snug">
                  {item.title}
                </h3>
                <span className="text-[10px] text-[var(--hb-ink-soft)] block">{item.read}</span>
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
