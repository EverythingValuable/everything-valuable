import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Package, Trash2, Clock, Gavel, ShieldCheck,
  Eye, Heart, Search, Handshake, Download,
  SlidersHorizontal, ChevronLeft, ChevronRight, Activity,
  Package2, DollarSign, CheckCircle2, AlertCircle, X, ZoomIn,
  Loader2, XCircle
} from "lucide-react";

// ─── Image Lightbox ────────────────────────────────────────────────────────────
function ImageLightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
        <X className="w-6 h-6" />
      </button>
      <div className="relative max-w-4xl max-h-[85vh] flex items-center gap-4" onClick={e => e.stopPropagation()}>
        {images.length > 1 && (
          <button onClick={prev} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <img src={images[idx]} alt="" className="max-h-[85vh] max-w-full object-contain rounded-lg" />
        {images.length > 1 && (
          <button onClick={next} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
              className={`w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
      )}
      <p className="absolute bottom-4 right-4 text-white/50 text-sm">{idx + 1} / {images.length}</p>
    </div>
  );
}
import { formatDistanceToNow, isPast, subDays } from "date-fns";
import ItemRowMenu from "./ItemRowMenu";
import AdvancedFiltersPanel from "./AdvancedFiltersPanel";

const STATUS_CONFIG = {
  draft:          { label: "Draft",             cls: "bg-gray-100 text-gray-500 border-gray-200" },
  first_bids:     { label: "1stBid$ Preview",   cls: "bg-blue-50 text-blue-700 border-blue-100" },
  prisometer:     { label: "PRI$OMETER Live",   cls: "bg-red-50 text-red-700 border-red-200 font-bold" },
  sold:           { label: "Sold",              cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending_review: { label: "Under Review",      cls: "bg-amber-50 text-amber-700 border-amber-200" },
  unsold:         { label: "Unsold",            cls: "bg-gray-100 text-gray-500 border-gray-200" },
  scheduled:      { label: "Scheduled",         cls: "bg-purple-50 text-purple-700 border-purple-100" },
  declined:       { label: "Declined",          cls: "bg-rose-50 text-rose-700 border-rose-100" },
};

const CATEGORIES = [
  "All Categories", "fine_art", "decorative_art", "jewelry", "asian_antiques",
  "fashion_accessories", "watches_clocks", "furniture", "collectibles", "other"
];
const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "first_bids", label: "1stBid$ Preview" },
  { value: "prisometer", label: "PRI$OMETER Live" },
  { value: "pending_review", label: "Under Review" },
  { value: "sold", label: "Sold" },
  { value: "unsold", label: "Unsold" },
  { value: "scheduled", label: "Scheduled" },
];
const PRISOMETER_OPTS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

const PAGE_SIZES = [10, 25, 50];

function itemPriceDisplay(item) {
  if (item.status === "sold") return { label: "Sold for", value: `$${item.sold_price?.toLocaleString() ?? "—"}`, green: true };
  if (item.status === "prisometer") return { label: "Current", value: item.current_price ? `$${item.current_price.toLocaleString()}` : "—" };
  if (item.status === "first_bids") {
    const bid = item.highest_bid || 0;
    return { label: bid > 0 ? "High bid" : "Starting", value: bid > 0 ? `$${bid.toLocaleString()}` : `$${item.prisometer_start_price?.toLocaleString() ?? "—"}` };
  }
  return { label: "Asking", value: item.prisometer_start_price ? `$${item.prisometer_start_price.toLocaleString()}` : "—" };
}

// ─── Summary Cards ─────────────────────────────────────────────────────────────
function SummaryCards({ items }) {
  const total = items.length;
  const totalValue = items.reduce((sum, i) => {
    const v = i.current_price || i.highest_bid || i.prisometer_start_price || 0;
    return sum + v;
  }, 0);
  const live = items.filter(i => i.status === "prisometer").length;
  const review = items.filter(i => i.status === "pending_review").length;
  const sold = items.filter(i => i.status === "sold").length;

  const cards = [
    { label: "Total Inventory", value: total.toLocaleString(), sub: "All items", icon: Package2, color: "text-slate-500", bg: "bg-slate-50" },
    { label: "Total Current Price", value: `$${totalValue.toLocaleString()}`, sub: "Sum of current prices", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Live on PRI$OMETER", value: live.toLocaleString(), sub: "Items", icon: Activity, color: "text-red-600", bg: "bg-red-50" },
    { label: "Under Review", value: review.toLocaleString(), sub: "Items", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Sold Items", value: sold.toLocaleString(), sub: "Items", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-xl border border-border shadow-sm px-4 py-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">{card.label}</p>
              <p className="font-price text-2xl font-bold text-foreground leading-none">{card.value}</p>
              <p className="text-[11px] text-muted-foreground/50 mt-1">{card.sub}</p>
            </div>
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InventoryTable({ items, view, limit }) {
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lightbox, setLightbox] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState(new Set());
  const [processingOffer, setProcessingOffer] = useState(null);
  const queryClient = useQueryClient();

  const handleAcceptOffer = async (item) => {
    setProcessingOffer(item.id);
    await base44.entities.Item.update(item.id, {
      status: "sold",
      sold_price: item.make_it_mine_buyer ? item.prisometer_start_price : item.highest_bid,
      sold_to_email: item.make_it_mine_buyer || item.highest_bidder_email,
      sold_via: "make_it_mine",
    });
    if (item.make_it_mine_buyer || item.highest_bidder_email) {
      await base44.integrations.Core.SendEmail({
        to: item.make_it_mine_buyer || item.highest_bidder_email,
        subject: `Your offer on "${item.title}" has been accepted!`,
        body: `Congratulations! The seller has accepted your offer on "${item.title}". You will receive an invoice shortly with payment instructions.`,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["seller-items"] });
    setProcessingOffer(null);
  };

  const handleDeclineOffer = async (item) => {
    setProcessingOffer(item.id);
    await base44.entities.Item.update(item.id, {
      status: "unsold",
      make_it_mine_buyer: null,
      make_it_mine_expires: null,
    });
    if (item.make_it_mine_buyer || item.highest_bidder_email) {
      await base44.integrations.Core.SendEmail({
        to: item.make_it_mine_buyer || item.highest_bidder_email,
        subject: `Update on your offer for "${item.title}"`,
        body: `Thank you for your interest in "${item.title}". Unfortunately the seller has declined this offer at this time.`,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["seller-items"] });
    setProcessingOffer(null);
  };

  const toggleDesc = (id) => setExpandedDesc(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ── Filter ──
  const q = search.toLowerCase().trim();
  const filtered = items.filter(item => {
    const matchQ = !q || (
      item.title?.toLowerCase().includes(q) ||
      item.maker?.toLowerCase().includes(q) ||
      item.inventory_number?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.consignor_name?.toLowerCase().includes(q)
    );
    const matchCat = !categoryFilter || categoryFilter === "All Categories" || item.category === categoryFilter;
    const matchStatus = !statusFilter || item.status === statusFilter;
    const af = advancedFilters;
    const price = item.current_price || item.highest_bid || item.prisometer_start_price || 0;
    const matchPriceMin = !af.priceMin || price >= Number(af.priceMin);
    const matchPriceMax = !af.priceMax || price <= Number(af.priceMax);
    const matchDate = !af.dateRange || (item.created_date && new Date(item.created_date) >= subDays(new Date(), Number(af.dateRange)));
    const matchOwnership = !af.ownershipType || item.ownership_type === af.ownershipType;
    const matchCondition = !af.condition || item.condition === af.condition;
    const matchBids = !af.hasBids || (af.hasBids === "yes" ? (item.bid_count || 0) > 0 : (item.bid_count || 0) === 0);
    return matchQ && matchCat && matchStatus && matchPriceMin && matchPriceMax && matchDate && matchOwnership && matchCondition && matchBids;
  });

  // ── Pagination ──
  const effectiveLimit = limit || Infinity;
  const paginated = filtered.slice(0, effectiveLimit);
  const totalPages = Math.max(1, Math.ceil(paginated.length / pageSize));
  const displayed = paginated.slice((page - 1) * pageSize, page * pageSize);

  const resetPage = () => setPage(1);

  // ── Selection ──
  const toggleSelect = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () => setSelected(selected.size === displayed.length ? new Set() : new Set(displayed.map(i => i.id)));

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} item${selected.size !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    setDeleting(true);
    await Promise.all([...selected].map(id => base44.entities.Item.delete(id)));
    setSelected(new Set());
    setDeleting(false);
    queryClient.invalidateQueries({ queryKey: ["seller-items"] });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-16 text-center space-y-3">
        <Package className="w-8 h-8 text-muted-foreground/30 mx-auto" />
        <h3 className="font-serif text-lg font-medium text-muted-foreground">No items here yet</h3>
        <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
          {view === "draft" ? "Save a listing as a draft to see it here."
          : view === "sold" ? "Completed sales will appear here."
          : "Upload your first item to get started."}
        </p>
        <Link to="/seller/studio">
          <Button className="mt-2 gap-2"><Plus className="w-4 h-4" /> Add Listing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Summary cards — only on full inventory view */}
      {!view && <SummaryCards items={items} />}

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">Inventory</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {items.length.toLocaleString()} items total
            {items.filter(i => i.prisometer_start_price).length > 0 && (
              <> · <span className="font-medium">${items.reduce((s, i) => s + (i.current_price || i.prisometer_start_price || 0), 0).toLocaleString()}</span> Total Current Price</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px] h-8">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Link to="/seller/studio">
            <Button size="sm" className="gap-1.5 text-[12px] h-8 bg-primary hover:bg-primary/90">
              <Plus className="w-3.5 h-3.5" /> Add Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Search by title, maker, inventory #, consignment…"
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            className="pl-8 h-9 bg-white text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); resetPage(); }}
          className="h-9 border border-input bg-white rounded-md px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c === "All Categories" ? "" : c}>
              {c === "All Categories" ? c : c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); resetPage(); }}
          className="h-9 border border-input bg-white rounded-md px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <Button
          variant="outline"
          size="sm"
          className={`gap-1.5 text-[12px] h-9 border-border/60 ${showAdvanced ? "bg-primary/5 border-primary/30 text-primary" : ""}`}
          onClick={() => setShowAdvanced(o => !o)}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          More Filters
          {Object.values(advancedFilters).some(v => v !== "" && v !== undefined) && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          )}
        </Button>
      </div>

      {/* ── Advanced Filters Panel ── */}
      {showAdvanced && (
        <AdvancedFiltersPanel
          onApply={setAdvancedFilters}
          onClose={() => setShowAdvanced(false)}
        />
      )}

      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-destructive/5 border border-destructive/15 rounded-lg">
          <span className="text-sm font-medium text-destructive">{selected.size} selected</span>
          <Button variant="destructive" size="sm" className="gap-1.5 ml-auto" onClick={handleBulkDelete} disabled={deleting}>
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "Deleting…" : `Delete ${selected.size}`}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Cancel</Button>
        </div>
      )}

      {/* ── No results ── */}
      {displayed.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-sm text-muted-foreground">No items match your filters</p>
        </div>
      )}

      {/* ── Rows ── */}
      {displayed.length > 0 && (
        <div className="divide-y divide-border/40 border border-border bg-white">
          {displayed.map(item => {
            const price = itemPriceDisplay(item);
            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
            const isLive = ["first_bids", "prisometer", "pending_review"].includes(item.status);
            const isConsignment = item.ownership_type === "consignment";
            const hasDesc = !!item.description;
            const descOpen = expandedDesc.has(item.id);

            // Timer
            let timerEl = null;
            if (item.status === "first_bids" && item.first_bids_end) {
              timerEl = (
                <span className="text-[10px] text-blue-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isPast(new Date(item.first_bids_end)) ? "Ended" : formatDistanceToNow(new Date(item.first_bids_end), { addSuffix: true })}
                </span>
              );
            } else if (item.status === "prisometer" && item.prisometer_activated_at && item.prisometer_duration_hours) {
              const end = new Date(new Date(item.prisometer_activated_at).getTime() + item.prisometer_duration_hours * 3600000);
              timerEl = (
                <span className={`text-[10px] flex items-center gap-1 ${isPast(end) ? "text-muted-foreground/50" : "text-red-600"}`}>
                  <Clock className="w-3 h-3" />
                  {isPast(end) ? "Expired" : formatDistanceToNow(end, { addSuffix: true })}
                </span>
              );
            }

            return (
              <React.Fragment key={item.id}>
                <div className={`flex items-center gap-4 px-5 py-4 hover:bg-neutral-50/60 transition-colors group ${selected.has(item.id) ? "bg-primary/3" : ""}`}>
                  {/* Checkbox */}
                  <input type="checkbox" className="rounded shrink-0" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />

                  {/* Thumbnail */}
                  {item.images?.[0] ? (
                    <button
                      onClick={() => setLightbox({ images: item.images, startIndex: 0 })}
                      className="relative shrink-0 w-14 h-14 overflow-hidden border border-border/40 group/img focus:outline-none"
                    >
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
                      {item.images.length > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] font-bold px-1 leading-tight">+{item.images.length - 1}</span>
                      )}
                    </button>
                  ) : (
                    <div className="w-14 h-14 bg-neutral-100 shrink-0" />
                  )}

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif font-semibold text-foreground truncate leading-snug">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {item.inventory_number && <span className="font-mono text-[10px] text-muted-foreground/60">{item.inventory_number}</span>}
                      {item.inventory_number && <span className="text-muted-foreground/30 text-[10px]">·</span>}
                      <span className="text-[11px] text-muted-foreground/60 capitalize">{item.category?.replace(/_/g, " ") || "—"}</span>
                      {isConsignment && (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 font-bold tracking-wide uppercase">
                          <Handshake className="w-2.5 h-2.5" /> Consignment
                        </span>
                      )}
                    </div>
                    {hasDesc && (
                      <button
                        onClick={() => toggleDesc(item.id)}
                        className="text-[10px] text-primary/60 hover:text-primary underline underline-offset-2 transition-colors mt-0.5"
                      >
                        {descOpen ? "Hide description" : "Show description"}
                      </button>
                    )}
                  </div>

                  {/* Price block */}
                  <div className="hidden sm:block text-right shrink-0 w-28">
                    <p className={`font-price text-sm font-bold tabular-nums ${price.green ? "text-emerald-700" : "text-foreground"}`}>{price.value}</p>
                    {item.reserve_price > 0 && (
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5 flex items-center justify-end gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> ${item.reserve_price.toLocaleString()}
                      </p>
                    )}
                    {timerEl && <div className="mt-1">{timerEl}</div>}
                  </div>

                  {/* Status */}
                  <div className="hidden md:block shrink-0 w-28 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-[9px] font-bold tracking-wide uppercase border ${status.cls}`}>
                      {item.status === "prisometer" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse inline-block" />}
                      {status.label}
                    </span>
                  </div>

                  {/* Insights: bids / views / saves */}
                  <div className="hidden lg:flex flex-col gap-1 shrink-0 w-24">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                      <Gavel className="w-3 h-3 text-muted-foreground/40" />
                      <span className="font-semibold text-foreground tabular-nums">{item.bid_count || 0}</span>
                      <span className="text-[10px]">bids</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                      <Eye className="w-3 h-3 text-muted-foreground/40" />
                      <span className="font-semibold text-foreground tabular-nums">{item.view_count || 0}</span>
                      <span className="text-[10px]">views</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                      <Heart className="w-3 h-3 text-rose-300" />
                      <span className="font-semibold text-foreground tabular-nums">{item.watcher_count || 0}</span>
                      <span className="text-[10px]">saves</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.status === "pending_review" ? (
                      <>
                        <Button size="sm" className="text-[11px] h-7 px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAcceptOffer(item)} disabled={processingOffer === item.id}>
                          {processingOffer === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 gap-1 border-amber-400 text-amber-800 hover:bg-amber-50" onClick={() => handleDeclineOffer(item)} disabled={processingOffer === item.id}>
                          <XCircle className="w-3 h-3" /> Decline
                        </Button>
                      </>
                    ) : item.status !== "sold" ? (
                      <Link to={`/seller/studio?edit=${item.id}`}>
                        <Button variant="outline" size="sm" className="text-[11px] font-semibold h-7 px-3 border-border/60">
                          {isLive ? "Manage" : item.status === "unsold" ? "Relist" : "Edit"}
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/item/${item.id}`}>
                        <Button variant="outline" size="sm" className="text-[11px] font-semibold h-7 px-3 border-border/60">View</Button>
                      </Link>
                    )}
                    <ItemRowMenu item={item} />
                  </div>
                </div>

                {/* Description expansion */}
                {descOpen && hasDesc && (
                  <div className="bg-neutral-50/60 px-5 pb-4 pt-2 pl-[5.5rem]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">Description</p>
                    <p className="text-sm text-foreground/70 leading-relaxed max-w-3xl">{item.description}</p>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* ── Pagination ── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
          <p className="text-[12px] text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length.toLocaleString()} items
            {q ? ` matching "${search}"` : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md border text-[12px] font-semibold transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-white text-foreground hover:bg-secondary"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {totalPages > 5 && page < totalPages - 2 && (
              <>
                <span className="text-muted-foreground text-[12px]">…</span>
                <button onClick={() => setPage(totalPages)} className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-white text-[12px] font-semibold hover:bg-secondary">
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-8 border border-input bg-white rounded-md px-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}