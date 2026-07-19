import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Appointments() {
  const navigate = useNavigate();

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
            Consultations
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--hb-ink)]">
            Book an Appointment
          </h1>
          <p className="text-lg text-[var(--hb-ink-soft)] max-w-2xl mx-auto leading-relaxed">
            Select a convenient slot to speak with one of our specialized doctors. Log in or create
            an account to finalize your booking.
          </p>

          <div className="glass-clay p-8 max-w-xl mx-auto space-y-6 pt-8">
            <h3 className="text-xl font-bold text-[var(--hb-ink)] text-left">Quick Scheduler</h3>

            <div className="grid grid-cols-3 gap-3">
              {["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"].map(
                (slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate("/login")}
                    className="p-3 text-xs font-bold rounded-xl border border-[var(--border)] hover:bg-[var(--hb-red)] hover:text-white transition-all active:scale-95"
                  >
                    {slot}
                  </button>
                )
              )}
            </div>

            <div className="border-t border-[var(--border)] pt-6 text-left">
              <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed mb-4">
                Already have a consultation ID? Enter details inside the patient portal to view
                details.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="btn-clay-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Access Patient Portal
              </button>
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
