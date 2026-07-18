import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FaBars, FaTimes, FaArrowRight } from "react-icons/fa";
import NavLink from "./NavLink";

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <motion.nav
      style={{
        height: navHeight,
        marginTop: navMargin,
      }}
      className="fixed top-0 left-0 right-0 z-50 glass-clay mx-4 md:mx-8 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between px-6 transition-all duration-300 select-none"
    >
      <div className="flex items-center gap-3 cursor-pointer group justify-self-start" onClick={() => navigate("/")}>
        <div className="clay-pressed p-1.5 rounded-xl group-hover:scale-105 transition-transform shadow-md">
          <img src="/logo.png" alt="Logo" className="w-7 h-7" />
        </div>
        <span className="text-base font-black tracking-tighter uppercase text-[var(--hb-ink)]">
          HEALTH<span className="text-[var(--hb-red)]">BRIDGE</span>
        </span>
      </div>

      {/* Center Navigation links */}
      <div
        className="hidden md:flex items-center gap-1 justify-self-center"
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
          className="hidden md:block px-5 py-2 font-bold text-xs uppercase tracking-widest text-[var(--hb-ink-soft)] hover:text-[var(--hb-ink)] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)] focus:rounded-xl"
        >
          Sign In
        </button>

        {/* Primary Book Appointment button in Clay */}
        <motion.button
          onClick={() => navigate("/appointments")}
          className="btn-clay-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider hidden md:flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
          whileHover={{ y: -2, scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
        >
          Book Appointment
        </motion.button>

        {/* Mobile menu trigger */}
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden clay-pressed p-2.5 rounded-xl flex items-center justify-center text-[var(--hb-ink-soft)] hover:text-[var(--hb-red)] focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)] min-h-[40px] min-w-[40px]"
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </motion.button>
      </div>

      {/* Mobile Slide-down Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+12px)] left-0 right-0 glass-clay overflow-hidden p-5 flex flex-col gap-3 md:hidden z-40 border border-[var(--glass-border)] shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="clay-pressed px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--hb-ink-soft)] hover:text-[var(--hb-ink)] flex justify-between items-center"
              >
                <span>{link.name}</span>
                <FaArrowRight size={10} className="opacity-50" />
              </Link>
            ))}
            <div className="h-px bg-[var(--glass-border)] my-2 opacity-50"></div>
            <button
              onClick={() => {
                navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="clay-pressed px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[var(--hb-ink)] w-full border border-[var(--glass-border)] hover:bg-white/10"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                navigate("/appointments");
                setIsMobileMenuOpen(false);
              }}
              className="btn-clay-primary py-3.5 w-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Book Appointment <FaArrowRight size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
