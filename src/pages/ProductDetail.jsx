import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, Share2, Shield, Truck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProductGallery from "../components/product/ProductGallery";
import PrisometerWidget from "../components/shared/PrisometerWidget";
import FirstBidsCountdown from "../components/shared/FirstBidsCountdown";
import BidSection from "../components/product/BidSection";
import LotDetails from "../components/product/LotDetails";

const categoryLabels = {
  fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
  decorative_arts: "Decorative Arts", design: "Design", antiques: "Antiques",
  collectibles: "Collectibles", luxury_goods: "Luxury Goods", other: "Other",
};

export default function ProductDetail() {
  const pathParts = window.location.pathname.split("/");
  const itemId = pathParts[pathParts.length - 1];

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => base44.entities.Item.filter({ id: itemId }).then(items => items[0]),
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[4/5] bg-muted rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
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
        {/* Main grid: gallery (3) | details (3) | bid panel (2) */}
        <div className="grid lg:grid-cols-8 gap-8 lg:gap-10 items-start">

          {/* Gallery */}
          <div className="lg:col-span-3">
            <ProductGallery images={item.images || []} />
          </div>

          {/* Lot Info + Details */}
          <div className="lg:col-span-3">
            {/* Status + Category */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
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
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight text-foreground mb-2">
              {item.title}
            </h1>
            {item.seller_name && (
              <p className="text-sm text-muted-foreground mb-3">
                Offered by <span className="font-medium text-foreground">{item.seller_name}</span>
              </p>
            )}
            {item.estimated_low && item.estimated_high && (
              <p className="text-sm text-muted-foreground mb-4">
                Estimate: ${item.estimated_low?.toLocaleString()} – ${item.estimated_high?.toLocaleString()}
              </p>
            )}

            {/* Collapsible lot details */}
            <LotDetails item={item} />
          </div>

          {/* Sticky Bid Panel */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 space-y-4">
            {/* PRI$OMETER / Countdown */}
            {item.status === "first_bids" && item.first_bids_end && (
              <FirstBidsCountdown endTime={item.first_bids_end} />
            )}
            {(item.status === "prisometer" || item.status === "first_bids") && (
              <PrisometerWidget item={item} />
            )}

            {/* Bidding */}
            <BidSection item={item} />

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2 h-10">
                <Heart className="w-4 h-4" /> Save
              </Button>
              <Button variant="outline" className="flex-1 gap-2 h-10">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>

            {/* Trust signals */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">Buyer Protection</p>
                  <p className="text-[10px] text-muted-foreground">Every purchase is guaranteed</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">Insured Shipping</p>
                  <p className="text-[10px] text-muted-foreground">Full-value coverage available</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}