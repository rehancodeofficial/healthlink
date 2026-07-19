import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaBookOpen, FaUserCheck, FaQuestionCircle, FaArrowRight, FaShieldAlt, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Resources() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const articles = [
    {
      category: "Preventive Care",
      title: "Understanding Telemedicine Consultations & Virtual Care",
      excerpt: "Learn how to prepare for your online doctor visit to get the most out of your consultation.",
      readTime: "4 min read",
      reviewer: "Dr. Amara Khan, Cardiologist"
    },
    {
      category: "Health Guides",
      title: "Managing Seasonal Allergies & Respiratory Infections at Home",
      excerpt: "Key symptoms, preventive measures, and when to seek virtual medical advice.",
      readTime: "5 min read",
      reviewer: "Dr. Farhan Yousaf, General Physician"
    },
    {
      category: "Pediatric Care",
      title: "Child Growth, Nutrition & Immunity Essentials",
      excerpt: "Practical guidance for parents on nutrition, fever management, and routine checkups.",
      readTime: "6 min read",
      reviewer: "Dr. Bilal Ahmed, Pediatrician"
    }
  ];

  const categories = ["Health Guides", "Preventive Care", "Medication Info", "Mental Wellness", "Patient FAQs"];

  const faqs = [
    {
      q: "Is a video consultation as effective as an in-person visit?",
      a: "For most non-emergency concerns — consultations, prescriptions, follow-ups, and specialist advice — yes. Doctors will always recommend in-person or emergency care when needed."
    },
    {
      q: "Are my prescriptions valid at any pharmacy?",
      a: "Yes, e-prescriptions issued through HealthLink are valid at any licensed pharmacy."
    },
    {
      q: "Is my health data private?",
      a: "Yes. All consultations and records are encrypted with bank-grade security and accessible only to you and your treating doctor."
    },
    {
      q: "What if I need emergency care?",
      a: "HealthLink is not for medical emergencies. Please call your local emergency number or visit the nearest emergency room immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>

      <div className="blur-blob-red top-[-100px] left-[-50px]"></div>
      <div className="blur-blob-green top-[300px] right-[-100px]"></div>

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-36 pb-24 space-y-20">
        {/* Hero */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="clay-pressed inline-block px-4 py-1.5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-widest text-[var(--hb-red)]">
            Knowledge Center
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[var(--hb-ink)] leading-[1.1]">
            Health resources, explained simply
          </h1>
          <p className="text-lg sm:text-xl text-[var(--hb-ink-soft)] max-w-3xl mx-auto leading-relaxed font-medium">
            Guides, articles, and tools to help you understand your health — written and reviewed by our medical team.
          </p>
        </section>

        {/* Categories Bar */}
        <section className="flex flex-wrap justify-center gap-3 select-none">
          {categories.map((cat, idx) => (
            <span
              key={idx}
              className="clay-pressed px-5 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider text-[var(--hb-ink-soft)] border border-[var(--border)]"
            >
              {cat}
            </span>
          ))}
        </section>

        {/* Featured Articles */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="glass-clay p-8 rounded-[2rem] border border-[var(--border)] space-y-5 hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--hb-red)] block">
                  {art.category}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-[var(--hb-ink)] leading-snug">{art.title}</h3>
                <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed font-medium">{art.excerpt}</p>
              </div>

              <div className="border-t border-[var(--border)] pt-4 space-y-2 text-[11px] font-medium text-[var(--hb-ink-soft)]">
                <div className="flex items-center justify-between">
                  <span>{art.readTime}</span>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold">
                    <FaUserCheck />
                    <span>Verified</span>
                  </div>
                </div>
                <p className="text-[10px] opacity-80">Reviewed by {art.reviewer}</p>
              </div>
            </div>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="glass-clay p-10 sm:p-14 rounded-[2.5rem] border border-[var(--border)] space-y-10 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              FAQ
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">
              Frequently asked questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="p-6 rounded-3xl bg-[var(--bg-main)]/70 border border-[var(--border)] cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-base font-bold text-[var(--hb-ink)] tracking-tight">{faq.q}</h4>
                  <FaChevronDown className={`text-xs text-[var(--hb-ink-soft)] transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </div>
                {openFaq === idx && (
                  <p className="text-xs text-[var(--hb-ink-soft)] leading-relaxed font-medium pt-2 border-t border-[var(--border)] animate-in fade-in duration-300">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 glass-clay p-12 rounded-[2.5rem] border border-[var(--border)] max-w-3xl mx-auto">
          <h2 className="text-3xl font-black tracking-tighter">
            Still have questions?
          </h2>
          <button
            onClick={() => navigate("/contact")}
            className="btn-clay-primary px-9 py-4 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <span>Contact Support</span>
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
