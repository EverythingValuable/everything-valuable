import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Info, ChevronDown, Pause } from "lucide-react";
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

function ExpandableInfoBox({ label, explanation }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
      >
        <Info className="w-3 h-3" />
        <span>{open ? "Hide" : "What is this?"}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-secondary/40 rounded-lg px-3 py-2">
          {explanation}
        </p>
      )}
    </div>
  );
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

  return (
    <div className="space-y-1.5">

      {/* Box 1: 1stBid$ Preview Timer */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              1stBid$<sup className="text-[9px] ml-0.5">™</sup> Preview
            </span>
          </div>
          <div className="font-price text-sm font-bold tabular-nums text-amber-600">
            {countdown.days > 0 && `${countdown.days}d `}
            {countdown.hours.toString().padStart(2, "0")}h {countdown.minutes.toString().padStart(2, "0")}m {countdown.seconds.toString().padStart(2, "0")}s
          </div>
        </div>
        <ExpandableInfoBox explanation="1stBid$™ is the preview bidding phase before live pricing begins. Place early bids to signal interest — the highest bid carries over when the PRI$OMETER™ opens." />
      </div>

      {/* Box 2: PRI$OMETER Start Price */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 opacity-60 shadow-sm">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">PRI$OMETER™ Start Price</p>
        <motion.div
          key={Math.floor(displayPrice)}
          initial={{ scale: 1.02, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-sans text-3xl md:text-4xl font-bold text-foreground mt-1"
        >
          ${formatPrice(displayPrice)}
        </motion.div>
        <p className="text-xs text-muted-foreground italic mt-0.5">Activates after preview</p>
        <ExpandableInfoBox explanation="This is the price at which the live PRI$OMETER™ will begin once the preview phase ends. From here, the price descends continuously until it's claimed or the session closes." />
      </div>

      {/* Box 3: Highest Preview Bid */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Highest Preview Bid</p>
        {item.highest_bid > 0 ? (
          <>
            <p className="font-sans text-2xl md:text-3xl font-bold text-foreground mt-1">
              ${item.highest_bid.toLocaleString("en-US")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.bid_count} bid{item.bid_count !== 1 ? "s" : ""} placed</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground mt-1 italic">No bids yet — be the first</p>
        )}
        <ExpandableInfoBox explanation="Preview bids help establish early interest. The leading bid at the time the PRI$OMETER™ activates will carry over as the starting high bid in the live phase." />
      </div>

    </div>
  );
}

function LiveState({ item, isActive, isPaused, pauseTimeLeft, displayPrice, cents, formatPrice }) {
  return (
    <div className="space-y-1.5">

      {/* Box 1: Live PRI$OMETER Price */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
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

        {isPaused && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 space-y-2 mb-3"
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

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current PRI$OMETER™ Price</p>
        <motion.div
          key={Math.floor(displayPrice)}
          initial={{ scale: 1.02, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="font-sans text-5xl md:text-6xl font-bold text-foreground mt-1"
        >
          ${formatPrice(displayPrice)}
          {isActive && (
            <span className="font-sans text-xl text-red-500 animate-price-tick">.{cents.toString().padStart(2, "0")}</span>
          )}
        </motion.div>
        <ExpandableInfoBox explanation={PRISOMETER_INFO} />
      </div>

      {/* Box 2: Current Highest Bid */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Highest Bid</p>
        {item.highest_bid > 0 ? (
          <>
            <p className="font-sans text-2xl md:text-3xl font-bold text-foreground mt-1">
              ${item.highest_bid.toLocaleString("en-US")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.bid_count} bid{item.bid_count !== 1 ? "s" : ""} placed</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground mt-1 italic">No bids yet — be the first</p>
        )}
        <ExpandableInfoBox explanation="If the PRI$OMETER™ price descends to meet the highest bid, the sale is concluded. If the price is at or above the reserve, it's an automatic sale. If below, the seller is notified and may choose to accept." />
      </div>

    </div>
  );
}