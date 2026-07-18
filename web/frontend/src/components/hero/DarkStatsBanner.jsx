import { useEffect, useState, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

export default function DarkStatsBanner() {
  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[var(--hb-ink)] text-[#FAFAF8] py-16 md:py-20 overflow-hidden select-none border-t border-b border-[var(--hb-ink)]/10">
      
      {/* Low opacity dot grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Banner Heading */}
        <div className="text-center mb-12">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--hb-ink-soft)] opacity-95">
            Award-Winning Reliability, Built for Modern Clinics
          </h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
          <CounterTile value="12,000+" label="Patients Managed" />
          <CounterTile value="250+" label="Clinics Connected" />
          <CounterTile value="99.99%" label="Uptime SLA" />
          <CounterTile value="AI Active" label="Assistant Active" />
        </div>

      </div>
    </section>
  );
}

function CounterTile({ value, label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  const isNumeric = /^[0-9,.]+$/.test(value.replace(/[%+]/g, ""));
  const numberPart = isNumeric ? parseFloat(value.replace(/[,%+]/g, "")) : 0;
  const suffix = value.replace(/[0-9,.]/g, "");

  useEffect(() => {
    if (isInView && isNumeric) {
      const controls = animate(0, numberPart, {
        duration: 1.8,
        ease: "easeOut",
        onUpdate: (val) => {
          if (numberPart % 1 === 0) {
            setCount(Math.floor(val));
          } else {
            setCount(parseFloat(val.toFixed(2)));
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, numberPart, isNumeric]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center space-y-2">
      <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
        {isNumeric ? `${count.toLocaleString()}${suffix}` : value}
      </span>
      <span className="text-[10px] font-black uppercase text-[var(--hb-ink-soft)] tracking-[0.15em] opacity-80">
        {label}
      </span>
    </div>
  );
}
