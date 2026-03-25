import React, { useState, useEffect } from "react";
import { Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PropertyCard({ property }) {
  const [displayPrice, setDisplayPrice] = useState(property.prisometer_start_price);

  useEffect(() => {
    if (property.status === "prisometer" && property.prisometer_activated_at) {
      const updatePrice = () => {
        const startTime = new Date(property.prisometer_activated_at).getTime();
        const startPrice = property.prisometer_start_price;
        const reservePrice = property.reserve_price || startPrice * 0.5;
        const belowPercent = property.below_reserve_percent || 10;
        const floorPrice = reservePrice * (1 - belowPercent / 100);
        const durationMs = property.prisometer_duration_hours * 3600000;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        setDisplayPrice(Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice));
      };

      updatePrice();
      const interval = setInterval(updatePrice, 1000);
      return () => clearInterval(interval);
    }
  }, [property]);

  const statusLabels = {
    first_bids: "1stBid$ Preview",
    prisometer: "PRI$OMETER Live",
    sold: "Sold",
    pending_review: "Pending Review",
  };

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-video">
        <img
          src={property.images?.[0]}
          alt={property.address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-serif font-semibold text-sm">{property.address}</p>
            <p className="text-xs text-muted-foreground">
              {property.city}, {property.state} {property.zip}
            </p>
          </div>
        </div>

        {/* Specs */}
        <div className="flex gap-3 text-xs">
          <span className="text-muted-foreground">{property.bedrooms} bed</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{property.bathrooms} bath</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{property.square_feet?.toLocaleString()} sqft</span>
        </div>

        {/* Status & Price */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Badge variant="outline" className="text-xs">
            {statusLabels[property.status] || property.status}
          </Badge>
          <p className="font-price font-bold text-lg">
            ${displayPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}