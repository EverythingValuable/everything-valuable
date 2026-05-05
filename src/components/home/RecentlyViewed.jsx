import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
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
      return results.filter(Boolean);
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 w-64"
              >
                <Link to={`/item/${item.id}`} className="group block">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <span className="font-serif text-4xl">EV</span>
                      </div>
                    )}
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                      <Heart className="w-3.5 h-3.5 text-muted-foreground hover:fill-red-500 hover:text-red-500 transition-all" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    {categoryLabels[item.category] || item.category || ""}
                  </p>
                  <h4 className="font-serif text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  {item.prisometer_start_price && (
                    <p className="text-sm font-bold text-foreground mt-1">
                      ${item.prisometer_start_price.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Scroll buttons */}
          {items.length > 3 && (
            <>
              <button
                onClick={() => scrollContainer("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => scrollContainer("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}