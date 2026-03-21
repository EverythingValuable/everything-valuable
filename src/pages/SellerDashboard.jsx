import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Package, TrendingUp, Eye, DollarSign, Upload, X } from "lucide-react";

const categoryOptions = [
  { value: "fine_art", label: "Fine Art" }, { value: "jewelry", label: "Jewelry" },
  { value: "watches", label: "Watches" }, { value: "furniture", label: "Furniture" },
  { value: "decorative_arts", label: "Decorative Arts" }, { value: "design", label: "Design" },
  { value: "antiques", label: "Antiques" }, { value: "collectibles", label: "Collectibles" },
  { value: "luxury_goods", label: "Luxury Goods" }, { value: "other", label: "Other" },
];

const statusColors = {
  draft: "bg-muted text-muted-foreground", first_bids: "bg-primary/10 text-primary",
  prisometer: "bg-red-50 text-red-600", sold: "bg-emerald-50 text-emerald-700",
  pending_review: "bg-amber-50 text-amber-700", unsold: "bg-muted text-muted-foreground",
  declined: "bg-destructive/10 text-destructive",
};

function NewItemForm({ onClose }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "fine_art", condition: "very_good",
    prisometer_start_price: "", reserve_price: "", below_reserve_percent: 10,
    first_bids_duration_hours: 24, prisometer_duration_hours: 48,
    estimated_low: "", estimated_high: "", dimensions: "", materials: "", period: "", origin: "",
    provenance: "", condition_notes: "", shipping_notes: "",
  });
  const [images, setImages] = useState([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImages(prev => [...prev, file_url]);
    }
  };

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Item.create({
      ...form,
      images,
      prisometer_start_price: parseFloat(form.prisometer_start_price),
      reserve_price: parseFloat(form.reserve_price),
      estimated_low: form.estimated_low ? parseFloat(form.estimated_low) : undefined,
      estimated_high: form.estimated_high ? parseFloat(form.estimated_high) : undefined,
      status: "draft",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-items"] });
      toast({ title: "Item created", description: "Your listing has been saved as a draft." });
      onClose();
    },
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold">New Listing</h2>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>

      {/* Images */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Photos</Label>
        <div className="flex gap-2 flex-wrap mb-2">
          {images.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-foreground/60 text-background flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Mid-Century Danish Teak Sideboard" />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Editorial description of the item..." />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Condition</Label>
          <Select value={form.condition} onValueChange={(v) => update("condition", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="very_good">Very Good</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="as_is">As Is</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="font-serif text-lg font-semibold mb-4">Pricing & Sale Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>PRI$OMETER Start Price ($)</Label>
            <Input type="number" value={form.prisometer_start_price} onChange={(e) => update("prisometer_start_price", e.target.value)} placeholder="5000" />
          </div>
          <div>
            <Label>Reserve Price ($) — Hidden</Label>
            <Input type="number" value={form.reserve_price} onChange={(e) => update("reserve_price", e.target.value)} placeholder="3000" />
          </div>
          <div>
            <Label>Below Reserve Tolerance</Label>
            <Select value={form.below_reserve_percent.toString()} onValueChange={(v) => update("below_reserve_percent", parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5% below reserve</SelectItem>
                <SelectItem value="10">10% below reserve</SelectItem>
                <SelectItem value="15">15% below reserve</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>1stBid$ Preview Duration</Label>
            <Select value={form.first_bids_duration_hours.toString()} onValueChange={(v) => update("first_bids_duration_hours", parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Hours</SelectItem>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
                <SelectItem value="72">72 Hours</SelectItem>
                <SelectItem value="168">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>PRI$OMETER Duration</Label>
            <Select value={form.prisometer_duration_hours.toString()} onValueChange={(v) => update("prisometer_duration_hours", parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
                <SelectItem value="72">72 Hours</SelectItem>
                <SelectItem value="168">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="font-serif text-lg font-semibold mb-4">Additional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Estimate Low ($)</Label><Input type="number" value={form.estimated_low} onChange={(e) => update("estimated_low", e.target.value)} /></div>
          <div><Label>Estimate High ($)</Label><Input type="number" value={form.estimated_high} onChange={(e) => update("estimated_high", e.target.value)} /></div>
          <div><Label>Dimensions</Label><Input value={form.dimensions} onChange={(e) => update("dimensions", e.target.value)} placeholder='e.g. 24" × 36" × 2"' /></div>
          <div><Label>Materials</Label><Input value={form.materials} onChange={(e) => update("materials", e.target.value)} placeholder="Oil on canvas" /></div>
          <div><Label>Period</Label><Input value={form.period} onChange={(e) => update("period", e.target.value)} placeholder="Mid-20th Century" /></div>
          <div><Label>Origin</Label><Input value={form.origin} onChange={(e) => update("origin", e.target.value)} placeholder="France" /></div>
          <div className="md:col-span-2"><Label>Provenance</Label><Textarea value={form.provenance} onChange={(e) => update("provenance", e.target.value)} rows={2} /></div>
          <div className="md:col-span-2"><Label>Condition Notes</Label><Textarea value={form.condition_notes} onChange={(e) => update("condition_notes", e.target.value)} rows={2} /></div>
          <div className="md:col-span-2"><Label>Shipping Notes</Label><Textarea value={form.shipping_notes} onChange={(e) => update("shipping_notes", e.target.value)} rows={2} /></div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {createMutation.isPending ? "Saving..." : "Save as Draft"}
        </Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  const [showNewItem, setShowNewItem] = useState(false);
  const [tab, setTab] = useState("inventory");

  const { data: items = [] } = useQuery({
    queryKey: ["seller-items"],
    queryFn: () => base44.entities.Item.list("-created_date", 100),
    initialData: [],
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["seller-invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 50),
    initialData: [],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const launchMutation = useMutation({
    mutationFn: async (item) => {
      const now = new Date();
      const endTime = new Date(now.getTime() + (item.first_bids_duration_hours || 24) * 3600000);
      await base44.entities.Item.update(item.id, {
        status: "first_bids",
        first_bids_start: now.toISOString(),
        first_bids_end: endTime.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-items"] });
      toast({ title: "Listing launched", description: "1stBid$ preview is now active." });
    },
  });

  const stats = {
    total: items.length,
    live: items.filter(i => ["first_bids", "prisometer"].includes(i.status)).length,
    watchers: items.reduce((sum, i) => sum + (i.watcher_count || 0), 0),
    revenue: invoices.reduce((sum, inv) => sum + (inv.item_price || 0), 0),
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Seller Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your listings and sales</p>
          </div>
          <Button onClick={() => setShowNewItem(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> New Listing
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Listings", value: stats.total, icon: Package },
            { label: "Live Now", value: stats.live, icon: TrendingUp },
            { label: "Total Watchers", value: stats.watchers, icon: Eye },
            { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign },
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

        {showNewItem ? (
          <Card>
            <CardContent className="p-6 md:p-8">
              <NewItemForm onClose={() => setShowNewItem(false)} />
            </CardContent>
          </Card>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              {items.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-serif text-xl text-muted-foreground">No listings yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create your first listing to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-serif">EV</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${statusColors[item.status]} text-[10px]`}>{item.status?.replace("_", " ")}</Badge>
                            <span className="text-xs text-muted-foreground">${item.prisometer_start_price?.toLocaleString()}</span>
                            {item.bid_count > 0 && <span className="text-xs text-muted-foreground">{item.bid_count} bids</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {item.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => launchMutation.mutate(item)} disabled={launchMutation.isPending}>
                              Launch
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {items.filter(i => i.status === "pending_review").length === 0 ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground">No pending items</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {items.filter(i => i.status === "pending_review").map(item => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Highest bid: ${item.highest_bid?.toLocaleString()} (below reserve)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={async () => {
                              await base44.entities.Item.update(item.id, { status: "sold", sold_price: item.highest_bid, sold_via: "seller_accepted" });
                              queryClient.invalidateQueries({ queryKey: ["seller-items"] });
                              toast({ title: "Offer accepted" });
                            }}>Accept</Button>
                          <Button size="sm" variant="destructive"
                            onClick={async () => {
                              await base44.entities.Item.update(item.id, { status: "declined" });
                              queryClient.invalidateQueries({ queryKey: ["seller-items"] });
                              toast({ title: "Offer declined" });
                            }}>Decline</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invoices">
              {invoices.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground">No invoices yet</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {invoices.map(inv => (
                    <Card key={inv.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Invoice #{inv.id?.slice(-8)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {inv.buyer_email} • ${inv.item_price?.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline">{inv.status}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}