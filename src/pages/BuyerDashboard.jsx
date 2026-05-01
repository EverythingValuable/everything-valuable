import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Gavel, Settings, Package, ShoppingBag, FileText, Download, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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

const INVOICE_STATUS_STYLES = {
  draft:     { label: "Invoice Pending",  className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  sent:      { label: "Invoice Sent",     className: "bg-blue-50 text-blue-700 border-blue-200" },
  paid:      { label: "Paid",             className: "bg-green-50 text-green-700 border-green-200" },
  shipped:   { label: "Shipped",          className: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered: { label: "Delivered",        className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  disputed:  { label: "Disputed",         className: "bg-red-50 text-red-700 border-red-200" },
};

const NEXT_STEP = {
  draft:     "Invoice is being prepared by the seller.",
  sent:      "Review your invoice and arrange payment.",
  paid:      "Awaiting shipment from the seller.",
  shipped:   "Your item is on its way!",
  delivered: "Enjoy your purchase!",
  disputed:  "Contact the seller to resolve this dispute.",
};

function PurchaseRow({ invoice }) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const status = INVOICE_STATUS_STYLES[invoice.status] || INVOICE_STATUS_STYLES.draft;
  const nextStep = NEXT_STEP[invoice.status] || "";

  const handleDownloadPdf = async () => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, "_blank");
      return;
    }
    setGeneratingPdf(true);
    const res = await base44.functions.invoke("generateInvoicePDF", { invoiceId: invoice.id });
    setGeneratingPdf(false);
    if (res.data?.pdf_url) window.open(res.data.pdf_url, "_blank");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base font-medium text-foreground line-clamp-2">{invoice.item_title || "Purchase"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {invoice.seller_email && `From: ${invoice.seller_email}`}
            {invoice.created_date && ` · ${format(new Date(invoice.created_date), "MMM d, yyyy")}`}
          </p>
        </div>
        <Badge variant="outline" className={`shrink-0 text-xs font-medium ${status.className}`}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Purchase Price</p>
          <p className="font-semibold">${Number(invoice.item_price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Invoice Total</p>
          <p className="font-semibold text-primary">${Number(invoice.total_amount || invoice.item_price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {nextStep && (
        <div className="bg-secondary/40 rounded-lg px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Next: </span>{nextStep}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {invoice.item_id && (
          <Link to={`/item/${invoice.item_id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ExternalLink className="w-3 h-3" /> View Item
            </Button>
          </Link>
        )}
        <Button
          variant="outline" size="sm"
          className="gap-1.5 text-xs"
          onClick={handleDownloadPdf}
          disabled={generatingPdf}
        >
          {generatingPdf ? (
            <span className="text-xs">Generating…</span>
          ) : (
            <><Download className="w-3 h-3" /> {invoice.pdf_url ? "Download PDF" : "Get Invoice PDF"}</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "watchlist";
  const [tab, setTab] = useState(defaultTab);

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
  const wonBids = rawBids.filter(b => b.status === "won");

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your bids and saved items</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Saved Items", value: watchlist.length, icon: Heart },
            { label: "Active Bids", value: activeBids.length, icon: Gavel },
            { label: "Won", value: wonBids.length, icon: Package },
            { label: "Purchases", value: purchases.length, icon: ShoppingBag },
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
            {purchases.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-serif text-xl text-muted-foreground">No purchases yet</p>
                <p className="text-sm text-muted-foreground mt-1">Won items and Make It Mine purchases will appear here</p>
                <Link to="/browse" className="text-sm text-primary font-medium mt-3 inline-block">Browse Items →</Link>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {purchases.map(inv => (
                  <PurchaseRow key={inv.id} invoice={inv} />
                ))}
              </div>
            )}
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