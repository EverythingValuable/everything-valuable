import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel, ShoppingBag, AlertCircle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import FeeCalculator from "../shared/FeeCalculator";

export default function BidSection({ item }) {
  const [bidAmount, setBidAmount] = useState("");
  const [showMakeItMine, setShowMakeItMine] = useState(false);
  const [confirmCountdown, setConfirmCountdown] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const placeBidMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(bidAmount);
      if (!amount || amount <= (item.highest_bid || 0)) {
        throw new Error("Bid must be higher than current highest bid");
      }
      await base44.entities.Bid.create({
        item_id: item.id,
        amount,
        phase: item.status,
      });
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

  const makeItMineMutation = useMutation({
    mutationFn: async () => {
      const price = item.current_price || item.prisometer_start_price;
      const serviceFee = price * 0.10 + 30;
      const feeCredit = serviceFee * 0.50;
      await base44.entities.Item.update(item.id, {
        status: "sold",
        sold_price: price,
        sold_via: "make_it_mine",
      });
      await base44.entities.Invoice.create({
        item_id: item.id,
        buyer_email: "buyer@example.com",
        seller_email: item.seller_email,
        item_price: price,
        service_fee: serviceFee,
        fee_credit: feeCredit,
        final_amount: price - feeCredit,
        total_cost: price + serviceFee - feeCredit,
        purchase_method: "make_it_mine",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", item.id] });
      toast({ title: "It's yours!", description: "Congratulations. Your purchase has been secured." });
      setShowMakeItMine(false);
    },
  });

  const canBid = item.status === "first_bids" || item.status === "prisometer";
  const canMakeItMine = item.status === "prisometer" && !item.make_it_mine_active;
  const currentPrice = item.current_price || item.prisometer_start_price;
  const minBid = (item.highest_bid || 0) + 1;

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
      {/* Place bid */}
      {canBid && (
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

      {/* Make It Mine */}
      {canMakeItMine && !showMakeItMine && (
        <Button
          onClick={() => setShowMakeItMine(true)}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-semibold gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          Make It Mine — ${currentPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </Button>
      )}

      {/* Make It Mine confirmation */}
      {showMakeItMine && (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-xl font-semibold">Secure This Item</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete your purchase at the current PRI$OMETER price. A transparent service fee applies — 
            half is credited back to your final invoice.
          </p>
          <FeeCalculator price={currentPrice} showDetailed />
          <div className="flex gap-3">
            <Button
              onClick={() => makeItMineMutation.mutate()}
              disabled={makeItMineMutation.isPending}
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold"
            >
              {makeItMineMutation.isPending ? "Securing..." : "Confirm Purchase"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMakeItMine(false)}
              className="h-12"
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            You have 60 seconds to complete this purchase
          </p>
        </div>
      )}
    </div>
  );
}