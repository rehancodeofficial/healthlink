import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";
import { FaHeartbeat, FaFilePrescription, FaCalendarCheck } from "react-icons/fa";

export default function Services() {
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
            Our Services
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--hb-ink)]">
            Comprehensive Digital Care
          </h1>
          <p className="text-lg text-[var(--hb-ink-soft)] max-w-2xl mx-auto leading-relaxed">
            We provide clinics with a cohesive suite of modules designed to handle everything from
            scheduling to clinical AI synthesis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="glass-clay p-8 text-left space-y-4">
              <div className="h-12 w-12 rounded-xl bg-[var(--hb-red)]/10 text-[var(--hb-red)] flex items-center justify-center text-xl">
                <FaHeartbeat />
              </div>
              <h3 className="text-lg font-bold text-[var(--hb-ink)]">EHR Integration</h3>
              <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed">
                Securely host and retrieve patient records with HIPAA-compliant encryption
                standards.
              </p>
            </div>

            <div className="glass-clay p-8 text-left space-y-4">
              <div className="h-12 w-12 rounded-xl bg-[var(--hb-green)]/10 text-[var(--hb-green)] flex items-center justify-center text-xl">
                <FaFilePrescription />
              </div>
              <h3 className="text-lg font-bold text-[var(--hb-ink)]">Smart Prescriptions</h3>
              <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed">
                Write, validate, and electronically dispatch prescriptions directly to
                patient-preferred pharmacies.
              </p>
            </div>

            <div className="glass-clay p-8 text-left space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-xl">
                <FaCalendarCheck />
              </div>
              <h3 className="text-lg font-bold text-[var(--hb-ink)]">Smart Scheduling</h3>
              <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed">
                Automate appointment queues and decrease doctor idle hours with calendar
                optimizations.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-xs text-[var(--hb-ink-soft)]">
        &copy; 2025 Health Link. All Rights Reserved.
      </footer>
    </div>
  );
}
