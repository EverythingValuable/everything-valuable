import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Heart, Share2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ProductGallery from "@/components/product/ProductGallery";
import PriceConvergenceModule from "@/components/product/PriceConvergenceModule";
import BidSection from "@/components/product/BidSection";
import ItemMessaging from "@/components/product/ItemMessaging";
import DeliveryOptions from "@/components/product/DeliveryOptions";
import TermsAndConditions from "@/components/product/TermsAndConditions";
import SimilarLots from "@/components/product/SimilarLots";

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

function PriceConvergenceModuleWrapper({ item }) {
  const [displayPrice, setDisplayPrice] = useState(item.current_price || item.prisometer_start_price);
  const [cents, setCents] = useState(0);
  const [pauseTimeLeft, setPauseTimeLeft] = useState(0);
  const intervalRef = useRef(null);
  const resumedRef = useRef(false);
  const queryClient = useQueryClient();

  const isActive = item.status === "prisometer" && !item.make_it_mine_active;
  const isPaused = item.status === "prisometer" && item.make_it_mine_active;

  useEffect(() => {
    if (!isPaused || !item.make_it_mine_expires) return;
    resumedRef.current = false;
    const update = async () => {
      const secs = Math.max(0, Math.round((new Date(item.make_it_mine_expires) - Date.now()) / 1000));
      setPauseTimeLeft(secs);
      if (secs === 0 && !resumedRef.current) {
        resumedRef.current = true;
        await base44.entities.Item.update(item.id, { make_it_mine_active: false, make_it_mine_expires: null });
        queryClient.invalidateQueries({ queryKey: ["item", item.id] });
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [isPaused, item.make_it_mine_expires, item.id, queryClient]);

  useEffect(() => {
    if (isActive && item.prisometer_activated_at && item.prisometer_duration_hours) {
      const startTime = new Date(item.prisometer_activated_at).getTime();
      const startPrice = item.prisometer_start_price;
      const reservePrice = item.reserve_price || startPrice * 0.5;
      const belowPercent = item.below_reserve_percent || 10;
      const floorPrice = reservePrice * (1 - belowPercent / 100);
      const durationMs = item.prisometer_duration_hours * 3600000;
      const updatePrice = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const currentPrice = Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice);
        setDisplayPrice(currentPrice);
        setCents(Math.floor((currentPrice % 1) * 100));
      };
      updatePrice();
      intervalRef.current = setInterval(updatePrice, 800);
      return () => clearInterval(intervalRef.current);
    } else {
      setDisplayPrice(item.current_price || item.prisometer_start_price);
    }
  }, [item, isActive]);

  const formatPrice = (price) => Math.floor(price).toLocaleString("en-US");

  return <PriceConvergenceModule item={item} isActive={isActive} isPaused={isPaused} pauseTimeLeft={pauseTimeLeft} displayPrice={displayPrice} cents={cents} formatPrice={formatPrice} />;
}

export default function ProductDetailContent({ itemId }) {
  const [user, setUser] = useState(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // All hooks must be called unconditionally before any early returns
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => base44.entities.Item.filter({ id: itemId }).then(items => items[0]),
    enabled: !!itemId,
  });

  const { data: existingAgreement } = useQuery({
    queryKey: ["terms-agreement", itemId, user?.email],
    queryFn: () => base44.entities.TermsAgreement.filter({ item_id: itemId, user_email: user?.email }).then(r => r[0] || null),
    enabled: !!itemId && !!user?.email,
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

  useEffect(() => {
    if (existingAgreement) {
      setTermsAgreed(true);
    }
  }, [existingAgreement]);

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
      </div>
    );
  }

  const mdComponents = {
    a: ({ node, ...props }) => <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />,
    p: ({ node, ...props }) => <p {...props} className="mb-3" />,
  };

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden">
      <div className="w-full max-w-full px-4 md:px-6 py-6 pb-12 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 w-full max-w-full overflow-x-hidden">

          {/* LEFT — Gallery + Info */}
          <div className="lg:col-span-3 space-y-0 w-full min-w-0">
            <ProductGallery images={item.images || []} />

            {/* Mobile bid panel */}
            <div className="lg:hidden mt-6 space-y-5 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{categoryLabels[item.category] || item.category}</Badge>
                {item.status === "first_bids" && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-display">1stBid$™ Active</Badge>}
                {item.status === "prisometer" && <Badge className="bg-red-50 text-red-600 border-red-200 text-xs font-display">PRI$OMETER™ Live</Badge>}
              </div>
              <div className="w-full max-w-full min-w-0">
                <h1 className="font-display text-2xl font-bold leading-tight text-foreground break-words whitespace-normal w-full max-w-full overflow-hidden [overflow-wrap:anywhere]">
                  {item.title}
                </h1>
                {(sellerProfile?.display_name || item.seller_name) && (
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Offered by{" "}
                    <Link to={`/seller/profile?seller=${item.seller_email}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {sellerProfile?.display_name || item.seller_name}
                    </Link>
                  </p>
                )}
              </div>
              {(item.status === "first_bids" || item.status === "prisometer") && <PriceConvergenceModuleWrapper item={item} />}
              {(item.status === "first_bids" || item.status === "prisometer") && <BidSection item={item} termsAgreed={termsAgreed} />}
              {item.terms_and_conditions && (
                <TermsAndConditions
                  terms={item.terms_and_conditions}
                  onAgree={(agreed) => {
                    if (agreed && user) {
                      base44.entities.TermsAgreement.create({ item_id: itemId, user_email: user.email });
                      setTermsAgreed(true);
                    } else {
                      setTermsAgreed(false);
                    }
                  }}
                />
              )}
              <div className="flex gap-3">
                <Button variant="outline" className={`flex-1 gap-2 h-10 ${isSaved ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-100" : ""}`} onClick={() => user ? saveMutation.mutate() : base44.auth.redirectToLogin()} disabled={saveMutation.isPending}>
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} /> {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" className="flex-1 gap-2 h-10"><Share2 className="w-4 h-4" /> Share</Button>
              </div>
              <DeliveryOptions item={item} />
              <ItemMessaging item={item} user={user} />
              <Separator />
            </div>

            {/* Collapsible sections */}
            <div className="mt-8 w-full">
              {item.description && (
                <CollapsibleSection title="About This Lot" defaultOpen={true}>
                  <div className="text-sm text-foreground leading-relaxed prose prose-sm w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">
                    <ReactMarkdown skipHtml={false} components={mdComponents}>{item.description}</ReactMarkdown>
                  </div>
                </CollapsibleSection>
              )}
              {item.dimensions && (
                <CollapsibleSection title="Dimensions" defaultOpen={true}>
                  <div className="text-sm text-muted-foreground">{item.dimensions}</div>
                </CollapsibleSection>
              )}
              {item.condition && (
                <CollapsibleSection title="Condition" defaultOpen={false}>
                  <div className="text-sm text-muted-foreground">{conditionLabels[item.condition] || item.condition}</div>
                </CollapsibleSection>
              )}
              {(item.period || item.materials || item.origin) && (
                <CollapsibleSection title="Details" defaultOpen={true}>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm w-full">
                    {item.period && <div><span className="text-foreground text-xs font-semibold block mb-0.5">Period</span><span className="text-muted-foreground">{item.period}</span></div>}
                    {item.materials && <div><span className="text-foreground text-xs font-semibold block mb-0.5">Materials</span><span className="text-muted-foreground">{item.materials}</span></div>}
                    {item.origin && <div><span className="text-foreground text-xs font-semibold block mb-0.5">Origin</span><span className="text-muted-foreground">{item.origin}</span></div>}
                  </div>
                </CollapsibleSection>
              )}
              {item.provenance && (
                <CollapsibleSection title="Provenance" defaultOpen={false}>
                  <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">
                    <ReactMarkdown components={mdComponents}>{item.provenance}</ReactMarkdown>
                  </div>
                </CollapsibleSection>
              )}
              {item.condition_notes && (
                <CollapsibleSection title="Condition Report" defaultOpen={false}>
                  <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">
                    <ReactMarkdown components={mdComponents}>{item.condition_notes}</ReactMarkdown>
                  </div>
                </CollapsibleSection>
              )}
              {item.shipping_notes && (
                <CollapsibleSection title="Shipping" defaultOpen={false}>
                  <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">
                    <ReactMarkdown components={mdComponents}>{item.shipping_notes}</ReactMarkdown>
                  </div>
                </CollapsibleSection>
              )}
            </div>
          </div>

          {/* RIGHT — Sticky Bid Panel (desktop only) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="lg:sticky lg:top-6 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{categoryLabels[item.category] || item.category}</Badge>
                {item.status === "first_bids" && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-display">1stBid$™ Active</Badge>}
                {item.status === "prisometer" && <Badge className="bg-red-50 text-red-600 border-red-200 text-xs font-display">PRI$OMETER™ Live</Badge>}
              </div>
              <div className="w-full max-w-full min-w-0">
                <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight text-foreground break-words whitespace-normal w-full max-w-full overflow-hidden [overflow-wrap:anywhere]">
                  {item.title}
                </h1>
                {(sellerProfile?.display_name || item.seller_name) && (
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Offered by{" "}
                    <Link to={`/seller/profile?seller=${item.seller_email}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {sellerProfile?.display_name || item.seller_name}
                    </Link>
                  </p>
                )}
              </div>
              {(item.status === "first_bids" || item.status === "prisometer") && <PriceConvergenceModuleWrapper item={item} />}
              {(item.status === "first_bids" || item.status === "prisometer") && <BidSection item={item} termsAgreed={termsAgreed} />}
              <Separator />
              {item.location && (
                <div className="bg-secondary/40 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Location</p>
                  <p className="text-sm font-medium text-foreground">{item.location}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className={`flex-1 gap-2 h-10 ${isSaved ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-100" : ""}`} onClick={() => user ? saveMutation.mutate() : base44.auth.redirectToLogin()} disabled={saveMutation.isPending}>
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} /> {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" className="flex-1 gap-2 h-10"><Share2 className="w-4 h-4" /> Share</Button>
              </div>
              <DeliveryOptions item={item} />
              <ItemMessaging item={item} user={user} />
              {item.terms_and_conditions && (
                <TermsAndConditions
                  terms={item.terms_and_conditions}
                  onAgree={(agreed) => {
                    if (agreed && user) {
                      base44.entities.TermsAgreement.create({ item_id: itemId, user_email: user.email });
                      setTermsAgreed(true);
                    } else {
                      setTermsAgreed(false);
                    }
                  }}
                />
              )}
              </div>
              </div>
              </div>

              <div className="px-0">
              <SimilarLots item={item} />
              </div>
      </div>
    </div>
  );
}