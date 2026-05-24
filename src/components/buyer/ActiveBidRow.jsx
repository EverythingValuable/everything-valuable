import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, Crown, Gavel, Zap, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

function getIncrements(sellerTiers, currentHighest) {
  if (!sellerTiers?.length) return 50;
  const tier = sellerTiers.find(t => currentHighest >= t.min && currentHighest <= t.max);
  return tier?.increment ?? 50;
}

function generateOptions(currentHighest, sellerTiers) {
  const options = [];
  const getTierIncrement = (price) => {
    const tier = sellerTiers?.find(t => price >= t.min && price <= t.max);
    return tier?.increment ?? 50;
  };
  let val = currentHighest > 0 ? currentHighest + getTierIncrement(currentHighest) : 100;
  while (options.length < 50) {
    options.push(val);
    val += getTierIncrement(val);
  }
  return options;
}

function useCountdown(endTime) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    if (!endTime) return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [endTime]);
  if (!endTime) return null;
  const diff = new Date(endTime) - now;
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function ActiveBidRow({ bid, currentUser }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState("");

  const { data: item } = useQuery({
    queryKey: ["item-mini", bid.item_id],
    queryFn: () => base44.entities.Item.filter({ id: bid.item_id }).then(r => r[0]),
    enabled: !!bid.item_id,
    staleTime: 30000,
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ["sellerProfile", item?.seller_email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: item?.seller_email }).then(p => p[0]),
    enabled: !!item?.seller_email,
    staleTime: 60000,
  });

  const isOutbid = item && item.highest_bidder_email && item.highest_bidder_email !== currentUser?.email;
  const isHighBidder = item && item.highest_bidder_email === currentUser?.email;
  const myBidAmount = bid.amount;
  const currentHighest = item?.highest_bid || 0;
  const isFirstBids = item?.status === "first_bids";
  const isPrisometer = item?.status === "prisometer";
  const isActive = isFirstBids || isPrisometer;
  const INACTIVE_STATUSES = ["sold", "unsold", "declined"];
  const isInactive = item && INACTIVE_STATUSES.includes(item.status);

  const countdown = useCountdown(isFirstBids ? item?.first_bids_end : isPrisometer ? item?.prisometer_activated_at : null);

  const makeitMinePrice = isPrisometer && item?.current_price
    ? item.current_price
    : item?.prisometer_start_price;

  const placeBidMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(bidAmount);
      if (!amount || amount <= currentHighest) throw new Error(`Bid must be above $${currentHighest.toLocaleString()}`);
      await base44.entities.Bid.create({ item_id: item.id, amount, phase: item.status, bidder_email: currentUser?.email, bidder_name: currentUser?.full_name });
      await base44.entities.Item.update(item.id, {
        highest_bid: amount,
        highest_bidder_email: currentUser?.email,
        bid_count: (item.bid_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-mini", bid.item_id] });
      queryClient.invalidateQueries({ queryKey: ["buyer-bids"] });
      setBidAmount("");
      toast({ title: "Bid placed!", description: `Your bid of $${parseFloat(bidAmount).toLocaleString()} has been placed.` });
    },
    onError: (err) => {
      toast({ title: "Bid failed", description: err.message, variant: "destructive" });
    },
  });

  const makeItMineMutation = useMutation({
    mutationFn: async () => {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await base44.entities.Item.update(item.id, {
        make_it_mine_active: true,
        make_it_mine_buyer: currentUser?.email,
        make_it_mine_expires: expires,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-mini", bid.item_id] });
      toast({ title: "Make It Mine request sent!", description: "The seller has been notified." });
    },
    onError: (err) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  if (isInactive) return null;

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden transition-all ${isOutbid ? "border-orange-300" : isHighBidder ? "border-green-200" : "border-border"}`}>
      {/* Outbid banner */}
      {isOutbid && isActive && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="text-xs font-semibold text-orange-700">You've been outbid — current high: ${currentHighest.toLocaleString()}</span>
        </div>
      )}
      {isHighBidder && isActive && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-b border-green-200">
          <Crown className="w-3.5 h-3.5 text-green-600 shrink-0" />
          <span className="text-xs font-semibold text-green-700">You're the high bidder!</span>
        </div>
      )}

      <div className="flex gap-4 p-4">
        {/* Image */}
        <Link to={`/item/${bid.item_id}`} className="relative w-24 h-28 rounded-xl overflow-hidden bg-muted shrink-0 hover:opacity-90 transition-opacity">
          {item?.images?.[0]
            ? <img src={item.images[0]} alt={item?.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-muted" />
          }
          {/* Status badge overlaid */}
          {isFirstBids && (
            <div className="absolute top-1.5 left-1.5">
              <span className="text-[9px] font-bold bg-primary/90 text-white px-1.5 py-0.5 rounded">1stBid$</span>
            </div>
          )}
          {isPrisometer && (
            <div className="absolute top-1.5 left-1.5">
              <span className="text-[9px] font-bold bg-red-600/90 text-white px-1.5 py-0.5 rounded">PRI$OMETER™</span>
            </div>
          )}
          {countdown && countdown !== "Ended" && (
            <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 rounded px-1 py-0.5 flex items-center gap-1">
              <Clock className="w-2 h-2 text-white/80" />
              <span className="text-[9px] text-white font-medium truncate">{countdown}</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
          <div>
            <Link to={`/item/${bid.item_id}`} className="font-serif text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
              {item?.title || `Item #${bid.item_id?.slice(-8)}`}
            </Link>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground">
                Your bid: <span className="font-bold text-foreground">${myBidAmount?.toLocaleString()}</span>
              </span>
              {currentHighest > myBidAmount && (
                <span className="text-xs text-muted-foreground">
                  Current high: <span className="font-bold text-foreground">${currentHighest.toLocaleString()}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action area */}
          {isActive && isOutbid && (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Bid again */}
              <div className="flex gap-2 flex-1">
                <Select value={bidAmount} onValueChange={setBidAmount}>
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue placeholder={`From $${(currentHighest + getIncrements(sellerProfile?.bid_increment_tiers, currentHighest)).toLocaleString()}`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {generateOptions(currentHighest, sellerProfile?.bid_increment_tiers).map(opt => (
                      <SelectItem key={opt} value={opt.toString()}>${opt.toLocaleString()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => placeBidMutation.mutate()}
                  disabled={!bidAmount || placeBidMutation.isPending}
                  className="h-8 px-3 text-xs gap-1 bg-foreground text-background hover:bg-foreground/90 shrink-0"
                >
                  <Gavel className="w-3 h-3" />
                  {placeBidMutation.isPending ? "…" : "Bid"}
                </Button>
              </div>

              {/* Make It Mine */}
              {isPrisometer && makeitMinePrice && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => makeItMineMutation.mutate()}
                  disabled={makeItMineMutation.isPending || item?.make_it_mine_active}
                  className="h-8 px-3 text-xs gap-1 border-primary/40 text-primary hover:bg-primary hover:text-white shrink-0"
                >
                  <Zap className="w-3 h-3" />
                  {item?.make_it_mine_active ? "Requested" : `Make It Mine · $${makeitMinePrice.toLocaleString()}`}
                </Button>
              )}
            </div>
          )}

          {isActive && isHighBidder && isPrisometer && makeitMinePrice && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => makeItMineMutation.mutate()}
              disabled={makeItMineMutation.isPending || item?.make_it_mine_active}
              className="h-8 px-3 text-xs gap-1 border-primary/40 text-primary hover:bg-primary hover:text-white self-start"
            >
              <Zap className="w-3 h-3" />
              {item?.make_it_mine_active ? "Requested" : `Make It Mine · $${makeitMinePrice.toLocaleString()}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}