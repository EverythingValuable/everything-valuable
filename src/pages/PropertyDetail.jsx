import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Heart, ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyGallery from "@/components/real-estate/PropertyGallery";
import PropertyPriceModule from "@/components/real-estate/PropertyPriceModule";
import PropertyBidSection from "@/components/real-estate/PropertyBidSection";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isWatched, setIsWatched] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [cents, setCents] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseTimeLeft, setPauseTimeLeft] = useState(0);
  const queryClient = useQueryClient();

  const { data: property } = useQuery({
    queryKey: ["property", id],
    queryFn: () => base44.entities.Property.get(id),
  });

  // Calculate live price and manage pause state
  useEffect(() => {
    if (!property) return;

    if (property.status === "first_bids") {
      setDisplayPrice(property.prisometer_start_price);
      setCents(0);
      return;
    }

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
        const price = Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice);
        
        setDisplayPrice(Math.floor(price));
        setCents(Math.round((price % 1) * 100));

        // Check pause state
        if (property.make_it_mine_active) {
          const expiresAt = new Date(property.make_it_mine_expires).getTime();
          const timeRemaining = Math.max(0, (expiresAt - Date.now()) / 1000);
          setIsPaused(true);
          setPauseTimeLeft(timeRemaining);
        } else {
          setIsPaused(false);
        }
      };

      updatePrice();
      const interval = setInterval(updatePrice, 100);
      return () => clearInterval(interval);
    }
  }, [property]);

  const isActive = property?.status === "prisometer" && !isPaused;
  const formatPrice = (price) => Math.floor(price).toLocaleString("en-US");

  const watchMutation = useMutation({
    mutationFn: async () => {
      if (isWatched) {
        await base44.entities.PropertyWatchlist.filter({
          property_id: id,
        }).then((results) => {
          if (results.length > 0) {
            return base44.entities.PropertyWatchlist.delete(results[0].id);
          }
        });
      } else {
        await base44.entities.PropertyWatchlist.create({
          property_id: id,
          user_email: (await base44.auth.me()).email,
        });
      }
      setIsWatched(!isWatched);
    },
  });

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/real-estate")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Home className="w-4 h-4" />
            {property.address}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => watchMutation.mutate()}
            className={isWatched ? "text-red-500" : ""}
          >
            <Heart className={`w-5 h-5 ${isWatched ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Gallery */}
          <div className="lg:col-span-2">
            <PropertyGallery property={property} />

            {/* Property Specs */}
            <div className="grid grid-cols-3 gap-4 mt-6 bg-card rounded-xl border border-border p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Bedrooms</p>
                <p className="font-serif text-2xl font-bold">{property.bedrooms}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Bathrooms</p>
                <p className="font-serif text-2xl font-bold">{property.bathrooms}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Sq Ft</p>
                <p className="font-serif text-2xl font-bold">{property.square_feet?.toLocaleString()}</p>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="mt-6 bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-lg font-semibold mb-4">About This Property</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </div>
            )}

            {/* Realtor Info */}
            {property.realtor_name && (
              <div className="mt-6 bg-card rounded-xl border border-border p-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">Listed by</p>
                <p className="font-serif text-lg font-semibold">{property.realtor_name}</p>
              </div>
            )}
          </div>

          {/* Right: Pricing & Bid */}
           <div className="space-y-4">
            <PropertyPriceModule property={property} isActive={isActive} isPaused={isPaused} pauseTimeLeft={pauseTimeLeft} displayPrice={displayPrice} cents={cents} formatPrice={formatPrice} />
            <PropertyBidSection property={property} />
           </div>
        </div>
      </div>
    </div>
  );
}