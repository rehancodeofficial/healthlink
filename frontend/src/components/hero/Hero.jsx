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
    <section className="relative flex flex-col pt-32 sm:pt-36 pb-0 overflow-hidden select-none">
      <div className="max-w-4xl mx-auto px-6 w-full flex flex-col items-center text-center gap-7">
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
          Manage appointments, patients, prescriptions, billing, staff, and AI-assisted
          healthcare—one platform.
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

          <motion.button
            onClick={() => navigate("/login")}
            className="px-9 py-4 text-sm font-semibold uppercase tracking-wider border-2 border-[var(--hb-red)] text-[var(--hb-red)] bg-transparent rounded-2xl flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)] active:scale-95 transition-all"
            whileHover={{ y: -2, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Book Demo</span>
          </motion.button>
        </motion.div>

        {/* Hero Image Component with float widgets (Centered) */}
        <HeroImage />
      </div>
    </section>
  );
}
