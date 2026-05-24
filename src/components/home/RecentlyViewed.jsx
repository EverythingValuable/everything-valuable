import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingDown, Clock, Eye, ArrowRight } from "lucide-react";

const categoryLabels = {
  fine_art: "Fine Art",
  jewelry: "Jewelry",
  watches: "Watches",
  furniture: "Furniture",
  decorative_art: "Decorative Art",
  antiques: "Antiques",
  collectibles: "Collectibles",
  photography: "Photography",
  sculpture: "Sculpture",
  asian_antiques: "Asian Antiques",
  fashion_accessories: "Fashion Accessories",
  watches_clocks: "Watches & Clocks",
  other: "Other"
};

function StatusBadge({ item }) {
  if (item.status === "prisometer") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
        <TrendingDown className="w-2.5 h-2.5" />
        Price Dropping
      </span>
    );
  }
  if (item.status === "first_bids") {
    if (item.bid_count > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {item.bid_count} Bid{item.bid_count !== 1 ? "s" : ""}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Clock className="w-2.5 h-2.5" />
        Live
      </span>
    );
  }
  return null;
}

export default function RecentlyViewed() {
  const [recentIds, setRecentIds] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentlyViewed");
    if (stored) {
      try {
        const ids = JSON.parse(stored).slice(0, 12);
        setRecentIds(ids);
      } catch (e) {}
    }
  }, []);

  const { data: items = [] } = useQuery({
    queryKey: ["recently-viewed-items", recentIds.join(",")],
    queryFn: async () => {
      if (recentIds.length === 0) return [];
      const results = await Promise.all(
        recentIds.map(id =>
          base44.entities.Item.filter({ id }).then(r => r[0]).catch(() => null)
        )
      );
      return results.filter(item => item && ["first_bids", "prisometer"].includes(item.status));
    },
    enabled: recentIds.length > 0,
    staleTime: 60000,
  });

  if (items.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-background border-b border-border/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1 flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Recently Viewed
            </p>
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">Still Considering These?</h3>
          </div>
          <Link to="/browse" className="text-xs text-primary font-medium hover:underline whitespace-nowrap ml-4">
            Browse all →
          </Link>
        </div>

        <div
          id="recent-scroll"
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex-shrink-0 w-80"
            >
              <Link
                to={`/item/${item.id}`}
                className="group flex items-stretch gap-0 bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200"
              >
                {/* Thumbnail — 120px wide, full height */}
                <div className="w-[120px] flex-shrink-0 relative overflow-hidden bg-muted">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                      <span className="font-serif text-xl">EV</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-col justify-between">
                  <div>
                    {/* Category */}
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                      {categoryLabels[item.category] || item.category || "Item"}
                    </p>
                    {/* Title */}
                    <h4 className="font-serif text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <StatusBadge item={item} />
                      {item.prisometer_start_price && (
                        <p className="text-xs font-bold text-foreground font-price">
                          ${item.prisometer_start_price.toLocaleString("en-US")}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      View Again <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}