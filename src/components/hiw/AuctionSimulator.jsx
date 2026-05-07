import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingDown, ShoppingBag, RotateCcw, Timer, CheckCircle2, Gavel } from "lucide-react";

const PHASE = { SETUP: "setup", FIRST_BIDS: "first_bids", PRISOMETER: "prisometer", SOLD_BID: "sold_bid", SOLD_MIM: "sold_mim", UNSOLD: "unsold" };

function formatPrice(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
}
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

// Fee structure matching the How It Works page: 13% upfront, 50% credited back
function calcFees(price) {
  const fee = Math.round(price * 0.13);
  const credit = Math.round(fee * 0.5);
  const invoiceBeforeShipping = price + fee - credit;
  const remaining = invoiceBeforeShipping - fee;
  return { fee, credit, invoiceBeforeShipping, remaining };
}

export default function AuctionSimulator() {
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [settings, setSettings] = useState({ startPrice: 2500, reservePrice: 1800, firstBidsDuration: 30, prisometerDuration: 60 });
  const [settingsInput, setSettingsInput] = useState({ startPrice: "2500", reservePrice: "1800", firstBidsDuration: "30", prisometerDuration: "60" });
  const [timeLeft, setTimeLeft] = useState(0);
  const [bidInput, setBidInput] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [bids, setBids] = useState([]);
  const [bidError, setBidError] = useState("");
  const [prisometerPrice, setPrisometerPrice] = useState(0);
  const [prisometerTimeLeft, setPrisometerTimeLeft] = useState(0);
  const [mimCountdown, setMimCountdown] = useState(null);
  const [mimPrice, setMimPrice] = useState(null);
  const [soldPrice, setSoldPrice] = useState(null);
  const [soldViaPreview, setSoldViaPreview] = useState(false);
  const [log, setLog] = useState([]);

  const timerRef = useRef(null);
  const prisometerRef = useRef(null);
  const mimRef = useRef(null);
  const settingsRef = useRef(settings);
  const prisometerPriceRef = useRef(0);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { prisometerPriceRef.current = prisometerPrice; }, [prisometerPrice]);

  const addLog = useCallback((msg, type = "info") => {
    setLog(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  }, []);

  const startAuction = () => {
    const sp = Math.max(100, parseInt(settingsInput.startPrice) || 2500);
    const rp = Math.max(50, parseInt(settingsInput.reservePrice) || 1800);
    const fd = Math.max(10, parseInt(settingsInput.firstBidsDuration) || 30);
    const pd = Math.max(10, parseInt(settingsInput.prisometerDuration) || 60);
    const s = { startPrice: sp, reservePrice: rp, firstBidsDuration: fd, prisometerDuration: pd };
    setSettings(s);
    settingsRef.current = s;
    setCurrentBid(0); setBids([]); setBidInput(""); setBidError(""); setLog([]); setSoldPrice(null); setMimCountdown(null); setMimPrice(null); setSoldViaPreview(false);
    setTimeLeft(fd);
    setPhase(PHASE.FIRST_BIDS);
    addLog("1stBid$™ preview phase is open. Place your bids.", "start");
  };

  useEffect(() => {
    if (phase !== PHASE.FIRST_BIDS) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Read current bid from ref via setState callback trick
          setCurrentBid(cur => {
            const s = settingsRef.current;
            if (cur >= s.startPrice) {
              setSoldPrice(cur);
              setSoldViaPreview(true);
              setTimeout(() => setPhase(PHASE.SOLD_BID), 0);
              addLog(`High bid of ${formatPrice(cur)} met the start price. Item sold during preview!`, "success");
            } else {
              addLog(`Preview ended. High bid ${cur > 0 ? formatPrice(cur) : "none"} is below start price. PRI$OMETER™ activating…`, "warning");
              const sp = s.startPrice;
              setPrisometerPrice(sp);
              prisometerPriceRef.current = sp;
              setPrisometerTimeLeft(s.prisometerDuration);
              setTimeout(() => setPhase(PHASE.PRISOMETER), 0);
            }
            return cur;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const placeBid = () => {
    setBidError("");
    const amount = parseInt(bidInput.replace(/\D/g, ""));
    if (!amount || amount <= 0) { setBidError("Please enter a valid bid amount."); return; }
    if (amount <= currentBid) { setBidError(`Bid must exceed current high bid of ${formatPrice(currentBid)}.`); return; }
    setCurrentBid(amount);
    setBids(prev => [{ amount, time: new Date().toLocaleTimeString() }, ...prev]);
    setBidInput("");
    addLog(`Bid placed: ${formatPrice(amount)}`, "bid");
  };

  useEffect(() => {
    if (phase !== PHASE.PRISOMETER) return;
    const s = settingsRef.current;
    const floor = s.reservePrice * 0.9;
    const step = (s.startPrice - floor) / s.prisometerDuration;

    prisometerRef.current = setInterval(() => {
      setPrisometerTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(prisometerRef.current);
          addLog("PRI$OMETER expired. No buyer claimed the item.", "error");
          setTimeout(() => setPhase(PHASE.UNSOLD), 0);
          return 0;
        }
        return prev - 1;
      });

      setPrisometerPrice(cur => {
        const next = Math.max(floor, cur - step);
        prisometerPriceRef.current = next;
        setCurrentBid(bid => {
          if (bid > 0 && next <= bid) {
            clearInterval(prisometerRef.current);
            const finalPrice = bid;
            setSoldPrice(finalPrice);
            if (bid >= s.reservePrice) {
              addLog(`PRI$OMETER price met your bid of ${formatPrice(finalPrice)}. Sold!`, "success");
            } else {
              addLog(`PRI$OMETER converged below reserve at ${formatPrice(finalPrice)}. Pending seller review.`, "warning");
            }
            setTimeout(() => setPhase(PHASE.SOLD_BID), 0);
          }
          return bid;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(prisometerRef.current);
  }, [phase]);

  const makeItMine = () => {
    clearInterval(prisometerRef.current);
    const price = Math.round(prisometerPriceRef.current);
    setMimPrice(price);
    setMimCountdown(10);
    addLog(`Make It Mine™ initiated at ${formatPrice(price)}. Confirm within 10s.`, "bid");
  };

  useEffect(() => {
    if (mimCountdown === null) return;
    if (mimCountdown <= 0) {
      setSoldPrice(mimPrice);
      setPhase(PHASE.SOLD_MIM);
      addLog(`Make It Mine™ confirmed at ${formatPrice(mimPrice)}. Sold!`, "success");
      setMimCountdown(null);
      return;
    }
    mimRef.current = setTimeout(() => setMimCountdown(c => c - 1), 1000);
    return () => clearTimeout(mimRef.current);
  }, [mimCountdown, mimPrice]);

  const cancelMim = () => {
    clearTimeout(mimRef.current);
    setMimCountdown(null);
    setMimPrice(null);
    addLog("Make It Mine™ cancelled. PRI$OMETER continuing.", "info");
    // Restart prisometer from current state
    setPhase(prev => {
      setTimeout(() => setPhase(PHASE.PRISOMETER), 10);
      return PHASE.SETUP; // brief flicker workaround
    });
    setTimeout(() => setPhase(PHASE.PRISOMETER), 20);
  };

  const reset = () => {
    clearInterval(timerRef.current); clearInterval(prisometerRef.current); clearTimeout(mimRef.current);
    setPhase(PHASE.SETUP); setLog([]); setBids([]); setCurrentBid(0); setMimCountdown(null); setMimPrice(null); setSoldPrice(null);
  };

  const prisometerPercent = phase === PHASE.PRISOMETER
    ? Math.max(0, Math.min(100, ((prisometerPrice - settings.reservePrice * 0.9) / (settings.startPrice - settings.reservePrice * 0.9)) * 100))
    : 0;

  const quickBids = [500, 1000, 1500, 2000, 2500, 3000].filter(v => v > currentBid).slice(0, 4);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">

      {/* ── Header ── */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-secondary/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Gavel className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-display font-semibold text-sm text-foreground">Interactive Demo Sandbox</div>
            <div className="text-xs text-muted-foreground">No real bids · No account required</div>
          </div>
        </div>
        {phase !== PHASE.SETUP && (
          <Button size="sm" variant="ghost" onClick={reset} className="text-muted-foreground hover:text-foreground gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">

        {/* ── LEFT: Item ── */}
        <div className="p-6 space-y-4">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border/50">
            <img src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=500&h=375&fit=crop" alt="Demo item" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Fine Art · 19th Century</p>
            <h3 className="font-serif text-xl font-semibold text-foreground leading-snug">Landscape Study in Oil</h3>
            <p className="text-xs text-muted-foreground">Continental School, c. 1880 · Oil on canvas · 18 × 24 in.</p>
          </div>

          {/* Phase pill */}
          <div>
            {phase === PHASE.SETUP && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">Not started</span>
            )}
            {phase === PHASE.FIRST_BIDS && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 border-primary/30 bg-primary/5 text-primary">
                <Zap className="w-3 h-3" /> 1stBid$™ Active
              </span>
            )}
            {phase === PHASE.PRISOMETER && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 border-amber-300 bg-amber-50 text-amber-700">
                <TrendingDown className="w-3 h-3" /> PRI$OMETER™ Active
              </span>
            )}
            {(phase === PHASE.SOLD_BID || phase === PHASE.SOLD_MIM) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 border-green-300 bg-green-50 text-green-700">
                <CheckCircle2 className="w-3 h-3" /> Sold
              </span>
            )}
            {phase === PHASE.UNSOLD && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 border-border bg-muted text-muted-foreground">
                Unsold
              </span>
            )}
          </div>

          {/* Live price info */}
          <div className="space-y-2 pt-1">
            {phase === PHASE.SETUP && (
              <p className="text-xs text-muted-foreground italic">Configure the scenario and start the auction →</p>
            )}
            {phase === PHASE.FIRST_BIDS && (
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                  <span className="text-muted-foreground">High Bid</span>
                  <span className="font-price font-semibold text-foreground">{currentBid > 0 ? formatPrice(currentBid) : "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-muted-foreground">PRI$OMETER Starts At</span>
                  <span className="font-price text-foreground">{formatPrice(settings.startPrice)}</span>
                </div>
              </div>
            )}
            {phase === PHASE.PRISOMETER && (
              <div className="space-y-3">
                <div className="flex justify-between items-baseline py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <span className="font-price font-bold text-xl text-amber-600">{formatPrice(Math.round(prisometerPrice))}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Your Bid</span>
                  <span className="font-price text-foreground">{currentBid > 0 ? formatPrice(currentBid) : "—"}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div className="h-full bg-primary rounded-full" style={{ width: `${prisometerPercent}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Floor</span><span>Start {formatPrice(settings.startPrice)}</span>
                  </div>
                </div>
              </div>
            )}
            {(phase === PHASE.SOLD_BID || phase === PHASE.SOLD_MIM) && (
              <div className="text-center py-4 rounded-lg border border-border/50 bg-secondary/30 space-y-1">
                <CheckCircle2 className="w-7 h-7 text-primary mx-auto" />
                <div className="font-price text-2xl font-bold text-foreground">{soldPrice ? formatPrice(soldPrice) : ""}</div>
                <div className="text-xs text-muted-foreground">{phase === PHASE.SOLD_MIM ? "via Make It Mine™" : "via Bid Match"}</div>
              </div>
            )}
            {phase === PHASE.UNSOLD && (
              <div className="text-center py-4 rounded-lg border border-border/50 bg-secondary/30">
                <div className="text-sm text-muted-foreground mb-3">No sale · PRI$OMETER expired</div>
                <Button size="sm" variant="outline" onClick={reset} className="gap-1.5 text-xs"><RotateCcw className="w-3 h-3" /> Try Again</Button>
              </div>
            )}
          </div>
        </div>

        {/* ── MIDDLE: Controls ── */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* SETUP */}
            {phase === PHASE.SETUP && (
              <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">Configure the Scenario</h3>
                  <p className="text-xs text-muted-foreground mt-1">Set pricing and timing, then start the auction.</p>
                </div>

                {[
                  { label: "PRI$OMETER Start Price", key: "startPrice", hint: "Where the descending price begins" },
                  { label: "Reserve Price", key: "reservePrice", hint: "Seller's minimum — hidden from buyers" },
                  { label: "1stBid$™ Duration (seconds)", key: "firstBidsDuration", hint: "Preview bidding window (10–120s)" },
                  { label: "PRI$OMETER Duration (seconds)", key: "prisometerDuration", hint: "How long the price drops (10–120s)" },
                ].map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{field.label}</label>
                    <Input
                      type="number"
                      value={settingsInput[field.key]}
                      onChange={e => setSettingsInput(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="h-9 font-price text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">{field.hint}</p>
                  </div>
                ))}

                <Button onClick={startAuction} className="w-full gap-2 h-10 rounded-lg">
                  <Zap className="w-4 h-4" /> Start the Auction
                </Button>
              </motion.div>
            )}

            {/* FIRST BIDS */}
            {phase === PHASE.FIRST_BIDS && (
              <motion.div key="firstbids" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-foreground">1stBid$™ Preview</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Place preview bids before live pricing begins.</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-price font-bold text-lg text-primary flex items-center gap-1 justify-end">
                      <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">remaining</div>
                  </div>
                </div>

                <div className="w-full h-1 rounded-full bg-border overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" style={{ width: `${(timeLeft / settings.firstBidsDuration) * 100}%` }} transition={{ duration: 0.9 }} />
                </div>

                <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bid this to win now</span>
                    <span className="font-price font-semibold text-foreground">{formatPrice(settings.startPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current high bid</span>
                    <span className="font-price font-semibold text-foreground">{currentBid > 0 ? formatPrice(currentBid) : "—"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Enter Your Bid ($)</label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder={currentBid > 0 ? `Above ${currentBid}` : "e.g. 1200"} value={bidInput} onChange={e => setBidInput(e.target.value)} onKeyDown={e => e.key === "Enter" && placeBid()} className="font-price text-sm" />
                    <Button onClick={placeBid} className="shrink-0 px-3"><Gavel className="w-4 h-4" /></Button>
                  </div>
                  {bidError && <p className="text-xs text-destructive">{bidError}</p>}
                </div>

                {quickBids.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground">Quick select</p>
                    <div className="flex flex-wrap gap-2">
                      {quickBids.map(v => (
                        <button key={v} onClick={() => { setBidInput(String(v)); setBidError(""); }}
                          className="text-xs px-3 py-1.5 rounded-md border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors font-price">
                          {formatPrice(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {bids.length > 0 && (
                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <p className="text-[11px] text-muted-foreground font-medium">Bids placed</p>
                    {bids.slice(0, 3).map((b, i) => (
                      <div key={i} className="flex justify-between text-xs py-1">
                        <span className="text-muted-foreground">{b.time}</span>
                        <span className="font-price text-foreground font-medium">{formatPrice(b.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* PRISOMETER */}
            {phase === PHASE.PRISOMETER && (
              <motion.div key="prisometer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-foreground">PRI$OMETER™</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Price descends toward the market in real time.</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-price font-bold text-lg text-amber-600 flex items-center gap-1 justify-end">
                      <Timer className="w-4 h-4" /> {formatTime(prisometerTimeLeft)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">remaining</div>
                  </div>
                </div>

                <div className="w-full h-1 rounded-full bg-border overflow-hidden">
                  <motion.div className="h-full bg-amber-500 rounded-full" style={{ width: `${(prisometerTimeLeft / settings.prisometerDuration) * 100}%` }} transition={{ duration: 0.9 }} />
                </div>

                {/* Dropping price display */}
                <div className="rounded-lg border border-border/50 bg-secondary/30 py-5 text-center">
                  <TrendingDown className="w-5 h-5 text-primary mx-auto mb-2" />
                  <AnimatePresence mode="wait">
                    <motion.div key={Math.round(prisometerPrice)} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="font-price text-4xl font-bold text-foreground tracking-tight">
                      {formatPrice(Math.round(prisometerPrice))}
                    </motion.div>
                  </AnimatePresence>
                  <p className="text-[11px] text-muted-foreground mt-1">Current price · drops every second</p>
                </div>

                {mimCountdown === null ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Enter a Bid ($)</label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder={currentBid > 0 ? `Above ${currentBid}` : "e.g. 1400"} value={bidInput} onChange={e => setBidInput(e.target.value)} onKeyDown={e => e.key === "Enter" && placeBid()} className="font-price text-sm" />
                        <Button onClick={placeBid} variant="outline" className="shrink-0 px-3"><Gavel className="w-4 h-4" /></Button>
                      </div>
                      {bidError && <p className="text-xs text-destructive">{bidError}</p>}
                      <p className="text-[11px] text-muted-foreground">Set your price — if the PRI$OMETER drops to meet it, you win automatically.</p>
                    </div>

                    <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex-1 h-px bg-border" /><span>or</span><div className="flex-1 h-px bg-border" />
                    </div>

                    <Button onClick={makeItMine} className="w-full gap-2 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                      <ShoppingBag className="w-4 h-4" /> Make It Mine™ — {formatPrice(Math.round(prisometerPrice))}
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center">Buy instantly at the current price. A 10-second confirmation window will open.</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-border bg-secondary/40 p-5 text-center space-y-3">
                    <ShoppingBag className="w-6 h-6 text-primary mx-auto" />
                    <div className="font-serif text-base font-semibold text-foreground">Confirm Purchase</div>
                    <div className="font-price text-2xl font-bold text-foreground">{mimPrice ? formatPrice(mimPrice) : ""}</div>
                    <div className="font-price text-4xl font-bold text-primary">{mimCountdown}</div>
                    <p className="text-xs text-muted-foreground">Confirming automatically in {mimCountdown}s</p>
                    <div className="flex gap-2 pt-1">
                      <Button onClick={cancelMim} variant="outline" size="sm" className="flex-1 text-xs">Cancel</Button>
                      <Button onClick={() => setMimCountdown(0)} size="sm" className="flex-1 text-xs">Confirm Now</Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* SOLD */}
            {(phase === PHASE.SOLD_BID || phase === PHASE.SOLD_MIM) && (
              <motion.div key="sold" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="text-center space-y-2 py-2">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h3 className="font-serif text-2xl font-semibold text-foreground">Sold</h3>
                  <p className="text-xs text-muted-foreground">
                    {phase === PHASE.SOLD_MIM ? "Purchased via Make It Mine™" : soldViaPreview ? "Won during 1stBid$™ preview — PRI$OMETER never activated" : "Won via PRI$OMETER bid match"}
                  </p>
                </div>

                {/* Fee breakdown — matching the How It Works page exactly */}
                {soldPrice && (() => {
                  const { fee, credit, invoiceBeforeShipping, remaining } = calcFees(soldPrice);
                  return (
                    <div className="rounded-lg border border-border/50 p-4 space-y-2 bg-secondary/20">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Fee Breakdown</h4>
                      <div className="flex justify-between text-sm py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Item Price</span>
                        <span className="font-price font-semibold text-foreground">{formatPrice(soldPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Service Fee Paid Upfront (13%)</span>
                        <span className="font-price text-foreground">{formatPrice(fee)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-border/50 bg-primary/5 px-2 rounded">
                        <span className="text-sm text-foreground font-medium">Fee Credit Applied (50%)</span>
                        <span className="font-price text-primary font-medium">-{formatPrice(credit)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Final Invoice Before Shipping/Taxes</span>
                        <span className="font-price font-semibold text-foreground">{formatPrice(invoiceBeforeShipping)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 text-muted-foreground">
                        <span>Amount Already Paid (Fee)</span>
                        <span className="font-price">-{formatPrice(fee)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-sm font-semibold text-foreground">Remaining Balance Due</span>
                        <span className="font-price font-bold text-lg text-foreground">{formatPrice(remaining)}</span>
                      </div>
                    </div>
                  );
                })()}

                <Button onClick={reset} variant="outline" className="w-full gap-2 text-sm">
                  <RotateCcw className="w-3.5 h-3.5" /> Try Another Scenario
                </Button>
              </motion.div>
            )}

            {/* UNSOLD */}
            {phase === PHASE.UNSOLD && (
              <motion.div key="unsold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center mx-auto">
                  <Timer className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">PRI$OMETER Expired</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">No buyer claimed the item before time ran out. The seller would review the outcome and may relist.</p>
                <Button onClick={reset} variant="outline" className="gap-2 text-sm">
                  <RotateCcw className="w-3.5 h-3.5" /> Try Again
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── RIGHT: Activity Log ── */}
        <div className="p-6 space-y-4 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <h3 className="font-display text-sm font-semibold text-foreground">Activity Log</h3>
          </div>

          {log.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Events will appear here as the auction plays out…</p>
          ) : (
            <div className="space-y-2 flex-1">
              {log.map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  className={`text-xs p-2.5 rounded-lg border ${
                    entry.type === "success" ? "bg-primary/5 border-primary/20 text-foreground" :
                    entry.type === "bid" ? "bg-secondary border-border text-foreground" :
                    entry.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
                    entry.type === "error" ? "bg-destructive/5 border-destructive/20 text-destructive" :
                    entry.type === "start" ? "bg-secondary/60 border-border text-foreground" :
                    "bg-muted/40 border-border/50 text-muted-foreground"
                  }`}>
                  <div className="text-[10px] text-muted-foreground mb-0.5">{entry.time}</div>
                  {entry.msg}
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-border space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Scenarios to try</p>
            <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <li className="flex gap-1.5"><span className="text-primary shrink-0">→</span> Bid at or above the start price to win during 1stBid$™</li>
              <li className="flex gap-1.5"><span className="text-primary shrink-0">→</span> Bid low, let the timer expire, watch PRI$OMETER activate</li>
              <li className="flex gap-1.5"><span className="text-primary shrink-0">→</span> Set a bid and wait — price may drop to meet it</li>
              <li className="flex gap-1.5"><span className="text-primary shrink-0">→</span> Use Make It Mine™ to claim the item instantly</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}