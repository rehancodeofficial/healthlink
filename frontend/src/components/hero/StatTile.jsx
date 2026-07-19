import { useEffect, useState, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

export default function StatTile({ value, label, accent, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  // Extract digits for numeric values to animate
  const isNumeric = /^[0-9,.]+$/.test(value.replace(/[%+]/g, ""));
  const numberPart = isNumeric ? parseFloat(value.replace(/[,%+]/g, "")) : 0;
  const suffix = value.replace(/[0-9,.]/g, "");

  useEffect(() => {
    if (isInView && isNumeric) {
      const controls = animate(0, numberPart, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (value) => {
          if (numberPart % 1 === 0) {
            setCount(Math.floor(value));
          } else {
            setCount(parseFloat(value.toFixed(2)));
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, numberPart, isNumeric]);

  const tileVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={tileVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`glass-clay p-5 flex flex-col justify-center text-center sm:text-left ${
        accent ? "bg-[var(--hb-red-glow)] border-[var(--hb-red)]/20" : ""
      }`}
    >
      <span className={`text-2xl sm:text-3xl font-extrabold ${accent ? 'text-[var(--hb-red)]' : 'text-[var(--hb-ink)]'}`}>
        {isNumeric ? `${count.toLocaleString()}${suffix}` : value}
      </span>
      <span className="text-[9px] font-black uppercase text-[var(--hb-ink-soft)] tracking-wider mt-1.5">
        {label}
      </span>
    </motion.div>
  );
}
