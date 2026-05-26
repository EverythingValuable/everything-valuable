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
import { formatDistanceToNow, isPast, subDays } from "date-fns";
import ItemRowMenu from "./ItemRowMenu";
import AdvancedFiltersPanel from "./AdvancedFiltersPanel";

// ─── Image Lightbox ─────────────────────────────────────────────────────────
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
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
      <div className="relative max-w-4xl max-h-[85vh] flex items-center gap-4" onClick={e => e.stopPropagation()}>
        {images.length > 1 && <button onClick={prev} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0"><ChevronLeft className="w-5 h-5" /></button>}
        <img src={images[idx]} alt="" className="max-h-[85vh] max-w-full object-contain rounded-lg" />
        {images.length > 1 && <button onClick={next} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0"><ChevronRight className="w-5 h-5" /></button>}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }} className={`w-2 h-2 rounded-full ${i === idx ? "bg-white" : "bg-white/30"}`} />)}
        </div>
      )}
      <p className="absolute bottom-4 right-4 text-white/50 text-sm">{idx + 1} / {images.length}</p>
    </div>
  );
}

const STATUS_CONFIG = {
  draft:          { label: "Draft",           dot: "bg-neutral-300",  text: "text-neutral-500",  bg: "bg-neutral-50",  border: "border-neutral-200" },
  first_bids:     { label: "1stBid$ Preview", dot: "bg-neutral-700",  text: "text-neutral-700",  bg: "bg-white",       border: "border-neutral-400" },
  prisometer:     { label: "PRI$OMETER Live", dot: "bg-primary",      text: "text-neutral-900",  bg: "bg-neutral-900", border: "border-neutral-900", textOverride: "text-white" },
  sold:           { label: "Sold",            dot: "bg-neutral-500",  text: "text-neutral-700",  bg: "bg-white",       border: "border-neutral-300" },
  pending_review: { label: "Under Review",    dot: "bg-primary",      text: "text-neutral-700",  bg: "bg-white",       border: "border-neutral-300" },
  unsold:         { label: "Unsold",          dot: "bg-neutral-300",  text: "text-neutral-400",  bg: "bg-neutral-50",  border: "border-neutral-200" },
  scheduled:      { label: "Scheduled",       dot: "bg-neutral-500",  text: "text-neutral-600",  bg: "bg-neutral-50",  border: "border-neutral-300" },
  declined:       { label: "Declined",        dot: "bg-primary",      text: "text-neutral-600",  bg: "bg-neutral-50",  border: "border-neutral-300" },
};

const CATEGORIES = [
  "All Categories","fine_art","decorative_art","jewelry","asian_antiques",
  "fashion_accessories","watches_clocks","furniture","collectibles","other"
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

// ─── Summary Strip ───────────────────────────────────────────────────────────
function SummaryStrip({ items }) {
  const totalValue = items.reduce((s, i) => s + (i.current_price || i.highest_bid || i.prisometer_start_price || 0), 0);
  const live = items.filter(i => i.status === "prisometer").length;
  const preview = items.filter(i => i.status === "first_bids").length;
  const sold = items.filter(i => i.status === "sold").length;
  const draft = items.filter(i => i.status === "draft").length;

  const stats = [
    { label: "Total Items",        value: items.length.toLocaleString() },
    { label: "Total Value",        value: `$${totalValue.toLocaleString()}` },
    { label: "PRI$OMETER Live",    value: live.toLocaleString(),    accent: live > 0 },
    { label: "1stBid$ Preview",    value: preview.toLocaleString() },
    { label: "Drafts",             value: draft.toLocaleString() },
    { label: "Sold",               value: sold.toLocaleString(),    green: true },
  ];

  return (
    <div className="flex flex-wrap gap-0 border border-border bg-white mb-5 divide-x divide-border">
      {stats.map(s => (
        <div key={s.label} className="flex-1 min-w-[100px] px-5 py-3.5">
          <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-muted-foreground/50 mb-1">{s.label}</p>
          <p className={`font-price text-xl font-bold leading-none ${s.accent ? "text-red-600" : s.green ? "text-emerald-600" : "text-foreground"}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold border ${cfg.textOverride || cfg.text} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${status === "prisometer" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function InventoryTable({ items, view, limit }) {
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
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
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

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

  const effectiveLimit = limit || Infinity;
  const paginated = filtered.slice(0, effectiveLimit);
  const totalPages = Math.max(1, Math.ceil(paginated.length / pageSize));
  const displayed = paginated.slice((page - 1) * pageSize, page * pageSize);
  const resetPage = () => setPage(1);

  const toggleSelect = (id) => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
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
      <div className="border border-dashed border-border bg-white p-16 text-center space-y-3">
        <Package className="w-8 h-8 text-muted-foreground/30 mx-auto" />
        <h3 className="font-serif text-lg font-medium text-muted-foreground">No items here yet</h3>
        <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
          {view === "draft" ? "Save a listing as a draft to see it here." : view === "sold" ? "Completed sales will appear here." : "Upload your first item to get started."}
        </p>
        <Link to="/seller/studio"><Button className="mt-2 gap-2"><Plus className="w-4 h-4" /> Add Listing</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Summary strip — full inventory only */}
      {!view && <SummaryStrip items={items} />}

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] text-muted-foreground">
            {filtered.length.toLocaleString()} item{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== items.length && ` of ${items.length.toLocaleString()} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px] h-8">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Link to="/seller/studio">
            <Button size="sm" className="gap-1.5 text-[12px] h-8">
              <Plus className="w-3.5 h-3.5" /> Add Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Search title, maker, inventory #…"
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            className="pl-9 h-9 bg-white text-sm"
          />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); resetPage(); }}
          className="h-9 border border-input bg-white px-3 text-sm text-foreground focus:outline-none">
          {CATEGORIES.map(c => <option key={c} value={c === "All Categories" ? "" : c}>{c === "All Categories" ? c : c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); resetPage(); }}
          className="h-9 border border-input bg-white px-3 text-sm text-foreground focus:outline-none">
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <Button variant="outline" size="sm"
          className={`gap-1.5 text-[12px] h-9 ${showAdvanced ? "bg-primary/5 border-primary/30 text-primary" : ""}`}
          onClick={() => setShowAdvanced(o => !o)}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {Object.values(advancedFilters).some(v => v !== "" && v !== undefined) && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </Button>
      </div>

      {showAdvanced && <AdvancedFiltersPanel onApply={setAdvancedFilters} onClose={() => setShowAdvanced(false)} />}

      {/* Bulk action */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-destructive/5 border border-destructive/15">
          <span className="text-sm font-medium text-destructive">{selected.size} selected</span>
          <Button variant="destructive" size="sm" className="gap-1.5 ml-auto" onClick={handleBulkDelete} disabled={deleting}>
            <Trash2 className="w-3.5 h-3.5" />{deleting ? "Deleting…" : `Delete ${selected.size}`}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Cancel</Button>
        </div>
      )}

      {displayed.length === 0 && (
        <div className="border border-dashed border-border bg-white p-10 text-center">
          <p className="text-sm text-muted-foreground">No items match your filters</p>
        </div>
      )}

      {/* ── Table ── */}
      {displayed.length > 0 && (
        <div className="bg-white border border-border overflow-hidden" style={{boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)"}}>
          {/* Header */}
          <table className="w-full border-collapse">
            <thead>
              <tr style={{background: "#f5f4f2"}}>
                <th className="w-10 px-4 py-3 border-b border-border">
                  <input type="checkbox" checked={selected.size === displayed.length && displayed.length > 0} onChange={toggleAll} />
                </th>
                <th className="w-20 px-3 py-3 border-b border-border text-left">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Image</span>
                </th>
                <th className="px-4 py-3 border-b border-border text-left">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Title</span>
                </th>
                <th className="w-28 px-4 py-3 border-b border-border text-left hidden lg:table-cell">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Inv #</span>
                </th>
                <th className="w-36 px-4 py-3 border-b border-border text-left hidden md:table-cell">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Status</span>
                </th>
                <th className="w-36 px-4 py-3 border-b border-border text-right hidden lg:table-cell">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Price</span>
                </th>
                <th className="w-24 px-4 py-3 border-b border-border text-center hidden xl:table-cell">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Insights</span>
                </th>
                <th className="w-20 px-4 py-3 border-b border-border text-center hidden xl:table-cell">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Bids</span>
                </th>
                <th className="w-32 px-4 py-3 border-b border-border text-right">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((item, rowIdx) => {
                const price = itemPriceDisplay(item);
                const isLive = ["first_bids", "prisometer", "pending_review"].includes(item.status);
                const isConsignment = item.ownership_type === "consignment";
                const hasDesc = !!item.description;
                const descOpen = expandedDesc.has(item.id);

                let timerText = null;
                if (item.status === "first_bids" && item.first_bids_end) {
                  const ended = isPast(new Date(item.first_bids_end));
                  timerText = { text: ended ? "Preview ended" : `Ends ${formatDistanceToNow(new Date(item.first_bids_end), { addSuffix: true })}`, color: ended ? "text-muted-foreground/40" : "text-blue-600" };
                } else if (item.status === "prisometer" && item.prisometer_activated_at && item.prisometer_duration_hours) {
                  const end = new Date(new Date(item.prisometer_activated_at).getTime() + item.prisometer_duration_hours * 3600000);
                  const ended = isPast(end);
                  timerText = { text: ended ? "Expired" : `Ends ${formatDistanceToNow(end, { addSuffix: true })}`, color: ended ? "text-muted-foreground/40" : "text-red-600" };
                }

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`border-b border-border/60 transition-colors ${selected.has(item.id) ? "bg-primary/[0.02]" : rowIdx % 2 === 0 ? "bg-white" : "bg-[hsl(35,25%,99%)]"} hover:bg-[hsl(35,30%,98%)]`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-0 w-10">
                        <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />
                      </td>

                      {/* Image */}
                      <td className="px-3 py-3 w-20">
                        {item.images?.[0] ? (
                          <button onClick={() => setLightbox({ images: item.images, startIndex: 0 })}
                            className="relative w-16 h-16 overflow-hidden group focus:outline-none border border-border/30 shrink-0 block">
                            <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {item.images.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-black/55 text-white text-[8px] font-bold px-1 leading-tight">+{item.images.length - 1}</span>
                            )}
                          </button>
                        ) : (
                          <div className="w-16 h-16 bg-[hsl(35,20%,94%)] border border-border/30 flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground/20" />
                          </div>
                        )}
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3">
                        <p className="font-serif text-[14px] font-semibold text-foreground leading-snug line-clamp-2 mb-1">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          {item.maker && <span className="text-[11px] text-muted-foreground/70">{item.maker}</span>}
                          {item.period && <span className="text-[11px] text-muted-foreground/40">{item.period}</span>}
                          {item.category && <span className="text-[10px] text-muted-foreground/40 capitalize">{item.category.replace(/_/g, " ")}</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {isConsignment && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide uppercase bg-neutral-100 text-neutral-500 border border-neutral-200 px-1.5 py-0.5">
                              <Handshake className="w-2.5 h-2.5" /> Consignment
                            </span>
                          )}
                          {item.lot_number && (
                            <span className="text-[10px] font-mono text-muted-foreground/60 border border-border/50 bg-secondary/50 px-1.5 py-0.5">
                              Lot #{item.lot_number}
                            </span>
                          )}
                          {timerText && (
                            <span className={`flex items-center gap-1 text-[10px] font-medium ${timerText.color}`}>
                              <Clock className="w-3 h-3 shrink-0" /> {timerText.text}
                            </span>
                          )}
                          {hasDesc && (
                            <button onClick={() => toggleDesc(item.id)}
                              className="text-[10px] text-primary/60 hover:text-primary underline underline-offset-2">
                              {descOpen ? "Hide" : "Details"}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Inv # */}
                      <td className="px-4 py-3 w-28 hidden lg:table-cell">
                        {item.inventory_number
                          ? <span className="font-mono text-[11px] font-semibold text-foreground/80">{item.inventory_number}</span>
                          : <span className="text-muted-foreground/25 select-none">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 w-36 hidden md:table-cell">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 w-36 text-right hidden lg:table-cell">
                        <p className="font-price text-[15px] font-bold leading-none text-neutral-900">{price.value}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">{price.label}</p>
                        {item.reserve_price > 0 && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <ShieldCheck className="w-2.5 h-2.5 text-muted-foreground/30" />
                            <span className="text-[9px] text-muted-foreground/40">Reserve ${item.reserve_price.toLocaleString()}</span>
                          </div>
                        )}
                      </td>

                      {/* Insights */}
                      <td className="px-4 py-3 w-24 hidden xl:table-cell">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-muted-foreground/35" />
                            <span className="text-[11px] font-semibold tabular-nums">{item.view_count || 0}</span>
                            <span className="text-[10px] text-muted-foreground/40">views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-300" />
                            <span className="text-[11px] font-semibold tabular-nums">{item.watcher_count || 0}</span>
                            <span className="text-[10px] text-muted-foreground/40">watching</span>
                          </div>
                        </div>
                      </td>

                      {/* Bids */}
                      <td className="px-4 py-3 w-20 hidden xl:table-cell text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Gavel className="w-3.5 h-3.5 text-muted-foreground/35" />
                          <span className="font-price text-base font-bold tabular-nums">{item.bid_count || 0}</span>
                        </div>
                        {item.highest_bid > 0 && (
                          <p className="text-[9px] text-muted-foreground/40 mt-0.5 tabular-nums">High ${item.highest_bid.toLocaleString()}</p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 w-32 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === "pending_review" ? (
                            <>
                              <Button size="sm" className="text-[11px] h-7 px-2.5 gap-1 bg-neutral-900 hover:bg-black text-white"
                                onClick={() => handleAcceptOffer(item)} disabled={processingOffer === item.id}>
                                {processingOffer === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 gap-1 border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                                onClick={() => handleDeclineOffer(item)} disabled={processingOffer === item.id}>
                                <XCircle className="w-3 h-3" /> Decline
                              </Button>
                            </>
                          ) : item.status !== "sold" ? (
                            <Link to={`/seller/studio?edit=${item.id}`}>
                              <Button variant="outline" size="sm" className="text-[11px] font-semibold h-7 px-3 border-border/70 hover:bg-secondary/80">
                                {isLive ? "Manage" : item.status === "unsold" ? "Relist" : "Edit"}
                              </Button>
                            </Link>
                          ) : (
                            <Link to={`/item/${item.id}`}>
                              <Button variant="outline" size="sm" className="text-[11px] font-semibold h-7 px-3 border-border/70">View</Button>
                            </Link>
                          )}
                          <ItemRowMenu item={item} />
                        </div>
                      </td>
                    </tr>

                    {/* Description expand */}
                    {descOpen && hasDesc && (
                      <tr className="border-b border-border/40">
                        <td colSpan={9} className="px-4 py-4 bg-[hsl(35,20%,98%)]">
                          <div className="pl-[calc(16px+80px+16px)]">
                            <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 mb-2">Description</p>
                            <p className="text-sm text-foreground/75 leading-relaxed max-w-3xl">{item.description}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && <ImageLightbox images={lightbox.images} startIndex={lightbox.startIndex} onClose={() => setLightbox(null)} />}

      {/* ── Pagination ── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
          <p className="text-[12px] text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length.toLocaleString()} items
            {q ? ` matching "${search}"` : ""}
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-border bg-white text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center border text-[12px] font-semibold transition-colors ${p === page ? "bg-primary text-white border-primary" : "border-border bg-white hover:bg-secondary"}`}>
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <>
                <span className="text-muted-foreground text-[12px] px-1">…</span>
                <button onClick={() => setPage(totalPages)} className="w-8 h-8 flex items-center justify-center border border-border bg-white text-[12px] font-semibold hover:bg-secondary">{totalPages}</button>
              </>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-border bg-white text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-8 border border-input bg-white px-2 text-[12px] text-foreground focus:outline-none ml-2">
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}