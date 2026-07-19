import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NavLink({ href, children, isHovered, onHover, onLeave }) {
  return (
    <Link
      to={href}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--hb-ink-soft)] hover:text-[var(--hb-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)] focus:rounded-xl"
    >
      {isHovered && (
        <motion.div
          layoutId="nav-hover-bg"
          className="absolute inset-0 clay-pressed -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
