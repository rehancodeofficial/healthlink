import { useNavigate } from "react-router-dom";
import {
  FaClock,
  FaMobileAlt,
  FaVideo,
  FaSearch,
  FaBell,
  FaUserMd,
  FaCalendarAlt,
  FaRobot,
  FaChartLine,
  FaShieldAlt,
  FaCircle,
  FaArrowRight,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300`}>
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>
      
      {/* Floating ambient blobs */}
      <div className="blur-blob-red top-[-100px] left-[-50px]"></div>
      <div className="blur-blob-green top-[250px] right-[-100px]"></div>

      {/* Decorative Floating Medical Icons */}
      <div className="absolute top-[15%] left-[5%] text-[var(--brand-primary)] opacity-10 animate-float-slow hidden lg:block" style={{ fontSize: '32px' }}><FaUserMd /></div>
      <div className="absolute top-[65%] left-[8%] text-[var(--brand-secondary)] opacity-10 animate-float-medium hidden lg:block" style={{ fontSize: '28px' }}><FaShieldAlt /></div>
      <div className="absolute top-[80%] right-[10%] text-[var(--brand-primary)] opacity-15 animate-float-slow hidden lg:block" style={{ fontSize: '30px' }}><FaCalendarAlt /></div>
      <div className="absolute top-[20%] right-[30%] text-[var(--brand-accent)] opacity-10 animate-float-medium hidden lg:block" style={{ fontSize: '24px' }}><FaRobot /></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 backdrop-blur-3xl border-b border-[var(--border)] px-6 py-4 bg-[var(--bg-glass)] transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="bg-[var(--bg-card)] p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md border border-[var(--border)]">
              <img src="/images/logo/Asset3.png" alt="Logo" className="w-8 h-8" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              HEALTH<span className="text-[var(--brand-primary)]">BRIDGE</span>
            </span>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-12">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-soft)] hover:text-[var(--brand-primary)] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <FaMoon size={16} /> : <FaSun size={16} />}
            </button>

            {/* Ghost Sign In */}
            <button
              onClick={() => navigate("/login")}
              className="hidden md:block px-6 py-2.5 font-semibold text-sm uppercase tracking-widest text-[var(--text-soft)] hover:text-[var(--brand-primary)] transition-colors"
            >
              Sign In
            </button>

            {/* Filled Join Portal */}
            <button
              onClick={() => navigate("/register")}
              className="hidden md:block btn btn-primary !py-3 !px-7 text-xs"
            >
              Join Portal
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-soft)] hover:text-[var(--brand-primary)] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-[var(--bg-card)] border-b border-[var(--border)] shadow-2xl transition-all duration-300 origin-top overflow-hidden ${
            isMobileMenuOpen ? "opacity-100 max-h-[500px] visible" : "opacity-0 max-h-0 invisible"
          }`}
        >
          <div className="flex flex-col p-6 space-y-3">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-widest bg-[var(--bg-glass)] text-[var(--text-main)] flex items-center justify-center border border-[var(--border)]"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-widest bg-[var(--bg-glass)] text-[var(--text-main)] flex items-center justify-center border border-[var(--border)]"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-widest bg-[var(--bg-glass)] text-[var(--text-main)] flex items-center justify-center border border-[var(--border)]"
            >
              Contact
            </a>
            <div className="border-t border-[var(--border)] my-2 opacity-50"></div>
            <button
              onClick={() => {
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="px-4 py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-widest bg-[var(--bg-glass)] text-[var(--text-main)] w-full border border-[var(--border)]"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setIsMobileMenuOpen(false);
              }}
              className="btn btn-primary !py-4 w-full"
            >
              Join Portal <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center pt-32 pb-16 lg:pt-20 lg:pb-0">
        <div className="page-container max-w-7xl mx-auto grid lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-center">
          
          {/* Left Side Content */}
          <div className="text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--brand-secondary)] text-[11px] font-semibold tracking-wider uppercase">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-accent)] animate-pulse"></span>
              ✨ AI Powered Clinic Management
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[var(--text-main)] leading-[1.05] tracking-tighter">
              Healthcare Management<br />
              <span className="text-gradient">Built for Modern Clinics</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-[var(--text-soft)] max-w-xl leading-relaxed font-medium mx-auto lg:mx-0 opacity-90">
              Manage appointments, patients, prescriptions, billing, staff, medical records, and AI-assisted healthcare—all from one secure platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={() => navigate("/register")}
                className="btn btn-primary !py-4.5 !px-10 text-sm shadow-xl shine-hover"
              >
                Start Free <FaArrowRight className="ml-2" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-glass !py-4.5 !px-10 text-sm border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--bg-glass)] hover:-translate-y-0.5"
              >
                Book Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-2 text-[11px] font-semibold tracking-wider text-[var(--text-soft)] uppercase opacity-85">
              <span className="flex items-center gap-1.5 justify-center lg:justify-start">
                <span className="text-[var(--brand-accent)]">✓</span> HIPAA Ready
              </span>
              <span className="flex items-center gap-1.5 justify-center lg:justify-start">
                <span className="text-[var(--brand-accent)]">✓</span> Role Based Access
              </span>
              <span className="flex items-center gap-1.5 justify-center lg:justify-start">
                <span className="text-[var(--brand-accent)]">✓</span> AI Assistant Included
              </span>
              <span className="flex items-center gap-1.5 justify-center lg:justify-start">
                <span className="text-[var(--brand-accent)]">✓</span> 24/7 Support
              </span>
            </div>

            {/* Statistics modern cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              <StatCard value="12,000+" label="Patients Managed" />
              <StatCard value="250+" label="Clinics Connected" />
              <StatCard value="99.99%" label="Uptime SLA" />
              <StatCard value="AI" label="Assistant Active" accent />
            </div>
          </div>

          {/* Right Side Mockup */}
          <div className="relative w-full h-full flex items-center justify-center lg:block animate-in fade-in zoom-in-95 duration-1000 delay-200">
            {/* Main Mockup Glass Dashboard Container */}
            <div className="w-full max-w-[500px] lg:max-w-none glass !rounded-3xl p-6 shadow-2xl border border-[var(--border)] relative overflow-hidden backdrop-blur-3xl shine-hover animate-float-slow">
              {/* Header Top Nav */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
                <div className="flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-xl border border-[var(--border)] w-2/3">
                  <FaSearch className="text-[var(--text-muted)] text-xs" />
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">Search patient records...</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaBell className="text-[var(--text-soft)] text-sm cursor-pointer hover:text-[var(--brand-primary)] transition-colors" />
                  <div className="h-7 w-7 rounded-full bg-slate-200 border border-[var(--border)] overflow-hidden flex items-center justify-center text-xs text-[var(--brand-primary)] font-black">
                    MD
                  </div>
                </div>
              </div>

              {/* Dashboard Layout Mock Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Upcoming Patient Card */}
                <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider">Next Patient</span>
                    <span className="h-2 w-2 rounded-full bg-[var(--brand-accent)]"></span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[var(--text-main)]">Sarah Jenkins</h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">Ophthalmology • 10:15 AM</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Checked In</span>
                  </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider">Today's Revenue</span>
                    <FaChartLine className="text-[var(--brand-secondary)] text-xs" />
                  </div>
                  <div className="mt-2">
                    <h4 className="text-lg font-black text-[var(--text-main)]">$2,450.00</h4>
                    <p className="text-[9px] text-[var(--brand-secondary)] font-extrabold flex items-center gap-0.5 mt-0.5">
                      +14.2% <span className="text-[var(--text-muted)] font-medium">vs yesterday</span>
                    </p>
                  </div>
                </div>

                {/* Interactive AI Chat Mockup */}
                <div className="col-span-2 bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                    <FaRobot className="text-[var(--brand-primary)] text-sm" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-main)]">AI Clinical Assistant</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl rounded-tl-none border border-[var(--border)] shadow-sm">
                      <p className="text-[10px] text-[var(--text-soft)] font-medium leading-relaxed">
                        Summarize patient notes for Sarah Jenkins' visit.
                      </p>
                    </div>
                    <div className="bg-[var(--brand-primary)]/5 p-2.5 rounded-xl rounded-tr-none border border-[var(--brand-primary)]/10">
                      <p className="text-[10px] text-[var(--text-soft)] font-medium leading-relaxed">
                        🤖 Sarah reports mild light sensitivity. Diagnostic history suggests checking corneal pressure. Recommended specialist: <span className="font-bold text-[var(--brand-primary)]">Ophthalmology</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Glass Widget 1: AI Assistant Online */}
            <div className="absolute -top-6 -right-6 glass !px-4 !py-3 !rounded-2xl border border-[var(--border)] shadow-xl flex items-center gap-2 animate-float-slow backdrop-blur-xl pointer-events-none hidden sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-accent)] animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-main)]">AI Assistant Online</span>
            </div>

            {/* Floating Glass Widget 2: Today's Appointments */}
            <div className="absolute bottom-6 -left-10 glass !px-5 !py-4 !rounded-2xl border border-[var(--border)] shadow-xl animate-float-medium backdrop-blur-xl pointer-events-none hidden sm:block">
              <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider">Appointments Today</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[var(--brand-primary)]">28</span>
                <span className="text-[9px] text-[var(--brand-secondary)] font-extrabold">8 pending</span>
              </div>
            </div>

            {/* Floating Glass Widget 3: Secure Medical Records */}
            <div className="absolute -bottom-8 -right-4 glass !px-4 !py-3 !rounded-2xl border border-[var(--border)] shadow-xl flex items-center gap-2.5 animate-float-slow backdrop-blur-xl pointer-events-none hidden sm:flex">
              <FaShieldAlt className="text-[var(--brand-secondary)] text-sm" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-main)]">HIPAA Secure Records</span>
            </div>
          </div>

        </div>
      </section>

      {/* Features - Compact Grid */}
      <section id="features" className="py-24 relative bg-[var(--bg-main)] border-t border-[var(--border)]">
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
              We've re-engineered the telemedicine workflow from the ground up. Health Bridge isn't just a video tool; it's a complete medical ecosystem.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 glass !rounded-[2rem] border-[var(--border)] hover:-translate-y-1 transition-transform duration-500">
                <p className="text-3xl md:text-4xl font-black text-[var(--brand-secondary)] mb-2">
                  100k+
                </p>
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Users Served
                </p>
              </div>
              <div className="p-6 glass !rounded-[2rem] border-[var(--border)] hover:-translate-y-1 transition-transform duration-500">
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
              <div className="bg-[var(--bg-glass)] p-2 rounded-xl shadow-sm border border-[var(--border)]">
                <img src="/images/logo/Asset3.png" alt="Logo" className="w-8 h-8" />
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

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)] hover:text-[var(--brand-primary)] active:scale-90 transition-all"
    >
      {children}
    </a>
  );
}

function StatCard({ value, label, accent }) {
  return (
    <div className={`p-5 glass !rounded-2xl border border-[var(--border)] flex flex-col justify-center text-center sm:text-left ${accent ? 'bg-[var(--brand-primary)]/5 border-[var(--brand-primary)]/20' : ''}`}>
      <span className={`text-2xl sm:text-3xl font-extrabold ${accent ? 'text-[var(--brand-primary)]' : 'text-[var(--text-main)]'}`}>{value}</span>
      <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider mt-1">{label}</span>
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
      className={`card group p-8 hover:-translate-y-1 transition-all cursor-default border-[var(--border)] ${dynamicColor} h-full flex flex-col`}
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
