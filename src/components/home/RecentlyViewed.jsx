import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingDown, Clock, Eye, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

function useLivePrice(item) {
  const [livePrice, setLivePrice] = useState(item.current_price || item.prisometer_start_price);
  const intervalRef = useRef(null);

  useEffect(() => {
    const isActive = item.status === "prisometer" && !item.make_it_mine_active && item.prisometer_activated_at && item.prisometer_duration_hours;
    if (!isActive) {
      setLivePrice(item.current_price || item.prisometer_start_price);
      return;
    }
    const startTime = new Date(item.prisometer_activated_at).getTime();
    const startPrice = item.prisometer_start_price;
    const reservePrice = item.reserve_price || startPrice * 0.5;
    const belowPercent = item.below_reserve_percent || 10;
    const floorPrice = reservePrice * (1 - belowPercent / 100);
    const durationMs = item.prisometer_duration_hours * 3600000;

    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setLivePrice(Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice));
    };
    update();
    intervalRef.current = setInterval(update, 800);
    return () => clearInterval(intervalRef.current);
  }, [item]);

  return livePrice;
}

function useCountdown(endDateStr) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!endDateStr) return;
    const update = () => {
      const diff = new Date(endDateStr) - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h >= 24) {
        const d = Math.floor(h / 24);
        setTimeLeft(`${d}d ${h % 24}h`);
      } else {
        setTimeLeft(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endDateStr]);
  return timeLeft;
}

function RecentCard({ item, index }) {
  const livePrice = useLivePrice(item);
  const countdown = useCountdown(item.status === "first_bids" ? item.first_bids_end : null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex-shrink-0 w-80"
    >
      <Link
        to={`/item/${item.id}`}
        className="group flex items-stretch bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200 h-[110px]"
      >
        {/* Thumbnail */}
        <div className="w-[110px] h-[110px] flex-shrink-0 relative overflow-hidden bg-muted">
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
        <div className="flex-1 min-w-0 px-3.5 py-2.5 flex flex-col justify-between">
          {/* Top: category + title */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
              {categoryLabels[item.category] || item.category || "Item"}
            </p>
            <h4 className="font-serif text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h4>
          </div>

          {/* Bottom: status + price */}
          <div className="flex flex-col gap-1">
            {/* Status badge + countdown on same row */}
            <div className="flex items-center gap-2">
              {item.status === "prisometer" && (
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px] px-1.5 py-0 font-semibold">
                  <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                  PRI$OMETER Active
                </Badge>
              )}
              {item.status === "first_bids" && (
                <Badge variant="outline" className="bg-white text-primary border-primary/40 text-[10px] px-1.5 py-0 font-semibold">
                  <Clock className="w-2.5 h-2.5 mr-0.5" />
                  1stBid$ Live
                </Badge>
              )}
              {item.status === "first_bids" && countdown && (
                <span className="font-price text-[10px] font-bold text-primary tracking-wide">{countdown}</span>
              )}
            </div>

            {/* Price row */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">
                {item.status === "prisometer" ? "Now" : "Start"}
              </span>
              <span className="font-price text-sm font-bold text-foreground">
                ${Math.floor(livePrice).toLocaleString("en-US")}
                {item.status === "prisometer" && !item.make_it_mine_active && (
                  <span className="text-xs text-red-500 animate-price-tick">
                    .{Math.floor((livePrice % 1) * 100).toString().padStart(2, "0")}
                  </span>
                )}
              </span>
              {item.bid_count > 0 && (
                <span className="text-[10px] text-muted-foreground">· {item.bid_count} bid{item.bid_count !== 1 ? "s" : ""}</span>
              )}
            </div>

            {/* High bid — own line, more prominent */}
            {item.highest_bid > 0 && (
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">High Bid</span>
                <span className="font-price text-sm font-bold text-foreground">${item.highest_bid.toLocaleString("en-US")}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
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
            <RecentCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}