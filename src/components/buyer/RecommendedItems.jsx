import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import ItemCard from "@/components/shared/ItemCard";
import { Link } from "react-router-dom";

export default function RecommendedItems({ watchlist, bids, userEmail }) {
  // Gather categories and item ids from watchlist + bids to use for recommendations
  const watchedItemIds = watchlist.map(w => w.item_id);
  const biddedItemIds = bids.map(b => b.item_id);
  const allEngagedItemIds = [...new Set([...watchedItemIds, ...biddedItemIds])];

  // Fetch engaged items to extract categories
  const { data: engagedItems = [] } = useQuery({
    queryKey: ["engaged-items", allEngagedItemIds.join(",")],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      if (allEngagedItemIds.length === 0) return [];
      // Fetch up to 10 engaged items
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

  // Extract top categories
  const categoryCounts = engagedItems.reduce((acc, item) => {
    if (item?.category) acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cat]) => cat);

  // Fetch active items in those categories, excluding already engaged ones
  const { data: recommendedItems = [] } = useQuery({
    queryKey: ["recommended-items", topCategories.join(","), allEngagedItemIds.join(",")],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      if (topCategories.length === 0) {
        // Fallback: just show recent active items
        const items = await base44.entities.Item.filter(
          { status: "first_bids" },
          "-created_date",
          8
        );
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
    enabled: true,
    staleTime: 60000,
  });

  if (recommendedItems.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">You May Be Interested In</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Based on your bids and saved items</p>
          </div>
        </div>
        <Link to="/browse" className="text-xs text-primary font-medium hover:underline">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-5">
        {recommendedItems.map((item, i) => (
          <ItemCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}