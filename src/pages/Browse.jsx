import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ItemCard from "../components/shared/ItemCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryLabels = {
  fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
  decorative_arts: "Decorative Arts", design: "Design", antiques: "Antiques",
  collectibles: "Collectibles", photography: "Photography", sculpture: "Sculpture",
  ceramics: "Ceramics", textiles: "Textiles", books: "Books", wine: "Wine",
  luxury_goods: "Luxury Goods", other: "Other",
};

const statusLabels = {
  first_bids: "1stBid$ Active",
  prisometer: "PRI$OMETER Live",
  sold: "Sold",
};

export default function Browse() {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [statusFilter, setStatusFilter] = useState(params.get("status") || "all");
  const [sort, setSort] = useState("-created_date");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items-browse"],
    queryFn: () => base44.entities.Item.filter(
      { status: ["first_bids", "prisometer", "sold", "pending_review"] },
      "-created_date",
      100
    ),
    initialData: [],
  });

  const filtered = useMemo(() => {
    let result = items;
    if (category !== "all") result = result.filter(i => i.category === category);
    if (statusFilter !== "all") result = result.filter(i => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.seller_name?.toLowerCase().includes(q)
      );
    }
    if (sort === "price_asc") result.sort((a, b) => (a.prisometer_start_price || 0) - (b.prisometer_start_price || 0));
    else if (sort === "price_desc") result.sort((a, b) => (b.prisometer_start_price || 0) - (a.prisometer_start_price || 0));
    else if (sort === "bids") result.sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0));
    return result;
  }, [items, category, statusFilter, search, sort]);

  const activeFilters = [category !== "all" && category, statusFilter !== "all" && statusFilter].filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Browse the Marketplace
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {filtered.length} {filtered.length === 1 ? "object" : "objects"} available
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search objects, sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-card"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40 h-10 bg-card">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10 bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-36 h-10 bg-card">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_date">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="bids">Most Bids</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            {activeFilters.map(f => (
              <Badge key={f} variant="secondary" className="gap-1 pr-1 text-xs">
                {categoryLabels[f] || statusLabels[f] || f}
                <button
                  className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/10"
                  onClick={() => {
                    if (categoryLabels[f]) setCategory("all");
                    if (statusLabels[f]) setStatusFilter("all");
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setCategory("all"); setStatusFilter("all"); setSearch(""); }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-[4/5] rounded-lg bg-muted" />
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/3 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-muted-foreground mb-2">No items found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}