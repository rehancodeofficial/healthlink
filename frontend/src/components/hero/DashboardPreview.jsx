import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaBell, FaRobot, FaChartLine, FaShieldAlt } from "react-icons/fa";

export default function DashboardPreview() {
  const [rotateX, setRotateX] = useState(-1.5);
  const [rotateY, setRotateY] = useState(0);
  const [showTypingIndicator, setShowTypingIndicator] = useState(true);
  const [showSecondBubble, setShowSecondBubble] = useState(false);

  // Parallax on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const { clientX, clientY } = e;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const xVal = (clientX - width / 2) / (width / 2); // -1 to 1
      const yVal = (clientY - height / 2) / (height / 2); // -1 to 1
      
      setRotateX(-1.5 + yVal * 2);
      setRotateY(xVal * 3);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Simulating typing effect for AI message bubble
  useEffect(() => {
    const typingTimer = setTimeout(() => {
      setShowTypingIndicator(false);
      setShowSecondBubble(true);
    }, 1800);

    return () => clearTimeout(typingTimer);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center lg:block select-none">
      {/* Ambient Pulsing Glow Layer */}
      <div className="absolute inset-[-40px] bg-gradient-to-tr from-[var(--hb-red-glow)] to-[var(--hb-green-glow)] -z-10 blur-[80px] rounded-full pointer-events-none opacity-60 animate-[pulse_6s_ease-in-out_infinite_alternate]" />

      {/* Main Glass-Clay Mockup Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04, rotateX: 0, rotateY: 0 }}
        animate={{ opacity: 1, scale: 1, rotateX: rotateX, rotateY: rotateY, rotateZ: -1.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        className="w-full max-w-[500px] lg:max-w-none glass-clay p-6 relative overflow-hidden backdrop-blur-3xl shine-hover"
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      >
        {/* Inner header */}
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4 mb-4">
          <div className="flex items-center gap-2 clay-pressed px-3.5 py-2 w-2/3 border border-[var(--glass-border)]">
            <FaSearch className="text-[var(--hb-ink-soft)] text-xs" />
            <span className="text-[10px] text-[var(--hb-ink-soft)] font-semibold uppercase tracking-wider">Search records...</span>
          </div>
          <div className="flex items-center gap-3">
            <FaBell className="text-[var(--hb-ink-soft)] text-sm cursor-pointer hover:text-[var(--hb-red)] transition-colors" />
            <div className="h-8 w-8 rounded-full bg-[var(--hb-cream-deep)] border border-[var(--glass-border)] flex items-center justify-center text-xs text-[var(--hb-red)] font-black">
              MD
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Next Patient Mini-Card */}
          <div className="clay-pressed p-4 space-y-3 border border-[var(--glass-border)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-[var(--hb-ink-soft)] tracking-wider">Next Patient</span>
              <span className="h-2 w-2 rounded-full bg-[var(--hb-green)] animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[var(--hb-ink)]">Sarah Jenkins</h4>
              <p className="text-[10px] text-[var(--hb-ink-soft)] font-semibold mt-0.5">Ophthalmology • 10:15 AM</p>
            </div>
            <div className="flex">
              <span className="px-2 py-0.5 rounded-full bg-[var(--hb-green)]/15 text-[var(--hb-green)] text-[8px] font-black uppercase tracking-wider border border-[var(--hb-green)]/20">Checked In</span>
            </div>
          </div>

          {/* Revenue Mini-Card */}
          <div className="clay-pressed p-4 border border-[var(--glass-border)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-[var(--hb-ink-soft)] tracking-wider">Today's Revenue</span>
              <FaChartLine className="text-[var(--hb-green)] text-xs" />
            </div>
            <div className="mt-2">
              <h4 className="text-lg font-black text-[var(--hb-ink)]">$2,450.00</h4>
              <p className="text-[9px] text-[var(--hb-green)] font-extrabold flex items-center gap-0.5 mt-0.5">
                +14.2% <span className="text-[var(--hb-ink-soft)] font-medium">vs yesterday</span>
              </p>
            </div>
          </div>

          {/* AI Clinical Assistant Chat Block */}
          <div className="col-span-2 clay-pressed p-4 border border-[var(--glass-border)] space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--glass-border)] pb-2">
              <FaRobot className="text-[var(--hb-red)] text-sm animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--hb-ink)]">AI Clinical Assistant</span>
            </div>
            <div className="space-y-2">
              {/* User Bubble */}
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl rounded-tl-none border border-[var(--glass-border)] shadow-sm max-w-[85%]">
                <p className="text-[10px] text-[var(--hb-ink)] font-medium leading-relaxed">
                  Summarize notes for Sarah Jenkins' ophthalmology visit.
                </p>
              </div>
              
              {/* AI Bubble */}
              <AnimatePresence>
                {showTypingIndicator && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-1.5 p-3 rounded-2xl rounded-tr-none bg-[var(--hb-red)]/5 border border-[var(--hb-red)]/10 max-w-[85%] w-fit"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--hb-red)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--hb-red)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--hb-red)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </motion.div>
                )}
                
                {showSecondBubble && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-[var(--hb-red)]/5 p-3 rounded-2xl rounded-tr-none border border-[var(--hb-red)]/10 max-w-[85%] ml-auto"
                  >
                    <p className="text-[10px] text-[var(--hb-ink-soft)] font-medium leading-relaxed">
                      Sarah reports mild light sensitivity. Corneal pressure is normal. Recommended specialist confirmed as <span className="font-bold text-[var(--hb-red)]">Ophthalmology</span>.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Floating Glass Widget 1: AI Assistant Online */}
      <div className="absolute -top-5 -right-5 clay-pressed px-4 py-2 border border-[var(--glass-border)] shadow-lg flex items-center gap-2 backdrop-blur-xl pointer-events-none hidden sm:flex">
        <span className="h-2 w-2 rounded-full bg-[var(--hb-green)] animate-ping"></span>
        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--hb-ink)]">AI Assistant Online</span>
      </div>

      {/* Floating Glass Widget 2: Today's Appointments with gentle idle float loop */}
      <div className="absolute bottom-6 -left-10 glass-clay !px-5 !py-3.5 border border-[var(--glass-border)] shadow-xl backdrop-blur-xl pointer-events-none hidden sm:block animate-[float-medium_4s_ease-in-out_infinite_alternate]">
        <span className="text-[9px] font-black uppercase text-[var(--hb-ink-soft)] tracking-wider">Appointments Today</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-[var(--hb-red)]">28</span>
          <span className="text-[9px] text-[var(--hb-green)] font-extrabold">8 pending</span>
        </div>
      </div>

      {/* Floating Glass Widget 3: Secure Medical Records */}
      <div className="absolute -bottom-6 -right-3 glass-clay !px-4 !py-2.5 border border-[var(--glass-border)] shadow-lg flex items-center gap-2.5 backdrop-blur-xl pointer-events-none hidden sm:flex">
        <FaShieldAlt className="text-[var(--hb-green)] text-sm" />
        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--hb-ink)]">Secure Records</span>
      </div>
    </div>
  );
}
