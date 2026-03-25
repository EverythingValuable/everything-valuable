import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Instagram, ArrowLeft, Package } from "lucide-react";
import ItemCard from "../components/shared/ItemCard";

export default function SellerPublicProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const sellerEmail = urlParams.get("seller");

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["public-seller-profile", sellerEmail],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: sellerEmail }).then(r => r[0]),
    enabled: !!sellerEmail,
  });

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["seller-items", sellerEmail],
    queryFn: () => base44.entities.Item.filter({ seller_email: sellerEmail, status: ["first_bids", "prisometer"] }),
    enabled: !!sellerEmail,
  });

  if (loadingProfile) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-16 animate-pulse space-y-6">
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="font-serif text-2xl text-muted-foreground">Seller not found</p>
        <Link to="/browse" className="text-sm text-primary mt-4 inline-block">Return to browse</Link>
      </div>
    );
  }

  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 pb-20">
      {/* Back */}
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Browse
      </Link>

      {/* Banner */}
      {profile.banner_url && (
        <div className="w-full h-40 md:h-56 rounded-xl overflow-hidden mb-6 bg-muted">
          <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        {profile.logo_url && (
          <img
            src={profile.logo_url}
            alt={profile.display_name}
            className="w-20 h-20 rounded-full object-cover border-2 border-border shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              {profile.display_name}
            </h1>
            {profile.verified && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Verified</Badge>
            )}
          </div>
          {profile.seller_type && (
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {profile.seller_type.replace("_", " ")}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {location}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            )}
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Instagram className="w-3.5 h-3.5" /> {profile.instagram}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio / About */}
      {(profile.bio || profile.about) && (
        <div className="mb-10 space-y-3 max-w-2xl">
          {profile.bio && <p className="text-base text-foreground leading-relaxed">{profile.bio}</p>}
          {profile.about && <p className="text-sm text-muted-foreground leading-relaxed">{profile.about}</p>}
        </div>
      )}

      {/* Specialties */}
      {profile.specialties?.length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map(s => (
              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Listings */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Package className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-serif text-xl font-semibold">Active Listings</h2>
          {items.length > 0 && (
            <span className="text-xs text-muted-foreground">({items.length})</span>
          )}
        </div>

        {loadingItems ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-xl">
            No active listings at this time.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}