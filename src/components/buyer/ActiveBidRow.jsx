import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, Crown, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const phaseLabel = { first_bids: "1stBid$™", prisometer: "PRI$OMETER™" };

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
  const increment = getTierIncrement(currentHighest);
  let val = currentHighest > 0 ? currentHighest + increment : 100;
  while (options.length < 50) {
    options.push(val);
    val += getTierIncrement(val);
  }
  return options;
}

export default function ActiveBidRow({ bid, currentUser }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showBid, setShowBid] = useState(false);
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
  const isActive = item?.status === "first_bids" || item?.status === "prisometer";

  const placeBidMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(bidAmount);
      if (!amount || amount <= currentHighest) throw new Error(`Bid must be above $${currentHighest.toLocaleString()}`);
      await base44.entities.Bid.create({ item_id: item.id, amount, phase: item.status });
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
      setShowBid(false);
      toast({ title: "Bid placed!", description: `Your bid of $${parseFloat(bidAmount).toLocaleString()} has been placed.` });
    },
    onError: (err) => {
      toast({ title: "Bid failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className={`rounded-xl border bg-card overflow-hidden transition-all ${isOutbid ? "border-orange-300" : "border-border"}`}>
      {/* Outbid banner */}
      {isOutbid && isActive && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-xs font-semibold text-orange-700">You've been outbid — current high bid is ${currentHighest.toLocaleString()}</span>
        </div>
      )}

      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <Link to={`/item/${bid.item_id}`} className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 hover:opacity-90 transition-opacity">
          {item?.images?.[0]
            ? <img src={item.images[0]} alt={item?.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-muted" />
          }
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/item/${bid.item_id}`} className="hover:underline">
            <p className="font-medium text-sm text-foreground truncate">{item?.title || `Item #${bid.item_id?.slice(-8)}`}</p>
          </Link>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">Your bid: <span className="font-semibold text-foreground">${myBidAmount?.toLocaleString()}</span></span>
            {item?.status && (
              <>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-xs text-muted-foreground">{phaseLabel[item.status] || item.status}</span>
              </>
            )}
          </div>
        </div>

        {/* Status badge + bid toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {isHighBidder && (
            <Badge className="bg-green-50 text-green-700 border-green-200 border text-xs gap-1">
              <Crown className="w-3 h-3" /> High Bidder
            </Badge>
          )}
          {isOutbid && isActive && (
            <Button
              size="sm"
              onClick={() => setShowBid(v => !v)}
              className="h-8 px-3 text-xs bg-orange-500 hover:bg-orange-600 text-white gap-1"
            >
              Bid Again {showBid ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          )}
          {!isActive && (
            <Badge variant="outline" className="text-xs text-muted-foreground">Ended</Badge>
          )}
        </div>
      </div>

      {/* Inline bid panel */}
      {showBid && isOutbid && isActive && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20">
          <div className="flex gap-2 mt-3">
            <Select value={bidAmount} onValueChange={setBidAmount}>
              <SelectTrigger className="flex-1 h-9 text-sm">
                <SelectValue placeholder={`Min: $${(currentHighest + getIncrements(sellerProfile?.bid_increment_tiers, currentHighest)).toLocaleString()}`} />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {generateOptions(currentHighest, sellerProfile?.bid_increment_tiers).map(opt => (
                  <SelectItem key={opt} value={opt.toString()}>${opt.toLocaleString()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => placeBidMutation.mutate()}
              disabled={!bidAmount || placeBidMutation.isPending}
              className="h-9 px-4 text-sm bg-foreground text-background hover:bg-foreground/90"
            >
              {placeBidMutation.isPending ? "Placing…" : "Place Bid"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Current high bid: <span className="font-semibold">${currentHighest.toLocaleString()}</span>
            {item?.first_bids_end && item.status === "first_bids" && (
              <> · Preview ends {new Date(item.first_bids_end).toLocaleDateString()}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}