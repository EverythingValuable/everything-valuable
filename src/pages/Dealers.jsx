import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Search, ChevronRight, MessageCircle, Package, Star, Instagram, ArrowRight } from "lucide-react";
import DealerContactModal from "@/components/dealers/DealerContactModal";

const sellerTypeLabels = {
  individual: "Individual Collector",
  gallery: "Gallery",
  dealer: "Dealer",
  auction_house: "Auction House",
  estate: "Estate",
};

function DealerCard({ profile, itemCount, onContact }) {
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");

  return (
    <div className="group bg-card border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col">
      {/* Banner */}
      <Link to={`/seller/profile?seller=${profile.user_email}`} className="block relative h-36 bg-gradient-to-br from-muted to-secondary overflow-hidden">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Avatar */}
        <div className="absolute bottom-3 left-4">
          {profile.logo_url ? (
            <img src={profile.logo_url} alt={profile.display_name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-white/90 border-2 border-white shadow-md flex items-center justify-center">
              <span className="font-serif text-lg font-semibold text-primary">{(profile.display_name || "?")[0]}</span>
            </div>
          )}
        </div>

        {/* Active lots badge */}
        {itemCount > 0 && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 tracking-wide">
            {itemCount} LIVE {itemCount === 1 ? "LOT" : "LOTS"}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="pt-4 pb-4 px-4 flex-1 flex flex-col gap-2.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/seller/profile?seller=${profile.user_email}`}>
              <h3 className="font-serif text-base font-semibold text-foreground leading-tight hover:text-primary transition-colors">
                {profile.display_name}
              </h3>
            </Link>
            {profile.verified && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">Verified</Badge>
            )}
          </div>
          {profile.seller_type && (
            <p className="text-xs text-muted-foreground mt-0.5">{sellerTypeLabels[profile.seller_type] || profile.seller_type}</p>
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

        <div className="mt-auto pt-3 border-t border-border/50 flex items-center gap-3 flex-wrap">
          {location && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="w-3 h-3" /> {location}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              <Globe className="w-3 h-3" /> Website
            </a>
          )}
          {profile.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram.replace("@","")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-3 h-3" /> @{profile.instagram.replace("@","")}
            </a>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-border grid grid-cols-2">
        <Link
          to={`/seller/profile?seller=${profile.user_email}`}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors border-r border-border"
        >
          <ChevronRight className="w-3.5 h-3.5" /> View Lots
        </Link>
        <button
          onClick={() => onContact(profile)}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Contact
        </button>
      </div>
    </div>
  );
}

export default function Dealers() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [contactProfile, setContactProfile] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["all-seller-profiles"],
    queryFn: () => base44.entities.SellerProfile.list("-created_date", 200),
  });

  const { data: liveItems = [] } = useQuery({
    queryKey: ["live-items-for-dealers"],
    queryFn: async () => {
      const [a, b] = await Promise.all([
        base44.entities.Item.filter({ status: "first_bids" }, "-created_date", 300),
        base44.entities.Item.filter({ status: "prisometer" }, "-created_date", 300),
      ]);
      return [...a, ...b];
    },
  });

  const itemCountBySeller = useMemo(() => {
    const counts = {};
    liveItems.forEach(item => {
      if (item.seller_email) counts[item.seller_email] = (counts[item.seller_email] || 0) + 1;
    });
    return counts;
  }, [liveItems]);

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
    result.sort((a, b) => (itemCountBySeller[b.user_email] || 0) - (itemCountBySeller[a.user_email] || 0));
    return result;
  }, [profiles, typeFilter, search, itemCountBySeller]);

  const sellerTypes = useMemo(() => {
    const types = new Set(profiles.map(p => p.seller_type).filter(Boolean));
    return Array.from(types);
  }, [profiles]);

  // Featured = verified or has most live lots
  const featured = useMemo(() =>
    filtered.filter(p => p.verified || (itemCountBySeller[p.user_email] || 0) > 0).slice(0, 4),
    [filtered, itemCountBySeller]
  );

  return (
    <div className="min-h-screen bg-background">
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

      {/* Consign CTA Banner */}
      <div className="bg-foreground text-background">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Consign with a Dealer</span>
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-semibold leading-snug">
              Have something valuable to sell?
            </h2>
            <p className="text-sm text-background/70 mt-1 max-w-lg">
              Our vetted dealers specialize in fine art, antiques, jewelry, and collectibles. Contact any seller below to discuss consignment terms, valuations, and next steps.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/sell">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                Apply to Sell <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works strip */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: Search, title: "Find a Specialist", desc: "Browse our directory of verified dealers by specialty, location, or category." },
            { icon: MessageCircle, title: "Reach Out Directly", desc: "Send a message to discuss consignment terms, request a valuation, or ask questions." },
            { icon: Star, title: "Sell with Confidence", desc: "Your items are listed through our secure, transparent auction and pricing platform." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2 px-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8" id="dealer-grid">

        {/* Search & Filters */}
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium border transition-all ${typeFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/30 bg-card"}`}
            >
              All
            </button>
            {sellerTypes.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(prev => prev === t ? "all" : t)}
                className={`px-3 py-1.5 text-xs font-medium border transition-all ${typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/30 bg-card"}`}
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
              <div key={i} className="border border-border overflow-hidden animate-pulse">
                <div className="h-36 bg-muted" />
                <div className="pt-4 pb-5 px-4 space-y-3">
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
            <button onClick={() => { setSearch(""); setTypeFilter("all"); }} className="mt-4 text-sm text-primary hover:underline">
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
                onContact={setContactProfile}
              />
            ))}
          </div>
        )}
      </div>

      {contactProfile && (
        <DealerContactModal
          isOpen={!!contactProfile}
          onClose={() => setContactProfile(null)}
          profile={contactProfile}
          user={user}
        />
      )}
    </div>
  );
}