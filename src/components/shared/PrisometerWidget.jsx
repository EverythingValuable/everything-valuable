import React, { useState, useEffect, useRef } from "react";
import { TrendingDown, Pause, Clock, Info } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PRISOMETER_INFO = "The PRI$OMETER™ is our live declining-price engine. The price starts high and drops continuously over time. You can place a bid at any moment — or use Make It Mine to buy instantly at the current price. The longer you wait, the lower the price — but someone else may buy it first.";

export default function PrisometerWidget({ item, compact = false }) {
  const [displayPrice, setDisplayPrice] = useState(item.current_price || item.prisometer_start_price);
  const [cents, setCents] = useState(0);
  const intervalRef = useRef(null);

  const isActive = item.status === "prisometer" && !item.make_it_mine_active;
  const isPaused = item.make_it_mine_active;
  const queryClient = useQueryClient();

  // Countdown timer for paused state — auto-resumes when it hits 0
  const [pauseTimeLeft, setPauseTimeLeft] = useState(0);
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!isPaused || !item.make_it_mine_expires) return;
    resumedRef.current = false;
    const update = async () => {
      const secs = Math.max(0, Math.round((new Date(item.make_it_mine_expires) - Date.now()) / 1000));
      setPauseTimeLeft(secs);
      if (secs === 0 && !resumedRef.current) {
        resumedRef.current = true;
        await base44.entities.Item.update(item.id, {
          make_it_mine_active: false,
          make_it_mine_expires: null,
        });
        queryClient.invalidateQueries({ queryKey: ["item", item.id] });
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [isPaused, item.make_it_mine_expires, item.id]);

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
        const currentPrice = Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice);
        setDisplayPrice(currentPrice);
        // Derive cents from the actual fractional price so they drop in order
        setCents(Math.floor((currentPrice % 1) * 100));
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
          <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">
            PRI$OMETER<sup className="text-[8px] ml-0.5">™</sup>
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed" side="bottom">
                {PRISOMETER_INFO}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

      {isPaused && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Transaction in Progress</span>
            </div>
            <span className="font-mono text-sm font-bold text-amber-700">
              {Math.floor(pauseTimeLeft / 60)}:{(pauseTimeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-amber-600">
            A buyer is completing a Make It Mine purchase. The PRI$OMETER will resume automatically if the transaction is cancelled or the timer expires.
          </p>
        </div>
      )}

      <div className="text-center py-3">
        <p className="text-xs text-muted-foreground mb-1">Current Price</p>
        <motion.div
          key={Math.floor(displayPrice)}
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          className="font-price text-4xl md:text-5xl font-bold text-foreground"
        >
          ${formatPrice(displayPrice)}
          {isActive && (
            <span className="font-price text-xl text-muted-foreground animate-price-tick">.{cents.toString().padStart(2, "0")}</span>
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