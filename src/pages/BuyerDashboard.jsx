import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Gavel, ShoppingBag, Settings, Package } from "lucide-react";
import { Link } from "react-router-dom";

const statusColors = {
  active: "bg-green-50 text-green-700 border-green-200",
  outbid: "bg-orange-50 text-orange-700 border-orange-200",
  won: "bg-primary/10 text-primary border-primary/20",
  lost: "bg-muted text-muted-foreground border-border",
};

function ItemRow({ itemId, children }) {
  const { data: item } = useQuery({
    queryKey: ["item-mini", itemId],
    queryFn: () => base44.entities.Item.filter({ id: itemId }).then(r => r[0]),
    enabled: !!itemId,
    staleTime: 60000,
  });

  return (
    <Link to={`/item/${itemId}`} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
        {item?.images?.[0]
          ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full bg-muted" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">
          {item?.title || `Item #${itemId?.slice(-8)}`}
        </p>
        {item?.category && (
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{item.category.replace("_", " ")}</p>
        )}
        {children}
      </div>
    </Link>
  );
}

export default function BuyerDashboard() {
  const [tab, setTab] = useState("watchlist");

  const { data: watchlist = [] } = useQuery({
    queryKey: ["buyer-watchlist"],
    queryFn: () => base44.entities.WatchlistItem.list("-created_date", 50),
    initialData: [],
  });

  const { data: rawBids = [] } = useQuery({
    queryKey: ["buyer-bids"],
    queryFn: () => base44.entities.Bid.list("-created_date", 50),
    initialData: [],
  });

  // Deduplicate: one entry per item, keeping the most recent bid
  const bids = Object.values(
    rawBids.reduce((acc, bid) => {
      if (!acc[bid.item_id] || new Date(bid.created_date) > new Date(acc[bid.item_id].created_date)) {
        acc[bid.item_id] = bid;
      }
      return acc;
    }, {})
  );

  const { data: invoices = [] } = useQuery({
    queryKey: ["buyer-invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 50),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your bids, purchases, and saved items</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Saved Items", value: watchlist.length, icon: Heart },
            { label: "Active Bids", value: bids.filter(b => b.status === "active").length, icon: Gavel },
            { label: "Purchases", value: invoices.length, icon: ShoppingBag },
            { label: "Won", value: bids.filter(b => b.status === "won").length, icon: Package },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-serif text-2xl font-bold mt-0.5">{s.value}</p>
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
              <div className="space-y-3">
                {watchlist.map(w => (
                  <ItemRow key={w.id} itemId={w.item_id} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* BIDS */}
          <TabsContent value="bids">
            {bids.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Gavel className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-serif text-xl text-muted-foreground">No bids placed</p>
                <p className="text-sm text-muted-foreground mt-1">Start bidding on items in the marketplace</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {bids.map(bid => (
                  <ItemRow key={bid.id} itemId={bid.item_id}>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-price font-semibold text-foreground">
                        ${bid.amount?.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {bid.phase === "first_bids" ? "1stBid$™" : "PRI$OMETER™"}
                      </span>
                      <Badge className={`text-[10px] px-2 py-0 border ml-auto ${statusColors[bid.status] || ""}`}>
                        {bid.status === "active" ? "High Bidder" : bid.status}
                      </Badge>
                    </div>
                  </ItemRow>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PURCHASES */}
          <TabsContent value="purchases">
            {invoices.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-serif text-xl text-muted-foreground">No purchases yet</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {invoices.map(inv => (
                  <ItemRow key={inv.id} itemId={inv.item_id}>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-price font-semibold text-foreground">
                        ${inv.total_cost?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {inv.purchase_method === "make_it_mine" ? "Make It Mine" : "Bid"}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-2 py-0 ml-auto">{inv.status}</Badge>
                    </div>
                  </ItemRow>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings">
            <Card>
              <CardContent className="p-8 space-y-6">
                <h3 className="font-serif text-xl font-semibold">Account Settings</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipping Address</h4>
                    <p className="text-sm text-muted-foreground">No shipping address saved yet. Add one when completing your first purchase.</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Methods</h4>
                    <p className="text-sm text-muted-foreground">No payment methods saved. Payment will be collected at invoice.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}