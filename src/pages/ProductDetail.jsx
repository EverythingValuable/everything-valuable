import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, Share2, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ProductGallery from "../components/product/ProductGallery";
import PrisometerWidget from "../components/shared/PrisometerWidget";
import FirstBidsCountdown from "../components/shared/FirstBidsCountdown";
import BidSection from "../components/product/BidSection";
import ItemMessaging from "../components/product/ItemMessaging";

const categoryLabels = {
  fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
  decorative_arts: "Decorative Arts", design: "Design", antiques: "Antiques",
  collectibles: "Collectibles", luxury_goods: "Luxury Goods", other: "Other",
};
const conditionLabels = {
  excellent: "Excellent", very_good: "Very Good", good: "Good", fair: "Fair", as_is: "As Is",
};

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

export default function ProductDetail() {
  const pathParts = window.location.pathname.split("/");
  const itemId = pathParts[pathParts.length - 1];
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => base44.entities.Item.filter({ id: itemId }).then(items => items[0]),
    enabled: !!itemId,
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-profile", item?.seller_email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: item.seller_email }).then(r => r[0]),
    enabled: !!item?.seller_email,
  });

  const { data: watchlistEntry } = useQuery({
    queryKey: ["watchlist", itemId, user?.email],
    queryFn: () => base44.entities.WatchlistItem.filter({ item_id: itemId, user_email: user.email }).then(r => r[0] || null),
    enabled: !!itemId && !!user?.email,
  });

  const isSaved = !!watchlistEntry;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await base44.entities.WatchlistItem.delete(watchlistEntry.id);
      } else {
        await base44.entities.WatchlistItem.create({ item_id: itemId, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", itemId, user?.email] });
      toast({ title: isSaved ? "Removed from saved items" : "Saved to your watchlist" });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[4/5] bg-muted rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-8 w-3/4 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="font-serif text-2xl text-muted-foreground">Item not found</p>
        <Link to="/browse" className="text-sm text-primary mt-4 inline-block">Return to browse</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/browse?category=${item.category}`} className="hover:text-foreground">
            {categoryLabels[item.category] || item.category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[200px]">{item.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

          {/* LEFT — Gallery + Info Sections */}
          <div className="lg:col-span-3 space-y-0">
            <ProductGallery images={item.images || []} />

            {/* Collapsible Info Sections */}
            <div className="mt-8">
              {item.description && (
                <CollapsibleSection title="About This Lot" defaultOpen={true}>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </CollapsibleSection>
              )}

              {/* Details grid */}
              {(item.condition || item.period || item.dimensions || item.materials || item.origin) && (
                <CollapsibleSection title="Details" defaultOpen={true}>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    {item.condition && (
                      <div>
                        <span className="text-muted-foreground text-xs block mb-0.5">Condition</span>
                        <span className="font-medium">{conditionLabels[item.condition] || item.condition}</span>
                      </div>
                    )}
                    {item.period && (
                      <div>
                        <span className="text-muted-foreground text-xs block mb-0.5">Period</span>
                        <span className="font-medium">{item.period}</span>
                      </div>
                    )}
                    {item.dimensions && (
                      <div>
                        <span className="text-muted-foreground text-xs block mb-0.5">Dimensions</span>
                        <span className="font-medium">{item.dimensions}</span>
                      </div>
                    )}
                    {item.materials && (
                      <div>
                        <span className="text-muted-foreground text-xs block mb-0.5">Materials</span>
                        <span className="font-medium">{item.materials}</span>
                      </div>
                    )}
                    {item.origin && (
                      <div>
                        <span className="text-muted-foreground text-xs block mb-0.5">Origin</span>
                        <span className="font-medium">{item.origin}</span>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {item.provenance && (
                <CollapsibleSection title="Provenance" defaultOpen={false}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.provenance}</p>
                </CollapsibleSection>
              )}

              {item.condition_notes && (
                <CollapsibleSection title="Condition Report" defaultOpen={false}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.condition_notes}</p>
                </CollapsibleSection>
              )}

              {item.shipping_notes && (
                <CollapsibleSection title="Shipping & Pickup Terms" defaultOpen={false}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.shipping_notes}</p>
                </CollapsibleSection>
              )}
            </div>
          </div>

          {/* RIGHT — Sticky Bid Panel */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Title & Seller */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[item.category] || item.category}
                  </Badge>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight text-foreground mb-4">
                  {item.title}
                </h1>
                {(sellerProfile?.display_name || item.seller_name) && (
                  <Link
                    to={`/seller/profile?seller=${item.seller_email}`}
                    className="inline-block"
                  >
                    <div className="border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Offered by</p>
                      <p className="font-medium text-foreground text-sm hover:text-primary transition-colors">
                        {sellerProfile?.display_name || item.seller_name}
                      </p>
                      {item.location && (
                        <p className="text-xs text-muted-foreground mt-1.5">{item.location}</p>
                      )}
                    </div>
                  </Link>
                )}
              </div>

              {/* Unified Bidding Module */}
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                {/* Status Badge */}
                <div className="border-b border-border px-5 py-3 bg-secondary/30">
                  {item.status === "first_bids" && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-display">1stBid$™ Active — Preview Bidding</Badge>
                  )}
                  {item.status === "prisometer" && (
                    <Badge className="bg-red-50 text-red-600 border-red-200 text-xs font-display">PRI$OMETER™ Live</Badge>
                  )}
                </div>

                {/* Countdown or Prisometer */}
                <div className="px-5 py-4 space-y-4">
                  {item.status === "first_bids" && item.first_bids_end && (
                    <FirstBidsCountdown endTime={item.first_bids_end} />
                  )}

                  {/* PRI$OMETER Start Price Section */}
                  {(item.status === "prisometer" || item.status === "first_bids") && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        PRI$OMETER<sup className="text-[8px] ml-0.5">™</sup> Start Price
                      </p>
                      <p className="font-price text-4xl md:text-5xl font-bold text-foreground">
                        ${item.prisometer_start_price?.toLocaleString("en-US")}
                      </p>
                      {item.status === "first_bids" && (
                        <p className="text-xs text-muted-foreground italic">Live pricing begins when preview ends.</p>
                      )}
                    </div>
                  )}

                  {/* Current Price if Prisometer Active */}
                  {item.status === "prisometer" && !item.make_it_mine_active && (
                    <div className="pt-3 border-t border-border">
                      <PrisometerWidget item={item} />
                    </div>
                  )}
                </div>

                {/* Bidding Section */}
                <div className="border-t border-border px-5 py-4">
                  <BidSection item={item} />
                </div>
              </div>

              {/* How It Works Expandable */}
              <details className="border border-border rounded-lg group">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors font-medium text-sm">
                  <span>How 1stBid$™ and PRI$OMETER™ Work</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border px-4 py-3 text-xs space-y-2 text-muted-foreground bg-secondary/20">
                  <p>• <strong>Preview Phase:</strong> Place a bid during 1stBid$™ preview period</p>
                  <p>• <strong>At Preview End:</strong> If your bid is highest and clears the PRI$OMETER™ start price, you win</p>
                  <p>• <strong>If Not Won:</strong> Your bid carries forward and may win if PRI$OMETER™ descends to it above reserve</p>
                  <p>• <strong>Make It Mine™:</strong> Instantly lock in the live price at any point during PRI$OMETER™</p>
                </div>
              </details>

              {/* Save/Share - Compact */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 gap-2 ${isSaved ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-100" : ""}`}
                  onClick={() => user ? saveMutation.mutate() : base44.auth.redirectToLogin()}
                  disabled={saveMutation.isPending}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-red-500" : ""}`} /> {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
              </div>

              {/* Messaging */}
              <ItemMessaging item={item} user={user} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}