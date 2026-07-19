import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  FaEnvelope, 
  FaUserMd, 
  FaNewspaper, 
  FaClock, 
  FaMapMarkerAlt, 
  FaExclamationTriangle, 
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            <h4 className="font-bold text-xs uppercase tracking-wider">Emergency Notice</h4>
            <p className="text-xs leading-relaxed font-medium">
              HealthLink is not an emergency service. For urgent medical situations, please contact your local emergency number or visit the nearest ER immediately.
            </p>
          </div>
        </section>

        {/* Hero */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="clay-pressed inline-block px-4 py-1.5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-widest text-[var(--hb-red)]">
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[var(--hb-ink)] leading-[1.1]">
            We're here to help
          </h1>
          <p className="text-lg sm:text-xl text-[var(--hb-ink-soft)] max-w-3xl mx-auto leading-relaxed font-medium">
            Questions about your account, an appointment, or how HealthLink works? Reach out — we typically respond within a few hours.
          </p>
        </section>

        {/* Contact Options & Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Options */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-clay p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[var(--hb-red)]/10 text-[var(--hb-red)]">
                  <FaEnvelope className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--hb-ink)]">Patient Support</h4>
                  <p className="text-xs text-[var(--hb-ink-soft)] font-medium">For appointment, billing, or account issues</p>
                </div>
              </div>
              <a href="mailto:support@healthlink.dev" className="text-xs font-bold text-[var(--hb-red)] block pt-1 hover:underline">
                support@healthlink.dev
              </a>
            </div>

            <div className="glass-clay p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <FaUserMd className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--hb-ink)]">Doctor Partnerships</h4>
                  <p className="text-xs text-[var(--hb-ink-soft)] font-medium">For licensed physicians interested in joining panel</p>
                </div>
              </div>
              <a href="mailto:partners@healthlink.dev" className="text-xs font-bold text-emerald-600 block pt-1 hover:underline">
                partners@healthlink.dev
              </a>
            </div>

            <div className="glass-clay p-6 rounded-3xl border border-[var(--border)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                  <FaNewspaper className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--hb-ink)]">Media & Press</h4>
                  <p className="text-xs text-[var(--hb-ink-soft)] font-medium">Press inquiries and public relations</p>
                </div>
              </div>
              <a href="mailto:press@healthlink.dev" className="text-xs font-bold text-blue-600 block pt-1 hover:underline">
                press@healthlink.dev
              </a>
            </div>

            {/* Support Hours & HQ */}
            <div className="glass-clay p-6 rounded-3xl border border-[var(--border)] space-y-4">
              <div className="flex items-start gap-3">
                <FaClock className="text-amber-500 text-lg mt-0.5" />
                <div className="text-xs font-medium text-[var(--hb-ink-soft)] space-y-1">
                  <h4 className="font-bold text-[var(--hb-ink)] text-xs uppercase tracking-wider">Support Hours</h4>
                  <p>Live Chat & Phone: Monday–Sunday, 8 AM – 12 AM</p>
                  <p>Email Support: 24/7, response within 4 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-[var(--border)] pt-4">
                <FaMapMarkerAlt className="text-[var(--hb-red)] text-lg mt-0.5" />
                <div className="text-xs font-medium text-[var(--hb-ink-soft)] space-y-1">
                  <h4 className="font-bold text-[var(--hb-ink)] text-xs uppercase tracking-wider">HealthLink HQ</h4>
                  <p>Technology Innovation Park, Suite 400</p>
                  <p>Islamabad, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 glass-clay p-8 sm:p-10 rounded-[2.5rem] border border-[var(--border)] space-y-6">
            <h3 className="text-2xl font-black tracking-tight text-[var(--hb-ink)]">Send us a message</h3>

            {submitted ? (
              <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4 text-emerald-900 dark:text-emerald-200">
                <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                <h4 className="text-xl font-bold tracking-tight">Message Received!</h4>
                <p className="text-xs font-medium leading-relaxed">
                  Got it — we'll get back to you within a few hours.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--hb-ink)] uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Malik"
                    className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs font-medium text-[var(--hb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--hb-ink)] uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="ayesha@example.com"
                    className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs font-medium text-[var(--hb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--hb-ink)] uppercase tracking-wider">Reason for Contact</label>
                  <select className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs font-medium text-[var(--hb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]">
                    <option>Patient Support & Billing</option>
                    <option>Doctor Application</option>
                    <option>Partnership Inquiry</option>
                    <option>Technical Issue</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--hb-ink)] uppercase tracking-wider">Message</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Write details of your inquiry..."
                    className="w-full p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs font-medium text-[var(--hb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-clay-primary w-full py-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Send Message</span>
                  <FaArrowRight size={10} />
                </button>
              </form>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 glass-clay p-12 rounded-[2.5rem] border border-[var(--border)] max-w-3xl mx-auto">
          <h2 className="text-3xl font-black tracking-tighter">
            Prefer to just talk to a doctor?
          </h2>
          <p className="text-base text-[var(--hb-ink-soft)] font-medium">
            Skip the form — book a consultation directly in under 2 minutes.
          </p>
          <button
            onClick={() => navigate("/appointments")}
            className="btn-clay-primary px-9 py-4 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <span>Book an Appointment</span>
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
