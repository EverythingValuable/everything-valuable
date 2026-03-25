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
  const queryClient = useQueryClient();

  const { data: property } = useQuery({
    queryKey: ["property", id],
    queryFn: () => base44.entities.Property.get(id),
  });

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
            <PropertyPriceModule property={property} />
            <PropertyBidSection property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}