import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gavel, ShoppingBag, CheckCircle2, Clock, TrendingDown, RotateCcw, 
  Heart, Share2, Bell, ChevronDown, ChevronUp, Pause, Crown, 
  Zap, Timer, Settings, Play, SkipForward, Info, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

// ─── Demo item data ───────────────────────────────────────────────────────────
const DEMO_ITEM = {
  title: "Erik Kollin, Fabergé Master Goldsmith, Russian Imperial Signed Mechanical Silver Easter Egg Clock",
  subtitle: "with Pop-Up Crucifix Compartment and Double-Headed Eagle, 84 Mark",
  seller: "Collective Hudson",
  category: "Watches & Clocks",
  description: "Erik Kollin was Fabergé's chief goldsmith, appointed by Peter Carl Fabergé in 1870. He is credited with creating the first Fabergé egg, the Hen Egg, commissioned by the Tsar in 1885.\n\nThis egg-form table clock bears Imperial markings for the Russian 84 silver standard, Moscow, and Erik Kollin's mark. The silver clock is richly decorated with chased foliate scrollwork and blue and green enamel panels, and is raised on a hexagonal base with conforming ornament and ball feet. The front is fitted with a white enamel dial with Roman numerals. The egg opens at the center to reveal a silver crucifix in the round, along with a small covered compartment in the upper half. The top is surmounted by an enamel medallion bearing the Russian Imperial double-headed eagle.",
  dimensions: "Measurement: 10 x 5 x 5 in. (25.4 x 12.7 x 12.7 cm.) approx",
  condition: "Very Good — Attractive overall appearance with honest age. Clock movement not tested.",
  location: "Kingston, NY 12401",
  estimated_low: 20000,
  estimated_high: 40000,
  images: [
    "https://base44.app/api/apps/69beac1c3231aaeb891946d5/files/mp/public/69beac1c3231aaeb891946d5/b07d8d465_11_01.jpg",
    "https://base44.app/api/apps/69beac1c3231aaeb891946d5/files/mp/public/69beac1c3231aaeb891946d5/0f97db25a_11_03.jpg",
    "https://base44.app/api/apps/69beac1c3231aaeb891946d5/files/mp/public/69beac1c3231aaeb891946d5/35653a00d_11_04.jpg",
    "https://base44.app/api/apps/69beac1c3231aaeb891946d5/files/mp/public/69beac1c3231aaeb891946d5/cdc2007dc_11_05.jpg",
    "https://base44.app/api/apps/69beac1c3231aaeb891946d5/files/mp/public/69beac1c3231aaeb891946d5/1838be99b_11_06.jpg",
    "https://base44.app/api/apps/69beac1c3231aaeb891946d5/files/mp/public/69beac1c3231aaeb891946d5/31a1385bb_11_07.jpg",
  ],
};

const PHASE = {
  SETUP: "setup",
  FIRST_BIDS: "first_bids",
  PRISOMETER: "prisometer",
  MIM_CONFIRM: "mim_confirm",
  SOLD_ABOVE: "sold_above",
  SOLD_BELOW: "sold_below",
  UNSOLD: "unsold",
};

function fmtDollars(n) {
  return Math.floor(n).toLocaleString("en-US");
}

function InfoBox({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-1">
        <Info className="w-3 h-3" />
        <span>{open ? "Hide" : "What is this?"}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-xs text-foreground leading-relaxed bg-secondary rounded px-3 py-2">{text}</p>}
    </div>
  );
}

// ─── Price Convergence Module ─────────────────────────────────────────────────
function PriceModule({ phase, settings, timeLeft, prisometerPrice, cents, highestBid, bidCount, mimTimeLeft }) {
  const { firstBidsDuration, prisometerDuration } = settings;

  if (phase === PHASE.FIRST_BIDS) {
    return (
      <div className="space-y-1.5">
        <div className="rounded border border-border bg-card px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              1stBid$<sup className="text-[9px] ml-0.5">™</sup> Preview
            </span>
          </div>
          <div className="font-price text-3xl font-bold text-amber-600 mb-1 tabular-nums">
            {String(Math.floor(timeLeft / 60)).padStart(2,"0")}m {String(timeLeft % 60).padStart(2,"0")}s
          </div>
          <div className="w-full h-1 bg-border rounded-full overflow-hidden mt-2">
            <motion.div className="h-full bg-amber-500 rounded-full" style={{ width: `${(timeLeft/firstBidsDuration)*100}%` }} transition={{ duration: 0.9 }} />
          </div>
          <InfoBox text="1stBid$™ is the preview bidding phase before PRI$OMETER™ live pricing begins. Place your highest and best bid during preview." />
        </div>
        <div className="rounded border border-border bg-amber-50 px-5 py-4 opacity-50">
          <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">PRI$OMETER™ Start Price</p>
          <div className="font-sans text-3xl font-bold text-foreground/40 mt-1">${fmtDollars(settings.startPrice)}</div>
          <p className="text-xs text-muted-foreground italic mt-0.5">Activates after preview</p>
        </div>
        <div className="rounded border border-border bg-card px-5 py-4">
          <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Highest Preview Bid</p>
          {highestBid > 0 ? (
            <>
              <p className="font-sans text-2xl font-bold text-primary mt-1">${fmtDollars(highestBid)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{bidCount} bid{bidCount !== 1 ? "s" : ""} placed</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-1 italic">No bids yet — be the first</p>
          )}
        </div>
      </div>
    );
  }

  if (phase === PHASE.PRISOMETER || phase === PHASE.MIM_CONFIRM) {
    const isPaused = phase === PHASE.MIM_CONFIRM;
    return (
      <div className="space-y-1.5">
        <div className="rounded border border-border bg-card px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            {!isPaused && (
              <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center gap-1.5">
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
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="rounded bg-amber-50 border border-amber-200 px-4 py-3 space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">PRI$OMETER Reserved Temporarily</span>
                <span className="font-mono text-sm font-bold text-amber-700">
                  {Math.floor(mimTimeLeft/60)}:{String(mimTimeLeft%60).padStart(2,"0")}
                </span>
              </div>
              <p className="text-xs text-amber-600 leading-relaxed">A buyer has started a Make It Mine purchase. If they do not complete checkout, live pricing resumes.</p>
            </motion.div>
          )}
          <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Current PRI$OMETER™ Price</p>
          <motion.div key={Math.floor(prisometerPrice)} initial={{ scale:1.02, opacity:0.8 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.4 }}
            className="font-sans text-5xl font-bold text-foreground mt-1">
            <span className="text-foreground">${fmtDollars(prisometerPrice)}</span>
            {!isPaused && <span className="text-xl text-primary animate-price-tick">.{String(cents).padStart(2,"0")}</span>}
          </motion.div>
          <InfoBox text="The PRI$OMETER™ is our live declining-price engine. The price starts high and drops continuously over time. You can place a bid at any moment — or use Make It Mine to buy instantly at the current price." />
        </div>
        <div className="rounded border border-border bg-card px-5 py-4">
          <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Current Highest Bid</p>
          {highestBid > 0 ? (
            <>
              <p className="font-sans text-2xl font-bold text-primary mt-1">${fmtDollars(highestBid)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{bidCount} bid{bidCount !== 1 ? "s" : ""} placed</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-1 italic">No bids yet — be the first</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Bid Section ──────────────────────────────────────────────────────────────
function BidSection({ phase, settings, prisometerPrice, highestBid, bidCount, mimTimeLeft, mimPrice,
  onPlaceBid, onMakeItMine, onConfirmMim, onCancelMim, onCancelMimExpired }) {

  const [bidInput, setBidInput] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  const tiers = [
    { min: 0, max: 1000, inc: 50 },
    { min: 1001, max: 5000, inc: 100 },
    { min: 5001, max: 999999999, inc: 250 },
  ];

  const getInc = (price) => {
    const t = tiers.find(t => price >= t.min && price <= t.max);
    return t ? t.inc : 100;
  };

  const snapBid = (val) => {
    const t = tiers.find(t => val >= t.min && val <= t.max);
    if (!t) return val;
    const rem = val % t.inc;
    return rem === 0 ? val : val + (t.inc - rem);
  };

  const generateOptions = () => {
    const options = [];
    const base = highestBid > 0 ? highestBid + getInc(highestBid) : Math.max(Math.round(settings.estimatedLow / 2 / 50) * 50, 100);
    let val = snapBid(base);
    const cap = phase === PHASE.PRISOMETER ? Math.floor(prisometerPrice) : Infinity;
    while (val <= cap && options.length < 50) {
      options.push(val);
      val += getInc(val);
    }
    return options;
  };

  const handleSelectBid = (val) => {
    setBidInput(val.toString());
    setBidError("");
    setShowFeeModal(true);
  };

  const handleConfirmBid = () => {
    const amount = parseInt(bidInput);
    if (!amount || amount <= 0) { setBidError("Enter a valid bid amount."); return; }
    if (amount <= highestBid) { setBidError(`Bid must exceed current high bid of $${fmtDollars(highestBid)}.`); return; }
    setShowFeeModal(false);
    setBidError("");
    setBidInput("");
    setBidSuccess(true);
    onPlaceBid(amount);
    setTimeout(() => setBidSuccess(false), 2000);
  };

  const handleCancelBid = () => {
    setShowFeeModal(false);
    setBidInput("");
  };

  const allOptions = generateOptions();
  const quickPicks = allOptions.slice(0, 3);
  const dropdownOpts = allOptions.slice(3);

  // MIM Confirm Screen
  if (phase === PHASE.MIM_CONFIRM) {
    const serviceFee = mimPrice * 0.10 + 30;
    const feeCredit = serviceFee * 0.50;
    const aboveReserve = mimPrice >= settings.reservePrice;
    return (
      <div className="rounded border-2 border-primary/40 bg-primary/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-green-600 font-semibold">Registration Status: Confirmed</p>
            <h3 className="font-serif text-lg font-semibold mt-1">Confirm Your Offer Now</h3>
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-semibold text-lg ${mimTimeLeft <= 30 ? "text-red-500" : "text-primary"}`}>
            <Clock className="w-4 h-4" />
            {Math.floor(mimTimeLeft/60)}:{String(mimTimeLeft%60).padStart(2,"0")}
          </div>
        </div>
        <div className="bg-background/50 rounded p-4 space-y-1 text-sm">
          <p>The PRI$OMETER is currently paused at <strong>${fmtDollars(mimPrice)}</strong></p>
          <p className="text-red-600 font-medium mt-2">Please review the bid amount and ensure you are ready to proceed.</p>
        </div>
        <div className="rounded bg-card border border-border p-4 space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Purchase Price</span><span className="font-semibold">${fmtDollars(mimPrice)}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Service Fee (10% + $30)</span><span>${fmtDollars(serviceFee)}</span></div>
          <div className="flex justify-between py-1 border-b border-border/50 bg-primary/5 px-2 rounded"><span className="font-medium">Fee Credit (50%)</span><span className="text-primary font-medium">-${fmtDollars(feeCredit)}</span></div>
          <div className="flex justify-between py-2 font-semibold"><span>Total Due to Seller</span><span>${fmtDollars(mimPrice + serviceFee - feeCredit)}</span></div>
        </div>
        {!aboveReserve && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">⚠ This offer is below reserve — seller review required before the sale is confirmed.</p>}
        <p className="text-xs text-muted-foreground text-center">Press "Confirm" to place your offer</p>
        <div className="flex gap-3">
          <Button onClick={onConfirmMim} className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Confirm</Button>
          <Button variant="outline" onClick={onCancelMim} className="h-11 px-6">Cancel</Button>
        </div>
      </div>
    );
  }

  // Sold screens
  if (phase === PHASE.SOLD_ABOVE) {
    const serviceFee = (mimPrice || highestBid) * 0.10 + 30;
    const feeCredit = serviceFee * 0.50;
    const price = mimPrice || highestBid;
    return (
      <div className="rounded border-2 border-primary/40 bg-primary/5 p-8 space-y-5 text-center">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
        <div><h3 className="font-serif text-2xl font-semibold">Purchase Confirmed!</h3>
          <p className="text-sm text-muted-foreground mt-1">Purchase price: ${fmtDollars(price)}</p></div>
        <div className="bg-card border border-border rounded p-4 text-sm space-y-2 text-left">
          <p className="font-semibold text-xs uppercase tracking-wider">Next steps</p>
          <ul className="text-muted-foreground space-y-1 text-xs list-disc list-inside">
            <li>An invoice has been created and is pending from the seller.</li>
            <li>View it in My Account › Purchases.</li>
            <li>Payment instructions will be on the invoice.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (phase === PHASE.SOLD_BELOW) {
    return (
      <div className="rounded border-2 border-amber-300 bg-amber-50 p-8 space-y-5 text-center">
        <CheckCircle2 className="w-12 h-12 text-amber-600 mx-auto" />
        <div><h3 className="font-serif text-2xl font-semibold">Offer Submitted for Review</h3>
          <p className="text-sm text-muted-foreground mt-1">The seller will review your offer and respond shortly.</p></div>
        <div className="bg-white border border-amber-200 rounded p-4 text-sm space-y-2 text-left">
          <p className="font-semibold text-xs uppercase tracking-wider">Next steps</p>
          <ul className="text-muted-foreground space-y-1 text-xs list-disc list-inside">
            <li>Your offer is below the reserve — the seller will decide.</li>
            <li>Check My Account › Purchases for updates.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (phase === PHASE.UNSOLD) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center space-y-4">
        <Timer className="w-10 h-10 text-muted-foreground mx-auto" />
        <h3 className="font-serif text-xl font-semibold">PRI$OMETER Expired</h3>
        <p className="text-sm text-muted-foreground">No buyer claimed the item before time ran out. The seller would review and may relist.</p>
      </div>
    );
  }

  if (phase === PHASE.FIRST_BIDS || phase === PHASE.PRISOMETER) {
    return (
      <div className="space-y-3">
        {highestBid > 0 && (
          <div className="rounded border border-green-200 bg-green-50 p-4 flex items-center gap-3">
            <Crown className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700">You're the Highest Bidder</p>
              <p className="text-xs text-green-600">Your current bid: ${fmtDollars(highestBid)}</p>
            </div>
          </div>
        )}

        {phase === PHASE.PRISOMETER && (
          <Button onClick={onMakeItMine} className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold gap-2">
            <ShoppingBag className="w-5 h-5" /> Make It Mine
          </Button>
        )}

        <div className="rounded border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Place a Bid</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickPicks.map(opt => (
              <button key={opt} onClick={() => handleSelectBid(opt)}
                className="flex flex-col items-center justify-center border rounded py-3 px-2 transition-colors text-center border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/30">
                <span className="font-semibold text-sm">${fmtDollars(opt)}</span>
              </button>
            ))}
          </div>
          {dropdownOpts.length > 0 && (
            <select value="" onChange={e => { if (e.target.value) handleSelectBid(parseInt(e.target.value)); }}
              className="w-full h-10 border border-input bg-background rounded px-3 text-sm text-foreground">
              <option value="">Or select a higher bid amount</option>
              {dropdownOpts.map(opt => <option key={opt} value={opt}>${fmtDollars(opt)}</option>)}
            </select>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                placeholder="Enter custom amount"
                className="w-full h-10 border border-input bg-background rounded pl-6 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={e => { if (e.key === "Enter" && e.target.value) handleSelectBid(parseInt(e.target.value)); }}
                id="custom-bid-input"
              />
            </div>
            <button
              onClick={() => {
                const el = document.getElementById("custom-bid-input");
                if (el && el.value) handleSelectBid(parseInt(el.value));
              }}
              className="h-10 px-4 bg-foreground text-background text-sm font-semibold rounded hover:bg-foreground/90 transition-colors whitespace-nowrap"
            >
              Review Bid
            </button>
          </div>
          {bidError && <p className="text-xs text-destructive">{bidError}</p>}
          {bidSuccess && <p className="text-xs text-green-600 font-medium">✓ Bid placed successfully!</p>}

          {/* Fee breakdown modal */}
          {showFeeModal && bidInput && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCancelBid}>
              <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-serif text-lg font-semibold">Review Your Bid</h2>
                  <button onClick={handleCancelBid} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[70vh] p-5">
                  {(() => {
                    const amount = parseInt(bidInput);
                    const serviceFee = amount * 0.10 + 30;
                    const feeCredit = serviceFee * 0.50;
                    const remainingBalance = amount + feeCredit - serviceFee;
                    const totalPaid = serviceFee + remainingBalance;
                    const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return (
                      <div className="rounded-lg border border-border bg-background/50 p-4 space-y-4 text-sm">
                        <div className="space-y-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Item Price</p>
                          <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span>${amount.toLocaleString("en-US")}.00</span></div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Service Fee</p>
                          <div className="text-xs text-muted-foreground">10% of item price + $30</div>
                          <div className="flex justify-between"><span></span><span>${fmt(serviceFee)}</span></div>
                        </div>
                        <div className="border-t border-border pt-3 space-y-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">If You Win</p>
                          <div className="text-xs text-muted-foreground">Card on file will be charged automatically</div>
                          <div className="flex justify-between font-semibold"><span></span><span>${fmt(serviceFee)}</span></div>
                          <p className="text-xs text-muted-foreground italic mt-2">This payment secures your winning position. If the sale is completed, 50% of this fee is credited back on your final invoice.</p>
                        </div>
                        <div className="border-t border-border pt-3 space-y-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Final Invoice From Seller</p>
                          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Item Price</span><span>${amount.toLocaleString("en-US")}.00</span></div>
                          <div className="flex justify-between text-xs text-green-600"><span className="text-muted-foreground">Less Service Fee Credit</span><span>-${fmt(feeCredit)}</span></div>
                          <div className="flex justify-between font-semibold"><span className="text-muted-foreground">Remaining Balance Due</span><span>${fmt(remainingBalance)}</span></div>
                        </div>
                        <div className="border-t border-border pt-3 space-y-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Total Paid</p>
                          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Paid Upfront</span><span>${fmt(serviceFee)}</span></div>
                          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Paid on Final Invoice</span><span>${fmt(remainingBalance)}</span></div>
                          <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold"><span className="text-muted-foreground">Total Paid Before Tax / Shipping</span><span>${fmt(totalPaid)}</span></div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">Does not include sales tax, shipping, or other fees.</p>
                        <div className="border-t border-border pt-4 space-y-3">
                          <p className="text-xs text-muted-foreground">Your credit card on file will be charged automatically if successful for service fee only.</p>
                          <div className="flex gap-3">
                            <button onClick={handleConfirmBid} className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-md transition-colors">Confirm Bid</button>
                            <button onClick={handleCancelBid} className="flex-1 h-11 border border-input bg-background hover:bg-muted text-foreground font-semibold rounded-md transition-colors">Cancel</button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Setup Panel ──────────────────────────────────────────────────────────────
function SetupPanel({ settings, setSettings, onStart, onJumpToPrisometer }) {
  const [local, setLocal] = useState({
    startPrice: String(settings.startPrice),
    reservePrice: String(settings.reservePrice),
    firstBidsDuration: String(settings.firstBidsDuration),
    prisometerDuration: String(settings.prisometerDuration),
  });

  const apply = () => ({
    startPrice: Math.max(100, parseInt(local.startPrice) || 25000),
    reservePrice: Math.max(50, parseInt(local.reservePrice) || 18000),
    firstBidsDuration: Math.max(5, parseInt(local.firstBidsDuration) || 30),
    prisometerDuration: Math.max(5, parseInt(local.prisometerDuration) || 60),
    estimatedLow: settings.estimatedLow,
  });

  return (
    <div className="rounded border border-primary/30 bg-primary/5 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-primary" />
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-primary">Demo Configuration</h3>

      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Start Price ($)", key: "startPrice", hint: "Where price begins" },
          { label: "Reserve Price ($)", key: "reservePrice", hint: "Hidden minimum" },
          { label: "1stBid$™ Duration (s)", key: "firstBidsDuration", hint: "Preview phase length" },
          { label: "PRI$OMETER Duration (s)", key: "prisometerDuration", hint: "Live price drop length" },
        ].map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-xs font-semibold text-foreground">{f.label}</label>
            <Input type="number" value={local[f.key]} onChange={e => setLocal(p => ({ ...p, [f.key]: e.target.value }))}
              className="h-9 text-sm font-price" />
            <p className="text-[10px] text-muted-foreground">{f.hint}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => { const s = apply(); setSettings(s); onStart(s, "first_bids"); }} className="flex-1 h-10 gap-2">
          <Play className="w-4 h-4" /> Start from 1stBid$™
        </Button>
        <Button onClick={() => { const s = apply(); setSettings(s); onStart(s, "prisometer"); }} variant="outline" className="flex-1 h-10 gap-2 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
          <SkipForward className="w-4 h-4" /> Jump to PRI$OMETER
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductPageDemo() {
  const DEFAULT_SETTINGS = {
    startPrice: 40000,
    reservePrice: 20000,
    firstBidsDuration: 30,
    prisometerDuration: 90,
    estimatedLow: DEMO_ITEM.estimated_low,
  };

  const [phase, setPhase] = useState(PHASE.SETUP);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(0);           // first_bids countdown
  const [prisometerPrice, setPrisometerPrice] = useState(0);
  const [prisometerTimeLeft, setPrisometerTimeLeft] = useState(0);
  const [cents, setCents] = useState(0);
  const [highestBid, setHighestBid] = useState(0);
  const [bidCount, setBidCount] = useState(0);
  const [mimPrice, setMimPrice] = useState(null);
  const [mimTimeLeft, setMimTimeLeft] = useState(120);
  const [savedPrisometerPrice, setSavedPrisometerPrice] = useState(0);
  const [savedPrisometerTimeLeft, setSavedPrisometerTimeLeft] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [descOpen, setDescOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(true);

  const isMobile = useIsMobile();

  const timerRef = useRef(null);
  const prisRef = useRef(null);
  const mimRef = useRef(null);
  const centRef = useRef(null);
  const settingsRef = useRef(settings);
  const prisometerPriceRef = useRef(0);
  const highestBidRef = useRef(0);
  const phaseRef = useRef(PHASE.SETUP);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { prisometerPriceRef.current = prisometerPrice; }, [prisometerPrice]);
  useEffect(() => { highestBidRef.current = highestBid; }, [highestBid]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const clearAllTimers = () => {
    clearInterval(timerRef.current);
    clearInterval(prisRef.current);
    clearInterval(mimRef.current);
    clearInterval(centRef.current);
  };

  const startFirstBids = (s) => {
    clearAllTimers();
    setTimeLeft(s.firstBidsDuration);
    setHighestBid(0); setBidCount(0); setMimPrice(null);
    setPhase(PHASE.FIRST_BIDS);
  };

  const activatePrisometer = useCallback((s, initBid) => {
    clearInterval(timerRef.current);
    const price = s.startPrice;
    setPrisometerPrice(price);
    prisometerPriceRef.current = price;
    setPrisometerTimeLeft(s.prisometerDuration);
    setPhase(PHASE.PRISOMETER);
    phaseRef.current = PHASE.PRISOMETER;

    // Cents ticker
    centRef.current = setInterval(() => setCents(Math.floor(Math.random() * 100)), 100);

    const floor = s.reservePrice * 0.9;
    const step = (s.startPrice - floor) / s.prisometerDuration;

    prisRef.current = setInterval(() => {
      if (phaseRef.current !== PHASE.PRISOMETER) { clearInterval(prisRef.current); return; }
      setPrisometerTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(prisRef.current);
          clearInterval(centRef.current);
          // Check if price met bid
          const cur = prisometerPriceRef.current;
          const bid = highestBidRef.current;
          if (bid > 0 && cur <= bid) {
            // sold via bid match
            if (bid >= settingsRef.current.reservePrice) { setPhase(PHASE.SOLD_ABOVE); phaseRef.current = PHASE.SOLD_ABOVE; }
            else { setPhase(PHASE.SOLD_BELOW); phaseRef.current = PHASE.SOLD_BELOW; }
          } else {
            setPhase(PHASE.UNSOLD); phaseRef.current = PHASE.UNSOLD;
          }
          return 0;
        }
        return prev - 1;
      });
      setPrisometerPrice(prev => {
        const next = Math.max(floor, prev - step);
        prisometerPriceRef.current = next;
        // Auto-converge check
        const bid = highestBidRef.current;
        if (bid > 0 && next <= bid && phaseRef.current === PHASE.PRISOMETER) {
          clearInterval(prisRef.current);
          clearInterval(centRef.current);
          if (bid >= settingsRef.current.reservePrice) { setPhase(PHASE.SOLD_ABOVE); phaseRef.current = PHASE.SOLD_ABOVE; }
          else { setPhase(PHASE.SOLD_BELOW); phaseRef.current = PHASE.SOLD_BELOW; }
        }
        return next;
      });
    }, 1000);
  }, []);

  // First bids timer
  useEffect(() => {
    if (phase !== PHASE.FIRST_BIDS) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          const s = settingsRef.current;
          const bid = highestBidRef.current;
          if (bid >= s.startPrice) {
            // sold during preview
            setPhase(PHASE.SOLD_ABOVE); phaseRef.current = PHASE.SOLD_ABOVE;
          } else {
            activatePrisometer(s, bid);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, activatePrisometer]);

  // MIM countdown
  useEffect(() => {
    if (phase !== PHASE.MIM_CONFIRM) return;
    setMimTimeLeft(120);
    mimRef.current = setInterval(() => {
      setMimTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(mimRef.current);
          // expired — resume prisometer
          handleCancelMimExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(mimRef.current);
  }, [phase]);

  const handleStart = (s, startPhase) => {
    setSettings(s);
    settingsRef.current = s;
    setHighestBid(0); highestBidRef.current = 0;
    setBidCount(0);
    setMimPrice(null);
    setShowSetup(false);
    if (startPhase === "first_bids") startFirstBids(s);
    else activatePrisometer(s, 0);
  };

  const handlePlaceBid = (amount) => {
    setHighestBid(amount);
    highestBidRef.current = amount;
    setBidCount(c => c + 1);
  };

  const handleMakeItMine = () => {
    clearInterval(prisRef.current);
    clearInterval(centRef.current);
    const price = Math.round(prisometerPriceRef.current);
    setSavedPrisometerPrice(price);
    setSavedPrisometerTimeLeft(prisometerTimeLeft);
    setMimPrice(price);
    setPhase(PHASE.MIM_CONFIRM);
    phaseRef.current = PHASE.MIM_CONFIRM;
  };

  const handleConfirmMim = () => {
    clearInterval(mimRef.current);
    const aboveReserve = mimPrice >= settings.reservePrice;
    setPhase(aboveReserve ? PHASE.SOLD_ABOVE : PHASE.SOLD_BELOW);
    phaseRef.current = aboveReserve ? PHASE.SOLD_ABOVE : PHASE.SOLD_BELOW;
  };

  const resumePrisometer = (fromPrice, fromTimeLeft) => {
    clearInterval(mimRef.current);
    setMimPrice(null);
    setPhase(PHASE.PRISOMETER);
    phaseRef.current = PHASE.PRISOMETER;

    const s = settingsRef.current;
    const floor = s.reservePrice * 0.9;
    const step = (s.startPrice - floor) / s.prisometerDuration;

    setPrisometerPrice(fromPrice);
    prisometerPriceRef.current = fromPrice;
    setPrisometerTimeLeft(fromTimeLeft);

    centRef.current = setInterval(() => setCents(Math.floor(Math.random() * 100)), 100);

    prisRef.current = setInterval(() => {
      if (phaseRef.current !== PHASE.PRISOMETER) { clearInterval(prisRef.current); return; }
      setPrisometerTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(prisRef.current);
          clearInterval(centRef.current);
          const cur = prisometerPriceRef.current;
          const bid = highestBidRef.current;
          if (bid > 0 && cur <= bid) {
            if (bid >= settingsRef.current.reservePrice) { setPhase(PHASE.SOLD_ABOVE); phaseRef.current = PHASE.SOLD_ABOVE; }
            else { setPhase(PHASE.SOLD_BELOW); phaseRef.current = PHASE.SOLD_BELOW; }
          } else {
            setPhase(PHASE.UNSOLD); phaseRef.current = PHASE.UNSOLD;
          }
          return 0;
        }
        return prev - 1;
      });
      setPrisometerPrice(prev => {
        const next = Math.max(floor, prev - step);
        prisometerPriceRef.current = next;
        const bid = highestBidRef.current;
        if (bid > 0 && next <= bid && phaseRef.current === PHASE.PRISOMETER) {
          clearInterval(prisRef.current);
          clearInterval(centRef.current);
          if (bid >= settingsRef.current.reservePrice) { setPhase(PHASE.SOLD_ABOVE); phaseRef.current = PHASE.SOLD_ABOVE; }
          else { setPhase(PHASE.SOLD_BELOW); phaseRef.current = PHASE.SOLD_BELOW; }
        }
        return next;
      });
    }, 1000);
  };

  const handleCancelMim = () => {
    resumePrisometer(savedPrisometerPrice, savedPrisometerTimeLeft);
  };

  const handleCancelMimExpired = () => {
    resumePrisometer(savedPrisometerPrice, savedPrisometerTimeLeft);
  };

  const reset = () => {
    clearAllTimers();
    setPhase(PHASE.SETUP);
    phaseRef.current = PHASE.SETUP;
    setHighestBid(0); highestBidRef.current = 0;
    setBidCount(0);
    setMimPrice(null);
    setPrisometerPrice(0);
    setShowSetup(true);
  };

  const phaseBadge = () => {
    if (phase === PHASE.FIRST_BIDS) return <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700"><Zap className="w-3 h-3" /> 1stBid$™ Preview</span>;
    if (phase === PHASE.PRISOMETER || phase === PHASE.MIM_CONFIRM) return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-red-300 bg-red-50 text-red-600">
        <motion.span animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.5, repeat:Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        PRI$OMETER™ Live
      </span>
    );
    if (phase === PHASE.SOLD_ABOVE || phase === PHASE.SOLD_BELOW) return <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border border-green-300 bg-green-50 text-green-700"><CheckCircle2 className="w-3 h-3" /> {phase === PHASE.SOLD_ABOVE ? "Sold" : "Pending Review"}</span>;
    if (phase === PHASE.UNSOLD) return <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground">Unsold</span>;
    return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">Demo Mode</span>;
  };

  return (
    <div className="bg-background">


      {/* Demo control bar */}
      <div className="border border-primary/20 bg-primary/5 rounded px-4 py-2.5 mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Demo Mode</span>

        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSetup(p => !p)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-semibold border border-primary/30 rounded px-3 py-1 transition-colors">
            <Settings className="w-3 h-3" /> {showSetup ? "Hide" : "Configure"}
          </button>
          {phase !== PHASE.SETUP && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1 transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Setup panel */}
      <AnimatePresence>
        {showSetup && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="overflow-hidden mb-4">
            <SetupPanel settings={settings} setSettings={setSettings} onStart={handleStart} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product Page Layout ── */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

        {/* Left: Gallery */}
        <div className="space-y-3 md:order-1 order-2">
          <div className="aspect-square rounded overflow-hidden bg-muted border border-border">
            <AnimatePresence mode="wait">
              <motion.img key={activeImage} src={DEMO_ITEM.images[activeImage]} alt={DEMO_ITEM.title}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}
                className="w-full h-full object-cover" />
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DEMO_ITEM.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)}
                className={`aspect-square rounded overflow-hidden border-2 transition-colors ${activeImage === i ? "border-primary" : "border-border hover:border-primary/50"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Item details below gallery */}
          <div className="space-y-2 pt-2">
            <button onClick={() => setDescOpen(o => !o)}
              className="w-full flex items-center justify-between py-3 border-b border-border text-sm font-semibold text-foreground hover:text-primary transition-colors">
              <span>About this lot</span>
              {descOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {descOpen && <p className="text-sm text-muted-foreground leading-relaxed pb-3">{DEMO_ITEM.description}</p>}

            <div className="py-3 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/60 mb-1">Dimensions</p>
              <p className="text-sm text-muted-foreground">{DEMO_ITEM.dimensions}</p>
            </div>
            <div className="py-3 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/60 mb-1">Condition</p>
              <p className="text-sm text-muted-foreground">{DEMO_ITEM.condition}</p>
            </div>
          </div>
        </div>

        {/* Right: Info + Bidding */}
        <div className="space-y-4 md:order-2 order-1">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground border border-border rounded px-2 py-0.5">{DEMO_ITEM.category}</span>
              {phaseBadge()}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground leading-tight">{DEMO_ITEM.title}</h1>
            <p className="text-sm text-muted-foreground">Offered by <span className="font-medium text-foreground">{DEMO_ITEM.seller}</span></p>
          </div>

          {/* Price module — always here, full width on mobile too */}
          {phase !== PHASE.SETUP && (
            <PriceModule
              phase={phase} settings={settings} timeLeft={timeLeft}
              prisometerPrice={prisometerPrice} cents={cents}
              highestBid={highestBid} bidCount={bidCount} mimTimeLeft={mimTimeLeft}
            />
          )}

          {/* Bid section — immediately below price module */}
          {phase !== PHASE.SETUP && (
            <BidSection
              phase={phase} settings={settings} prisometerPrice={prisometerPrice}
              highestBid={highestBid} bidCount={bidCount}
              mimTimeLeft={mimTimeLeft} mimPrice={mimPrice}
              onPlaceBid={handlePlaceBid}
              onMakeItMine={handleMakeItMine}
              onConfirmMim={handleConfirmMim}
              onCancelMim={handleCancelMim}
              onCancelMimExpired={handleCancelMimExpired}
            />
          )}

          {phase === PHASE.SETUP && (
            <div className="rounded border border-border bg-muted/30 p-8 text-center space-y-3">
              <Settings className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium text-foreground">Configure & Start the Demo</p>
              <p className="text-xs text-muted-foreground">Use the configuration panel above to set pricing and timing, then click Start.</p>
            </div>
          )}

          {/* Action row */}
          {(phase === PHASE.FIRST_BIDS || phase === PHASE.PRISOMETER) && (
            <div className="flex gap-3">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded px-4 py-2 transition-colors flex-1 justify-center">
                <Heart className="w-4 h-4" /> Save
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded px-4 py-2 transition-colors flex-1 justify-center">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          )}
          {(phase === PHASE.FIRST_BIDS || phase === PHASE.PRISOMETER) && (
            <button className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded px-4 py-2.5 transition-colors">
              <Bell className="w-4 h-4 text-amber-500" /> Price Alert
            </button>
          )}

          {/* Location */}
          {phase !== PHASE.SETUP && (
            <div className="rounded border border-border p-4 text-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-base shrink-0">📍</div>
              <div>
                <p className="font-medium text-foreground text-xs uppercase tracking-wider mb-0.5">Delivery Options</p>
                <p className="text-muted-foreground text-xs">{DEMO_ITEM.location}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">Shipping fees will be calculated by the seller after purchase.</p>
              </div>
            </div>
          )}

          {/* Terms */}
          {(phase === PHASE.FIRST_BIDS || phase === PHASE.PRISOMETER) && (
            <div className="rounded border border-border p-4">
              <button className="w-full flex items-center justify-between text-sm font-medium text-foreground">
                <span>Terms &amp; Conditions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}