import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PricingConvergenceAnimation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-end justify-center gap-8 px-8 md:px-12 w-full lg:w-[45%]">
      {/* Highest Bid — from top */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-right"
      >
        <p className="text-xs tracking-widest uppercase text-muted-foreground font-display mb-1">
          Highest Bid
        </p>
        <motion.div
          animate={isVisible ? { y: [0, 20, 0] } : { y: 0 }}
          transition={{ duration: 2.5, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="font-price text-5xl md:text-6xl font-bold text-foreground"
        >
          $4,250
        </motion.div>
      </motion.div>

      {/* Center label */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center"
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-primary">
          → Converging →
        </p>
      </motion.div>

      {/* Prisometer Price — from bottom */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="text-right"
      >
        <p className="text-xs tracking-widest uppercase text-muted-foreground font-display mb-1">
          PRI$OMETER Price
        </p>
        <motion.div
          animate={isVisible ? { y: [0, -20, 0] } : { y: 0 }}
          transition={{ duration: 2.5, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="font-price text-5xl md:text-6xl font-bold text-primary"
        >
          $4,250
        </motion.div>
      </motion.div>
    </div>
  );
}