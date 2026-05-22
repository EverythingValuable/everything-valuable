import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Gavel, Zap, AlertCircle, Settings, Package, Trophy, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import BuyerProfileForm from "@/components/buyer/BuyerProfileForm";
import ActiveBidRow from "@/components/buyer/ActiveBidRow";
import RecommendedItems from "@/components/buyer/RecommendedItems";
import PurchaseCard from "@/components/buyer/PurchaseCard";
import PriceAlertsTab from "@/components/buyer/PriceAlertsTab";
import ContactSupportModal from "@/components/shared/ContactSupportModal";

const categoryLabels = {
  fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
  decorative_art: "Decorative Art", design: "Design", antiques: "Antiques",
  collectibles: "Collectibles", photography: "Photography", sculpture: "Sculpture",
  ceramics: "Ceramics", textiles: "Textiles", books: "Books", asian_antiques: "Asian Antiques",
  fashion_accessories: "Fashion Accessories", watches_clocks: "Watches & Clocks", other: "Other"
};

const savedStatusConfig = {
  first_bids: { label: "1stBid$ Live", color: "bg-primary/10 text-primary border-primary/20" },
  prisometer:  { label: "PRI$OMETER™ Active", color: "bg-red-50 text-red-600 border-red-200" },
  sold:        { label: "Sold", color: "bg-muted text-muted-foreground border-border" },
};

function SavedItemCard({ itemId, watchlistId }) {
  const [removing, setRemoving] = useState(false);

  const { data: item } = useQuery({
    queryKey: ["item-mini", itemId],
    queryFn: () => base44.entities.Item.filter({ id: itemId }).then(r => r[0]),
    enabled: !!itemId,
    staleTime: 60000,
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-profile-card", item?.seller_email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: item.seller_email }).then(r => r[0]),
    enabled: !!item?.seller_email,
    staleTime: 300000,
  });

  const { refetch: refetchWatchlist } = useQuery({ queryKey: ["buyer-watchlist"] });

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    await base44.entities.WatchlistItem.delete(watchlistId);
    refetchWatchlist();
  };

  // Hide inactive listings
  if (item && ["sold", "unsold", "declined", "draft"].includes(item.status)) return null;

  const status = savedStatusConfig[item?.status];
  const displayPrice = item?.status === "prisometer" && item?.current_price
    ? item.current_price
    : item?.prisometer_start_price;

  return (
    <Link to={`/item/${itemId}`} className="group block relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
        {item?.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <span className="font-serif text-4xl">EV</span>
          </div>
        )}
        {status && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="outline" className={`${status.color} text-xs font-medium backdrop-blur-sm`}>{status.label}</Badge>
          </div>
        )}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
        </button>
      </div>
      <div className="mt-2.5 space-y-0.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{categoryLabels[item?.category] || item?.category || ""}</p>
        <h3 className="font-serif text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {item?.title || "Loading…"}
        </h3>
        {(sellerProfile?.display_name || item?.seller_name) && (
          <p className="text-[11px] text-muted-foreground">{sellerProfile?.display_name || item?.seller_name}</p>
        )}
        {item && (
          <div className="pt-1">
            {item.highest_bid > 0 && (
              <p className="text-[11px] text-muted-foreground">
                High bid: <span className="font-semibold text-foreground">${item.highest_bid.toLocaleString("en-US")}</span>
                {item.bid_count > 0 && <span> · {item.bid_count} bid{item.bid_count !== 1 ? "s" : ""}</span>}
              </p>
            )}
            {displayPrice && (
              <span className="font-sans text-sm font-semibold text-foreground">
                ${displayPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

const STAT_CARDS = (watchlist, activeBids, outbidCount, needsActionCount) => [
  {
    label: "Watching",
    value: watchlist.length,
    icon: Heart,
    tab: "watchlist",
    accent: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    label: "Active Bids",
    value: activeBids.length,
    icon: Gavel,
    tab: "bids",
    accent: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/15",
  },
  {
    label: "Outbid",
    value: outbidCount,
    icon: Trophy,
    tab: "bids",
    accent: outbidCount > 0 ? "text-amber-600" : "text-muted-foreground",
    bg: outbidCount > 0 ? "bg-amber-50" : "bg-muted/50",
    border: outbidCount > 0 ? "border-amber-100" : "border-border",
  },
  {
    label: "Needs Action",
    value: needsActionCount,
    icon: AlertCircle,
    tab: "purchases",
    accent: needsActionCount > 0 ? "text-orange-600" : "text-muted-foreground",
    bg: needsActionCount > 0 ? "bg-orange-50" : "bg-muted/50",
    border: needsActionCount > 0 ? "border-orange-100" : "border-border",
  },
];

export default function BuyerDashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "watchlist";
  const [tab, setTab] = useState(defaultTab);
  const [supportOpen, setSupportOpen] = useState(false);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: watchlist = [] } = useQuery({
    queryKey: ["buyer-watchlist", user?.email],
    queryFn: () => base44.entities.WatchlistItem.filter({ user_email: user?.email }, "-created_date", 50),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: rawBids = [] } = useQuery({
    queryKey: ["buyer-bids", user?.email],
    queryFn: () => base44.entities.Bid.filter({ bidder_email: user?.email }, "-created_date", 200),
    enabled: !!user?.email,
    initialData: [],
  });

  // One entry per item — most recent bid wins
  const bids = Object.values(
    rawBids.reduce((acc, bid) => {
      if (!acc[bid.item_id] || new Date(bid.created_date) > new Date(acc[bid.item_id].created_date)) {
        acc[bid.item_id] = bid;
      }
      return acc;
    }, {})
  );

  const { data: purchases = [] } = useQuery({
    queryKey: ["buyer-purchases", user?.email],
    queryFn: () => base44.entities.Invoice.filter({ buyer_email: user?.email }, "-created_date", 50),
    enabled: !!user?.email,
    initialData: [],
  });

  const activeBids = bids.filter(b => b.status !== "lost");
  const outbidCount = bids.filter(b => b.status === "outbid").length;
  const needsActionCount = purchases.filter(p => ["sent"].includes(p.status)).length;

  const pendingPurchases = purchases.filter(p => !["paid", "shipped", "delivered"].includes(p.status));
  const completedPurchases = purchases.filter(p => ["paid", "shipped", "delivered"].includes(p.status));

  const statCards = STAT_CARDS(watchlist, activeBids, outbidCount, needsActionCount);

  return (
    <div className="min-h-screen bg-[hsl(40,20%,97%)]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1">Collecting Dashboard</p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            {user?.full_name ? `Welcome back, ${user.full_name.split(" ")[0]}.` : "Your Collecting Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">Track everything you're watching, bidding on, and collecting.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {statCards.map(s => (
            <button
              key={s.label}
              onClick={() => setTab(s.tab)}
              className={`group text-left rounded-2xl border p-4 bg-card shadow-sm hover:shadow-md transition-all duration-200 ${s.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-3.5 h-3.5 ${s.accent}`} />
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
              <p className={`font-sans text-3xl font-bold leading-none mt-1 ${s.accent}`}>{s.value}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 bg-transparent p-0 h-auto gap-1 flex-wrap">
            {[
              { value: "watchlist", icon: Heart, label: "Watching" },
              { value: "alerts",    icon: Bell, label: "Price Alerts" },
              { value: "bids",      icon: Gavel, label: "Bids" },
              { value: "purchases", icon: Package, label: "Purchases" },
              { value: "settings",  icon: Settings, label: "Profile" },
            ].map(t => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  data-[state=active]:bg-card data-[state=active]:border data-[state=active]:border-primary/30
                  data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold
                  data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                {t.value === "purchases" && needsActionCount > 0 && (
                  <span className="ml-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {needsActionCount}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* WATCHING */}
          <TabsContent value="watchlist">
            {watchlist.length === 0 ? (
              <Card className="border-dashed"><CardContent className="p-14 text-center">
                <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-serif text-xl text-muted-foreground">Nothing saved yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Browse the marketplace and save items you're interested in.</p>
                <Link to="/browse" className="text-sm text-primary font-medium hover:underline">Browse the marketplace →</Link>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {watchlist.map(w => (
                  <SavedItemCard key={w.id} itemId={w.item_id} watchlistId={w.id} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* PRICE ALERTS */}
          <TabsContent value="alerts">
            <PriceAlertsTab userEmail={user?.email} />
          </TabsContent>

          {/* BIDS */}
          <TabsContent value="bids">
            {activeBids.length === 0 ? (
              <Card className="border-dashed"><CardContent className="p-14 text-center">
                <Gavel className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-serif text-xl text-muted-foreground">No active bids</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Start bidding on items in the marketplace.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {activeBids.map(bid => (
                  <ActiveBidRow key={bid.id} bid={bid} currentUser={user} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* PURCHASES */}
          <TabsContent value="purchases">
            {purchases.length === 0 ? (
              <Card className="border-dashed"><CardContent className="p-14 text-center">
                <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-serif text-xl text-muted-foreground">No purchases yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Items you win or purchase will appear here.</p>
                <Link to="/browse" className="text-sm text-primary font-medium mt-3 inline-block hover:underline">Browse Items →</Link>
              </CardContent></Card>
            ) : (
              <div className="flex gap-8 items-start">
                {/* Main column */}
                <div className="flex-1 min-w-0 space-y-5">
                  {pendingPurchases.length > 0 && (
                    <div>
                      {needsActionCount > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Action Required</p>
                        </div>
                      )}
                      <div className="space-y-4">
                        {pendingPurchases.map(inv => <PurchaseCard key={inv.id} invoice={inv} />)}
                      </div>
                    </div>
                  )}
                  {completedPurchases.length > 0 && (
                    <div>
                      {pendingPurchases.length > 0 && (
                        <div className="flex items-center gap-3 my-5">
                          <div className="h-px flex-1 bg-border" />
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Completed Purchases</p>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                      )}
                      <div className="space-y-4">
                        {completedPurchases.map(inv => <PurchaseCard key={inv.id} invoice={inv} />)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block w-64 shrink-0 space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Need Assistance?</p>
                    <p className="text-sm text-foreground font-serif leading-relaxed mb-3">
                      Our team is here to help with any questions about your purchase, shipping, or payment.
                    </p>
                    <button onClick={() => setSupportOpen(true)} className="text-xs text-primary font-medium hover:underline text-left">
                      Contact Support →
                    </button>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Buyer Protection</p>
                    <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                      <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Seller-verified listings</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Invoice documentation</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Dispute resolution support</li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Provenance & condition notes</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings">
            <div className="mb-5">
              <h3 className="font-serif text-2xl font-semibold">My Profile</h3>
              <p className="text-sm text-muted-foreground mt-1">Required to confirm purchases. Your info is auto-filled on invoices.</p>
            </div>
            <BuyerProfileForm user={user} />
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        <RecommendedItems watchlist={watchlist} bids={bids} userEmail={user?.email} />

        <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} user={user} />
      </div>
    </div>
  );
}