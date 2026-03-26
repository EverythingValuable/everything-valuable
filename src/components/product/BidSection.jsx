import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Gavel, ShoppingBag, CheckCircle2, Clock, AlertCircle, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONFIRM_SECONDS = 120;

export default function BidSection({ item }) {
  const [bidAmount, setBidAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBidConfirm, setShowBidConfirm] = useState(false);
  const [lockedPrice, setLockedPrice] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null); // null | 'above' | 'below'
  const [timeLeft, setTimeLeft] = useState(CONFIRM_SECONDS);
  const [showTiers, setShowTiers] = useState(false);
  const [livePriceTick, setLivePriceTick] = useState(0);
  const timerRef = useRef(null);
  const priceTickRef = useRef(null);
  const queryClient = useQueryClient();

  // Re-evaluate live price every 5 seconds so bid options stay current
  useEffect(() => {
    if (item.status !== "prisometer") return;
    priceTickRef.current = setInterval(() => setLivePriceTick(t => t + 1), 5000);
    return () => clearInterval(priceTickRef.current);
  }, [item.status]);
  const { toast } = useToast();

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
      const currentHighest = item.highest_bid || 0;
      const increment = getMinBidIncrement(currentHighest, sellerProfile?.bid_increment_tiers || item.seller_bid_increment_tiers);
      const minRequired = currentHighest + increment;

      if (!amount || amount < minRequired) {
        throw new Error(`Bid must be at least $${minRequired.toLocaleString()}`);
      }
      if ((amount - currentHighest) % increment !== 0) {
        throw new Error(`Bid must increase by increments of $${increment}`);
      }
      await base44.entities.Bid.create({ item_id: item.id, amount, phase: item.status });
      await base44.entities.Item.update(item.id, {
        highest_bid: amount,
        bid_count: (item.bid_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", item.id] });
      queryClient.invalidateQueries({ queryKey: ["bids", item.id] });
      toast({ title: "Bid placed successfully", description: `Your bid of $${parseFloat(bidAmount).toLocaleString()} has been recorded.` });
      setBidAmount("");
      setShowBidConfirm(false);
    },
    onError: (err) => {
      toast({ title: "Bid failed", description: err.message, variant: "destructive" });
      setShowBidConfirm(false);
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
    // Pause the prisometer and save the locked price
    const expires = new Date(Date.now() + CONFIRM_SECONDS * 1000).toISOString();
    await base44.entities.Item.update(item.id, {
      make_it_mine_active: true,
      make_it_mine_expires: expires,
      current_price: price,
    });
    queryClient.invalidateQueries({ queryKey: ["item", item.id] });
    setShowConfirm(true);
  };

  const handleCancel = async () => {
    clearInterval(timerRef.current);
    setShowConfirm(false);
    setLockedPrice(null);
    setConfirmResult(null);
    await base44.entities.Item.update(item.id, {
      make_it_mine_active: false,
      make_it_mine_expires: null,
    });
    queryClient.invalidateQueries({ queryKey: ["item", item.id] });
  };

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const price = lockedPrice;
      const serviceFee = price * 0.10 + 30;
      const feeCredit = serviceFee * 0.50;
      const aboveReserve = price >= (item.reserve_price || 0);

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
        final_amount: price - feeCredit,
        total_cost: price + serviceFee - feeCredit,
        purchase_method: "make_it_mine",
        status: aboveReserve ? "pending" : "pending",
      });
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
  const serviceFee = price * 0.10 + 30;
  const feeCredit = serviceFee * 0.50;
  const upfrontDue = serviceFee;
  const aboveReserve = price >= (item.reserve_price || 0);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor = timeLeft <= 30 ? "text-red-500" : "text-primary";

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
    <div className="space-y-4">
      {/* Make It Mine button */}
      {canMakeItMine && !showConfirm && !showBidConfirm && (
        <Button
          onClick={handleOpenConfirm}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-semibold gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Make It Mine
        </Button>
      )}

      {/* Place a Bid */}
      {canBid && !showConfirm && !showBidConfirm && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Place a Bid</span>
          </div>
          <div className="flex gap-2">
            <Select
              value={bidAmount}
              onValueChange={(val) => {
                if (val === "make_it_mine") {
                  setBidAmount("");
                  handleOpenConfirm();
                } else {
                  setBidAmount(val);
                }
              }}
            >
              <SelectTrigger className="flex-1 h-11">
                <SelectValue placeholder={`Starting at $${minBid.toLocaleString()}`} />
              </SelectTrigger>
              <SelectContent>
                {generateBidOptions().map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    ${option.toLocaleString()}
                  </SelectItem>
                ))}
                {canMakeItMine && (
                  <SelectItem value="make_it_mine" className="text-primary font-semibold border-t border-border mt-1 pt-1">
                    🛍 Make It Mine — ${Math.floor(getLivePrice()).toLocaleString()}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowBidConfirm(true)}
              disabled={!bidAmount || bidAmount === "make_it_mine"}
              className="h-11 px-6 bg-foreground text-background hover:bg-foreground/90"
            >
              Bid
            </Button>
          </div>
          {getTierInfo().length > 0 && (
            <button
              onClick={() => setShowTiers(!showTiers)}
              className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showTiers ? "rotate-180" : ""}`} />
              View bidding increments
            </button>
          )}
          {showTiers && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Minimum Increments:</p>
              <div className="space-y-1">
                {getTierInfo().map((tier, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>${tier.min.toLocaleString()} – ${tier.max.toLocaleString()}</span>
                    <span className="font-medium">+${tier.increment.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

          {/* Bid Confirmation Modal */}
          {showBidConfirm && (
            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-semibold">Confirm Your Bid</h3>
                </div>
              </div>

              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                Your high bid will be placed when the prisometer starts. You will only be charged if the prisometer meets or exceeds your bid amount.
              </p>

              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your High Bid</p>
                <p className="font-price text-3xl font-semibold">${parseFloat(bidAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 space-y-3 text-sm">
                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Fee Breakdown</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item Price</span>
                  <span>${parseFloat(bidAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee (10% + $30)</span>
                  <span>${(parseFloat(bidAmount) * 0.1 + 30).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-border my-2 pt-3 flex justify-between font-semibold">
                  <span>If prisometer meets your high bid, you will be charged</span>
                  <span>${(parseFloat(bidAmount) * 0.1 + 30).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-green-700 font-medium">
                  <span>50% Credit Applied on Final Invoice</span>
                  <span>−${((parseFloat(bidAmount) * 0.1 + 30) * 0.5).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-border mt-2 pt-3 flex justify-between font-semibold text-xs text-muted-foreground">
                  <span>Remaining due after upfront payment</span>
                  <span className="text-foreground">${(parseFloat(bidAmount) + (parseFloat(bidAmount) * 0.1 + 30) * 0.5 - (parseFloat(bidAmount) * 0.1 + 30)).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => placeBidMutation.mutate()}
                  disabled={placeBidMutation.isPending}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {placeBidMutation.isPending ? "Placing Bid..." : "Confirm Bid"}
                </Button>
                <Button variant="outline" onClick={() => setShowBidConfirm(false)} className="h-12 px-5">
                  Cancel
                </Button>
              </div>
            </div>
          )}

      {/* Make It Mine result screen */}
      {confirmResult && !showBidConfirm && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 space-y-4 text-center">
          <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
          {confirmResult === "above" ? (
            <>
              <h3 className="font-serif text-xl font-semibold">Congratulations!</h3>
              <p className="text-sm text-muted-foreground">
                Your locked price was at or above the reserve. Your service fee has been charged and your purchase is confirmed. Check your buyer dashboard for the invoice.
              </p>
            </>
          ) : (
            <>
              <h3 className="font-serif text-xl font-semibold">Offer Submitted</h3>
              <p className="text-sm text-muted-foreground">
                Your locked price was below the reserve. Your offer has been sent to the seller for review. If confirmed, you will be charged the service fee. Please keep a look out for your email.
              </p>
            </>
          )}
        </div>
      )}

      {/* Make It Mine confirmation panel */}
      {showConfirm && !confirmResult && !showBidConfirm && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 space-y-5">
          {/* Header + timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Make It Mine</h3>
            </div>
            <div className={`flex items-center gap-1.5 font-mono font-semibold text-lg ${timerColor}`}>
              <Clock className="w-4 h-4" />
              {mins}:{secs.toString().padStart(2, "0")}
            </div>
          </div>

          {/* Paused notice */}
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            The PRI$OMETER is paused while you complete this purchase. Your price is locked at the amount shown below.
          </p>

          {/* Locked price */}
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Locked Price</p>
            <p className="font-price text-3xl font-semibold">${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>

          {/* Fee breakdown */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-sm">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Fee Breakdown</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item Price</span>
              <span>${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Fee (10% + $30)</span>
              <span>${serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-border my-1 pt-2 flex justify-between font-semibold">
              <span>Due Now (service fee)</span>
              <span>${upfrontDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-green-700 text-xs">
              <span>Credit applied to final invoice</span>
              <span>−${feeCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Remaining due after upfront payment</span>
              <span>${(price - feeCredit).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {confirmMutation.isPending ? "Processing..." : "Confirm & Pay Service Fee"}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="h-12 px-5">
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Timer expires in {mins}:{secs.toString().padStart(2, "0")} — cancellation unpauses the PRI$OMETER
          </p>
        </div>
      )}
    </div>
  );
}