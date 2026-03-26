import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Info, TrendingDown, Pause } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PRISOMETER_INFO = "The PRI$OMETER™ is our live declining-price engine. The price starts high and drops continuously over time. You can place a bid at any moment — or use Make It Mine to buy instantly at the current price.";

export default function PriceConvergenceModule({ item, isActive, isPaused, pauseTimeLeft, displayPrice, cents, formatPrice }) {
  if (item.status === "first_bids") {
    return <PreviewState item={item} displayPrice={displayPrice} formatPrice={formatPrice} />;
  }

  if (item.status === "prisometer") {
    return <LiveState item={item} isActive={isActive} isPaused={isPaused} pauseTimeLeft={pauseTimeLeft} displayPrice={displayPrice} cents={cents} formatPrice={formatPrice} />;
  }

  return null;
}

function PreviewState({ item, displayPrice, formatPrice }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const end = new Date(item.first_bids_end).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [item.first_bids_end]);

  const countdownStr = `${countdown.days > 0 ? countdown.days + "d " : ""}${countdown.hours.toString().padStart(2, "0")}h ${countdown.minutes.toString().padStart(2, "0")}m ${countdown.seconds.toString().padStart(2, "0")}s`;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Header: Status + Countdown pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">
            1stBid$™ Preview
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed" side="bottom">
                1stBid$™ is the preview bidding phase before the PRI$OMETER™ opens. Place early bids to signal interest. The highest bid carries over when live pricing begins.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="bg-primary/10 text-primary font-price text-xs font-bold tabular-nums px-3 py-1 rounded-full">
          {countdownStr}
        </span>
      </div>

      {/* PRI$OMETER Start Price */}
      <div className="text-center space-y-1 opacity-50">
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-xs font-semibold text-black uppercase tracking-wider letter-spacing-widest">PRI$OMETER™ Start Price</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-black cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed" side="bottom">
                The price at which live PRI$OMETER™ bidding will begin after the preview period ends.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <motion.div
          key={Math.floor(displayPrice)}
          initial={{ scale: 1.02, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-serif text-5xl font-bold text-muted-foreground"
        >
          ${formatPrice(displayPrice)}
        </motion.div>
        <p className="text-xs text-black/60 italic">Activates after preview if not met by bids.</p>
      </div>

      {/* Visual connector */}
      <div className="flex justify-center">
        <div className="w-px h-6" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 4px, hsl(var(--muted-foreground) / 0.3) 4px, hsl(var(--muted-foreground) / 0.3) 6px)'}}></div>
      </div>

      {/* Highest Preview Bid */}
      {item.highest_bid > 0 && (
        <div className="text-center space-y-0.5">
          <p className="text-xs text-muted-foreground font-medium">Highest Preview Bid</p>
          <p className="font-serif text-3xl font-bold text-foreground">
            ${item.highest_bid.toLocaleString("en-US")}
          </p>
          <p className="text-xs text-muted-foreground">({item.bid_count} bid{item.bid_count !== 1 ? "s" : ""})</p>
        </div>
      )}
    </div>
  );
}

function LiveState({ item, isActive, isPaused, pauseTimeLeft, displayPrice, cents, formatPrice }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      {/* Header: Live Status */}
      <div>
        {isActive && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">PRI$OMETER™ Live</span>
          </motion.div>
        )}
        {isPaused && (
          <div className="flex items-center gap-1.5 text-amber-600">
            <Pause className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">PRI$OMETER™ Paused</span>
          </div>
        )}
      </div>

      {/* Pause Notice (if paused) */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Transaction in Progress</span>
            <span className="font-mono text-sm font-bold text-amber-700">
              {Math.floor(pauseTimeLeft / 60)}:{(pauseTimeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-amber-600 leading-relaxed">
            A buyer is completing a Make It Mine purchase. The PRI$OMETER will resume if the transaction is cancelled or expires.
          </p>
        </motion.div>
      )}

      {/* Main: Current PRI$OMETER Price (large, dominant) */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current PRI$OMETER™ Price</p>
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
        <motion.div
          key={Math.floor(displayPrice)}
          initial={{ scale: 1.02, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="font-sans text-5xl md:text-6xl font-bold text-foreground"
        >
          ${formatPrice(displayPrice)}
          {isActive && (
            <span className="font-sans text-xl text-red-500 animate-price-tick">.{cents.toString().padStart(2, "0")}</span>
          )}
        </motion.div>
      </div>



      {/* Visual connector: Subtle downward movement indicator */}
      <div className="flex justify-center py-2">
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/40 via-muted-foreground/20 to-transparent" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 4px, hsl(var(--muted-foreground)) 4px, hsl(var(--muted-foreground)) 6px)'}}></div>
      </div>

      {/* Bottom: Current Highest Bid (smaller, secondary) */}
      {item.highest_bid > 0 && (
        <div className="text-center space-y-1 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">Current Highest Bid</p>
          <p className="font-sans text-2xl md:text-3xl font-bold text-foreground">
            ${item.highest_bid.toLocaleString("en-US")}
          </p>
          <p className="text-xs text-muted-foreground">({item.bid_count} bid{item.bid_count !== 1 ? "s" : ""})</p>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center bg-secondary/30 rounded-lg p-3 italic">
        {item.highest_bid > 0
          ? "If the PRI$OMETER reaches the highest bid above reserve, the sale completes."
          : "Place a bid or use Make It Mine to purchase at the current price."}
      </p>
    </div>
  );
}