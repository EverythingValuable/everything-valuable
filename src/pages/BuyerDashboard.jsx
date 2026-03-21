import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Gavel, ShoppingBag, FileText, Settings, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function BuyerDashboard() {
  const [tab, setTab] = useState("watchlist");

  const { data: watchlist = [] } = useQuery({
    queryKey: ["buyer-watchlist"],
    queryFn: () => base44.entities.WatchlistItem.list("-created_date", 50),
    initialData: [],
  });

  const { data: bids = [] } = useQuery({
    queryKey: ["buyer-bids"],
    queryFn: () => base44.entities.Bid.list("-created_date", 50),
    initialData: [],
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["buyer-invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 50),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
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

          <TabsContent value="watchlist">
            {watchlist.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-serif text-xl text-muted-foreground">No saved items</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Browse the marketplace and save items you love</p>
                  <Link to="/browse" className="text-sm text-primary font-medium">Browse →</Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {watchlist.map(w => (
                  <Card key={w.id}>
                    <CardContent className="p-4">
                      <Link to={`/item/${w.item_id}`} className="text-sm font-medium hover:text-primary">
                        Item #{w.item_id?.slice(-8)}
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bids">
            {bids.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Gavel className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-serif text-xl text-muted-foreground">No bids placed</p>
                  <p className="text-sm text-muted-foreground mt-1">Start bidding on items in the marketplace</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bids.map(bid => (
                  <Card key={bid.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <Link to={`/item/${bid.item_id}`} className="text-sm font-medium hover:text-primary">
                          Item #{bid.item_id?.slice(-8)}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          ${bid.amount?.toLocaleString()} • {bid.phase === "first_bids" ? "1stBid$" : "PRI$OMETER"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {bid.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchases">
            {invoices.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-serif text-xl text-muted-foreground">No purchases yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {invoices.map(inv => (
                  <Card key={inv.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Invoice #{inv.id?.slice(-8)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total: ${inv.total_cost?.toLocaleString("en-US", { minimumFractionDigits: 2 })} • via {inv.purchase_method === "make_it_mine" ? "Make It Mine" : "Bid"}
                        </p>
                      </div>
                      <Badge variant="outline">{inv.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

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