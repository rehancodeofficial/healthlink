import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";

export default function Contact() {
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
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--hb-ink)]">
            We'd Love to Hear From You
          </h1>
          <p className="text-lg text-[var(--hb-ink-soft)] max-w-2xl mx-auto leading-relaxed">
            Have questions about integrations or subscription packages? Message our clinic solutions support team.
          </p>

          <form className="glass-clay p-8 max-w-lg mx-auto space-y-6 pt-8 text-left" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--hb-ink)]">Full Name</label>
              <input
                type="text"
                className="w-full p-3 text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
                placeholder="Enter name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--hb-ink)]">Email Address</label>
              <input
                type="email"
                className="w-full p-3 text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
                placeholder="Enter email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--hb-ink)]">Message</label>
              <textarea
                rows="4"
                className="w-full p-3 text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
                placeholder="Write message details..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn-clay-primary w-full py-4 text-xs font-bold uppercase tracking-wider text-center"
            >
              Send Message
            </button>
          </form>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-xs text-[var(--hb-ink-soft)]">
        &copy; 2025 Health Bridge. All Rights Reserved.
      </footer>
    </div>
  );
}
