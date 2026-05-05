import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Info, ChevronDown, Pause } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function SlotDigit({ digit, className = "" }) {
  return (
    <span className={`inline-block overflow-hidden relative ${className}`} style={{ height: "1.2em", verticalAlign: "bottom" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="block"
          style={{ lineHeight: "1.2em" }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function SlotPrice({ value, className = "", centsValue = null, showCents = false }) {
  const formatted = Math.floor(value).toLocaleString("en-US");
  const digits = formatted.split("");
  const centsStr = centsValue !== null ? centsValue.toString().padStart(2, "0") : "00";

  return (
    <span className={`inline-flex items-end ${className}`} style={{ lineHeight: "1.2em" }}>
      <span>$</span>
      {digits.map((d, i) => (
        d === "," ? <span key={i}>,</span> : <SlotDigit key={i} digit={d} />
      ))}
      {showCents && (
        <span className="font-sans text-xl text-red-500" style={{ lineHeight: "1.2em" }}>
          .<SlotDigit digit={centsStr[0]} /><SlotDigit digit={centsStr[1]} />
        </span>
      )}
    </span>
  );
}

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
    <div className="w-full overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
      >
        <Info className="w-3 h-3" />
        <span>{open ? "Hide" : "What is this?"}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="mt-2 text-xs text-black leading-relaxed bg-secondary rounded-lg px-3 py-2 break-words w-full">
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
      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm w-full overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              1stBid$<sup className="text-[9px] ml-0.5">™</sup> Preview
            </span>
          </div>
        </div>
        <div className="text-left mb-4">
          <div className="font-price text-2xl md:text-3xl font-bold tabular-nums text-amber-600">
            {countdown.days > 0 && `${countdown.days}d `}
            {countdown.hours.toString().padStart(2, "0")}h {countdown.minutes.toString().padStart(2, "0")}m {countdown.seconds.toString().padStart(2, "0")}s
          </div>
        </div>
        <ExpandableInfoBox explanation="1stBid$™ is the preview bidding phase before PRI$OMETER™ live pricing begins. Place your highest and best bid during preview. If the highest bid meets or exceeds the PRI$OMETER™ start price, the item sells when preview ends and PRI$OMETER™ does not activate. If not, the highest bid carries forward and live pricing begins." />
      </div>

      {/* Box 2: PRI$OMETER Start Price */}
      <div className="rounded-xl border border-border bg-amber-50 px-5 py-4 opacity-50 shadow-sm w-full overflow-hidden">
        <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">PRI$OMETER™ Start Price</p>
        <div className="font-sans text-3xl md:text-4xl font-bold text-foreground/40 mt-1">
          <SlotPrice value={displayPrice} />
        </div>
        <p className="text-xs text-muted-foreground italic mt-0.5">Activates after preview</p>
        <ExpandableInfoBox explanation="This is the price at which the live PRI$OMETER™ will begin once the preview phase ends. From here, the price descends continuously until it's claimed or the session closes." />
      </div>

      {/* Box 3: Highest Preview Bid */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm w-full overflow-hidden">
        <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Highest Preview Bid</p>
        {item.highest_bid > 0 ? (
          <>
            <p className="font-sans text-2xl md:text-3xl font-bold text-primary mt-1">
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
  // Only show paused state if there's a valid, non-expired Make It Mine lock
  const nowMs = Date.now();
  const makeItMineExpiresMs = item.make_it_mine_expires
    ? new Date(item.make_it_mine_expires).getTime()
    : 0;
  const hasValidMakeItMineLock =
    item.make_it_mine_active === true &&
    makeItMineExpiresMs > nowMs;

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
          {hasValidMakeItMineLock && (
            <div className="flex items-center gap-1.5 text-amber-600">
              <Pause className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">PRI$OMETER™ Paused</span>
            </div>
          )}
        </div>

        {hasValidMakeItMineLock && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 space-y-2 mb-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700">PRI$OMETER Reserved Temporarily</span>
              <span className="font-mono text-sm font-bold text-amber-700">
                {Math.floor(pauseTimeLeft / 60)}:{(pauseTimeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <p className="text-xs text-amber-600 leading-relaxed">
              A buyer has started a Make It Mine purchase. If they do not complete checkout before the timer expires, live pricing resumes automatically.
            </p>
          </motion.div>
        )}

        <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Current PRI$OMETER™ Price</p>
        <div className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-700 mt-1">
          <SlotPrice value={displayPrice} showCents={isActive} centsValue={cents} />
        </div>
        <ExpandableInfoBox explanation={PRISOMETER_INFO} />
      </div>

      {/* Box 2: Current Highest Bid */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Current Highest Bid</p>
        {item.highest_bid > 0 ? (
          <>
            <p className="font-sans text-2xl md:text-3xl font-bold text-primary mt-1">
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