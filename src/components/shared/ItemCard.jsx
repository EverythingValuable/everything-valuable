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
  const livePrice = useLivePrice(item);
  const countdown = useCountdown(item.status === "first_bids" ? item.first_bids_end : item.status === "prisometer" ? new Date(new Date(item.prisometer_activated_at).getTime() + item.prisometer_duration_hours * 3600000) : null);
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
      <div className="group block cursor-pointer">
         {/* Premium auction catalog card — compact, image-led */}
         <div
           onClick={() => setDrawerOpen(true)}
           className="rounded-lg overflow-hidden border border-border bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full max-w-xs"
         >
           {/* Image area — 55-60% of card height, artwork is the hero */}
           <div className="relative aspect-[3/4] overflow-hidden bg-muted shrink-0">
             {item.images?.[0] ? (
               <>
                 <img
                   src={item.images[0]}
                   alt={item.title}
                   className={`w-full h-full object-cover transition-opacity duration-1000 ${item.images[1] ? "group-hover:opacity-0" : ""}`}
                   draggable="false"
                   onContextMenu={e => e.preventDefault()}
                 />
                 {item.images[1] && (
                   <img
                     src={item.images[1]}
                     alt={item.title}
                     className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                     draggable="false"
                     onContextMenu={e => e.preventDefault()}
                   />
                 )}
                 <div className="absolute inset-0 z-10" onContextMenu={e => e.preventDefault()} draggable="false" />
               </>
             ) : (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                 <span className="font-serif text-4xl">EV</span>
               </div>
             )}

             {/* Watchlist button — top right, subtle */}
             <button
               className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white border border-border/40 ${isSaved ? "!opacity-100" : ""}`}
               onClick={handleWatchlist}
             >
               <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-foreground"}`} />
             </button>

             {/* Status pill — top left, minimal */}
             <div className="absolute top-3 left-3 z-20">
               {item.status === "prisometer" ? (
                 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground text-white text-[10px] font-semibold">
                   <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   PRI$OMETER Live
                 </div>
               ) : item.status === "first_bids" ? (
                 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-foreground/30 text-foreground text-[10px] font-semibold">
                   1stBid$ Preview
                 </div>
               ) : null}
             </div>

             {/* Subtle bottom fade */}
             <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
           </div>

           {/* Information area — compact white section */}
           <div className="flex-1 px-3.5 py-2.5 flex flex-col gap-2">
             {/* Category, Title, Seller — tightened */}
             <div>
               {item.category && (
                 <p className="text-[8px] font-bold tracking-[0.08em] text-muted-foreground uppercase mb-0.5">
                   {item.category.replace(/_/g, " ")}
                 </p>
               )}
               <h3 className="font-serif text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-1">
                 {item.title}
               </h3>
               {(sellerProfile?.display_name || item.seller_name) && (
                 <p className="text-[11px] text-muted-foreground/80 font-light">
                   {sellerProfile?.display_name || item.seller_name}
                 </p>
               )}
             </div>

             {/* Compact pricing grid — 2 rows max */}
             <div className="border-t border-border/60 pt-1.5 space-y-1">
               {item.status === "prisometer" ? (
                 <>
                   <div className="flex items-baseline justify-between text-[10px]">
                     <span className="font-bold text-muted-foreground/70 uppercase tracking-wide">Current</span>
                     <div className="flex items-baseline gap-0.5 font-price">
                       <span className="text-sm font-bold text-foreground">
                         ${Math.floor(livePrice).toLocaleString("en-US")}
                       </span>
                       {!item.make_it_mine_active && (
                         <span className="text-xs font-bold text-red-600 animate-price-tick tabular-nums">
                           .{Math.floor((livePrice % 1) * 100).toString().padStart(2, "0")}
                         </span>
                       )}
                     </div>
                   </div>
                   <div className="flex items-baseline justify-between text-[10px]">
                     <span className="font-bold text-muted-foreground/70 uppercase tracking-wide">High</span>
                     <span className="font-price text-sm font-bold text-foreground">
                       {item.highest_bid > 0 ? `$${item.highest_bid.toLocaleString("en-US")}` : "—"}
                     </span>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex items-baseline justify-between text-[10px]">
                     <span className="font-bold text-muted-foreground/70 uppercase tracking-wide">High Bid</span>
                     <span className="font-price text-sm font-bold text-foreground">
                       {item.highest_bid > 0 ? `$${item.highest_bid.toLocaleString("en-US")}` : "—"}
                     </span>
                   </div>
                   <div className="flex items-baseline justify-between text-[10px]">
                     <span className="font-bold text-muted-foreground/70 uppercase tracking-wide">Start</span>
                     <span className="font-price text-sm font-bold text-foreground">
                       ${(item.prisometer_start_price || 0).toLocaleString("en-US")}
                     </span>
                   </div>
                 </>
               )}
             </div>

             {/* Footer row: Ends In left, View Lot button right */}
             <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
               <div className="text-[10px] flex flex-col gap-0.5">
                 <span className="font-bold text-muted-foreground/70 uppercase tracking-wide">Ends In</span>
                 <span className="font-price text-xs font-bold text-foreground">{countdown || "—"}</span>
               </div>
               <button
                 onClick={() => setDrawerOpen(true)}
                 className="h-7 px-3 text-foreground border border-foreground/40 hover:border-foreground hover:bg-foreground hover:text-background text-[10px] font-semibold rounded transition-colors shrink-0"
               >
                 View Lot
               </button>
             </div>
           </div>
         </div>
       </div>
    </motion.div>
    </>
  );
}