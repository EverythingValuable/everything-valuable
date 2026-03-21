import React, { useState, useEffect, useRef } from "react";
import { TrendingDown, Pause, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function PrisometerWidget({ item, compact = false }) {
  const [displayPrice, setDisplayPrice] = useState(item.current_price || item.prisometer_start_price);
  const [cents, setCents] = useState(0);
  const intervalRef = useRef(null);

  const isActive = item.status === "prisometer" && !item.make_it_mine_active;
  const isPaused = item.make_it_mine_active;

  // Countdown timer for paused state
  const [pauseTimeLeft, setPauseTimeLeft] = useState(0);
  useEffect(() => {
    if (!isPaused || !item.make_it_mine_expires) return;
    const update = () => {
      const secs = Math.max(0, Math.round((new Date(item.make_it_mine_expires) - Date.now()) / 1000));
      setPauseTimeLeft(secs);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [isPaused, item.make_it_mine_expires]);

  useEffect(() => {
    if (isActive && item.prisometer_activated_at && item.prisometer_duration_hours) {
      const startTime = new Date(item.prisometer_activated_at).getTime();
      const startPrice = item.prisometer_start_price;
      const reservePrice = item.reserve_price || startPrice * 0.5;
      const belowPercent = item.below_reserve_percent || 10;
      const floorPrice = reservePrice * (1 - belowPercent / 100);
      const durationMs = item.prisometer_duration_hours * 3600000;

      const updatePrice = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const currentPrice = startPrice - (startPrice - floorPrice) * progress;
        setDisplayPrice(Math.max(currentPrice, floorPrice));
        setCents(Math.floor(Math.random() * 99));
      };

      updatePrice();
      intervalRef.current = setInterval(updatePrice, 800);
      return () => clearInterval(intervalRef.current);
    } else {
      setDisplayPrice(item.current_price || item.prisometer_start_price);
    }
  }, [item, isActive]);

  const formatPrice = (price) => {
    const main = Math.floor(price).toLocaleString("en-US");
    return main;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isActive && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-red-500"
          />
        )}
        <span className="font-serif text-xl font-bold text-foreground">
          ${formatPrice(displayPrice)}
          {isActive && <span className="text-sm text-muted-foreground animate-price-tick">.{cents.toString().padStart(2, "0")}</span>}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">PRI$OMETER</span>
        </div>
        {isActive && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-red-600">LIVE</span>
          </motion.div>
        )}
        {isPaused && (
          <div className="flex items-center gap-1.5 text-amber-600">
            <Pause className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">PAUSED</span>
          </div>
        )}
      </div>

      <div className="text-center py-3">
        <p className="text-xs text-muted-foreground mb-1">Current Price</p>
        <motion.div
          key={Math.floor(displayPrice)}
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          className="font-serif text-4xl md:text-5xl font-bold text-foreground"
        >
          ${formatPrice(displayPrice)}
          {isActive && (
            <span className="text-xl text-muted-foreground animate-price-tick">.{cents.toString().padStart(2, "0")}</span>
          )}
        </motion.div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
        <div>
          <span className="block text-muted-foreground/60">Start Price</span>
          <span className="font-medium text-foreground">${item.prisometer_start_price?.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="block text-muted-foreground/60">Highest Bid</span>
          <span className="font-medium text-foreground">${(item.highest_bid || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}