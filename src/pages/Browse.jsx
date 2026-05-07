import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ItemCard from "../components/shared/ItemCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronRight, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAIN_CATEGORIES, SUBCATEGORIES, CATEGORY_LABELS, PERIODS, CATEGORIES_WITH_PERIODS } from "@/lib/categoryConfig";

const statusLabels = {
  first_bids: "1stBid$ Active",
  prisometer: "PRI$OMETER Live",
};

export default function Browse() {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [subcategory, setSubcategory] = useState(params.get("subcategory") || "");
  const [period, setPeriod] = useState("");
  const [statusFilter, setStatusFilter] = useState(params.get("status") || "all");
  const [sort, setSort] = useState("-created_date");
  const [expandedCategory, setExpandedCategory] = useState(params.get("category") || null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items-browse"],
    queryFn: () => base44.entities.Item.filter(
      { status: ["first_bids", "prisometer"] },
      "-created_date",
      200
    ),
    refetchInterval: 60000,
    staleTime: 0,
    refetchOnMount: true,
  });

  const filtered = useMemo(() => {
    let result = [...items];
    if (category !== "all") result = result.filter(i => i.category === category);
    if (subcategory) result = result.filter(i => i.subcategory === subcategory);
    if (period) result = result.filter(i => i.period === period);
    if (statusFilter !== "all") result = result.filter(i => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.seller_name?.toLowerCase().includes(q) ||
        i.maker?.toLowerCase().includes(q) ||
        i.keywords?.toLowerCase().includes(q)
      );
    }
    if (sort === "price_asc") result.sort((a, b) => (a.prisometer_start_price || 0) - (b.prisometer_start_price || 0));
    else if (sort === "price_desc") result.sort((a, b) => (b.prisometer_start_price || 0) - (a.prisometer_start_price || 0));
    else if (sort === "bids") result.sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0));
    return result;
  }, [items, category, subcategory, period, statusFilter, search, sort]);

  // Count items per category for sidebar badges
  const countByCategory = useMemo(() => {
    const counts = {};
    items.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  const countBySubcategory = useMemo(() => {
    const counts = {};
    items.filter(i => category === "all" || i.category === category).forEach(i => {
      if (i.subcategory) counts[i.subcategory] = (counts[i.subcategory] || 0) + 1;
    });
    return counts;
  }, [items, category]);

  const handleCategoryClick = (catValue) => {
    if (catValue === "all") {
      setCategory("all");
      setSubcategory("");
      setPeriod("");
      setExpandedCategory(null);
    } else if (expandedCategory === catValue && category === catValue) {
      setCategory("all");
      setSubcategory("");
      setPeriod("");
      setExpandedCategory(null);
    } else {
      setCategory(catValue);
      setSubcategory("");
      setPeriod("");
      setExpandedCategory(catValue);
    }
  };

  const handleSubcategoryClick = (sub) => {
    setSubcategory(prev => prev === sub ? "" : sub);
  };

  const clearAll = () => {
    setCategory("all");
    setSubcategory("");
    setPeriod("");
    setStatusFilter("all");
    setSearch("");
    setExpandedCategory(null);
  };

  const activeLabel = category !== "all"
    ? (subcategory ? `${CATEGORY_LABELS[category]} › ${subcategory}` : CATEGORY_LABELS[category])
    : null;

  const Sidebar = () => (
    <aside className="w-56 flex-shrink-0 space-y-1">
      <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-2">
        Categories
      </h2>

      {/* All */}
      <button
        onClick={() => handleCategoryClick("all")}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
          category === "all" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
        }`}
      >
        <span>All Categories</span>
        {items.length > 0 && <span className="text-xs text-muted-foreground">{items.length}</span>}
      </button>

      {MAIN_CATEGORIES.map(({ value, label }) => {
        const isExpanded = expandedCategory === value;
        const isActive = category === value;
        const subs = SUBCATEGORIES[value] || [];
        const count = countByCategory[value] || 0;

        return (
          <div key={value}>
            <button
              onClick={() => handleCategoryClick(value)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {subs.length > 0 && (
                  isExpanded
                    ? <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    : <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                )}
                {label}
              </span>
              {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
            </button>

            {/* Subcategories */}
            {isExpanded && subs.length > 0 && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-3 mb-1">
                {subs.map(sub => {
                  const subCount = countBySubcategory[sub] || 0;
                  return (
                    <button
                      key={sub}
                      onClick={() => handleSubcategoryClick(sub)}
                      className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors flex items-center justify-between ${
                        subcategory === sub
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{sub}</span>
                      {subCount > 0 && <span className="text-muted-foreground/60">{subCount}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Period filter — shown when this category supports periods and is expanded */}
            {isExpanded && CATEGORIES_WITH_PERIODS.includes(value) && (
              <div className="ml-5 mt-2 mb-2 border-l border-border pl-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-2">Time Period</p>
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(prev => prev === p ? "" : p)}
                    className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors ${
                      period === p ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 md:py-10">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            {activeLabel ? activeLabel : "Browse the Marketplace"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {filtered.length} {filtered.length === 1 ? "object" : "objects"} available
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        {/* Top filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search objects, artists, sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-card"
            />
          </div>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden gap-2"
            onClick={() => setShowMobileFilters(v => !v)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-10 bg-card">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40 h-10 bg-card">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_date">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
              <SelectItem value="bids">Most Bids</SelectItem>
            </SelectContent>
          </Select>

          {(category !== "all" || statusFilter !== "all" || search) && (
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {(activeLabel || period || statusFilter !== "all") && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {activeLabel && (
              <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                {activeLabel}
                <button className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/10" onClick={() => { setCategory("all"); setSubcategory(""); setPeriod(""); setExpandedCategory(null); }}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {period && (
              <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                {period}
                <button className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/10" onClick={() => setPeriod("")}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                {statusLabels[statusFilter]}
                <button className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/10" onClick={() => setStatusFilter("all")}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Body: sidebar + grid */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Mobile sidebar */}
          {showMobileFilters && (
            <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold">Browse by Category</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar />
              <Button className="w-full mt-6" onClick={() => setShowMobileFilters(false)}>
                View {filtered.length} Results
              </Button>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                <button onClick={clearAll} className="mt-4 text-sm text-primary hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((item, i) => (
                  <ItemCard key={item.id} item={item} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}