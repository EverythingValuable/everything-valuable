import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Info, ChevronDown, Pause } from "lucide-react";

const COLOR_MAP = {
  gray: { text: "text-neutral-500", bg: "bg-neutral-50", border: "border-neutral-200", dot: "bg-neutral-400", price: "text-neutral-500", label: "text-neutral-500" },
  red: { text: "text-[#d43d2a]", bg: "bg-[#fef2f0]", border: "border-[#d43d2a]/30", dot: "bg-[#d43d2a]", price: "text-[#d43d2a]", label: "text-[#d43d2a]" },
  amber: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", price: "text-amber-600", label: "text-amber-600" },
  green: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", price: "text-emerald-600", label: "text-emerald-600" },
};

const PHASE_META = [
  { key: "first_bids", label: "Preview", title: "Phase 1 — Preview" },
  { key: "buy_now", label: "Buy Now", title: "Phase 2 — Buy Now" },
  { key: "prisometer", label: "Declining", title: "Phase 3 — Declining Price" },
];

function phaseColor(item, phaseIndex) {
  const key = phaseIndex === 0 ? item.phase_1_color
    : phaseIndex === 1 ? item.phase_2_color
    : item.phase_3_color;
  return COLOR_MAP[key] || COLOR_MAP[phaseIndex === 0 ? "gray" : phaseIndex === 1 ? "red" : "green"];
}

function useCountdown(targetIso) {
  const [diff, setDiff] = useState(() => targetIso ? new Date(targetIso).getTime() - Date.now() : 0);
  useEffect(() => {
    if (!targetIso) return;
    const tick = () => setDiff(new Date(targetIso).getTime() - Date.now());
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [targetIso]);
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function formatCountdown(cd) {
  if (!cd) return "Ended";
  return `${cd.days > 0 ? `${cd.days}d ` : ""}${cd.hours.toString().padStart(2, "0")}h ${cd.minutes.toString().padStart(2, "0")}m ${cd.seconds.toString().padStart(2, "0")}s`;
}

function ExpandableInfoBox({ explanation }) {
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

function PhaseIndicator({ item }) {
  const currentIndex = PHASE_META.findIndex(p => p.key === item.status);
  if (currentIndex < 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-3 shadow-sm w-full overflow-hidden">
      <div className="flex items-center gap-2">
        {PHASE_META.map((phase, i) => {
          const c = phaseColor(item, i);
          const active = i === currentIndex;
          const done = i < currentIndex;
          return (
            <React.Fragment key={phase.key}>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={`w-2 h-2 rounded-full ${active ? c.dot : done ? c.dot : "bg-muted-foreground/20"} ${active ? "animate-pulse" : ""}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? c.label : "text-muted-foreground/50"}`}>{phase.label}</span>
              </div>
              {i < PHASE_META.length - 1 && (
                <div className={`flex-1 h-px ${done ? "bg-foreground/30" : "bg-border"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 font-medium">{PHASE_META[currentIndex].title}</p>
    </div>
  );
}

function HighestOfferPanel({ item }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm w-full overflow-hidden">
      <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Highest Offer</p>
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
      <ExpandableInfoBox explanation="The Highest Offer panel tracks the leading bid live across all three phases. In Phase 3, the declining PRI$OMETER™ price converges with this offer to conclude the sale." />
    </div>
  );
}

function PriusometerPriceBox({ item, color, displayPrice, cents, formatPrice, isActive, isPaused, pauseTimeLeft, subtitle, explanation }) {
  const nowMs = Date.now();
  const expiresMs = item.make_it_mine_expires ? new Date(item.make_it_mine_expires).getTime() : 0;
  const hasLock = item.make_it_mine_active === true && expiresMs > nowMs;

  return (
    <div className={`rounded-xl border ${color.border} ${color.bg} px-5 py-4 shadow-sm w-full overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        {isActive ? (
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${color.label}`}>PRI$OMETER™ Live</span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${color.label}`}>{subtitle}</span>
          </div>
        )}
        {hasLock && (
          <div className="flex items-center gap-1.5 text-amber-600">
            <Pause className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Reserved</span>
          </div>
        )}
      </div>

      {hasLock && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Purchase in progress</span>
            <span className="font-mono text-sm font-bold text-amber-700">
              {Math.floor(pauseTimeLeft / 60)}:{(pauseTimeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-amber-600 leading-relaxed">
            A buyer has started a Make It Mine purchase. If they do not complete checkout before the timer expires, the sale resumes.
          </p>
        </motion.div>
      )}

      <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">PRI$OMETER™ Price</p>
      <motion.div
        key={Math.floor(displayPrice)}
        initial={{ scale: 1.02, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`font-sans text-4xl md:text-5xl lg:text-6xl font-bold ${color.price} mt-1`}
      >
        ${formatPrice(displayPrice)}
        {isActive && <span className={`font-sans text-xl ${color.price} animate-price-tick`}>.{cents.toString().padStart(2, "0")}</span>}
      </motion.div>
      <ExpandableInfoBox explanation={explanation} />
    </div>
  );
}

function PhaseTimerBox({ color, title, cd, body }) {
  return (
    <div className={`rounded-xl border ${color.border} ${color.bg} px-5 py-4 shadow-sm w-full overflow-hidden`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className={`w-4 h-4 ${color.text}`} />
        <span className={`font-display text-sm font-bold uppercase tracking-wider ${color.label}`}>{title}</span>
      </div>
      <div className="text-left mb-1">
        <div className="font-price text-2xl md:text-3xl font-bold tabular-nums text-foreground">
          {formatCountdown(cd)}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{body}</p>
    </div>
  );
}

export default function PriceConvergenceModule({ item, isActive, isPaused, pauseTimeLeft, displayPrice, cents, formatPrice }) {
  // Resolve the countdown target for the current phase (single unconditional hook call)
  let countdownTarget = null;
  if (item.status === "first_bids") {
    countdownTarget = item.first_bids_end;
  } else if (item.status === "buy_now") {
    countdownTarget = item.phase_2_end;
  } else if (item.status === "prisometer" && item.prisometer_activated_at && item.prisometer_duration_hours) {
    countdownTarget = new Date(new Date(item.prisometer_activated_at).getTime() + item.prisometer_duration_hours * 3600000).toISOString();
  }
  const cd = useCountdown(countdownTarget);

  // Phase 1 — Preview (stagnant, gray)
  if (item.status === "first_bids") {
    const color = phaseColor(item, 0);
    return (
      <div className="space-y-1.5">
        <PhaseIndicator item={item} />
        <PhaseTimerBox color={color} title="1stBid$™ Preview" cd={cd}
          body="The PRI$OMETER™ price is fixed during preview. Place your highest bid — if it meets the displayed price, you can win before live pricing begins." />
        <PriusometerPriceBox item={item} color={color} displayPrice={displayPrice} cents={cents} formatPrice={formatPrice}
          isActive={false} isPaused={false} pauseTimeLeft={0}
          subtitle="Preview Price"
          explanation="This is the publicly displayed price. During Phase 1 it stays fixed. Bids placed here help discover whether the seller underpriced the asset." />
        <HighestOfferPanel item={item} />
        <div className="rounded-xl border border-dashed border-border px-5 py-3 text-center">
          <p className="text-xs text-muted-foreground">Make It Mine unlocks in <span className="font-semibold text-foreground">Phase 2</span></p>
        </div>
      </div>
    );
  }

  // Phase 2 — Stagnant + Buy Now (red/amber)
  if (item.status === "buy_now") {
    const color = phaseColor(item, 1);
    return (
      <div className="space-y-1.5">
        <PhaseIndicator item={item} />
        <PhaseTimerBox color={color} title="Buy Now Phase" cd={cd}
          body="The price is fixed and Make It Mine is active. Buy now at the displayed price, or keep bidding — bidding continues into Phase 3." />
        <PriusometerPriceBox item={item} color={color} displayPrice={displayPrice} cents={cents} formatPrice={formatPrice}
          isActive={false} isPaused={isPaused} pauseTimeLeft={pauseTimeLeft}
          subtitle="Buy Now Price"
          explanation="During Phase 2 the PRI$OMETER™ price is fixed and always at or above the hidden reserve. Use Make It Mine to buy instantly, or place a bid to compete." />
        <HighestOfferPanel item={item} />
      </div>
    );
  }

  // Phase 3 — Declining (green)
  if (item.status === "prisometer") {
    const color = phaseColor(item, 2);
    return (
      <div className="space-y-1.5">
        <PhaseIndicator item={item} />
        <PhaseTimerBox color={color} title="Declining Price" cd={cd}
          body="The price drops continuously. When it meets the highest offer, the sale concludes — above reserve auto-completes; below reserve goes to the seller." />
        <PriusometerPriceBox item={item} color={color} displayPrice={displayPrice} cents={cents} formatPrice={formatPrice}
          isActive={isActive} isPaused={isPaused} pauseTimeLeft={pauseTimeLeft}
          subtitle="Declining Price"
          explanation="The PRI$OMETER™ price declines until it converges with the highest offer. If that offer is at or above the hidden reserve, the sale completes automatically; if below, the seller decides whether to accept." />
        <HighestOfferPanel item={item} />
      </div>
    );
  }

  return null;
}