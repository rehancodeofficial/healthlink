import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";

export default function About() {
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
            About Health Bridge
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--hb-ink)]">
            Revolutionizing Clinic Management
          </h1>
          <p className="text-lg text-[var(--hb-ink-soft)] max-w-2xl mx-auto leading-relaxed">
            Our mission is to empower healthcare providers with cutting-edge artificial intelligence, 
            streamlining clinical administration so doctors can focus on what matters most: patient care.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <div className="glass-clay p-8 text-left space-y-4">
              <h3 className="text-xl font-bold text-[var(--hb-ink)]">Our Vision</h3>
              <p className="text-sm text-[var(--hb-ink-soft)] leading-relaxed">
                A connected healthcare ecosystem where technology bridges the gap between diagnosis and recovery instantly.
              </p>
            </div>
            <div className="glass-clay p-8 text-left space-y-4">
              <h3 className="text-xl font-bold text-[var(--hb-ink)]">Our Culture</h3>
              <p className="text-sm text-[var(--hb-ink-soft)] leading-relaxed">
                Driven by compliance, patient security, and design-led product innovation.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-xs text-[var(--hb-ink-soft)]">
        &copy; 2025 Health Bridge. All Rights Reserved.
      </footer>
    </div>
  );
}
