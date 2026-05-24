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
      {/* Image — fixed aspect ratio with overlaid content */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <span className="font-serif text-3xl">EV</span>
          </div>
        )}
        
        {/* Status badge — top left */}
        {(isFirstBids || isPrisometer) && (
          <div className="absolute top-2.5 left-2.5">
            {isFirstBids && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
              1stBid$ Live
              </Badge>
            )}
            {isPrisometer && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px] font-semibold">
              PRI$OMETER™ Active
              </Badge>
            )}
          </div>
        )}
        
        {/* Bottom overlay with info */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-10 px-3 pb-3 rounded-b-2xl">
          <h3 className="font-serif text-xs font-medium leading-tight text-white line-clamp-2 mb-1">
            {item.title}
          </h3>
          <p className="text-[10px] text-white/80 mb-2">
            {categoryLabels[item.category] || item.category || ""}
          </p>
          {displayPrice && (
            <p className="font-sans text-sm font-bold text-white">
              ${displayPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
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
      const activeStatuses = ["first_bids", "prisometer"];
      if (topCategories.length === 0) {
        const items = await base44.entities.Item.filter({ status: "first_bids" }, "-created_date", 8);
        return items.filter(i => !allEngagedItemIds.includes(i.id) && activeStatuses.includes(i.status)).slice(0, 6);
      }
      const results = await Promise.all(
        topCategories.flatMap(cat =>
          activeStatuses.map(status => base44.entities.Item.filter({ category: cat, status }, "-created_date", 8))
        )
      );
      const flat = results.flat();
      const seen = new Set();
      return flat
        .filter(i => !allEngagedItemIds.includes(i.id) && activeStatuses.includes(i.status) && !seen.has(i.id) && seen.add(i.id))
        .slice(0, 6);
    },
    enabled: !!userEmail,
    staleTime: 120000,
  });

  if (recommendedItems.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t-2 border-border/60">
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