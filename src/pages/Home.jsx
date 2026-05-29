import { useNavigate } from "react-router-dom";
import {
  FaClock,
  FaMobileAlt,
  FaVideo,
  FaHandHoldingUsd,
  FaPrescriptionBottleAlt,
  FaFileMedical,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaComments,
  FaSun,
  FaMoon,
  FaArrowRight,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === "dark" ? "bg-[var(--bg-main)]" : "bg-[var(--bg-main)]"
      }`}
    >
      {/* Refined Fixed Navbar */}
      <nav className="fixed w-full z-50 backdrop-blur-3xl border-b border-[var(--border)] px-4 md:px-6 py-3 bg-[var(--bg-glass)]/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="bg-[var(--bg-glass)] p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
              <img src="/images/logo/Asset3.png" alt="Logo" className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter text-[var(--text-main)] uppercase">
              CURE<span className="text-[var(--brand-blue)]">VIRTUAL</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 md:p-3 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-soft)] hover:text-[var(--brand-orange)] transition-all shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>

            {/* Desktop Auth Buttons */}
            <button
              onClick={() => navigate("/login")}
              className="hidden md:block px-4 md:px-5 py-2 font-black text-xs uppercase tracking-widest text-[var(--text-soft)] hover:text-[var(--brand-green)] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="hidden md:block btn btn-primary !py-2.5 !px-6 text-[10px]"
            >
              Join Portal
            </button>

            {/* Mobile Menu Button - Enhanced for touch */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-soft)] hover:text-[var(--brand-orange)] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced Dropdown with improved touch targets and animation */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-[var(--bg-card)]/95 backdrop-blur-3xl border-b border-[var(--border)] shadow-2xl transition-all duration-300 origin-top overflow-hidden ${
            isMobileMenuOpen ? "opacity-100 max-h-[500px] visible" : "opacity-0 max-h-0 invisible"
          }`}
        >
          <div className="flex flex-col p-6 space-y-3">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-white text-black shadow-lg flex items-center justify-center border border-[var(--border)]"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-white text-black shadow-lg flex items-center justify-center border border-[var(--border)]"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-white text-black shadow-lg flex items-center justify-center border border-[var(--border)]"
            >
              Contact
            </a>
            <div className="border-t border-[var(--border)] my-3 opacity-50"></div>
            <button
              onClick={() => {
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest bg-white text-black shadow-lg flex items-center justify-center w-full"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setIsMobileMenuOpen(false);
              }}
              className="btn btn-primary !py-4 !text-sm w-full mt-2"
            >
              Join Portal <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </nav>

      {/* Optimized Hero - "Fit in Page View" */}
      <section className="relative min-h-[100dvh] flex items-center pt-28 pb-10 md:pt-24 md:pb-0 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--brand-blue)]/5 to-transparent -z-10 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-[var(--brand-green)]/5 to-transparent -z-10 blur-[120px]"></div>

        <div className="page-container grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="text-center lg:text-left space-y-6 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-[var(--border)] text-[var(--brand-orange)] text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-orange)] animate-pulse"></span>
              Redefining Digital Care
            </div>

            <div className="space-y-4 md:space-y-5">
              <img
                src="/images/logo/Asset3.png"
                alt="CureVirtual Logo"
                className="w-24 md:w-28 h-auto mx-auto lg:mx-0 drop-shadow-2xl animate-in zoom-in duration-500"
              />
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[var(--text-main)] leading-[1.0] tracking-tighter uppercase whitespace-nowrap lg:whitespace-normal">
                CURE <br className="hidden lg:block" />
                <span className="text-gradient">VIRTUAL</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-black text-[var(--brand-orange)] tracking-[0.05em] uppercase italic opacity-90">
                Healthcare Simplified to You
              </p>
            </div>

            <p className="text-base md:text-lg text-[var(--text-soft)] max-w-xl leading-relaxed font-medium mx-auto lg:mx-0 opacity-80">
              Experience medical consultation with zero boundaries. Connect with world-class
              specialists instantly through our high-performance virtual clinic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 md:pt-6">
              <button
                onClick={() => navigate("/register")}
                className="btn btn-primary !py-4 md:!py-5 !px-8 md:!px-12 text-sm shadow-green-500/20 w-full sm:w-auto"
              >
                Start Consultation <FaArrowRight />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-glass !py-4 md:!py-5 !px-8 md:!px-12 text-sm text-[var(--text-main)] w-full sm:w-auto border-2 border-[var(--brand-green)] hover:bg-[var(--brand-green)] hover:text-white"
              >
                Login to Portal
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 md:gap-12 pt-8 md:pt-10 opacity-70">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-black text-[var(--brand-blue)]">24/7</p>
                <p className="text-[10px] font-black uppercase tracking-widest">Support</p>
              </div>
              <div className="w-px h-10 bg-[var(--border)]"></div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-black text-[var(--brand-green)]">100%</p>
                <p className="text-[10px] font-black uppercase tracking-widest">Secure</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="glass !p-4 !rounded-[3rem] overflow-hidden border-[var(--border)] shadow-2xl animate-float">
              <img
                src="/images/logo/Asset3.png"
                alt="Telemedicine"
                className="rounded-[2.5rem] w-full h-[600px] object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Status Floating Widget */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 glass !p-6 !rounded-3xl shadow-2xl border-[var(--border)] animate-bounce-slow backdrop-blur-3xl">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-[var(--brand-green)]/10 flex items-center justify-center text-[var(--brand-green)] text-3xl">
                  <FaVideo />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1">
                    Active Signal
                  </p>
                  <p className="font-black text-base">HD Consult Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Compact Grid */}
      <section id="features" className="py-20 md:py-24 relative bg-[var(--bg-main)]">
        <div className="page-container">
          <div className="text-center mb-12 md:mb-20 space-y-4 md:space-y-6">
            <h2 className="text-xs font-black text-[var(--brand-orange)] uppercase tracking-[0.4em] animate-pulse">
              Our Capabilities
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
              Everything you need <br className="hidden md:block" /> for health.
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<FaClock className="text-[var(--brand-green)]" />}
              title="24/7 Availability"
              text="Instant connectivity with licensed medical practitioners around the clock."
              color="green"
            />
            <FeatureCard
              icon={<FaMobileAlt className="text-[var(--brand-blue)]" />}
              title="Native Mobility"
              text="Optimized for every device to ensure care is always within reach."
              color="blue"
            />
            <FeatureCard
              icon={<FaVideo className="text-[var(--brand-orange)]" />}
              title="HD Consult"
              text="Encrypted, crystal-clear video calls for deep-dive medical sessions."
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* About - Premium Section */}
      <section
        id="about"
        className="py-20 md:py-32 bg-[var(--bg-glass)] backdrop-blur-sm border-y border-[var(--border)]"
      >
        <div className="page-container flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          <div className="lg:w-1/2 space-y-8 md:space-y-10 text-center lg:text-left">
            <h2 className="text-gradient font-black text-xs uppercase tracking-[0.3em]">
              The Ecosystem
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter">
              Patient-first <br /> technology.
            </h3>
            <p className="text-lg md:text-xl text-[var(--text-soft)] leading-relaxed font-medium opacity-80">
              We've re-engineered the telemedicine workflow from the ground up. CureVirtual isn't
              just a video tool; it's a complete medical ecosystem.
            </p>
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div className="p-6 md:p-8 glass !rounded-[2rem] border-[var(--border)] hover:-translate-y-2 transition-transform duration-500">
                <p className="text-3xl md:text-5xl font-black text-[var(--brand-green)] mb-2">
                  100k+
                </p>
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Users Served
                </p>
              </div>
              <div className="p-6 md:p-8 glass !rounded-[2rem] border-[var(--border)] hover:-translate-y-2 transition-transform duration-500 delay-100">
                <p className="text-3xl md:text-5xl font-black text-[var(--brand-blue)] mb-2">
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
              className="rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-[var(--border)] w-full object-cover h-[400px] md:h-[600px] hover:scale-[1.02] transition-transform duration-700"
              alt="Modern Hospital"
            />
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer id="contact" className="py-16 md:py-20">
        <div className="page-container flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 border-t border-[var(--border)] pt-12 md:pt-16">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--bg-glass)] p-2 rounded-xl shadow-sm border border-[var(--border)]">
                <img src="/images/logo/Asset3.png" alt="Logo" className="w-8 h-8" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">
                CURE<span className="text-[var(--brand-blue)]">VIRTUAL</span>
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] md:ml-4">
              &copy; 2025 ALL SYSTEMS NOMINAL
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            <a href="#features" className="hover:text-[var(--brand-green)] transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-[var(--brand-blue)] transition-colors">
              About Us
            </a>
            <a href="#contact" className="hover:text-[var(--brand-orange)] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-soft)] hover:text-[var(--brand-green)] active:scale-90 transition-all"
    >
      {children}
    </a>
  );
}

function FeatureCard({ icon, title, text, color }) {
  const dynamicColor = {
    green: "hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5",
    blue: "hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/5",
    orange: "hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/5",
  }[color];

  return (
    <div
      className={`card group p-6 md:p-10 hover:-translate-y-2 transition-all cursor-default border-[var(--border)] ${dynamicColor} h-full flex flex-col`}
    >
      <div
        className={`h-16 w-16 rounded-[1.5rem] bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner`}
      >
        {icon}
      </div>
      <h4 className="text-xl font-black text-[var(--text-main)] mb-4 tracking-tight">{title}</h4>
      <p className="text-sm font-medium text-[var(--text-soft)] leading-relaxed">{text}</p>
    </div>
  );
}
