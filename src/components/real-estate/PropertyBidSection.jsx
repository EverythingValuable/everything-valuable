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

export default function PropertyBidSection({ property }) {
  const [bidAmount, setBidAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBidConfirm, setShowBidConfirm] = useState(false);
  const [lockedPrice, setLockedPrice] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(CONFIRM_SECONDS);
  const [showTiers, setShowTiers] = useState(false);
  const timerRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const placeBidMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(bidAmount);
      const currentHighest = property.highest_bid || 0;
      const minRequired = currentHighest + 1000; // Simple $1k increment for real estate

      if (!amount || amount < minRequired) {
        throw new Error(`Bid must be at least $${minRequired.toLocaleString()}`);
      }

      await base44.entities.PropertyBid.create({
        property_id: property.id,
        amount,
        phase: property.status,
      });

      await base44.entities.Property.update(property.id, {
        highest_bid: amount,
        bid_count: (property.bid_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", property.id] });
      toast({
        title: "Bid placed successfully",
        description: `Your bid of $${parseFloat(bidAmount).toLocaleString()} has been recorded.`,
      });
      setBidAmount("");
      setShowBidConfirm(false);
    },
    onError: (err) => {
      toast({ title: "Bid failed", description: err.message, variant: "destructive" });
      setShowBidConfirm(false);
    },
  });

  const getLivePrice = () => {
    if (property.prisometer_activated_at && property.prisometer_duration_hours) {
      const startTime = new Date(property.prisometer_activated_at).getTime();
      const startPrice = property.prisometer_start_price;
      const reservePrice = property.reserve_price || startPrice * 0.5;
      const belowPercent = property.below_reserve_percent || 10;
      const floorPrice = reservePrice * (1 - belowPercent / 100);
      const durationMs = property.prisometer_duration_hours * 3600000;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      return Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice);
    }
    return property.current_price || property.prisometer_start_price;
  };

  const handleOpenConfirm = async () => {
    const price = getLivePrice();
    setLockedPrice(price);
    const expires = new Date(Date.now() + CONFIRM_SECONDS * 1000).toISOString();
    await base44.entities.Property.update(property.id, {
      make_it_mine_active: true,
      make_it_mine_expires: expires,
      current_price: price,
    });
    queryClient.invalidateQueries({ queryKey: ["property", property.id] });
    setShowConfirm(true);
  };

  const handleCancel = async () => {
    clearInterval(timerRef.current);
    setShowConfirm(false);
    setLockedPrice(null);
    setConfirmResult(null);
    await base44.entities.Property.update(property.id, {
      make_it_mine_active: false,
      make_it_mine_expires: null,
    });
    queryClient.invalidateQueries({ queryKey: ["property", property.id] });
  };

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const price = lockedPrice;
      const serviceFee = price * 0.05; // 5% for real estate
      const aboveReserve = price >= (property.reserve_price || 0);

      await base44.entities.Property.update(property.id, {
        status: aboveReserve ? "sold" : "pending_review",
        sold_price: aboveReserve ? price : undefined,
        sold_via: aboveReserve ? "make_it_mine" : undefined,
        make_it_mine_active: false,
        make_it_mine_expires: null,
      });

      return { aboveReserve, price, serviceFee };
    },
    onSuccess: ({ aboveReserve }) => {
      clearInterval(timerRef.current);
      queryClient.invalidateQueries({ queryKey: ["property", property.id] });
      setConfirmResult(aboveReserve ? "above" : "below");
    },
  });

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

  const canBid = property.status === "first_bids" || property.status === "prisometer";
  const canMakeItMine = property.status === "prisometer" && !property.make_it_mine_active;
  const currentPrice = property.current_price || property.prisometer_start_price;
  const currentHighestBid = property.highest_bid || 0;
  const minBid = currentHighestBid > 0 ? currentHighestBid + 1000 : property.prisometer_start_price;

  const price = lockedPrice || currentPrice;
  const serviceFee = price * 0.05;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (property.status === "sold") {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
        <p className="font-serif text-xl font-semibold">Sold</p>
        <p className="text-sm text-muted-foreground">
          Final price: ${property.sold_price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canMakeItMine && !showConfirm && !showBidConfirm && (
        <Button
          onClick={handleOpenConfirm}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-semibold gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Make It Mine
        </Button>
      )}

      {canBid && !showConfirm && !showBidConfirm && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Place a Bid</span>
          </div>
          <div className="flex gap-2">
            <Select value={bidAmount} onValueChange={(val) => setBidAmount(val)}>
              <SelectTrigger className="flex-1 h-11">
                <SelectValue placeholder={`Starting at $${minBid.toLocaleString()}`} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }).map((_, i) => {
                  const val = minBid + i * 1000;
                  return (
                    <SelectItem key={val} value={val.toString()}>
                      ${val.toLocaleString()}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowBidConfirm(true)}
              disabled={!bidAmount}
              className="h-11 px-6 bg-foreground text-background hover:bg-foreground/90"
            >
              Bid
            </Button>
          </div>
        </div>
      )}

      {showBidConfirm && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Confirm Your Bid</h3>
            </div>
          </div>

          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Bid</p>
            <p className="font-price text-3xl font-semibold">${parseFloat(bidAmount).toLocaleString("en-US")}</p>
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

      {confirmResult && !showBidConfirm && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 space-y-4 text-center">
          <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
          <h3 className="font-serif text-xl font-semibold">Purchase Submitted</h3>
          <p className="text-sm text-muted-foreground">
            Your offer has been submitted. You'll receive confirmation via email shortly.
          </p>
        </div>
      )}

      {showConfirm && !confirmResult && !showBidConfirm && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Make It Mine</h3>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-lg text-primary">
              <Clock className="w-4 h-4" />
              {mins}:{secs.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Locked Price</p>
            <p className="font-price text-3xl font-semibold">${price.toLocaleString("en-US")}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Fee (5%)</span>
              <span>${serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-border my-2 pt-2 flex justify-between font-semibold">
              <span>Due Now</span>
              <span>${serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {confirmMutation.isPending ? "Processing..." : "Confirm & Pay"}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="h-12 px-5">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}