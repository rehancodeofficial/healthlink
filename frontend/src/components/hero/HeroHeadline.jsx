import { motion } from "framer-motion";

export default function HeroHeadline() {
  const eyebrow = "Telemedicine, Redefined";
  const line1 = "Quality Healthcare,";
  const line2 = "One Video Call Away.";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2 text-center select-none"
    >
      <motion.p
        variants={itemVariants}
        className="text-xs font-black uppercase tracking-[0.3em] text-[var(--hb-red)] mb-2"
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        variants={itemVariants}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[var(--hb-ink)] leading-[1.05] tracking-tighter"
      >
        {line1}
      </motion.h1>
      <motion.h1
        variants={itemVariants}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tighter"
      >
        <span className="text-gradient">{line2}</span>
      </motion.h1>
    </motion.div>
  );
}
