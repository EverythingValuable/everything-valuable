import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, Share2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ProductGallery from "../components/product/ProductGallery";
import PrisometerWidget from "../components/shared/PrisometerWidget";
import FirstBidsCountdown from "../components/shared/FirstBidsCountdown";
import BidSection from "../components/product/BidSection";
import HighestBidDisplay from "../components/product/HighestBidDisplay";
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
                <CollapsibleSection title="Shipping" defaultOpen={false}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.shipping_notes}</p>
                </CollapsibleSection>
              )}
            </div>
          </div>

          {/* RIGHT — Sticky Bid Panel */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 space-y-5">
              {/* Status + Category */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[item.category] || item.category}
                </Badge>
                {item.status === "first_bids" && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-display">1stBid$™ Active</Badge>
                )}
                {item.status === "prisometer" && (
                  <Badge className="bg-red-50 text-red-600 border-red-200 text-xs font-display">PRI$OMETER™ Live</Badge>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight text-foreground">
                  {item.title}
                </h1>
                {(sellerProfile?.display_name || item.seller_name) && (
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Offered by{" "}
                    <Link
                      to={`/seller/profile?seller=${item.seller_email}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {sellerProfile?.display_name || item.seller_name}
                    </Link>
                  </p>
                )}
              </div>

              {/* PRI$OMETER or Countdown */}
              {item.status === "first_bids" && item.first_bids_end && (
                <FirstBidsCountdown endTime={item.first_bids_end} />
              )}
              {(item.status === "prisometer" || item.status === "first_bids") && (
                <PrisometerWidget item={item} />
              )}

              {/* Highest Bid */}
              <HighestBidDisplay item={item} />

              {/* Bidding */}
              <BidSection item={item} />

              <Separator />

              {/* Location */}
              {item.location && (
                <div className="bg-secondary/40 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Location</p>
                  <p className="text-sm font-medium text-foreground">{item.location}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className={`flex-1 gap-2 h-10 ${isSaved ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-100" : ""}`}
                  onClick={() => user ? saveMutation.mutate() : base44.auth.redirectToLogin()}
                  disabled={saveMutation.isPending}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} /> {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" className="flex-1 gap-2 h-10">
                  <Share2 className="w-4 h-4" /> Share
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