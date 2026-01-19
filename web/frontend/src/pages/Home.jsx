import { useNavigate } from 'react-router-dom';
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
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === 'dark' ? 'bg-[var(--bg-main)]' : 'bg-[var(--bg-main)]'
      }`}
    >
      {/* Refined Fixed Navbar */}
      <nav className="fixed w-full z-50 backdrop-blur-2xl border-b border-[var(--border)] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="bg-[var(--bg-glass)] p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <img
                src="/images/logo/Asset3.png"
                alt="Logo"
                className="w-7 h-7"
              />
            </div>
            <span className="text-xl font-black tracking-tighter text-[var(--text-main)] uppercase">
              CURE<span className="text-[var(--brand-blue)]">VIRTUAL</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-soft)] hover:text-[var(--brand-orange)] transition-all shadow-sm"
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block px-5 py-2 font-black text-xs uppercase tracking-widest text-[var(--text-soft)] hover:text-[var(--brand-green)]"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn btn-primary !py-2.5 !px-6 text-[10px]"
            >
              Join Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Optimized Hero - "Fit in Page View" */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--brand-blue)]/5 to-transparent -z-10 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-[var(--brand-green)]/5 to-transparent -z-10 blur-[120px]"></div>

        <div className="page-container grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-[var(--border)] text-[var(--brand-orange)] text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-orange)] animate-pulse"></span>
              Redefining Digital Care
            </div>

            <div className="space-y-4">
              <img
                src="/images/logo/Asset3.png"
                alt="CureVirtual Logo"
                className="w-24 h-auto mx-auto lg:mx-0 drop-shadow-lg"
              />
              <h1 className="text-6xl lg:text-7xl font-black text-[var(--text-main)] leading-[1.05] tracking-tighter uppercase">
                CURE <br />
                <span className="text-gradient">VIRTUAL</span>
              </h1>
              <p className="text-xl lg:text-2xl font-black text-[var(--brand-orange)] tracking-[0.05em] uppercase italic opacity-90">
                Healthcare Simplified to You
              </p>
            </div>

            <p className="text-lg text-[var(--text-soft)] max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
              Experience medical consultation with zero boundaries. Connect with
              world-class specialists instantly through our high-performance
              virtual clinic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
              <button
                onClick={() => navigate('/register')}
                className="btn btn-primary !py-4 !px-10 text-sm shadow-green-500/20"
              >
                Start Consultation <FaArrowRight />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-glass !py-4 !px-10 text-sm text-[var(--text-main)]"
              >
                Login to Portal
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-60">
              <div className="text-center">
                <p className="text-2xl font-black text-[var(--brand-blue)]">
                  24/7
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Support
                </p>
              </div>
              <div className="w-px h-8 bg-[var(--border)]"></div>
              <div className="text-center">
                <p className="text-2xl font-black text-[var(--brand-green)]">
                  100%
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Secure
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="glass !p-4 !rounded-[3rem] overflow-hidden border-[var(--border)] shadow-2xl animate-float">
              <img
                src="/images/logo/Asset3.png"
                alt="Telemedicine"
                className="rounded-[2.5rem] w-full h-[500px] object-cover"
              />
            </div>
            {/* Status Floating Widget */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 glass !p-5 !rounded-3xl shadow-2xl border-[var(--border)] animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[var(--brand-green)]/10 flex items-center justify-center text-[var(--brand-green)] text-2xl">
                  <FaVideo />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Active Signal
                  </p>
                  <p className="font-black text-sm">HD Consult Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Compact Grid */}
      <section id="features" className="py-20 relative">
        <div className="page-container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.4em]">
              Our Capabilities
            </h2>
            <h3 className="text-4xl font-black tracking-tighter">
              Everything you need for health.
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
        className="py-24 bg-[var(--bg-glass)] backdrop-blur-sm border-y border-[var(--border)]"
      >
        <div className="page-container flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-gradient font-black text-[10px] uppercase tracking-[0.3em]">
              The Ecosystem
            </h2>
            <h3 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter">
              Patient-first <br /> technology.
            </h3>
            <p className="text-lg text-[var(--text-soft)] leading-relaxed font-medium">
              We've re-engineered the telemedicine workflow from the ground up.
              CureVirtual isn't just a video tool; it's a complete medical
              ecosystem.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 glass !rounded-3xl border-[var(--border)]">
                <p className="text-3xl font-black text-[var(--brand-green)] mb-1">
                  100k+
                </p>
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Users Served
                </p>
              </div>
              <div className="p-6 glass !rounded-3xl border-[var(--border)]">
                <p className="text-3xl font-black text-[var(--brand-blue)] mb-1">
                  99.9%
                </p>
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Uptime Record
                </p>
              </div>
            </div>s
          </div>
          <div className="lg:w-1/2">
            <img
              src="/images/logo/Asset3.png"
              className="rounded-[3rem] shadow-2xl border border-[var(--border)]"
              alt="Modern Hospital"
            />
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer id="contact" className="py-16">
        <div className="page-container flex flex-col md:flex-row justify-between items-center gap-8 border-t border-[var(--border)] pt-12">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--bg-glass)] p-2 rounded-xl shadow-sm border border-[var(--border)]">
              <img
                src="/images/logo/Asset3.png"
                alt="Logo"
                className="w-6 h-6"
              />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase">
              CURE<span className="text-[var(--brand-blue)]">VIRTUAL</span>
            </span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            <a
              href="#features"
              className="hover:text-[var(--brand-green)] transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="hover:text-[var(--brand-blue)] transition-colors"
            >
              About Us
            </a>
            <a
              href="#contact"
              className="hover:text-[var(--brand-orange)] transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            &copy; 2025 ALL SYSTEMS NOMINAL
          </p>
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
    green: 'hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]/5',
    blue: 'hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/5',
    orange:
      'hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/5',
  }[color];

  return (
    <div
      className={`card group p-10 hover:-translate-y-2 transition-all cursor-default border-[var(--border)] ${dynamicColor}`}
    >
      <div
        className={`h-16 w-16 rounded-[1.5rem] bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner`}
      >
        {icon}
      </div>
      <h4 className="text-xl font-black text-[var(--text-main)] mb-4 tracking-tight">
        {title}
      </h4>
      <p className="text-sm font-medium text-[var(--text-soft)] leading-relaxed">
        {text}
      </p>
    </div>
  );
}
