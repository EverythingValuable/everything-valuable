import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Clock, Gavel } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const categoryLabels = {
  fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
  decorative_art: "Decorative Art", antiques: "Antiques", collectibles: "Collectibles",
  photography: "Photography", sculpture: "Sculpture", asian_antiques: "Asian Antiques",
  fashion_accessories: "Fashion Accessories", watches_clocks: "Watches & Clocks", other: "Other"
};

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

function RecommendedCard({ item }) {
  const isFirstBids = item.status === "first_bids";
  const isPrisometer = item.status === "prisometer";
  const countdown = useCountdown(isFirstBids ? item.first_bids_end : isPrisometer ? item.prisometer_activated_at : null);

  const displayPrice = isPrisometer && item.current_price
    ? item.current_price
    : item.prisometer_start_price;

  return (
    <Link to={`/item/${item.id}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <span className="font-serif text-3xl">EV</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          {isFirstBids && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold backdrop-blur-sm">
              1stBid$ Active
            </Badge>
          )}
          {isPrisometer && (
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px] font-semibold backdrop-blur-sm">
              PRI$OMETER™ Live
            </Badge>
          )}
        </div>
        {/* Countdown pill */}
        {countdown && countdown !== "Ended" && (
          <div className="absolute bottom-2.5 right-2.5 bg-background/85 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-foreground">{countdown}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {categoryLabels[item.category] || item.category || ""}
        </p>
        <h3 className="font-serif text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center justify-between pt-1">
          {displayPrice ? (
            <span className="font-sans text-sm font-semibold text-foreground">
              ${displayPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          ) : <span />}
          {item.bid_count > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Gavel className="w-2.5 h-2.5" />
              {item.bid_count} bid{item.bid_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {item.highest_bid > 0 && (
          <p className="text-[11px] text-muted-foreground">
            High bid: <span className="font-semibold text-foreground">${item.highest_bid.toLocaleString("en-US")}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

export default function RecommendedItems({ watchlist, bids, userEmail }) {
  const watchedItemIds = watchlist.map(w => w.item_id);
  const biddedItemIds = bids.map(b => b.item_id);
  const allEngagedItemIds = [...new Set([...watchedItemIds, ...biddedItemIds])];

  const { data: engagedItems = [] } = useQuery({
    queryKey: ["engaged-items", allEngagedItemIds.join(",")],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      if (allEngagedItemIds.length === 0) return [];
      const results = await Promise.all(
        allEngagedItemIds.slice(0, 10).map(id =>
          base44.entities.Item.filter({ id }).then(r => r[0]).catch(() => null)
        )
      );
      return results.filter(Boolean);
    },
    enabled: allEngagedItemIds.length > 0,
    staleTime: 60000,
  });

  const categoryCounts = engagedItems.reduce((acc, item) => {
    if (item?.category) acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cat]) => cat);

  const { data: recommendedItems = [] } = useQuery({
    queryKey: ["recommended-items", userEmail],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      if (topCategories.length === 0) {
        const items = await base44.entities.Item.filter({ status: "first_bids" }, "-created_date", 8);
        return items.filter(i => !allEngagedItemIds.includes(i.id)).slice(0, 6);
      }
      const results = await Promise.all(
        topCategories.map(cat =>
          base44.entities.Item.filter({ category: cat, status: "first_bids" }, "-created_date", 8)
        )
      );
      const flat = results.flat();
      const seen = new Set();
      return flat
        .filter(i => !allEngagedItemIds.includes(i.id) && !seen.has(i.id) && seen.add(i.id))
        .slice(0, 6);
    },
    enabled: !!userEmail,
    staleTime: 120000,
  });

  if (recommendedItems.length === 0) return null;

  return (
    <div className="mt-14 pt-8 border-t border-border">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Curated For You</p>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Recommended For You</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Based on your bids and saved items</p>
        </div>
        <Link to="/browse" className="text-xs text-primary font-medium hover:underline shrink-0">
          Browse all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-5">
        {recommendedItems.map(item => (
          <RecommendedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}