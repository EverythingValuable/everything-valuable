import React, { useEffect, useState, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ProductDrawer from "../shared/ProductDrawer";

// ── Live price hook ─────────────────────────────────────────────
function useLivePrice(item) {
  const [livePrice, setLivePrice] = useState(item.current_price || item.prisometer_start_price);
  const intervalRef = useRef(null);

  useEffect(() => {
    const isActive =
      item.status === "prisometer" &&
      !item.make_it_mine_active &&
      item.prisometer_activated_at &&
      item.prisometer_duration_hours;

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

// ── Countdown hook ──────────────────────────────────────────────
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

// ── Single card ─────────────────────────────────────────────────
function RecentCard({ item, index, onOpen }) {
  const livePrice = useLivePrice(item);
  const countdown = useCountdown(item.status === "first_bids" ? item.first_bids_end : null);
  const isPrisometer = item.status === "prisometer";

  const dollars = Math.floor(livePrice).toLocaleString("en-US");
  const cents = Math.floor((livePrice % 1) * 100).toString().padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="group flex flex-col bg-white border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-300 cursor-pointer"
      onClick={() => onOpen(item.id)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-neutral-50 h-52 flex items-center justify-center">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
            draggable="false"
            onContextMenu={e => e.preventDefault()}
          />
        ) : (
          <span className="text-neutral-300 font-serif text-4xl">EV</span>
        )}

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          {isPrisometer ? (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-black/80 text-white text-[9px] font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              PRI$OMETER™ LIVE
            </div>
          ) : item.status === "first_bids" ? (
            <div className="px-2 py-0.5 bg-white/90 text-foreground text-[9px] font-bold tracking-wide border border-neutral-200">
              1stBID$ PREVIEW
            </div>
          ) : (
            <div className="px-2 py-0.5 bg-neutral-800/80 text-white text-[9px] font-bold tracking-wide uppercase">
              {item.status?.replace(/_/g, " ") || "Viewed"}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Category */}
        {item.category && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-semibold">
            {item.category.replace(/_/g, " ")}
          </p>
        )}

        {/* Title */}
        <h3 className="font-serif text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 flex-1">
          {item.title}
        </h3>

        {/* Price block */}
        <div className="space-y-1 pt-1 border-t border-neutral-100">
          {isPrisometer ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] uppercase tracking-wide text-neutral-500 font-semibold">Now</span>
                <span className="font-price tabular-nums text-lg font-bold text-neutral-900">
                  ${dollars}
                  {!item.make_it_mine_active && (
                    <span className="text-primary">.{cents}</span>
                  )}
                </span>
              </div>
              {item.highest_bid > 0 && (
                <p className="text-xs text-neutral-500">
                  High bid: <span className="font-semibold text-neutral-700">${item.highest_bid.toLocaleString("en-US")}</span>
                  {item.bid_count > 0 && <span className="ml-1">({item.bid_count} {item.bid_count === 1 ? "bid" : "bids"})</span>}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] uppercase tracking-wide text-neutral-500 font-semibold">Start</span>
                <span className="font-price tabular-nums text-lg font-bold text-neutral-900">
                  ${(item.prisometer_start_price || 0).toLocaleString("en-US")}
                </span>
              </div>
              {countdown && (
                <p className="text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-700">{countdown}</span> remaining
                </p>
              )}
            </>
          )}
        </div>

        {/* Return link */}
        <button
          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:gap-2 transition-all tracking-wide mt-auto"
          onClick={e => { e.stopPropagation(); onOpen(item.id); }}
        >
          Return to Lot <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main component ──────────────────────────────────────────────
export default function RecentlyViewed() {
  const [openItemId, setOpenItemId] = useState(null);

  const recentIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("recently_viewed") || "[]").slice(0, 8);
    } catch {
      return [];
    }
  }, []);

  const { data: items = [] } = useQuery({
    queryKey: ["recently-viewed-items", recentIds.join(",")],
    queryFn: async () => {
      if (!recentIds.length) return [];
      const results = await Promise.all(
        recentIds.map(id => base44.entities.Item.filter({ id }).then(r => r[0]).catch(() => null))
      );
      return results.filter(Boolean);
    },
    enabled: recentIds.length > 0,
    staleTime: 1000 * 30,
  });

  const displayItems = items.slice(0, 4);

  if (!displayItems.length) return null;

  return (
    <>
      {openItemId && <ProductDrawer itemId={openItemId} onClose={() => setOpenItemId(null)} />}

      <section className="py-14 px-6 md:px-12 max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-neutral-900">
              Still Considering These?
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Pick up where you left off — prices may have moved since your last visit.
            </p>
          </div>
          {items.length > 4 && (
            <button
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors shrink-0 pb-0.5"
              onClick={() => {/* could expand or navigate */}}
            >
              View all recently viewed <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayItems.map((item, i) => (
            <RecentCard
              key={item.id}
              item={item}
              index={i}
              onOpen={setOpenItemId}
            />
          ))}
        </div>
      </section>
    </>
  );
}