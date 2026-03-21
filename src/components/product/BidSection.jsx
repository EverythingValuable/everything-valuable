import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel, ShoppingBag, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const CONFIRM_SECONDS = 120;

export default function BidSection({ item }) {
  const [bidAmount, setBidAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [lockedPrice, setLockedPrice] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null); // null | 'above' | 'below'
  const [timeLeft, setTimeLeft] = useState(CONFIRM_SECONDS);
  const timerRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      if (!amount || amount <= (item.highest_bid || 0)) {
        throw new Error("Bid must be higher than current highest bid");
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

  const canBid = item.status === "first_bids" || item.status === "prisometer";
  const canMakeItMine = item.status === "prisometer" && !item.make_it_mine_active;
  const currentPrice = item.current_price || item.prisometer_start_price;
  const minBid = (item.highest_bid || 0) + 1;

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
      {/* Place a Bid */}
      {canBid && !showConfirm && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Place a Bid</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder={`${minBid.toLocaleString()} or more`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="pl-7 h-11"
              />
            </div>
            <Button
              onClick={() => placeBidMutation.mutate()}
              disabled={placeBidMutation.isPending}
              className="h-11 px-6 bg-foreground text-background hover:bg-foreground/90"
            >
              {placeBidMutation.isPending ? "Placing..." : "Bid"}
            </Button>
          </div>
          {item.highest_bid > 0 && (
            <p className="text-xs text-muted-foreground">
              Current highest bid: ${item.highest_bid?.toLocaleString()} ({item.bid_count} bid{item.bid_count !== 1 ? "s" : ""})
            </p>
          )}
        </div>
      )}

      {/* Make It Mine button */}
      {canMakeItMine && !showConfirm && (
        <Button
          onClick={handleOpenConfirm}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-semibold gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Make It Mine
        </Button>
      )}

      {/* Make It Mine confirmation panel */}
      {showConfirm && (
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
            <p className="font-serif text-3xl font-semibold">${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
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
              <span>Remaining balance on final invoice</span>
              <span>${(price + feeCredit).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
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