import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, MapPin, Map, LayoutGrid, Bed, Bath, Square, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import REPropertyMap from "@/components/realestate/REPropertyMap";

const PROPERTY_TYPES = [
  { value: "", label: "All Types" },
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "waterfront", label: "Waterfront" },
  { value: "historic_estate", label: "Historic Estate" },
  { value: "farm_estate", label: "Farm & Estate" },
  { value: "land", label: "Land & Lots" },
  { value: "commercial", label: "Commercial" },
];

const STATUS_CONFIG = {
  first_bids: { label: "1stBid$™ Preview", color: "bg-primary/10 text-primary border-primary/20" },
  prisometer: { label: "PRI$OMETER™ Live", color: "bg-red-50 text-red-600 border-red-200" },
  coming_soon: { label: "Coming Soon", color: "bg-amber-50 text-amber-700 border-amber-200" },
  sold: { label: "Sold", color: "bg-gray-100 text-gray-500 border-gray-200" },
};

// Fallback demo listings while DB is being populated
const DEMO_LISTINGS = [
  {
    id: "re-001", title: "Historic Federal-Style Manor, Hudson Valley",
    display_location: "Rhinebeck, NY", property_type: "historic_estate",
    status: "prisometer", prisometer_start_price: 2150000,
    beds: 6, baths: 4.5, sqft: 5800, acres: 11,
    latitude: 41.9265, longitude: -73.9124, bid_count: 4,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"],
  },
  {
    id: "re-002", title: "Modernist Waterfront Retreat",
    display_location: "Southampton, NY", property_type: "waterfront",
    status: "first_bids", prisometer_start_price: 4750000,
    beds: 4, baths: 3, sqft: 3200, acres: 0.75,
    latitude: 40.8840, longitude: -72.3899, bid_count: 7,
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"],
  },
  {
    id: "re-003", title: "19th Century Limestone Farmstead",
    display_location: "Millbrook, NY", property_type: "farm_estate",
    status: "first_bids", prisometer_start_price: 1375000,
    beds: 5, baths: 3, sqft: 4100, acres: 38,
    latitude: 41.8348, longitude: -73.6965, bid_count: 2,
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"],
  },
  {
    id: "re-004", title: "Penthouse Loft, Tribeca",
    display_location: "New York, NY", property_type: "condo",
    status: "prisometer", prisometer_start_price: 6200000,
    beds: 3, baths: 2.5, sqft: 2900,
    latitude: 40.7195, longitude: -74.0089, bid_count: 11,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"],
  },
];

function ListingCard({ listing }) {
  const status = STATUS_CONFIG[listing.status] || {};
  const price = listing.prisometer_start_price;

  return (
    <Link to={`/real-property/listing/${listing.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        {status.label && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className={`${status.color} text-xs backdrop-blur-sm`}>{status.label}</Badge>
          </div>
        )}
        {listing.bid_count > 0 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-sm text-xs font-medium">
            {listing.bid_count} bid{listing.bid_count !== 1 ? "s" : ""}
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-serif text-base font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">{listing.title}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.display_location}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
          {listing.beds && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{listing.beds} bd</span>}
          {listing.baths && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{listing.baths} ba</span>}
          {listing.sqft && <span className="flex items-center gap-1"><Square className="w-3 h-3" />{listing.sqft?.toLocaleString()} sf</span>}
        </div>
        <p className="font-price text-lg font-semibold pt-1">${price?.toLocaleString("en-US")}</p>
      </div>
    </Link>
  );
}

export default function RealEstateBrowse() {
  const [view, setView] = useState("grid"); // "grid" | "map"
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: dbListings = [] } = useQuery({
    queryKey: ["re-listings"],
    queryFn: () => base44.entities.RealEstateListing.filter({ status: ["first_bids", "prisometer", "coming_soon"] }),
    staleTime: 60000,
  });

  const listings = dbListings.length > 0 ? dbListings : DEMO_LISTINGS;

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (search && !l.title?.toLowerCase().includes(search.toLowerCase()) && !l.display_location?.toLowerCase().includes(search.toLowerCase())) return false;
      if (propertyType && l.property_type !== propertyType) return false;
      const price = l.prisometer_start_price;
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;
      return true;
    });
  }, [listings, search, propertyType, minPrice, maxPrice]);

  const activeFilterCount = [propertyType, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 md:px-8 py-5">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold">Properties</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} active listing{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/real-property/agents">
                <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                  Find an Agent
                </Button>
              </Link>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")} className={`px-3 py-2 text-xs font-medium transition-colors ${view === "grid" ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setView("map")} className={`px-3 py-2 text-xs font-medium transition-colors ${view === "map" ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                  <Map className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search location or property name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={propertyType}
              onChange={e => setPropertyType(e.target.value)}
              className="h-10 px-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2"
              onClick={() => setShowFilters(v => !v)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
            </Button>
            {(search || propertyType || minPrice || maxPrice) && (
              <Button variant="ghost" size="sm" className="h-10 gap-1 text-muted-foreground" onClick={() => { setSearch(""); setPropertyType(""); setMinPrice(""); setMaxPrice(""); }}>
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-3 flex gap-3 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Price:</span>
                <input type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  className="w-28 h-9 px-3 border border-border rounded-lg bg-background text-sm focus:outline-none" />
                <span className="text-muted-foreground text-xs">–</span>
                <input type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="w-28 h-9 px-3 border border-border rounded-lg bg-background text-sm focus:outline-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        {view === "map" ? (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-[600px] rounded-xl overflow-hidden border border-border">
              <REPropertyMap listings={filtered} />
            </div>
            <div className="lg:col-span-2 space-y-4 overflow-y-auto max-h-[600px] pr-1">
              {filtered.map((l, i) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filtered.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ListingCard listing={l} />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-serif text-xl">No properties match your search</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}