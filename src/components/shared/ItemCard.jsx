import React, { useEffect, useState, useRef } from "react";
import { Heart, Info } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProductDrawer from "./ProductDrawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export default function ItemCard({ item, index = 0, sellerProfileOverride }) {
  const livePrice = useLivePrice(item);
  const countdown = useCountdown(item.status === "first_bids" ? item.first_bids_end : null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  const { data: fetchedSellerProfile } = useQuery({
    queryKey: ["seller-profile-card", item.seller_email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: item.seller_email }).then(r => r[0]),
    enabled: !!item.seller_email && !sellerProfileOverride,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  });
  const sellerProfile = sellerProfileOverride || fetchedSellerProfile;
  const [watchlistEntry, setWatchlistEntry] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    const delay = 200 + (index % 10) * 150;
    const timeout = setTimeout(() => {
      base44.entities.WatchlistItem.filter({ item_id: item.id, user_email: user.email })
        .then(r => setWatchlistEntry(r[0] || null))
        .catch(() => {});
    }, delay);
    return () => clearTimeout(timeout);
  }, [user?.email, item.id]);

  const isSaved = !!watchlistEntry;
  const handleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (isSaved) {
      await base44.entities.WatchlistItem.delete(watchlistEntry.id);
      setWatchlistEntry(null);
    } else {
      const created = await base44.entities.WatchlistItem.create({ item_id: item.id, user_email: user.email });
      setWatchlistEntry(created);
    }
    queryClient.invalidateQueries({ queryKey: ["buyer-watchlist"] });
  };

  const isPrisometer = item.status === "prisometer";

  return (
    <>
      {drawerOpen && <ProductDrawer itemId={item.id} onClose={() => setDrawerOpen(false)} />}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        className="group cursor-pointer"
        onClick={() => setDrawerOpen(true)}
      >
        {/* ── IMAGE ─────────────────────────────────── */}
        <div className="relative overflow-hidden bg-white flex items-center justify-center min-h-[300px]">
          {item.images?.[0] ? (
            <>
              <img
                src={item.images[0]}
                alt={item.title}
                className={`w-full object-contain max-h-[300px] transition-opacity duration-500 ${item.images[1] ? "group-hover:opacity-0" : ""}`}
                draggable="false"
                onContextMenu={e => e.preventDefault()}
              />
              {item.images[1] && (
                <img
                  src={item.images[1]}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  draggable="false"
                  onContextMenu={e => e.preventDefault()}
                />
              )}
              <div className="absolute inset-0 z-10" onContextMenu={e => e.preventDefault()} draggable="false" />
            </>
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-neutral-300">
              <span className="font-serif text-4xl">EV</span>
            </div>
          )}

          {/* Status pill — top left */}
          <div className="absolute top-2 left-2 z-20">
            {isPrisometer ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-black/75 text-white text-[9px] font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                PRI$OMETER Live
              </div>
            ) : item.status === "first_bids" ? (
              <div className="px-2 py-0.5 bg-white/90 text-foreground text-[9px] font-bold tracking-wide">
                1stBid$ Preview
              </div>
            ) : null}
          </div>
        </div>

        {/* ── INFO BELOW IMAGE — Sotheby's style ───── */}
        <div className="pt-3 pb-2">

          {/* Title row with watchlist heart */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 flex-1">
              {item.title}
            </h3>
            <button
              className="shrink-0 mt-0.5"
              onClick={handleWatchlist}
            >
              <Heart className={`w-4 h-4 transition-colors ${isSaved ? "fill-neutral-800 text-neutral-800" : "text-neutral-400 hover:text-neutral-700"}`} />
            </button>
          </div>

          {/* Seller / subtitle */}
          {(sellerProfile?.display_name || item.seller_name) && (
            <p className="text-sm text-neutral-600 mt-0.5 truncate font-medium">
              {sellerProfile?.display_name || item.seller_name}
            </p>
          )}

          {/* Price block */}
          <div className="mt-3 space-y-1">
            {isPrisometer ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] uppercase tracking-wide text-neutral-600 font-semibold">PRI$OMETER™:</span>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" onClick={e => e.stopPropagation()} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-neutral-300 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600 transition-colors shrink-0">
                            <Info className="w-2.5 h-2.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] text-xs leading-relaxed">
                          The asking price that gradually declines over time until it meets a bid or the reserve is reached.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-price tabular-nums text-lg font-bold text-neutral-900">
                    ${Math.floor(livePrice).toLocaleString("en-US")}
                    {!item.make_it_mine_active && (
                      <span className="text-primary animate-price-tick">
                        .{Math.floor((livePrice % 1) * 100).toString().padStart(2, "0")}
                      </span>
                    )}
                  </span>
                </div>
                {item.highest_bid > 0 && (
                  <p className="text-sm text-neutral-600">
                    High bid: <span className="font-semibold text-neutral-900">${item.highest_bid.toLocaleString("en-US")}</span>
                    {item.bid_count > 0 && (
                      <span className="text-neutral-500 ml-1">({item.bid_count} {item.bid_count === 1 ? "bid" : "bids"})</span>
                    )}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold">1stBids™ Preview</p>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" onClick={e => e.stopPropagation()} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-neutral-300 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600 transition-colors shrink-0">
                            <Info className="w-2.5 h-2.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] text-xs leading-relaxed">
                          An early preview phase where buyers can place bids before the PRI$OMETER™ goes live.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {countdown && (
                    <p className="text-[11px] text-neutral-600 font-medium">{countdown} remaining</p>
                  )}
                </div>
                {item.highest_bid > 0 && (
                  <p className="text-sm text-neutral-600">
                    High bid: <span className="font-semibold text-neutral-900">${item.highest_bid.toLocaleString("en-US")}</span>
                    {item.bid_count > 0 && (
                      <span className="text-neutral-500 ml-1">({item.bid_count} {item.bid_count === 1 ? "bid" : "bids"})</span>
                    )}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}