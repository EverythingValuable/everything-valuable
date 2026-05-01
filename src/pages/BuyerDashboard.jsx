import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Gavel, Settings, Package, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import BuyerProfileForm from "@/components/buyer/BuyerProfileForm";
import ActiveBidRow from "@/components/buyer/ActiveBidRow";

const categoryLabels = {
  fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
  decorative_art: "Decorative Art", design: "Design", antiques: "Antiques",
  collectibles: "Collectibles", photography: "Photography", sculpture: "Sculpture",
  ceramics: "Ceramics", textiles: "Textiles", books: "Books", asian_antiques: "Asian Antiques",
  fashion_accessories: "Fashion Accessories", watches_clocks: "Watches & Clocks", other: "Other"
};

const savedStatusConfig = {
  first_bids: { label: "1stBid$ Active", color: "bg-primary/10 text-primary border-primary/20" },
  prisometer:  { label: "PRI$OMETER™ Live", color: "bg-red-50 text-red-600 border-red-200" },
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

  const { refetch: refetchWatchlist } = useQuery({ queryKey: ["buyer-watchlist"] });

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    await base44.entities.WatchlistItem.delete(watchlistId);
    refetchWatchlist();
  };

  const status = savedStatusConfig[item?.status];
  const displayPrice = item?.status === "prisometer" && item?.current_price
    ? item.current_price
    : item?.prisometer_start_price;

  return (
    <Link to={`/item/${itemId}`} className="group block relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        {item?.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <span className="font-serif text-4xl">EV</span>
          </div>
        )}
        {status && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className={`${status.color} text-xs font-medium backdrop-blur-sm`}>
              {status.label}
            </Badge>
          </div>
        )}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
        </button>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {categoryLabels[item?.category] || item?.category || ""}
        </p>
        <h3 className="font-serif text-base font-medium leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {item?.title || "Loading…"}
        </h3>
        {item?.seller_name && (
          <p className="text-xs text-muted-foreground">{item.seller_name}</p>
        )}
        {/* Show highest bid if available, otherwise start price */}
        {item && (
          <div className="pt-1 space-y-0.5">
            {item.highest_bid > 0 && (
              <p className="text-xs text-muted-foreground">
                High bid: <span className="font-semibold text-foreground">${item.highest_bid.toLocaleString("en-US")}</span>
              </p>
            )}
            {displayPrice && (
              <span className="font-sans text-base font-semibold text-foreground">
                ${displayPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function BuyerDashboard() {
  const [tab, setTab] = useState("watchlist");

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: watchlist = [] } = useQuery({
    queryKey: ["buyer-watchlist"],
    queryFn: () => base44.entities.WatchlistItem.list("-created_date", 50),
    initialData: [],
  });

  const { data: rawBids = [] } = useQuery({
    queryKey: ["buyer-bids"],
    queryFn: () => base44.entities.Bid.list("-created_date", 200),
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

  const activeBids = bids.filter(b => b.status !== "lost");
  const wonBids = rawBids.filter(b => b.status === "won");

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your bids and saved items</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Saved Items", value: watchlist.length, icon: Heart },
            { label: "Active Bids", value: activeBids.length, icon: Gavel },
            { label: "Won", value: wonBids.length, icon: Package },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-sans text-2xl font-bold mt-0.5">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="watchlist" className="gap-1.5"><Heart className="w-3.5 h-3.5" /> Saved</TabsTrigger>
            <TabsTrigger value="bids" className="gap-1.5"><Gavel className="w-3.5 h-3.5" /> Bids</TabsTrigger>
            <TabsTrigger value="purchases" className="gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> Purchases</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5"><Settings className="w-3.5 h-3.5" /> Settings</TabsTrigger>
          </TabsList>

          {/* SAVED */}
          <TabsContent value="watchlist">
            {watchlist.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-serif text-xl text-muted-foreground">No saved items</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Browse the marketplace and save items you love</p>
                <Link to="/browse" className="text-sm text-primary font-medium">Browse →</Link>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {watchlist.map(w => (
                  <SavedItemCard key={w.id} itemId={w.item_id} watchlistId={w.id} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* BIDS */}
          <TabsContent value="bids">
            {activeBids.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Gavel className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-serif text-xl text-muted-foreground">No active bids</p>
                <p className="text-sm text-muted-foreground mt-1">Start bidding on items in the marketplace</p>
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
            <Card><CardContent className="p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-serif text-xl text-muted-foreground">No purchases yet</p>
              <p className="text-sm text-muted-foreground mt-1">Won items and invoices will appear here</p>
            </CardContent></Card>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings">
            <div className="mb-4">
              <h3 className="font-serif text-xl font-semibold">My Profile</h3>
              <p className="text-sm text-muted-foreground mt-1">Required to confirm purchases. Your info is auto-filled on invoices.</p>
            </div>
            <BuyerProfileForm user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}