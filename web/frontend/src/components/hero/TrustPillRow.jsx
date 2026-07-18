import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

export default function TrustPillRow() {
  const pills = [
    "HIPAA Ready",
    "Role Based Access",
    "AI Assistant Included",
    "24/7 Support",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.6,
      },
    },
  };

  const pillVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 select-none"
    >
      {pills.map((pill, idx) => (
        <motion.div
          key={idx}
          variants={pillVariants}
          className="clay-pressed inline-flex items-center gap-2 px-4 py-2 text-[10px] sm:text-[11px] font-semibold tracking-wider text-[var(--hb-ink-soft)] uppercase border border-[var(--glass-border)]"
        >
          <div className="h-4 w-4 rounded-full bg-[var(--hb-green)]/10 flex items-center justify-center text-[var(--hb-green)] text-[8px]">
            <FaCheck />
          </div>
          <span>{pill}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
