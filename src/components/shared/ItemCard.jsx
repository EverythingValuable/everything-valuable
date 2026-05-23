import React, { useEffect, useState, useRef } from "react";
import { Heart, Clock, TrendingDown, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProductDrawer from "./ProductDrawer";

const categoryLabels = {
  fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
  decorative_arts: "Decorative Arts", design: "Design", antiques: "Antiques",
  collectibles: "Collectibles", photography: "Photography", sculpture: "Sculpture",
  ceramics: "Ceramics", textiles: "Textiles", books: "Books", wine: "Wine",
  luxury_goods: "Luxury Goods", other: "Other"
};

const statusConfig = {
  first_bids: { label: "1stBid$ Live", color: "bg-white text-primary border-primary/40" },
  prisometer: { label: "PRI$OMETER Active", color: "bg-red-50 text-red-600 border-red-200" },
  sold: { label: "Sold", color: "bg-muted text-muted-foreground border-border" },
  pending_review: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
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
        setTimeLeft(`${h}h ${m.toString().padStart(2,"0")}m ${s.toString().padStart(2,"0")}s`);
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endDateStr]);

  return timeLeft;
}

export default function ItemCard({ item, index = 0, sellerProfileOverride }) {
  const status = statusConfig[item.status] || {};
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
    // Stagger watchlist checks by index to avoid simultaneous bursts
    const delay = 200 + (index % 10) * 150;
    const timeout = setTimeout(() => {
      base44.entities.WatchlistItem.filter({ item_id: item.id, user_email: user.email })
        .then(r => setWatchlistEntry(r[0] || null))
        .catch(() => {});
    }, delay);
    return () => clearTimeout(timeout);
  }, [user?.email, item.id]);

  const [flipped, setFlipped] = useState(false);

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

  return (
    <>
      {drawerOpen && <ProductDrawer itemId={item.id} onClose={() => setDrawerOpen(false)} />}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="group block cursor-pointer" style={{ perspective: "1200px" }}>
        {/* Flip container */}
        <div
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
          }}
        >

        {/* FRONT */}
        <div
          onClick={() => setDrawerOpen(true)}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card border border-border/40"
        >

          {/* Image area — movie poster style with title overlay */}
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            {item.images?.[0] ? (
              <>
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-opacity duration-1000 ${item.images[1] ? "group-hover:opacity-0" : ""}`}
                />
                {item.images[1] && (
                  <img
                    src={item.images[1]}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <span className="font-serif text-4xl">EV</span>
              </div>
            )}

            {/* Watchlist button */}
            <button
              className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 ${isSaved ? "!opacity-100" : ""}`}
              onClick={handleWatchlist}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>



            {/* Bid count pill — top left */}
            {(item.bid_count > 0 || item.highest_bid > 0) && (
              <div className="absolute top-3 left-3">
                <div className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-xs font-medium text-white">
                  {item.bid_count > 0 && (
                    <>{item.bid_count} bid{item.bid_count !== 1 ? "s" : ""}{item.highest_bid > 0 && " · "}</>
                  )}
                  {item.highest_bid > 0 && <>High ${item.highest_bid.toLocaleString("en-US")}</>}
                </div>
              </div>
            )}

            {/* Bottom gradient + title overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
              <h3 className="font-serif text-sm font-semibold leading-snug text-white drop-shadow-lg line-clamp-2"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)" }}>
                {item.title}
              </h3>
              {(sellerProfile?.display_name || item.seller_name) && (
                <p className="text-xs text-white/70 truncate mt-0.5" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                  {sellerProfile?.display_name || item.seller_name}
                </p>
              )}
            </div>
          </div>

          {/* Info area — status + price, compact but prominent */}
          <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2 relative">
            {/* Status badge + countdown on same row */}
            <div className="flex items-center justify-between">
              {status.label ? (
                <Badge variant="outline" className={`${status.color} text-xs font-semibold px-2 py-0.5`}>
                  {item.status === "prisometer" && <TrendingDown className="w-3 h-3 mr-1" />}
                  {item.status === "first_bids" && <Clock className="w-3 h-3 mr-1" />}
                  {status.label}
                </Badge>
              ) : <div />}
              {item.status === "first_bids" && countdown && (
                <span className="font-price text-xs font-bold text-primary tracking-wide">{countdown}</span>
              )}
            </div>

            {/* Info / flip button */}
            <button
              className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-border z-10"
              onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
            >
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Price row */}
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground font-medium">
                {item.status === "prisometer" ? "Pri$ometer" : "Pri$ometer Start"}
              </span>
              <span className="font-price text-base font-bold text-foreground">
                ${Math.floor(livePrice).toLocaleString("en-US")}
                {item.status === "prisometer" && !item.make_it_mine_active && (
                  <span className="text-sm text-red-500 animate-price-tick">
                    .{Math.floor((livePrice % 1) * 100).toString().padStart(2, "0")}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            inset: 0,
          }}
          className="rounded-2xl overflow-hidden shadow-md bg-card border border-border/40 flex flex-col"
        >
          {/* Back header */}
          <div className="bg-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <h3 className="font-serif text-sm font-semibold text-background line-clamp-1 flex-1 mr-2">{item.title}</h3>
            <button
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Back content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {item.description && (
              <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">Description</p>
                <p className="text-foreground leading-relaxed text-xs line-clamp-6">{item.description}</p>
              </div>
            )}
            {(item.maker || item.period || item.origin) && (
              <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">Maker / Origin</p>
                <p className="text-foreground text-xs">{[item.maker, item.period, item.origin].filter(Boolean).join(" · ")}</p>
              </div>
            )}
            {item.dimensions && (
              <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">Dimensions</p>
                <p className="text-foreground text-xs">{item.dimensions}</p>
              </div>
            )}
            {item.condition && (
              <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">Condition</p>
                <p className="text-foreground text-xs capitalize">{item.condition.replace("_", " ")}</p>
                {item.condition_notes && <p className="text-muted-foreground text-xs mt-0.5">{item.condition_notes}</p>}
              </div>
            )}
            {item.materials && (
              <div>
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">Materials</p>
                <p className="text-foreground text-xs">{item.materials}</p>
              </div>
            )}
            {!item.description && !item.maker && !item.dimensions && !item.condition && (
              <p className="text-muted-foreground text-xs italic">No additional details available.</p>
            )}
          </div>

          {/* Back footer — view full listing */}
          <div className="px-4 py-2.5 border-t border-border shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setFlipped(false); setDrawerOpen(true); }}
              className="w-full text-xs font-semibold text-primary hover:text-primary/80 transition-colors text-center"
            >
              View Full Listing →
            </button>
          </div>
        </div>

        </div>{/* end flip container */}
      </div>
    </motion.div>
    </>
  );
}