import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function WinCelebration({ item, onDismiss }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // Big burst
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#C41230", "#FFD700", "#FFFFFF", "#FF6B6B", "#FFF8DC"],
    });

    // Side cannons
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
    }, 300);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-card rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5 relative"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy icon */}
          <motion.div
            animate={{ rotate: [-8, 8, -8, 8, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
          >
            <Trophy className="w-10 h-10 text-primary" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Congratulations! 🎉
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You won <span className="font-semibold text-foreground">{item?.title}</span>!
            </p>
            {item?.sold_price && (
              <p className="text-2xl font-bold text-primary font-price">
                ${item.sold_price.toLocaleString("en-US")}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            The seller will send you an invoice shortly. You can track it in your purchases.
          </p>

          <div className="flex flex-col gap-2.5 pt-1">
            <Link to="/buyer?view=won" onClick={onDismiss}>
              <button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-sm transition-colors">
                View My Wins
              </button>
            </Link>
            <button
              onClick={onDismiss}
              className="w-full h-11 border border-border text-foreground hover:bg-muted rounded-xl text-sm font-medium transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}