import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, TrendingDown, Bed, Bath, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Four fake listings — same visual structure as ItemCard
const fakeListings = [
  {
    id: "re-001",
    title: "Historic Federal-Style Manor, Hudson Valley",
    location: "Rhinebeck, NY 12572",
    beds: 6,
    baths: 4.5,
    sqft: 5800,
    status: "prisometer",
    price: 2_150_000,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    bids: 4,
  },
  {
    id: "re-002",
    title: "Modernist Waterfront Retreat",
    location: "Southampton, NY 11968",
    beds: 4,
    baths: 3,
    sqft: 3200,
    status: "first_bids",
    price: 4_750_000,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    bids: 7,
  },
  {
    id: "re-003",
    title: "19th Century Limestone Farmstead",
    location: "Millbrook, NY 12545",
    beds: 5,
    baths: 3,
    sqft: 4100,
    status: "first_bids",
    price: 1_375_000,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    bids: 2,
  },
  {
    id: "re-004",
    title: "Penthouse Loft, Tribeca",
    location: "New York, NY 10013",
    beds: 3,
    baths: 2.5,
    sqft: 2900,
    status: "prisometer",
    price: 6_200_000,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    bids: 11,
  },
];

const statusConfig = {
  first_bids: { label: "1stBid$ Active", color: "bg-primary/10 text-primary border-primary/20" },
  prisometer: { label: "PRI$OMETER Live", color: "bg-red-50 text-red-600 border-red-200" },
};

function REListingCard({ listing, index }) {
  const status = statusConfig[listing.status] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/real-estate/listing/${listing.id}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Status badge */}
          {status.label && (
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className={`${status.color} text-xs font-medium backdrop-blur-sm bg-opacity-90`}>
                {listing.status === "prisometer" && <TrendingDown className="w-3 h-3 mr-1" />}
                {listing.status === "first_bids" && <Clock className="w-3 h-3 mr-1" />}
                {status.label}
              </Badge>
            </div>
          )}

          {/* Bid count */}
          {listing.bids > 0 && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
              {listing.bids} bid{listing.bids !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="font-serif text-lg font-medium leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground">{listing.location}</p>

          {/* Property stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {listing.beds} bd</span>
            <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {listing.baths} ba</span>
            <span className="flex items-center gap-1"><Square className="w-3 h-3" /> {listing.sqft.toLocaleString()} sf</span>
          </div>

          <div className="pt-1">
            <span className="font-price text-lg font-semibold text-foreground">
              ${listing.price.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function REFeaturedListings() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">Featured Live Sales</h2>
            <p className="text-muted-foreground mt-2 text-sm">Extraordinary properties with active bidding and live PRI$OMETER pricing</p>
          </div>
          <Link to="/real-estate/browse">
            <Button variant="ghost" className="gap-2 text-sm text-muted-foreground hover:text-foreground hidden md:flex">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {fakeListings.map((listing, i) => (
            <REListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/real-estate/browse">
            <Button variant="outline" className="gap-2 rounded-full">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}