import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ExternalLink, ChevronDown, Heart, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import BidSection from "../product/BidSection";
import PrisometerWidget from "./PrisometerWidget";
import FirstBidsCountdown from "./FirstBidsCountdown";

const categoryLabels = {
  fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
  decorative_arts: "Decorative Arts", design: "Design", antiques: "Antiques",
  collectibles: "Collectibles", photography: "Photography", sculpture: "Sculpture",
  ceramics: "Ceramics", textiles: "Textiles", books: "Books", wine: "Wine",
  luxury_goods: "Luxury Goods", other: "Other"
};

const conditionLabels = {
  excellent: "Excellent", very_good: "Very Good", good: "Good", fair: "Fair", as_is: "As Is",
};

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-3 text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function CompactPricePanel({ item }) {
  return (
    <div className="space-y-2">
      {item.status === "first_bids" && item.first_bids_end && (
        <FirstBidsCountdown endTime={item.first_bids_end} compact />
      )}
      <PrisometerWidget item={item} compact />
      {item.highest_bid > 0 && (
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">
            {item.status === "first_bids" ? "Highest Preview Bid" : "Current Highest Bid"}
          </p>
          <p className="font-sans text-2xl font-bold text-foreground">
            ${item.highest_bid.toLocaleString("en-US")}
          </p>
          {item.bid_count > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{item.bid_count} bid{item.bid_count !== 1 ? "s" : ""} placed</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ItemPreviewModal({ item: initialItem, onClose }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Fetch a fresh copy of the item so the modal always has up-to-date data
  const { data: freshItem } = useQuery({
    queryKey: ["item", initialItem.id],
    queryFn: () => base44.entities.Item.filter({ id: initialItem.id }).then(r => r[0]),
    enabled: !!initialItem.id,
  });

  const item = freshItem || initialItem;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-profile", item?.seller_email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: item.seller_email }).then(r => r[0]),
    enabled: !!item?.seller_email,
  });

  const images = item.images || [];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 m-auto w-[90vw] max-w-[700px] h-fit max-h-[80vh] z-50 bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Quick Preview</span>
          <div className="flex items-center gap-2">
            <Link to={`/item/${item.id}`} onClick={onClose}>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <ExternalLink className="w-3.5 h-3.5" /> View Full Page
              </Button>
            </Link>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-5 gap-0 h-full">

            {/* LEFT — Images */}
            <div className="lg:col-span-3 bg-muted/20">
              {/* Main image */}
              <div className="aspect-[4/3] lg:aspect-auto lg:h-[320px] overflow-hidden">
                <img
                  src={images[selectedImage] || ""}
                  alt={item.title}
                  className="w-full h-full object-contain bg-muted/10"
                />
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Collapsible details — shown below images on desktop */}
              <div className="px-6 pb-6 hidden lg:block">
                {item.description && (
                  <CollapsibleSection title="About This Lot">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.description}</p>
                  </CollapsibleSection>
                )}
                {(item.condition || item.period || item.dimensions || item.materials || item.origin) && (
                  <CollapsibleSection title="Details" defaultOpen={false}>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      {item.condition && <div><span className="text-muted-foreground text-xs block mb-0.5">Condition</span><span className="font-medium">{conditionLabels[item.condition]}</span></div>}
                      {item.period && <div><span className="text-muted-foreground text-xs block mb-0.5">Period</span><span className="font-medium">{item.period}</span></div>}
                      {item.dimensions && <div><span className="text-muted-foreground text-xs block mb-0.5">Dimensions</span><span className="font-medium">{item.dimensions}</span></div>}
                      {item.materials && <div><span className="text-muted-foreground text-xs block mb-0.5">Materials</span><span className="font-medium">{item.materials}</span></div>}
                      {item.origin && <div><span className="text-muted-foreground text-xs block mb-0.5">Origin</span><span className="font-medium">{item.origin}</span></div>}
                    </div>
                  </CollapsibleSection>
                )}
                {item.shipping_notes && (
                  <CollapsibleSection title="Shipping" defaultOpen={false}>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.shipping_notes}</p>
                  </CollapsibleSection>
                )}
              </div>
            </div>

            {/* RIGHT — Bid panel */}
            <div className="lg:col-span-2 border-l border-border p-6 space-y-4 overflow-y-auto">
              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{categoryLabels[item.category] || item.category}</Badge>
                {item.status === "first_bids" && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">1stBid$™ Active</Badge>}
                {item.status === "prisometer" && <Badge className="bg-red-50 text-red-600 border-red-200 text-xs">PRI$OMETER™ Live</Badge>}
              </div>

              {/* Title */}
              <div>
                <h2 className="font-display text-xl font-bold leading-tight text-foreground">{item.title}</h2>
                {(sellerProfile?.display_name || item.seller_name) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Offered by <span className="font-medium text-foreground">{sellerProfile?.display_name || item.seller_name}</span>
                  </p>
                )}
              </div>

              {/* Countdown + Prisometer — compact versions matching the full listing page layout */}
              {(item.status === "first_bids" || item.status === "prisometer") && (
                <CompactPricePanel item={item} />
              )}

              {/* Bid section */}
              <BidSection item={item} />

              <Separator />

              <Button variant="outline" className="w-full gap-2" onClick={() => user ? null : base44.auth.redirectToLogin()}>
                <Heart className="w-4 h-4" /> Save to Watchlist
              </Button>

              {/* Mobile details */}
              <div className="lg:hidden">
                {item.description && (
                  <CollapsibleSection title="About This Lot">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.description}</p>
                  </CollapsibleSection>
                )}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}