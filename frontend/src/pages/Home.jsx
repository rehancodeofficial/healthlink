import { FaClock, FaMobileAlt, FaVideo } from "react-icons/fa";
import Navbar from "../components/navbar/Navbar";
import Hero from "../components/hero/Hero";
import DarkStatsBanner from "../components/hero/DarkStatsBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>

      {/* Floating ambient blobs */}
      <div className="blur-blob-red top-[-100px] left-[-50px]"></div>
      <div className="blur-blob-green top-[250px] right-[-100px]"></div>

      {/* Primary Inset Navbar */}
      <Navbar />

      {/* Glass-Claymorphism Hero Layout */}
      <Hero />

      {/* Full-width Dark Stats Band */}
      <DarkStatsBanner />

      {/* Features - Compact Grid */}
      <section
        id="features"
        className="py-24 relative bg-[var(--bg-main)] border-t border-[var(--border)]"
      >
        <div className="page-container max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-black text-[var(--brand-primary)] uppercase tracking-[0.4em] animate-pulse">
              Our Capabilities
            </h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
              Everything you need for health.
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaClock className="text-[var(--brand-secondary)]" />}
              title="24/7 Availability"
              text="Instant connectivity with licensed medical practitioners around the clock."
              color="emerald"
            />
            <FeatureCard
              icon={<FaMobileAlt className="text-[var(--brand-primary)]" />}
              title="Native Mobility"
              text="Optimized for every device to ensure care is always within reach."
              color="red"
            />
            <FeatureCard
              icon={<FaVideo className="text-[var(--brand-primary)]" />}
              title="HD Consult"
              text="Encrypted, crystal-clear video calls for deep-dive medical sessions."
              color="slate"
            />
          </div>
        </div>
      </section>

      {/* About - Premium Section */}
      <section
        id="about"
        className="py-24 bg-[var(--bg-glass)] backdrop-blur-sm border-t border-[var(--border)]"
      >
        <div className="page-container max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <h2 className="text-gradient font-black text-xs uppercase tracking-[0.3em]">
              The Ecosystem
            </h2>
            <h3 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
              Patient-first technology.
            </h3>
            <p className="text-lg text-[var(--text-soft)] leading-relaxed font-medium opacity-80">
              We've re-engineered the telemedicine workflow from the ground up. Health Link isn't
              just a video tool; it's a complete medical ecosystem.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 glass-clay hover:-translate-y-1 transition-transform duration-500">
                <p className="text-3xl md:text-4xl font-black text-[var(--brand-secondary)] mb-2">
                  100k+
                </p>
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Users Served
                </p>
              </div>
              <div className="p-6 glass-clay hover:-translate-y-1 transition-transform duration-500">
                <p className="text-3xl md:text-4xl font-black text-[var(--brand-primary)] mb-2">
                  99.9%
                </p>
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Uptime Record
                </p>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <img
              src="/images/about.jpeg"
              className="rounded-[2rem] shadow-2xl border border-[var(--border)] w-full object-cover h-[400px] hover:scale-[1.01] transition-transform duration-700"
              alt="Modern Hospital"
            />
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer id="contact" className="py-16 border-t border-[var(--border)]">
        <div className="page-container max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t border-[var(--border)] pt-12">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="clay-pressed p-1.5 rounded-full shadow-sm border border-[var(--border)] overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 mix-blend-multiply" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">
                HEALTH<span className="text-[var(--brand-primary)]">BRIDGE</span>
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] md:ml-4">
              &copy; 2025 ALL SYSTEMS NOMINAL
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            <a href="#features" className="hover:text-[var(--brand-primary)] transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-[var(--brand-secondary)] transition-colors">
              About Us
            </a>
            <a href="#contact" className="hover:text-[var(--brand-primary)] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, text, color }) {
  const dynamicColor = {
    emerald: "hover:border-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/5",
    red: "hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5",
    slate: "hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5",
  }[color];

  return (
    <div
      className={`glass-clay group p-8 hover:-translate-y-1 transition-all cursor-default border-[var(--border)] ${dynamicColor} h-full flex flex-col`}
    >
      <div
        className={`h-14 w-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-2xl mb-6 group-hover:scale-105 transition-all shadow-inner`}
      >
        {icon}
      </div>
      <h4 className="text-lg font-bold text-[var(--text-main)] mb-3 tracking-tight">{title}</h4>
      <p className="text-sm font-medium text-[var(--text-soft)] leading-relaxed">{text}</p>
    </div>
  );
}
