import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Globe, Instagram, Search, ChevronRight } from "lucide-react";

const sellerTypeLabels = {
  individual: "Individual Collector",
  gallery: "Gallery",
  dealer: "Dealer",
  auction_house: "Auction House",
  estate: "Estate",
};

function DealerCard({ profile, itemCount }) {
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");

  return (
    <Link
      to={`/seller/profile?seller=${profile.user_email}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
    >
      {/* Banner / Cover */}
      <div className="relative h-32 bg-gradient-to-br from-muted to-secondary overflow-hidden">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-secondary" />
        )}
        {/* Avatar */}
        <div className="absolute -bottom-6 left-5">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt={profile.display_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-card shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-card shadow-md flex items-center justify-center">
              <span className="font-serif text-lg font-semibold text-primary">
                {(profile.display_name || "?")[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-9 pb-5 px-5 flex-1 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
              {profile.display_name}
            </h3>
            {profile.verified && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">Verified</Badge>
            )}
          </div>
          {profile.seller_type && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {sellerTypeLabels[profile.seller_type] || profile.seller_type}
            </p>
          )}
        </div>

        {profile.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{profile.bio}</p>
        )}

        {profile.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.specialties.slice(0, 3).map(s => (
              <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
            ))}
            {profile.specialties.length > 3 && (
              <span className="text-[10px] text-muted-foreground self-center">+{profile.specialties.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {location && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="w-3 h-3" /> {location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
              >
                <Globe className="w-3 h-3" /> Website
              </a>
            )}
          </div>
          {itemCount > 0 && (
            <span className="text-[10px] font-medium text-muted-foreground">
              {itemCount} active {itemCount === 1 ? "lot" : "lots"}
            </span>
          )}
        </div>
      </div>

      {/* CTA strip */}
      <div className="px-5 py-3 bg-muted/40 border-t border-border flex items-center justify-between text-xs font-medium text-primary group-hover:bg-primary/5 transition-colors">
        <span>View Collection</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

export default function Dealers() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["all-seller-profiles"],
    queryFn: () => base44.entities.SellerProfile.list("-created_date", 200),
  });

  const { data: liveItems = [] } = useQuery({
    queryKey: ["live-items-for-dealers"],
    queryFn: () => base44.entities.Item.filter({ status: ["first_bids", "prisometer"] }, "-created_date", 500),
  });

  // Count live items per seller
  const itemCountBySeller = useMemo(() => {
    const counts = {};
    liveItems.forEach(item => {
      if (item.seller_email) counts[item.seller_email] = (counts[item.seller_email] || 0) + 1;
    });
    return counts;
  }, [liveItems]);

  // Only show profiles with a display name
  const filtered = useMemo(() => {
    let result = profiles.filter(p => p.display_name);
    if (typeFilter !== "all") result = result.filter(p => p.seller_type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.display_name?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.specialties?.some(s => s.toLowerCase().includes(q))
      );
    }
    // Sort: those with active listings first
    result.sort((a, b) => (itemCountBySeller[b.user_email] || 0) - (itemCountBySeller[a.user_email] || 0));
    return result;
  }, [profiles, typeFilter, search, itemCountBySeller]);

  const sellerTypes = useMemo(() => {
    const types = new Set(profiles.map(p => p.seller_type).filter(Boolean));
    return Array.from(types);
  }, [profiles]);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Directory</p>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold text-foreground leading-tight">
            Our Dealers &amp; Sellers
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base">
            Shop directly from curated galleries, specialist dealers, and independent collectors — each offering authenticated works across every category.
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search dealers, specialties, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 bg-card"
            />
          </div>

          {/* Type pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${typeFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/30 bg-card"}`}
            >
              All
            </button>
            {sellerTypes.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(prev => prev === t ? "all" : t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/30 bg-card"}`}
              >
                {sellerTypeLabels[t] || t}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} {filtered.length === 1 ? "seller" : "sellers"}
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="h-32 bg-muted" />
                <div className="pt-10 pb-5 px-5 space-y-3">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-muted-foreground mb-2">No dealers found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(""); setTypeFilter("all"); }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(profile => (
              <DealerCard
                key={profile.id}
                profile={profile}
                itemCount={itemCountBySeller[profile.user_email] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}