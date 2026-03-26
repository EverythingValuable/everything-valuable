import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, Share2, ChevronRight, ChevronDown, Bed, Bath, Square, MapPin, FileText, Shield, BookOpen } from "lucide-react";
import DocumentDownloadModal from "../components/realestate/DocumentDownloadModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ProductGallery from "../components/product/ProductGallery";
import PriceConvergenceModule from "../components/product/PriceConvergenceModule";
import BidSection from "../components/product/BidSection";
import ItemMessaging from "../components/product/ItemMessaging";

// Fake listings mirror REFeaturedListings data so detail page works for demo
const FAKE_LISTINGS = {
  "re-001": {
    id: "re-001",
    title: "Historic Federal-Style Manor, Hudson Valley",
    description: "A rare opportunity to acquire one of the Hudson Valley's most storied Federal-style manors. Originally constructed in 1847, this meticulously preserved 5,800 sq ft estate features original wide-plank hardwood floors, restored ceiling medallions, six working fireplaces, and a grand central staircase. Situated on 11 private acres with mature hardwoods, a restored carriage house, and sweeping views of the Catskill Mountains.\n\nThe property has been sensitively updated with modern systems while preserving its exceptional historic character. A rare listing in Rhinebeck's most sought-after corridor.",
    location: "Rhinebeck, NY 12572",
    beds: 6, baths: 4.5, sqft: 5800, acres: 11,
    property_type: "Single-Family Estate",
    year_built: 1847,
    status: "prisometer",
    prisometer_start_price: 2_150_000,
    reserve_price: 1_850_000,
    below_reserve_percent: 10,
    prisometer_duration_hours: 72,
    prisometer_activated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    current_price: 2_080_000,
    highest_bid: 1_920_000,
    bid_count: 4,
    seller_name: "Rhinebeck Estate Partners",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
    ],
    condition_notes: "Property is in exceptional condition. Full inspection reports, environmental disclosures, and survey documents are available to registered, verified buyers upon request.",
    shipping_notes: "Standard closing timeline of 45–60 days. Buyer responsible for all customary closing costs. Earnest money deposit of 5% required within 48 hours of contract execution.",
  },
  "re-002": {
    id: "re-002",
    title: "Modernist Waterfront Retreat",
    description: "Conceived by a celebrated East End architect in 2009, this four-bedroom modernist retreat commands 180-degree water views from a prime Southampton peninsula. Floor-to-ceiling glazing, a cantilevered deck, open-plan living spaces, and a heated gunite pool define this singular property.\n\nPrivate beach access, a deep-water dock, and a two-car garage complete the offering. Offered for the first time since its original sale.",
    location: "Southampton, NY 11968",
    beds: 4, baths: 3, sqft: 3200, acres: 0.75,
    property_type: "Waterfront Residence",
    year_built: 2009,
    status: "first_bids",
    prisometer_start_price: 4_750_000,
    reserve_price: 4_200_000,
    below_reserve_percent: 10,
    first_bids_duration_hours: 336,
    first_bids_start: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    first_bids_end: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
    highest_bid: 4_100_000,
    bid_count: 7,
    seller_name: "Southampton Private",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    ],
    condition_notes: "Home inspection, environmental survey, and elevation certificate available to verified buyers. All systems in excellent working order.",
    shipping_notes: "45-day standard closing. 10% earnest money deposit required within 48 hours of executed contract.",
  },
  "re-003": {
    id: "re-003",
    title: "19th Century Limestone Farmstead",
    description: "An exceptional 1870s limestone farmstead on 38 acres in Millbrook's prime equestrian corridor. The main house retains original wide-board floors, hand-hewn beams, and four-over-four windows alongside tasteful modern updates. A restored bank barn, two paddocks, and a run-in shed make this a compelling working farm or gentleman's estate.\n\nMillbrook is one of the Hudson Valley's most discreet and desirable communities, within 90 minutes of Manhattan.",
    location: "Millbrook, NY 12545",
    beds: 5, baths: 3, sqft: 4100, acres: 38,
    property_type: "Farm & Country Estate",
    year_built: 1874,
    status: "first_bids",
    prisometer_start_price: 1_375_000,
    reserve_price: 1_200_000,
    below_reserve_percent: 10,
    first_bids_duration_hours: 504,
    first_bids_start: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    first_bids_end: new Date(Date.now() + 6 * 24 * 3600000).toISOString(),
    highest_bid: 1_150_000,
    bid_count: 2,
    seller_name: "Millbrook Estate Group",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
    ],
    condition_notes: "Full property inspection, well and septic reports, and structural assessment available to verified buyers.",
    shipping_notes: "60-day closing preferred. 5% earnest money deposit due within 72 hours of executed contract.",
  },
  "re-004": {
    id: "re-004",
    title: "Penthouse Loft, Tribeca",
    description: "An architecturally singular full-floor penthouse occupying the top two levels of a landmark 1903 cast-iron building in the heart of Tribeca. Soaring 14-foot ceilings, original steel columns, three private terraces, and a bespoke chef's kitchen anchor 2,900 sq ft of refined industrial space.\n\nThe building offers a dedicated concierge, private storage, and a bicycle room. One of fewer than twelve penthouses in Tribeca's landmarked district currently available.",
    location: "New York, NY 10013",
    beds: 3, baths: 2.5, sqft: 2900,
    property_type: "Penthouse Condominium",
    year_built: 1903,
    status: "prisometer",
    prisometer_start_price: 6_200_000,
    reserve_price: 5_600_000,
    below_reserve_percent: 10,
    prisometer_duration_hours: 48,
    prisometer_activated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    current_price: 6_050_000,
    highest_bid: 5_800_000,
    bid_count: 11,
    seller_name: "Tribeca Private Sales",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    ],
    condition_notes: "Board package, financial statements, proprietary lease, and alteration agreement available to verified, pre-approved buyers.",
    shipping_notes: "Co-op board approval required. Standard NYC closing timeline 60–90 days. 10% contract deposit at signing.",
  },
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

function PriceWrapper({ item }) {
  const [displayPrice, setDisplayPrice] = useState(item.current_price || item.prisometer_start_price);
  const [cents, setCents] = useState(0);
  const intervalRef = useRef(null);
  const isActive = item.status === "prisometer";

  useEffect(() => {
    if (isActive && item.prisometer_activated_at && item.prisometer_duration_hours) {
      const startTime = new Date(item.prisometer_activated_at).getTime();
      const startPrice = item.prisometer_start_price;
      const floorPrice = (item.reserve_price || startPrice * 0.5) * (1 - (item.below_reserve_percent || 10) / 100);
      const durationMs = item.prisometer_duration_hours * 3600000;
      const update = () => {
        const progress = Math.min((Date.now() - startTime) / durationMs, 1);
        const p = Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice);
        setDisplayPrice(p);
        setCents(Math.floor((p % 1) * 100));
      };
      update();
      intervalRef.current = setInterval(update, 800);
      return () => clearInterval(intervalRef.current);
    } else {
      setDisplayPrice(item.current_price || item.prisometer_start_price);
    }
  }, [item, isActive]);

  return (
    <PriceConvergenceModule
      item={item}
      isActive={isActive}
      isPaused={false}
      pauseTimeLeft={0}
      displayPrice={displayPrice}
      cents={cents}
      formatPrice={p => Math.floor(p).toLocaleString("en-US")}
    />
  );
}

export default function RealEstateDetail() {
  const pathParts = window.location.pathname.split("/");
  const listingId = pathParts[pathParts.length - 1];
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Use fake data for demo; real implementation would query an entity
  const listing = FAKE_LISTINGS[listingId];

  const [isSaved, setIsSaved] = useState(false);
  const [openModal, setOpenModal] = useState(null); // "property" | "transaction" | "disclosure"

  const PROPERTY_DOCS = [
    { label: "Deed" },
    { label: "Tax Bills" },
    { label: "Survey" },
    { label: "Municipal Reports" },
    { label: "Offering Plan" },
    { label: "Home Inspection Report" },
    { label: "Listing Link" },
    { label: "Tax Map" },
  ];

  const TRANSACTION_DOCS = [
    { label: "Option Agreement" },
    { label: "Election to Extend", note: "Sample Document — Not for site" },
    { label: "Election to Exercise Option", note: "Sample Document — Not for site" },
  ];

  const DISCLOSURE_DOCS = [
    { label: "Lead Paint Disclosure Form" },
    { label: "Environmental Hazard Pamphlet" },
    { label: "Homeowner's Guide to Earthquake Safety" },
    { label: "Megan's Law Disclosure" },
    { label: "Transfer Disclosure Statement" },
    { label: "Water Heater and Smoke Detector Statement of Compliance" },
    { label: "Water-Conserving Fixtures and Detector Notice" },
    { label: "Wood Destroying Pests and Organisms Inspection Report" },
    { label: "Property Condition Disclosure" },
  ];

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="font-serif text-2xl text-muted-foreground">Property not found</p>
        <Link to="/real-estate" className="text-sm text-primary mt-4 inline-block">Return to Real Estate</Link>
      </div>
    );
  }

  const handleSave = () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setIsSaved(s => !s);
    toast({ title: isSaved ? "Removed from saved" : "Saved to your watchlist" });
  };

  return (
    <div>
      {openModal === "property" && (
        <DocumentDownloadModal title="Property Documents" documents={PROPERTY_DOCS} onClose={() => setOpenModal(null)} />
      )}
      {openModal === "transaction" && (
        <DocumentDownloadModal title="Transaction Documents" documents={TRANSACTION_DOCS} onClose={() => setOpenModal(null)} />
      )}
      {openModal === "disclosure" && (
        <DocumentDownloadModal title="Disclosure Documents" documents={DISCLOSURE_DOCS} onClose={() => setOpenModal(null)} />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/real-estate" className="hover:text-foreground">Real Estate</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

          {/* LEFT — Gallery + Details */}
          <div className="lg:col-span-3 space-y-0">
            <ProductGallery images={listing.images || []} />

            <div className="mt-8">
              {listing.description && (
                <CollapsibleSection title="About This Property" defaultOpen={true}>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </CollapsibleSection>
              )}

              <CollapsibleSection title="Property Details" defaultOpen={true}>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {listing.property_type && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Property Type</span>
                      <span className="font-medium">{listing.property_type}</span>
                    </div>
                  )}
                  {listing.year_built && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Year Built</span>
                      <span className="font-medium">{listing.year_built}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground text-xs block mb-0.5">Bedrooms</span>
                    <span className="font-medium">{listing.beds}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-0.5">Bathrooms</span>
                    <span className="font-medium">{listing.baths}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-0.5">Interior</span>
                    <span className="font-medium">{listing.sqft.toLocaleString()} sq ft</span>
                  </div>
                  {listing.acres && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Lot Size</span>
                      <span className="font-medium">{listing.acres} acres</span>
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* Document Download Buttons */}
              <div className="border-t border-border pt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Documents</p>
                {[
                  { key: "property", icon: FileText, label: "Property Information", desc: "Deed, survey, inspection, tax docs" },
                  { key: "transaction", icon: BookOpen, label: "Transaction Documents", desc: "Option agreement and related forms" },
                  { key: "disclosure", icon: Shield, label: "Disclosures", desc: "Lead paint, transfer, condition disclosures" },
                ].map(({ key, icon: Icon, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setOpenModal(key)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Sticky Panel */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 space-y-5">
              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{listing.property_type}</Badge>
                {listing.status === "first_bids" && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-display">
                    1stBid$™ Qualified Preview
                  </Badge>
                )}
                {listing.status === "prisometer" && (
                  <Badge className="bg-red-50 text-red-600 border-red-200 text-xs font-display">
                    PRI$OMETER™ Live
                  </Badge>
                )}
              </div>

              {/* Title & quick stats */}
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight text-foreground">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {listing.beds} bd</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {listing.baths} ba</span>
                  <span className="flex items-center gap-1"><Square className="w-3.5 h-3.5" /> {listing.sqft.toLocaleString()} sf</span>
                </div>
                {listing.seller_name && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Offered by <span className="font-medium text-foreground">{listing.seller_name}</span>
                  </p>
                )}
              </div>

              {/* Price / phase module */}
              {(listing.status === "first_bids" || listing.status === "prisometer") && (
                <PriceWrapper item={listing} />
              )}

              {/* Bid section */}
              {(listing.status === "first_bids" || listing.status === "prisometer") && (
                <BidSection item={listing} />
              )}

              <Separator />

              {/* Qualification notice */}
              <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 space-y-1.5">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Qualified Buyers Only</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Participation requires verified identity and proof of funds or pre-approval. 
                  Winning a bid initiates the deposit and contract execution workflow.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className={`flex-1 gap-2 h-10 ${isSaved ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-100" : ""}`}
                  onClick={handleSave}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" className="flex-1 gap-2 h-10">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}