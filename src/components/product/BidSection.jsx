import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Gavel, ShoppingBag, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import FeeBreakdownDisplay from "./FeeBreakdownDisplay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONFIRM_SECONDS = 120;

export default function BidSection({ item, onMakeItMine, onCancel }) {
  const [bidAmount, setBidAmount] = useState("");
  const [customBid, setCustomBid] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [lockedPrice, setLockedPrice] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null); // null | 'above' | 'below'
  const [timeLeft, setTimeLeft] = useState(CONFIRM_SECONDS);
  const [showTiers, setShowTiers] = useState(false);
  const [livePriceTick, setLivePriceTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const priceTickRef = useRef(null);
  const queryClient = useQueryClient();

  // Re-evaluate live price every 5 seconds so bid options stay current (unless paused)
  useEffect(() => {
    if (item.status !== "prisometer" || isPaused) return;
    priceTickRef.current = setInterval(() => setLivePriceTick(t => t + 1), 5000);
    return () => clearInterval(priceTickRef.current);
  }, [item.status, isPaused]);
  const { toast } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ["sellerProfile", item?.seller_email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: item?.seller_email }).then(p => p[0]),
    enabled: !!item?.seller_email,
  });

  // Start countdown when confirm panel opens
  useEffect(() => {
    if (!showConfirm) return;
    setTimeLeft(CONFIRM_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleCancel();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [showConfirm]);

  const placeBidMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(bidAmount);

      if (!amount || amount % 100 !== 0) {
        throw new Error("Bid must be a multiple of $100");
      }
      const currentHighest = item.highest_bid || 0;
      if (amount <= currentHighest) {
        throw new Error(`Bid must be higher than current high bid of $${currentHighest.toLocaleString()}`);
      }

      await base44.entities.Bid.create({ item_id: item.id, amount, phase: item.status });
      await base44.entities.Item.update(item.id, {
        highest_bid: amount,
        highest_bidder_email: currentUser?.email,
        bid_count: (item.bid_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", item.id] });
      queryClient.invalidateQueries({ queryKey: ["bids", item.id] });
      setBidSuccess(true);
      setBidAmount("");
      setCustomBid("");
    },
    onError: (err) => {
      toast({ title: "Bid failed", description: err.message, variant: "destructive" });
    },
  });

  const getLivePrice = () => {
    if (item.prisometer_activated_at && item.prisometer_duration_hours && item.prisometer_start_price) {
      const startTime = new Date(item.prisometer_activated_at).getTime();
      const startPrice = item.prisometer_start_price;
      const reservePrice = item.reserve_price || startPrice * 0.5;
      const belowPercent = item.below_reserve_percent || 10;
      const floorPrice = reservePrice * (1 - belowPercent / 100);
      const durationMs = item.prisometer_duration_hours * 3600000;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      return Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice);
    }
    return item.current_price || item.prisometer_start_price;
  };

  const handleOpenConfirm = async () => {
    const price = getLivePrice();
    setLockedPrice(price);
    setIsPaused(true);
    if (onMakeItMine) onMakeItMine();
    // Pause the prisometer and save the locked price
    const expires = new Date(Date.now() + CONFIRM_SECONDS * 1000).toISOString();
    try {
      await base44.entities.Item.update(item.id, {
        make_it_mine_active: true,
        make_it_mine_expires: expires,
        current_price: price,
      });
      queryClient.invalidateQueries({ queryKey: ["item", item.id] });
    } catch (error) {
      console.warn("Could not update item state (may be demo data):", error.message);
    }
    setShowConfirm(true);
  };

  const handleCancel = async () => {
    clearInterval(timerRef.current);
    setShowConfirm(false);
    setLockedPrice(null);
    setConfirmResult(null);
    setIsPaused(false);
    if (onCancel) onCancel();
    try {
      await base44.entities.Item.update(item.id, {
        make_it_mine_active: false,
        make_it_mine_expires: null,
      });
      queryClient.invalidateQueries({ queryKey: ["item", item.id] });
    } catch (error) {
      console.warn("Could not update item state (may be demo data):", error.message);
    }
  };

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const price = lockedPrice;
      const serviceFee = price * 0.10 + 30; // 10% + $30
      const feeCredit = serviceFee * 0.50;
      const aboveReserve = price >= (item.reserve_price || 0);

      try {
        await base44.entities.Item.update(item.id, {
          status: aboveReserve ? "sold" : "pending_review",
          sold_price: aboveReserve ? price : undefined,
          sold_via: aboveReserve ? "make_it_mine" : undefined,
          make_it_mine_active: false,
          make_it_mine_expires: null,
          make_it_mine_buyer: "buyer@current.user",
        });
        await base44.entities.Invoice.create({
          item_id: item.id,
          buyer_email: "buyer@current.user",
          seller_email: item.seller_email,
          item_price: price,
          service_fee: serviceFee,
          fee_credit: feeCredit,
          purchase_method: "make_it_mine",
          status: aboveReserve ? "pending" : "pending",
        });
        } catch (error) {
        console.warn("Could not create database records (may be demo data):", error.message);
        }
        return { aboveReserve, price, serviceFee, feeCredit };
    },
    onSuccess: ({ aboveReserve }) => {
      clearInterval(timerRef.current);
      queryClient.invalidateQueries({ queryKey: ["item", item.id] });
      setConfirmResult(aboveReserve ? "above" : "below");
    },
  });

  const getMinBidIncrement = (currentBid, sellerTiers) => {
    if (!sellerTiers || !Array.isArray(sellerTiers)) return 1;
    const tier = sellerTiers.find(t => currentBid >= t.min && currentBid <= t.max);
    return tier ? tier.increment : 1;
  };

  const getTierInfo = () => {
    const currentHighestBid = item.highest_bid || 0;
    const tiers = sellerProfile?.bid_increment_tiers || [];
    return tiers.length > 0 ? tiers : [{ min: 0, max: 999999999, increment: 1 }];
  };

  const generateBidOptions = () => {
    const options = [];
    const currentHighest = item.highest_bid || 0;
    const sellerTiers = sellerProfile?.bid_increment_tiers || item.seller_bid_increment_tiers;
    const increment = getMinBidIncrement(currentHighest, sellerTiers);
    let start = currentHighest > 0 ? currentHighest + increment : (startingBid || increment);

    // For prisometer phase, cap options at (or below) the live current price
    const livePrice = item.status === "prisometer" ? Math.floor(getLivePrice()) : Infinity;

    let val = start;
    while (val <= livePrice && options.length < 200) {
      options.push(val);
      const nextIncrement = getMinBidIncrement(val, sellerTiers);
      if (!nextIncrement || nextIncrement <= 0) break; // guard against infinite loop
      val = val + nextIncrement;
    }
    return options;
  };

  const canBid = item.status === "first_bids" || item.status === "prisometer";
  const canMakeItMine = item.status === "prisometer" && !item.make_it_mine_active;
  const currentPrice = item.current_price || item.prisometer_start_price;
  const currentHighestBid = item.highest_bid || 0;
  const sellerTiers = sellerProfile?.bid_increment_tiers || item.seller_bid_increment_tiers;
  const increment = getMinBidIncrement(currentHighestBid, sellerTiers);
  const startingBid = item.estimated_low ? item.estimated_low / 2 : 0;
  const minBid = currentHighestBid > 0 ? currentHighestBid + increment : startingBid;

  const price = lockedPrice || currentPrice;
  const serviceFee = price * 0.10 + 30; // 10% + $30
  const feeCredit = serviceFee * 0.50;
  const aboveReserve = price >= (item.reserve_price || 0);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor = timeLeft <= 30 ? "text-red-500" : "text-primary";
  
  const isHighestBidder = currentUser && item.highest_bidder_email === currentUser.email;

  if (item.status === "sold") {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
        <p className="font-serif text-xl font-semibold">Sold</p>
        <p className="text-sm text-muted-foreground">
          Final price: ${item.sold_price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* You're the highest bidder banner */}
      {isHighestBidder && currentHighestBid > 0 && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 flex items-center gap-3">
          <Crown className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">You're the Highest Bidder</p>
            <p className="text-xs text-muted-foreground">Your current bid: ${currentHighestBid.toLocaleString("en-US")}</p>
          </div>
        </div>
      )}

      {/* Make It Mine button */}
      {canMakeItMine && !showConfirm && !bidSuccess && (
        <Button
          onClick={handleOpenConfirm}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-semibold gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Make It Mine
        </Button>
      )}

      {/* Place a Bid */}
      {canBid && !showConfirm && !bidSuccess && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Place a Bid</span>
          </div>
          <div className="flex gap-2">
            <Select value={bidAmount} onValueChange={(val) => setBidAmount(val)}>
              <SelectTrigger className="flex-1 h-11">
                <SelectValue placeholder={`Min: $${minBid.toLocaleString()}`} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {generateBidOptions().map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    ${option.toLocaleString("en-US")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => placeBidMutation.mutate()}
              disabled={!bidAmount || placeBidMutation.isPending}
              className="h-11 px-6 bg-foreground text-background hover:bg-foreground/90"
            >
              {placeBidMutation.isPending ? "Placing..." : "Bid"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Choose from suggested amounts or enter a custom bid</p>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Or Enter Custom Bid</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter custom amount"
                value={customBid}
                onChange={(e) => setCustomBid(e.target.value.replace(/\D/g, ""))}
                className="flex-1 h-10 px-3 border border-input rounded-md bg-background text-foreground text-sm"
              />
              <Button
                onClick={() => {
                  const amt = parseInt(customBid) || 0;
                  if (amt > 0) {
                    setBidAmount(amt.toString());
                    setCustomBid("");
                  } else {
                    toast({ title: "Invalid bid", description: "Enter a valid amount", variant: "destructive" });
                  }
                }}
                disabled={!customBid}
                className="h-10 px-4 bg-foreground text-background hover:bg-foreground/90 text-sm"
              >
                Submit
              </Button>
            </div>
          </div>

          {bidAmount && (
            <FeeBreakdownDisplay 
              amount={parseInt(bidAmount)} 
              onConfirmBid={() => placeBidMutation.mutate()}
              onCancel={() => { setBidAmount(""); setCustomBid(""); }}
            />
          )}
        </div>
      )}

          {/* Bid Increments */}
      {canBid && !showConfirm && !bidSuccess && sellerProfile?.bid_increment_tiers?.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setShowTiers(t => !t)}
            className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <span>Bid Increment Schedule</span>
            {showTiers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showTiers && (
            <div className="border-t border-border px-5 py-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-1.5 font-medium">Price Range</th>
                    <th className="text-right py-1.5 font-medium">Increment</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerProfile.bid_increment_tiers.map((tier, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="py-1.5 text-foreground">
                        ${tier.min.toLocaleString()} – {tier.max >= 999999999 ? "+" : `$${tier.max.toLocaleString()}`}
                      </td>
                      <td className="py-1.5 text-right font-medium text-foreground">
                        ${tier.increment.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bid Success Screen */}
      {bidSuccess && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-8 space-y-5 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-semibold">You're the Highest Bidder!</h3>
            <p className="text-sm text-muted-foreground">Your bid of ${parseFloat(bidAmount || item.highest_bid).toLocaleString("en-US")} has been confirmed</p>
          </div>
          <div className="bg-card/50 border border-border rounded-lg p-4 text-sm space-y-2">
            <p className="text-muted-foreground">Check your email for confirmation and stay tuned for updates</p>
          </div>
          <Button
            onClick={() => setBidSuccess(false)}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue Browsing
          </Button>
        </div>
      )}

      {/* Make It Mine result screen */}
      {confirmResult && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-8 space-y-5 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-semibold">Your Offer Has Been Placed!</h3>
            <p className="text-sm text-muted-foreground">Please check your email for confirmation and next steps</p>
          </div>
          <div className="bg-card/50 border border-border rounded-lg p-4 text-sm space-y-2">
            <p className="text-muted-foreground">Details about your offer located in</p>
            <p className="font-semibold text-foreground">"My Account"</p>
          </div>
        </div>
      )}

      {/* Make It Mine confirmation panel */}
      {showConfirm && !confirmResult && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-semibold">Registration Status: Confirmed</p>
              <h3 className="font-serif text-lg font-semibold mt-2">Confirm Your Offer Now</h3>
            </div>
            <div className={`flex items-center gap-1.5 font-mono font-semibold text-lg ${timerColor}`}>
              <Clock className="w-4 h-4" />
              {mins}:{secs.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-4 space-y-1 text-sm">
            <p>The PRI$OMETER is currently paused at <strong>${price.toLocaleString("en-US")}</strong></p>
            <p className="text-red-600 font-medium mt-2">Please review the bid amount and ensure you are ready to proceed.</p>
          </div>

          <FeeBreakdownDisplay amount={price} showConfirmButton={false} />

          <p className="text-xs text-muted-foreground text-center">Press "Confirm" to place your offer</p>

          <div className="flex gap-3">
            <Button
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
              className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg"
            >
              {confirmMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="h-11 px-6 rounded-lg">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}