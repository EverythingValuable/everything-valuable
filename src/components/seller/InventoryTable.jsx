import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Package, Trash2, Clock, ShieldCheck,
  Eye, Search, Handshake, Download,
  SlidersHorizontal, ChevronLeft, ChevronRight,
  CheckCircle2, X, ZoomIn, Loader2
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
  draft:          { label: "Draft",           dot: "bg-neutral-300",  text: "text-neutral-400",  bg: "bg-neutral-50",   border: "border-neutral-200", style: "muted" },
  first_bids:     { label: "1stBid$ Preview", dot: "bg-neutral-800",  text: "text-neutral-800",  bg: "bg-white",        border: "border-neutral-700", style: "outlined" },
  prisometer:     { label: "PRI$OMETER Live", dot: "bg-primary",      text: "text-white",        bg: "bg-neutral-900",  border: "border-neutral-900", style: "dark" },
  sold:           { label: "Sold",            dot: null,              text: "text-neutral-700",  bg: "bg-white",        border: "border-neutral-700", style: "sold" },
  pending_review: { label: "Under Review",    dot: "bg-primary",      text: "text-neutral-700",  bg: "bg-white",        border: "border-neutral-300", style: "review" },
  unsold:         { label: "Unsold",          dot: "bg-neutral-300",  text: "text-neutral-400",  bg: "bg-neutral-50",   border: "border-neutral-200", style: "muted" },
  scheduled:      { label: "Scheduled",       dot: "bg-neutral-500",  text: "text-neutral-600",  bg: "bg-neutral-50",   border: "border-neutral-300", style: "muted" },
  declined:       { label: "Declined",        dot: "bg-primary",      text: "text-neutral-500",  bg: "bg-neutral-50",   border: "border-neutral-200", style: "muted" },
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
          <p className={`font-price text-xl font-bold leading-none ${s.accent ? "text-primary" : "text-foreground"}`}>
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
  if (cfg.style === "sold") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border ${cfg.text} ${cfg.bg} ${cfg.border}`}>
        <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.5L3.5 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Sold
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold border ${cfg.text} ${cfg.bg} ${cfg.border}`}>
      {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot} ${status === "prisometer" ? "animate-pulse" : ""}`} />}
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

      {/* ── Catalog Records ── */}
      {displayed.length > 0 && (
        <div className="border border-neutral-200 bg-white divide-y divide-neutral-100">
          {displayed.map((item) => {
            const price = itemPriceDisplay(item);
            const isLive = ["first_bids", "prisometer", "pending_review"].includes(item.status);
            const isConsignment = item.ownership_type === "consignment";

            // Timer
            let timerText = null;
            if (item.status === "first_bids" && item.first_bids_end) {
              const ended = isPast(new Date(item.first_bids_end));
              timerText = { text: ended ? "Preview ended" : `Ends ${formatDistanceToNow(new Date(item.first_bids_end), { addSuffix: true })}`, ended };
            } else if (item.status === "prisometer" && item.prisometer_activated_at && item.prisometer_duration_hours) {
              const end = new Date(new Date(item.prisometer_activated_at).getTime() + item.prisometer_duration_hours * 3600000);
              const ended = isPast(end);
              timerText = { text: ended ? "Expired" : `Ends ${formatDistanceToNow(end, { addSuffix: true })}`, ended };
            }

            // Build chip list — max 3 visible + overflow
            const allChips = [];
            if (item.status === "sold") allChips.push({ label: "Sold", check: true, urgent: false });
            if (item.images?.length) allChips.push({ label: `${item.images.length} Photos`, urgent: false });
            else allChips.push({ label: "Needs Photos", urgent: true });
            if (!item.condition_notes && item.status !== "draft") allChips.push({ label: "Missing Condition", urgent: true });
            if (item.status === "pending_review") allChips.push({ label: "Needs Decision", urgent: true });
            if (item.reserve_price && item.highest_bid >= item.reserve_price) allChips.push({ label: "Reserve Met", urgent: false });
            if (isConsignment) allChips.push({ label: "Consignment", urgent: false });
            if (item.provenance) allChips.push({ label: "Provenance", urgent: false });
            if (item.provenance_docs?.length) allChips.push({ label: "Docs", urgent: false });
            const MAX_CHIPS = 3;
            const visibleChips = allChips.slice(0, MAX_CHIPS);
            const overflowCount = allChips.length - MAX_CHIPS;

            // Price label
            const priceLabel = {
              sold: "SOLD FOR",
              prisometer: "CURRENT PRICE",
              first_bids: item.highest_bid > 0 ? "HIGH BID" : "STARTING AT",
              pending_review: "OFFER PRICE",
              draft: "ASKING",
              scheduled: "ASKING",
              unsold: "ASKING",
              declined: "ASKING",
            }[item.status] || "ASKING";

            const priceValue = price.value || "—";

            return (
              <div
                key={item.id}
                style={{ display: "grid", gridTemplateColumns: "32px 112px minmax(320px, 1fr) 190px 170px 120px 44px", minHeight: "132px", alignItems: "center" }}
                className={`transition-colors ${selected.has(item.id) ? "bg-neutral-50" : "bg-white hover:bg-[#fafaf9]"}`}
              >
                {/* Col 1: Checkbox */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}>
                  <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="accent-neutral-700" />
                </div>

                {/* Col 2: Image */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
                  <button
                    onClick={() => item.images?.[0] && setLightbox({ images: item.images, startIndex: 0 })}
                    className="relative focus:outline-none group/img"
                    style={{ width: 92, height: 92, flexShrink: 0, background: "#f7f6f3", border: "1px solid #e8e5df", overflow: "hidden" }}
                  >
                    {item.images?.[0] ? (
                      <>
                        <img src={item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} className="group-hover/img:scale-105 transition-transform duration-300" />
                        {item.images.length > 1 && (
                          <span style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", lineHeight: "1.4" }}>
                            +{item.images.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package className="w-6 h-6 text-neutral-300" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Col 3: Item Details */}
                <div style={{ padding: "22px 20px 22px 16px", minWidth: 0 }}>
                  {/* Title — capped at 2 lines */}
                  <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.28, color: "#111", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 8 }}>
                    {item.title}
                  </p>
                  {/* Metadata */}
                  <div style={{ marginBottom: 10, fontSize: 12, color: "#8d8a84", display: "flex", flexWrap: "wrap", gap: "0 6px" }}>
                    {item.category && <span style={{ textTransform: "capitalize" }}>{item.category.replace(/_/g, " ")}</span>}
                    {item.period && <><span style={{ color: "#ccc" }}>·</span><span>{item.period}</span></>}
                    {item.lot_number && <><span style={{ color: "#ccc" }}>·</span><span>Lot #{item.lot_number}</span></>}
                    {item.maker && <><span style={{ color: "#ccc" }}>·</span><span>{item.maker}</span></>}
                  </div>
                  {/* Chip row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                    {/* Live status badge */}
                    {(item.status === "prisometer" || item.status === "first_bids") && (
                      <StatusBadge status={item.status} />
                    )}
                    {/* Timer chip */}
                    {timerText && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px", fontSize: 11, border: `1px solid ${timerText.ended ? "#e5e5e5" : "#d1d1d1"}`, color: timerText.ended ? "#aaa" : "#555" }}>
                        <Clock style={{ width: 11, height: 11, flexShrink: 0 }} />
                        {timerText.text}
                      </span>
                    )}
                    {/* Reserve chip for live */}
                    {(item.status === "prisometer" || item.status === "first_bids") && item.reserve_price > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", fontSize: 11, border: "1px solid #e5e5e5", color: "#777" }}>
                        Reserve ${item.reserve_price.toLocaleString()}
                      </span>
                    )}
                    {/* Non-live chips */}
                    {item.status !== "prisometer" && item.status !== "first_bids" && visibleChips.map((chip, ci) => (
                      <span key={ci} style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px", fontSize: 11, border: chip.urgent ? "1px solid rgba(220,38,38,0.25)" : "1px solid #e5e5e5", color: chip.urgent ? "hsl(var(--primary))" : "#777", background: chip.urgent ? "rgba(220,38,38,0.04)" : "transparent" }}>
                        {chip.check && (
                          <svg style={{ width: 10, height: 10 }} viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5.5L3.5 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {chip.label}
                      </span>
                    ))}
                    {item.status !== "prisometer" && item.status !== "first_bids" && overflowCount > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", fontSize: 11, border: "1px solid #e5e5e5", color: "#aaa" }}>
                        +{overflowCount} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Col 4: Price Block */}
                <div style={{ borderLeft: "1px solid #eeeae4", padding: "0 0 0 28px", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#aaa6a0", fontWeight: 700, marginBottom: 8 }}>{priceLabel}</p>
                  <p style={{ fontSize: 24, lineHeight: 1, fontWeight: 700, color: "#111", fontVariantNumeric: "tabular-nums" }}>{priceValue}</p>
                  {item.reserve_price > 0 && (
                    <p style={{ marginTop: 8, fontSize: 12, color: "#8d8a84" }}>Reserve ${item.reserve_price.toLocaleString()}</p>
                  )}
                </div>

                {/* Col 5: Activity Block */}
                <div style={{ borderLeft: "1px solid #eeeae4", padding: "0 0 0 24px", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, height: 20, fontSize: 12, color: "#77736d" }}>
                    <Eye style={{ width: 13, height: 13, color: "#bbb", flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: "#333", fontVariantNumeric: "tabular-nums" }}>{item.view_count || 0}</span>
                    <span>views</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, height: 20, fontSize: 12, color: "#77736d" }}>
                    <svg style={{ width: 13, height: 13, color: "#bbb", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span style={{ fontWeight: 600, color: "#333", fontVariantNumeric: "tabular-nums" }}>{item.watcher_count || 0}</span>
                    <span>watching</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, height: 20, fontSize: 12, color: "#77736d" }}>
                    <svg style={{ width: 13, height: 13, color: "#bbb", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span style={{ fontWeight: 600, color: "#333", fontVariantNumeric: "tabular-nums" }}>{item.bid_count || 0}</span>
                    <span>bid{(item.bid_count || 0) !== 1 ? "s" : ""}</span>
                  </div>
                  {item.highest_bid > 0 && (
                    <p style={{ fontSize: 11, color: "#555", fontVariantNumeric: "tabular-nums", marginTop: 2 }}>High ${item.highest_bid.toLocaleString()}</p>
                  )}
                </div>

                {/* Col 6: Action Button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.status === "pending_review" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button
                        onClick={() => handleAcceptOffer(item)} disabled={processingOffer === item.id}
                        style={{ width: 86, height: 34, fontSize: 11, fontWeight: 700, background: "#111", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                      >
                        {processingOffer === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineOffer(item)} disabled={processingOffer === item.id}
                        style={{ width: 86, height: 34, fontSize: 11, fontWeight: 700, background: "transparent", color: "#555", border: "1px solid #d1d1d1", cursor: "pointer" }}
                      >
                        Decline
                      </button>
                    </div>
                  ) : item.status !== "sold" ? (
                    <Link to={`/seller/studio?edit=${item.id}`}>
                      <button style={{ width: 86, height: 38, fontSize: 12, fontWeight: 600, background: "transparent", color: "#444", border: "1px solid #d1d1d1", cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#111"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d1d1"; e.currentTarget.style.color = "#444"; }}>
                        {isLive ? "Manage" : item.status === "unsold" ? "Relist" : "Edit"}
                      </button>
                    </Link>
                  ) : (
                    <Link to={`/item/${item.id}`}>
                      <button style={{ width: 86, height: 38, fontSize: 12, fontWeight: 600, background: "transparent", color: "#444", border: "1px solid #d1d1d1", cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#111"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d1d1"; e.currentTarget.style.color = "#444"; }}>
                        View
                      </button>
                    </Link>
                  )}
                </div>

                {/* Col 7: More Menu */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ItemRowMenu item={item} />
                </div>
              </div>
            );
          })}
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