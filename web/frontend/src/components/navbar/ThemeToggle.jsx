import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="clay-pressed p-3 rounded-full flex items-center justify-center text-[var(--hb-ink-soft)] hover:text-[var(--hb-red)] active:scale-95 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)] focus:ring-offset-2 min-h-[44px] min-w-[44px]"
      aria-label="Toggle Theme"
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <FaMoon size={15} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <FaSun size={15} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
