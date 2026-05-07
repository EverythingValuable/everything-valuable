import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Zap, TrendingDown, ShoppingBag, RotateCcw, Timer,
  CheckCircle2, DollarSign, ChevronDown, ChevronUp, Gavel
} from "lucide-react";

const PHASE = {
  SETUP: "setup",
  FIRST_BIDS: "first_bids",
  PRISOMETER: "prisometer",
  SOLD_BID: "sold_bid",
  SOLD_MIM: "sold_mim",
  UNSOLD: "unsold",
};

const DEFAULT_SETTINGS = {
  startPrice: 2500,
  reservePrice: 1800,
  firstBidsDuration: 30, // seconds for demo
  prisometerDuration: 60, // seconds for demo
};

function formatPrice(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export default function AuctionSimulator() {
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [settingsInput, setSettingsInput] = useState({
    startPrice: "2500",
    reservePrice: "1800",
    firstBidsDuration: "30",
    prisometerDuration: "60",
  });

  // First Bids state
  const [timeLeft, setTimeLeft] = useState(0);
  const [bidInput, setBidInput] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [bids, setBids] = useState([]);
  const [bidError, setBidError] = useState("");

  // Prisometer state
  const [prisometerPrice, setPrisometerPrice] = useState(0);
  const [prisometerTimeLeft, setPrisometerTimeLeft] = useState(0);
  const [mimCountdown, setMimCountdown] = useState(null);
  const [soldPrice, setSoldPrice] = useState(null);
  const [log, setLog] = useState([]);

  const timerRef = useRef(null);
  const prisometerRef = useRef(null);
  const mimRef = useRef(null);

  const addLog = useCallback((msg, type = "info") => {
    setLog(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 12));
  }, []);

  // ---- SETUP → FIRST BIDS ----
  const startAuction = () => {
    const sp = Math.max(100, parseInt(settingsInput.startPrice) || 2500);
    const rp = Math.max(50, parseInt(settingsInput.reservePrice) || 1800);
    const fd = Math.max(10, parseInt(settingsInput.firstBidsDuration) || 30);
    const pd = Math.max(10, parseInt(settingsInput.prisometerDuration) || 60);
    setSettings({ startPrice: sp, reservePrice: rp, firstBidsDuration: fd, prisometerDuration: pd });
    setCurrentBid(0);
    setBids([]);
    setBidInput("");
    setBidError("");
    setLog([]);
    setTimeLeft(fd);
    setSoldPrice(null);
    setMimCountdown(null);
    setPhase(PHASE.FIRST_BIDS);
    addLog("🎯 1stBid$™ phase opened! Place your preview bids.", "start");
  };

  // Countdown for first bids
  useEffect(() => {
    if (phase !== PHASE.FIRST_BIDS) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFirstBidsEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleFirstBidsEnd = useCallback(() => {
    setCurrentBid(cur => {
      setSettings(s => {
        if (cur >= s.startPrice) {
          // Sold in first bids
          setSoldPrice(cur);
          setPhase(PHASE.SOLD_BID);
          addLog(`✅ High bid of ${formatPrice(cur)} meets or exceeds PRI$OMETER start price. SOLD!`, "success");
        } else {
          // Activate prisometer
          addLog(`⚡ High bid ${cur > 0 ? formatPrice(cur) : "none"} is below start price ${formatPrice(s.startPrice)}. PRI$OMETER activating!`, "warning");
          setPrisometerPrice(s.startPrice);
          setPrisometerTimeLeft(s.prisometerDuration);
          setPhase(PHASE.PRISOMETER);
        }
        return s;
      });
      return cur;
    });
  }, [addLog]);

  // Place bid during first bids
  const placeBid = () => {
    setBidError("");
    const amount = parseInt(bidInput.replace(/\D/g, ""));
    if (!amount || amount <= 0) { setBidError("Enter a valid bid amount."); return; }
    if (amount <= currentBid) { setBidError(`Bid must be higher than current high bid of ${formatPrice(currentBid)}.`); return; }
    setCurrentBid(amount);
    setBids(prev => [{ amount, time: new Date().toLocaleTimeString() }, ...prev]);
    setBidInput("");
    addLog(`💰 Bid placed: ${formatPrice(amount)}`, "bid");
  };

  // Prisometer tick
  useEffect(() => {
    if (phase !== PHASE.PRISOMETER) return;
    prisometerRef.current = setInterval(() => {
      setPrisometerPrice(cur => {
        setSettings(s => {
          setCurrentBid(bid => {
            const floor = s.reservePrice * ((100 - (s.below_reserve_percent || 10)) / 100);
            const range = s.startPrice - floor;
            const step = range / s.prisometerDuration;
            const next = Math.max(floor, cur - step);

            // Convergence check: price meets bid
            if (bid > 0 && next <= bid) {
              clearInterval(prisometerRef.current);
              if (bid >= s.reservePrice) {
                setSoldPrice(bid);
                setPhase(PHASE.SOLD_BID);
                addLog(`🏆 PRI$OMETER price converged with high bid ${formatPrice(bid)}. SOLD!`, "success");
              } else {
                setSoldPrice(bid);
                setPhase(PHASE.SOLD_BID);
                addLog(`📋 PRI$OMETER converged below reserve. Sale pending seller review.`, "warning");
              }
              return bid;
            }
            return bid;
          });
          return s;
        });

        setPrisometerTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(prisometerRef.current);
            setPhase(PHASE.UNSOLD);
            addLog("⏱ PRI$OMETER expired with no match. Item unsold.", "error");
            return 0;
          }
          return prev - 1;
        });

        return Math.max(0, cur - (settings.startPrice - settings.reservePrice * 0.9) / settings.prisometerDuration);
      });
    }, 1000);
    return () => clearInterval(prisometerRef.current);
  }, [phase]);

  // Make It Mine
  const makeItMine = () => {
    clearInterval(prisometerRef.current);
    setMimCountdown(10);
    addLog(`🛒 Make It Mine™ initiated at ${formatPrice(Math.round(prisometerPrice))}. Confirm in 10s!`, "bid");
  };

  useEffect(() => {
    if (mimCountdown === null) return;
    if (mimCountdown <= 0) {
      const price = Math.round(prisometerPrice);
      setSoldPrice(price);
      setPhase(PHASE.SOLD_MIM);
      addLog(`✅ Make It Mine™ confirmed at ${formatPrice(price)}. SOLD!`, "success");
      setMimCountdown(null);
      return;
    }
    mimRef.current = setTimeout(() => setMimCountdown(c => c - 1), 1000);
    return () => clearTimeout(mimRef.current);
  }, [mimCountdown]);

  const cancelMim = () => {
    clearTimeout(mimRef.current);
    setMimCountdown(null);
    setPhase(PHASE.PRISOMETER);
    addLog("❌ Make It Mine™ cancelled. PRI$OMETER resumes.", "info");
    // Restart prisometer
    setPrisometerTimeLeft(t => t);
    setPhase(PHASE.PRISOMETER);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    clearInterval(prisometerRef.current);
    clearTimeout(mimRef.current);
    setPhase(PHASE.SETUP);
    setLog([]);
    setBids([]);
    setCurrentBid(0);
    setMimCountdown(null);
    setSoldPrice(null);
  };

  // ---- Prisometer % progress ----
  const prisometerPercent = phase === PHASE.PRISOMETER
    ? Math.max(0, Math.min(100, ((prisometerPrice - settings.reservePrice * 0.9) / (settings.startPrice - settings.reservePrice * 0.9)) * 100))
    : 0;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-foreground px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Gavel className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-primary-foreground font-semibold text-sm">Live Demo Sandbox</div>
            <div className="text-primary-foreground/50 text-xs">No real bids · No account needed</div>
          </div>
        </div>
        {phase !== PHASE.SETUP && (
          <Button size="sm" variant="ghost" onClick={reset} className="text-primary-foreground/70 hover:text-primary-foreground gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">

        {/* LEFT: Item card */}
        <div className="p-6 space-y-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted">
            <img
              src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=400&h=300&fit=crop"
              alt="Demo item"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Fine Art · 19th Century</p>
            <h3 className="font-serif text-lg font-semibold text-foreground">Landscape Study in Oil</h3>
            <p className="text-xs text-muted-foreground mt-1">Continental School, c. 1880 · Oil on canvas · 18 × 24 in.</p>
          </div>

          {/* Phase badge */}
          <div>
            {phase === PHASE.SETUP && <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>}
            {phase === PHASE.FIRST_BIDS && <Badge className="bg-blue-500 text-white gap-1"><Zap className="w-3 h-3" /> 1stBid$™ Active</Badge>}
            {phase === PHASE.PRISOMETER && <Badge className="bg-amber-500 text-white gap-1"><TrendingDown className="w-3 h-3" /> PRI$OMETER™ Active</Badge>}
            {(phase === PHASE.SOLD_BID || phase === PHASE.SOLD_MIM) && <Badge className="bg-green-600 text-white gap-1"><CheckCircle2 className="w-3 h-3" /> Sold</Badge>}
            {phase === PHASE.UNSOLD && <Badge variant="destructive">Unsold</Badge>}
          </div>

          {/* Price display */}
          <div className="space-y-2">
            {phase === PHASE.SETUP && (
              <div className="text-sm text-muted-foreground">Configure settings →</div>
            )}
            {phase === PHASE.FIRST_BIDS && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">High Bid</span>
                  <span className="font-price font-semibold text-foreground">{currentBid > 0 ? formatPrice(currentBid) : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PRI$OMETER Starts At</span>
                  <span className="font-price text-foreground">{formatPrice(settings.startPrice)}</span>
                </div>
              </>
            )}
            {phase === PHASE.PRISOMETER && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="font-price font-bold text-amber-600 text-lg">{formatPrice(Math.round(prisometerPrice))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your High Bid</span>
                  <span className="font-price text-foreground">{currentBid > 0 ? formatPrice(currentBid) : "—"}</span>
                </div>
                {/* Gauge */}
                <div className="mt-2">
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                      style={{ width: `${prisometerPercent}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Floor</span><span>Start {formatPrice(settings.startPrice)}</span>
                  </div>
                </div>
              </>
            )}
            {(phase === PHASE.SOLD_BID || phase === PHASE.SOLD_MIM) && (
              <div className="text-center py-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div className="font-price text-2xl font-bold text-green-700">{soldPrice ? formatPrice(soldPrice) : ""}</div>
                <div className="text-xs text-green-600 mt-1">{phase === PHASE.SOLD_MIM ? "via Make It Mine™" : "via Bid Match"}</div>
              </div>
            )}
            {phase === PHASE.UNSOLD && (
              <div className="text-center py-3 bg-muted rounded-xl">
                <div className="text-sm text-muted-foreground">No sale · PRI$OMETER expired</div>
                <Button size="sm" onClick={reset} className="mt-2 gap-1"><RotateCcw className="w-3 h-3" /> Try Again</Button>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: Controls */}
        <div className="p-6 space-y-5">
          <AnimatePresence mode="wait">

            {/* SETUP */}
            {phase === PHASE.SETUP && (
              <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="font-serif text-lg font-semibold text-foreground">Configure the Scenario</h3>
                <p className="text-xs text-muted-foreground">Set the prices and timing, then start the auction to see it play out.</p>

                {[
                  { label: "PRI$OMETER Start Price ($)", key: "startPrice", hint: "Price where PRI$OMETER begins descending" },
                  { label: "Reserve Price ($)", key: "reservePrice", hint: "Seller's minimum acceptable price" },
                  { label: "1stBid$ Duration (seconds)", key: "firstBidsDuration", hint: "Preview phase length (10–120s for demo)" },
                  { label: "PRI$OMETER Duration (seconds)", key: "prisometerDuration", hint: "How long the price descends (10–120s)" },
                ].map(field => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-medium text-foreground">{field.label}</label>
                    <Input
                      type="number"
                      value={settingsInput[field.key]}
                      onChange={e => setSettingsInput(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="h-9 font-price"
                    />
                    <p className="text-xs text-muted-foreground">{field.hint}</p>
                  </div>
                ))}

                <Button onClick={startAuction} className="w-full bg-primary text-primary-foreground gap-2 h-10">
                  <Zap className="w-4 h-4" /> Start the Auction
                </Button>
              </motion.div>
            )}

            {/* FIRST BIDS */}
            {phase === PHASE.FIRST_BIDS && (
              <motion.div key="firstbids" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">1stBid$™ Phase</h3>
                    <p className="text-xs text-muted-foreground">Preview is open. Place bids now.</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-blue-600 font-price font-bold text-xl">
                      <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
                    </div>
                    <div className="text-xs text-muted-foreground">remaining</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(timeLeft / settings.firstBidsDuration) * 100}%` }}
                    transition={{ duration: 0.9 }}
                  />
                </div>

                <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To sell now:</span>
                    <span className="font-price font-semibold">{formatPrice(settings.startPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High bid:</span>
                    <span className="font-price font-semibold text-foreground">{currentBid > 0 ? formatPrice(currentBid) : "—"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Place a Bid ($)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={currentBid > 0 ? `> ${currentBid}` : "Enter amount"}
                      value={bidInput}
                      onChange={e => setBidInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && placeBid()}
                      className="font-price"
                    />
                    <Button onClick={placeBid} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                      <Gavel className="w-4 h-4" />
                    </Button>
                  </div>
                  {bidError && <p className="text-xs text-destructive">{bidError}</p>}
                  <p className="text-xs text-muted-foreground">Bid {formatPrice(settings.startPrice)} or more to win during preview.</p>
                </div>

                {/* Quick bid buttons */}
                <div className="flex flex-wrap gap-2">
                  {[500, 1000, 1500, 2000, 2500].filter(v => v > currentBid).slice(0, 4).map(v => (
                    <button
                      key={v}
                      onClick={() => { setBidInput(String(v)); setBidError(""); }}
                      className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors font-price"
                    >
                      {formatPrice(v)}
                    </button>
                  ))}
                </div>

                {bids.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Your Bids</div>
                    {bids.slice(0, 3).map((b, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-border/50">
                        <span className="text-muted-foreground">{b.time}</span>
                        <span className="font-price font-medium text-foreground">{formatPrice(b.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* PRISOMETER */}
            {phase === PHASE.PRISOMETER && (
              <motion.div key="prisometer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">PRI$OMETER™</h3>
                    <p className="text-xs text-muted-foreground">Price is dropping in real time.</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-600 font-price font-bold text-xl">
                      <Timer className="w-4 h-4" /> {formatTime(prisometerTimeLeft)}
                    </div>
                    <div className="text-xs text-muted-foreground">remaining</div>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(prisometerTimeLeft / settings.prisometerDuration) * 100}%` }}
                    transition={{ duration: 0.9 }}
                  />
                </div>

                {/* Animated price */}
                <motion.div
                  className="text-center bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl py-5"
                  key={Math.round(prisometerPrice)}
                  initial={{ scale: 1.04 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingDown className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <div className="font-price text-3xl font-bold text-amber-700">{formatPrice(Math.round(prisometerPrice))}</div>
                  <div className="text-xs text-amber-600/70 mt-1">Current price · drops every second</div>
                </motion.div>

                {/* Bid or MIM */}
                {mimCountdown === null ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Place a Bid ($)</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder={currentBid > 0 ? `> ${currentBid}` : "Enter amount"}
                          value={bidInput}
                          onChange={e => setBidInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && placeBid()}
                          className="font-price"
                        />
                        <Button onClick={placeBid} variant="outline" className="shrink-0">
                          <Gavel className="w-4 h-4" />
                        </Button>
                      </div>
                      {bidError && <p className="text-xs text-destructive">{bidError}</p>}
                      <p className="text-xs text-muted-foreground">Your bid stays active. If the price drops to meet it, you win.</p>
                    </div>

                    <Button onClick={makeItMine} className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2">
                      <ShoppingBag className="w-4 h-4" /> Make It Mine™ at {formatPrice(Math.round(prisometerPrice))}
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-700 rounded-xl p-5 text-center space-y-3"
                  >
                    <ShoppingBag className="w-6 h-6 text-green-600 mx-auto" />
                    <div className="font-serif text-base font-semibold text-foreground">Confirm Purchase</div>
                    <div className="font-price text-2xl font-bold text-green-700">{formatPrice(Math.round(prisometerPrice))}</div>
                    <div className="text-4xl font-bold text-green-600">{mimCountdown}</div>
                    <div className="text-xs text-muted-foreground">Confirming in {mimCountdown}s…</div>
                    <div className="flex gap-2">
                      <Button onClick={cancelMim} variant="outline" size="sm" className="flex-1">Cancel</Button>
                      <Button onClick={() => setMimCountdown(0)} size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">Confirm Now</Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* SOLD */}
            {(phase === PHASE.SOLD_BID || phase === PHASE.SOLD_MIM) && (
              <motion.div key="sold" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">Item Sold!</h3>
                  <p className="text-xs text-muted-foreground">
                    {phase === PHASE.SOLD_MIM ? "Purchased via Make It Mine™" : "Won via bid match"}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item Price</span>
                    <span className="font-price font-semibold">{soldPrice ? formatPrice(soldPrice) : ""}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee (13%)</span>
                    <span className="font-price">{soldPrice ? formatPrice(Math.round(soldPrice * 0.13)) : ""}</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary">
                    <span>Fee Credit (50%)</span>
                    <span className="font-price">-{soldPrice ? formatPrice(Math.round(soldPrice * 0.065)) : ""}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span className="text-sm">Est. Total</span>
                    <span className="font-price">{soldPrice ? formatPrice(Math.round(soldPrice * 1.065)) : ""}</span>
                  </div>
                </div>

                <Button onClick={reset} className="w-full gap-2" variant="outline">
                  <RotateCcw className="w-4 h-4" /> Try Another Scenario
                </Button>
              </motion.div>
            )}

            {/* UNSOLD */}
            {phase === PHASE.UNSOLD && (
              <motion.div key="unsold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
                <div className="text-4xl">⏱</div>
                <h3 className="font-serif text-lg font-semibold text-foreground">PRI$OMETER Expired</h3>
                <p className="text-sm text-muted-foreground">No buyer claimed the item before the timer ran out. The seller would review the outcome.</p>
                <Button onClick={reset} variant="outline" className="gap-2">
                  <RotateCcw className="w-3.5 h-3.5" /> Try Again
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT: Activity Log */}
        <div className="p-6 space-y-4">
          <h3 className="font-serif text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            Activity Log
          </h3>
          {log.length === 0 ? (
            <p className="text-xs text-muted-foreground">Events will appear here as the auction unfolds…</p>
          ) : (
            <div className="space-y-2">
              {log.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs p-2.5 rounded-lg border ${
                    entry.type === "success" ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300" :
                    entry.type === "bid" ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300" :
                    entry.type === "warning" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300" :
                    entry.type === "error" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300" :
                    entry.type === "start" ? "bg-primary/5 border-primary/20 text-foreground" :
                    "bg-muted/40 border-border text-muted-foreground"
                  }`}
                >
                  <div className="text-[10px] opacity-60 mb-0.5">{entry.time}</div>
                  {entry.msg}
                </motion.div>
              ))}
            </div>
          )}

          {/* Tip block */}
          <div className="mt-auto pt-4 border-t border-border space-y-2">
            <div className="text-xs font-medium text-muted-foreground">💡 Tips to explore</div>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Bid <strong>above</strong> the start price to win during 1stBid$™</li>
              <li>• Let the timer expire with a low bid to trigger PRI$OMETER</li>
              <li>• Use <strong>Make It Mine™</strong> to grab it while the price is still falling</li>
              <li>• Place a bid &amp; wait — price may drop to meet you automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}