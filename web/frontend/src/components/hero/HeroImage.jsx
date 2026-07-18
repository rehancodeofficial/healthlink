import { motion } from "framer-motion";

export default function HeroImage() {
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Float animation configuration
  const floatAnimation = isReducedMotion
    ? {}
    : {
        y: [0, -6, 0],
        transition: {
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
      };

  return (
    <div className="relative w-full max-w-[920px] mx-auto mt-16 px-4 sm:px-0 select-none">
      
      {/* Centered Ambient Glow */}
      <div className="absolute inset-[-30px] bg-gradient-to-tr from-[var(--hb-red-glow)] to-[var(--hb-green-glow)] -z-10 blur-[90px] rounded-full pointer-events-none opacity-50 animate-[pulse_8s_ease-in-out_infinite_alternate]" />

      {/* Cutout Image of Doctors with Transparent Blend Effect */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
        className="relative max-w-[700px] mx-auto pointer-events-none flex justify-center"
      >
        <img
          src="/images/clinicians.png"
          alt="Pakistani medical team clinicians"
          className="w-[85%] h-auto select-none mix-blend-multiply rounded-full"
          style={{borderRadius: "50%"}}
        />
      </motion.div>

      {/* Left Floating Card - Trusted by Clinics */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
        className="absolute bottom-[-6%] left-[2%] sm:left-[4%] w-full max-w-[170px] sm:max-w-[240px] glass-clay !p-4 sm:!p-5 border border-[var(--glass-border)] shadow-xl z-20 hidden xs:block"
        style={{ y: floatAnimation.y, transition: floatAnimation.transition }}
      >
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase text-[var(--hb-ink-soft)] tracking-wider">
            Trusted Partners
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm sm:text-base font-extrabold text-[var(--hb-ink)]">
              250+ Clinics
            </span>
          </div>
          {/* Avatar stack */}
          <div className="flex -space-x-2.5 overflow-hidden pt-1">
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden flex items-center justify-center text-[8px] font-black text-[var(--hb-red)]">A</div>
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300 overflow-hidden flex items-center justify-center text-[8px] font-black text-[var(--hb-green)]">B</div>
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-400 overflow-hidden flex items-center justify-center text-[8px] font-black text-slate-800">C</div>
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-500 overflow-hidden flex items-center justify-center text-[8px] font-black text-white">D</div>
          </div>
        </div>
      </motion.div>

      {/* Right Floating Card - Today's Revenue */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.55 }}
        className="absolute bottom-[-4%] right-[2%] sm:right-[4%] w-full max-w-[150px] sm:max-w-[220px] glass-clay !p-4 sm:!p-5 border border-[var(--glass-border)] shadow-xl z-20 hidden xs:block"
        style={{ y: floatAnimation.y, transition: floatAnimation.transition }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase text-[var(--hb-ink-soft)] tracking-wider">
            Today's Revenue
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-[var(--hb-ink)]">
              $2,450
            </span>
            <span className="text-[8px] sm:text-[9px] text-[var(--hb-green)] font-extrabold">
              +14.2%
            </span>
          </div>
          {/* Sparkline SVG */}
          <div className="h-6 w-full pt-1.5">
            <svg viewBox="0 0 100 20" className="w-full h-full">
              <path
                d="M0 15 Q20 5 40 10 T80 2 T100 8"
                fill="none"
                stroke="var(--hb-green)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile Stacked Fallbacks (below 480px / xs width) */}
      <div className="xs:hidden flex gap-4 justify-center mt-6 w-full px-4">
        <div className="glass-clay p-4 w-1/2 border border-[var(--glass-border)] shadow-md">
          <span className="text-[8px] font-black uppercase text-[var(--hb-ink-soft)] tracking-wider block mb-1">Clinics</span>
          <span className="text-xs font-black text-[var(--hb-ink)]">250+ Served</span>
        </div>
        <div className="glass-clay p-4 w-1/2 border border-[var(--glass-border)] shadow-md">
          <span className="text-[8px] font-black uppercase text-[var(--hb-ink-soft)] tracking-wider block mb-1">Revenue</span>
          <span className="text-xs font-black text-[var(--hb-ink)]">$2,450 (+14%)</span>
        </div>
      </div>

    </div>
  );
}
