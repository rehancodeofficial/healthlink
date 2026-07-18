import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HeroHeadline from "./HeroHeadline";
import HeroImage from "./HeroImage";

export default function Hero() {
  const navigate = useNavigate();

  const fadeInVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (customDelay) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: customDelay,
      },
    }),
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center pt-36 pb-24 overflow-hidden select-none">
      <div className="max-w-4xl mx-auto px-6 w-full flex flex-col items-center text-center gap-7">
        
        {/* Eyebrow Badge (Centered) */}
        <motion.div
          custom={0.1}
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="clay-pressed inline-flex items-center gap-2.5 px-4.5 py-2 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-wider text-[var(--hb-ink-soft)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--hb-green)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--hb-green)]"></span>
          </span>
          <span>AI Powered Clinic Management</span>
        </motion.div>

        {/* Headline (Centered) */}
        <HeroHeadline />

        {/* Subheading (Centered, short width) */}
        <motion.p
          custom={0.45}
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="text-base sm:text-lg md:text-xl text-[var(--hb-ink-soft)] max-w-[560px] leading-relaxed font-medium mx-auto opacity-90"
        >
          Manage appointments, patients, prescriptions, billing, staff, and AI-assisted healthcare—one platform.
        </motion.p>

        {/* CTA Buttons (Centered) */}
        <motion.div
          custom={0.55}
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={() => navigate("/register")}
            className="btn-clay-primary px-9 py-4 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)]"
            whileHover={{ y: -2, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Start Free</span>
            <FaArrowRight size={12} />
          </motion.button>

          <button
            onClick={() => navigate("/login")}
            className="px-9 py-4 text-sm font-bold uppercase tracking-wider text-[var(--hb-ink-soft)] hover:text-[var(--hb-ink)] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)] focus:rounded-xl relative group"
          >
            <span>Book Demo</span>
            <span className="absolute bottom-3 left-9 right-9 h-0.5 bg-[var(--hb-cream-deep)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </button>
        </motion.div>

        {/* Hero Image Component with float widgets (Centered) */}
        <HeroImage />

      </div>
    </section>
  );
}
