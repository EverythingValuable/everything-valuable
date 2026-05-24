import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

export default function RecentlyViewed() {
  const [recentIds, setRecentIds] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Load recently viewed from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("recentlyViewed");
    if (stored) {
      try {
        const ids = JSON.parse(stored).slice(0, 12);
        setRecentIds(ids);
      } catch (e) {
        // Ignore parse errors
      }
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

  const scrollContainer = (direction) => {
    const container = document.getElementById("recent-scroll");
    if (!container) return;
    const amount = 320; // width of card + gap
    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth"
    });
  };

  return (
    <section className="py-10 md:py-14 bg-background border-b border-border/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1">Recently Viewed</p>
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">Still Thinking About These?</h3>
          </div>
          <Link to="/browse" className="text-xs text-primary font-medium hover:underline whitespace-nowrap ml-4">
            View all →
          </Link>
        </div>

        <div className="relative">
          <div
            id="recent-scroll"
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 w-72"
              >
                <Link to={`/item/${item.id}`} className="group flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-3 py-3 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                  {/* 16:9 Thumbnail */}
                  <div className="w-28 flex-shrink-0 rounded-xl overflow-hidden bg-muted" style={{ aspectRatio: "16/9" }}>
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <span className="font-serif text-base">EV</span>
                      </div>
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                      {categoryLabels[item.category] || item.category || ""}
                    </p>
                    {item.prisometer_start_price && (
                      <p className="text-[11px] font-semibold text-foreground mt-0.5">
                        ${item.prisometer_start_price.toLocaleString("en-US")}
                      </p>
                    )}
                  </div>
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 self-start mt-1 ${item.status === "prisometer" ? "bg-red-500" : "bg-primary"}`} />
                </Link>
              </motion.div>
            ))}
          </div>


        </div>
      </div>
    </section>
  );
}