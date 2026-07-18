import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaHome, FaInfoCircle, FaStethoscope, FaUserMd, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import NavLink from "./NavLink";

export default function Navbar() {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Scroll condensation motion signature
  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 80], [72, 64]);
  const navMargin = useTransform(scrollY, [0, 80], [24, 16]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Doctors", path: "/doctors" },
    { name: "Appointments", path: "/appointments" },
    { name: "Resources", path: "/resources" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navbar */}
      <motion.nav
        style={{
          height: navHeight,
          marginTop: navMargin,
        }}
        className="fixed top-0 left-0 right-0 z-50 glass-clay mx-4 md:mx-8 hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between px-6 transition-all duration-300 select-none"
      >
        <div className="flex items-center gap-3 cursor-pointer group justify-self-start" onClick={() => navigate("/")}>
          <div className="clay-pressed p-1.5 rounded-full group-hover:scale-105 transition-transform shadow-md overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 mix-blend-multiply" />
          </div>
          <span className="text-base font-black tracking-tighter uppercase text-[var(--hb-ink)]">
            HEALTH<span className="text-[var(--hb-red)]">BRIDGE</span>
          </span>
        </div>

        {/* Center Navigation links */}
        <div
          className="flex items-center gap-1 justify-self-center"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navLinks.map((link, idx) => (
            <NavLink
              key={link.name}
              href={link.path}
              isHovered={hoveredIndex === idx}
              onHover={() => setHoveredIndex(idx)}
              onLeave={() => {}}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3.5 justify-self-end">
          {/* Ghost Sign In */}
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 font-bold text-xs uppercase tracking-widest text-[var(--hb-ink-soft)] hover:text-[var(--hb-ink)] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)] focus:rounded-xl"
          >
            Sign In
          </button>

          {/* Primary Book Appointment button in Clay */}
          <motion.button
            onClick={() => navigate("/appointments")}
            className="btn-clay-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
            whileHover={{ y: -2, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Appointment
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile view top brand logo header */}
      <div className="fixed top-3 left-3 right-3 z-50 glass-clay h-12 rounded-full flex md:hidden items-center justify-between px-4 shadow-sm border border-[var(--glass-border)] select-none">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-full mix-blend-multiply" />
          <span className="text-xs font-black tracking-tighter uppercase text-[var(--hb-ink)]">
            HEALTH<span className="text-[var(--hb-red)]">BRIDGE</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-[9px] font-black uppercase tracking-wider text-[var(--hb-ink-soft)] hover:text-[var(--hb-ink)] active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-[var(--hb-red)] focus:rounded-lg px-3 py-1"
        >
          Sign In
        </button>
      </div>

      {/* Mobile view bottom floating icon navigation bar */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 glass-clay rounded-full px-5 py-3 flex md:hidden gap-5.5 items-center justify-around shadow-2xl border border-[var(--glass-border)] select-none w-auto min-w-[280px]">
        <Link to="/" className="text-slate-500 hover:text-[var(--hb-red)] active:scale-90 transition-all p-1 flex items-center justify-center" title="Home">
          <FaHome size={18} />
        </Link>
        <Link to="/about" className="text-slate-500 hover:text-[var(--hb-red)] active:scale-90 transition-all p-1 flex items-center justify-center" title="About">
          <FaInfoCircle size={18} />
        </Link>
        <Link to="/services" className="text-slate-500 hover:text-[var(--hb-red)] active:scale-90 transition-all p-1 flex items-center justify-center" title="Services">
          <FaStethoscope size={18} />
        </Link>
        <Link to="/doctors" className="text-slate-500 hover:text-[var(--hb-red)] active:scale-90 transition-all p-1 flex items-center justify-center" title="Doctors">
          <FaUserMd size={18} />
        </Link>
        <Link to="/appointments" className="text-slate-500 hover:text-[var(--hb-red)] active:scale-90 transition-all p-1 flex items-center justify-center" title="Appointments">
          <FaCalendarAlt size={18} />
        </Link>
        <Link to="/contact" className="text-slate-500 hover:text-[var(--hb-red)] active:scale-90 transition-all p-1 flex items-center justify-center" title="Contact">
          <FaEnvelope size={18} />
        </Link>
      </div>
    </>
  );
}
