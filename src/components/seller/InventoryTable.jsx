import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, Trash2, ArrowRight, Clock, Gavel, ShieldCheck, Eye, Heart, Search, Handshake } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";

const STATUS_CONFIG = {
  draft:         { label: "Draft",             cls: "bg-gray-100 text-gray-500 border-gray-200" },
  first_bids:    { label: "1stBid$ Preview",   cls: "bg-blue-50 text-blue-700 border-blue-100" },
  prisometer:    { label: "PRI$OMETER Live",   cls: "bg-red-50 text-red-700 border-red-100" },
  sold:          { label: "Sold",              cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  pending_review:{ label: "Under Review",      cls: "bg-amber-50 text-amber-700 border-amber-100" },
  unsold:        { label: "Unsold",            cls: "bg-gray-100 text-gray-500 border-gray-200" },
  scheduled:     { label: "Scheduled",         cls: "bg-purple-50 text-purple-700 border-purple-100" },
};

function itemPriceDisplay(item) {
  if (item.status === "sold") return { label: "Sold for", value: `$${item.sold_price?.toLocaleString() ?? "—"}`, green: true };
  if (item.status === "prisometer") return { label: "Current", value: item.current_price ? `$${item.current_price.toLocaleString()}` : "—" };
  if (item.status === "first_bids") {
    const bid = item.highest_bid || 0;
    return { label: bid > 0 ? "High bid" : "Starting", value: bid > 0 ? `$${bid.toLocaleString()}` : `$${item.prisometer_start_price?.toLocaleString() ?? "—"}` };
  }
  return { label: "Asking", value: item.prisometer_start_price ? `$${item.prisometer_start_price.toLocaleString()}` : "—" };
}

export default function InventoryTable({ items, view, limit }) {
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Search filter
  const q = search.toLowerCase().trim();
  const searched = q
    ? items.filter(item =>
        item.title?.toLowerCase().includes(q) ||
        item.maker?.toLowerCase().includes(q) ||
        item.inventory_number?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.consignor_name?.toLowerCase().includes(q)
      )
    : items;

  const displayed = limit ? searched.slice(0, limit) : searched;

  const toggleSelect = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    setSelected(selected.size === displayed.length ? new Set() : new Set(displayed.map(i => i.id)));
  };

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
      <div className="rounded-2xl border border-dashed border-border bg-white p-16 text-center space-y-3">
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
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder="Search by title, maker, inventory #, consignor…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-destructive/5 border border-destructive/15 rounded-xl">
          <span className="text-sm font-medium text-destructive">{selected.size} selected</span>
          <Button variant="destructive" size="sm" className="gap-1.5 ml-auto" onClick={handleBulkDelete} disabled={deleting}>
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "Deleting…" : `Delete ${selected.size}`}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Cancel</Button>
        </div>
      )}

      {displayed.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-sm text-muted-foreground">No items match &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {displayed.length > 0 && (
        <div className="rounded-2xl border border-border overflow-hidden bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[hsl(40,20%,98%)]">
                <th className="px-5 py-3.5 w-10">
                  <input type="checkbox" className="rounded" checked={selected.size === displayed.length && displayed.length > 0} onChange={toggleAll} />
                </th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase w-full">Item</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden lg:table-cell whitespace-nowrap">Inv #</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden md:table-cell whitespace-nowrap">Category</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase">Status</th>
                <th className="text-right px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden lg:table-cell">Price / Reserve</th>
                <th className="text-right px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden xl:table-cell">Bids</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden xl:table-cell">Insights</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden xl:table-cell">Timer</th>
                <th className="px-5 py-3.5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {displayed.map(item => {
                const price = itemPriceDisplay(item);
                const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
                const isLive = ["first_bids", "prisometer", "pending_review"].includes(item.status);
                const isConsignment = item.ownership_type === "consignment";

                return (
                  <tr key={item.id} className={`transition-colors hover:bg-[hsl(40,20%,99%)] ${selected.has(item.id) ? "bg-destructive/3" : ""}`}>
                    <td className="px-5 py-4">
                      <input type="checkbox" className="rounded" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        {item.images?.[0]
                          ? <img src={item.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border/50 shadow-sm" />
                          : <div className="w-16 h-16 rounded-xl bg-secondary shrink-0 flex items-center justify-center text-muted-foreground/40 text-[10px]">No img</div>
                        }
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-[15px] font-semibold text-foreground line-clamp-2 leading-snug">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {isConsignment && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-violet-50 text-violet-700 border border-violet-100 px-1.5 py-0.5 rounded font-semibold">
                                <Handshake className="w-2.5 h-2.5" />Consignment
                              </span>
                            )}
                            {item.maker && <span className="text-[11px] text-muted-foreground/70">{item.maker}</span>}
                            {item.period && <span className="text-[11px] text-muted-foreground/40">· {item.period}</span>}
                            {isConsignment && item.consignor_name && (
                              <span className="text-[10px] text-muted-foreground/60">· {item.consignor_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {item.inventory_number
                        ? <span className="font-mono text-[12px] font-semibold text-foreground">{item.inventory_number}</span>
                        : <span className="text-[11px] text-muted-foreground/30">—</span>
                      }
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="capitalize text-[11px] text-muted-foreground">{item.category?.replace(/_/g, " ") || "—"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-right">
                      <p className={`font-price text-sm font-semibold ${price.green ? "text-emerald-700" : "text-foreground"}`}>{price.value}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">{price.label}</p>
                      {item.reserve_price > 0 && (
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <ShieldCheck className="w-3 h-3 text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground/50">Reserve: ${item.reserve_price.toLocaleString()}</span>
                        </div>
                      )}
                      {isConsignment && item.consignor_commission_percent > 0 && item.status === "sold" && (
                        <div className="mt-1 text-[10px] text-violet-600 font-medium">
                          Payout: ${((item.sold_price || 0) * (1 - item.consignor_commission_percent / 100)).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Gavel className="w-3.5 h-3.5 text-muted-foreground/40" />
                        <span className="font-price text-sm font-semibold text-foreground">{item.bid_count || 0}</span>
                      </div>
                      {item.highest_bid > 0 && (
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">High: ${item.highest_bid.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <div className="flex flex-col gap-1.5 items-center">
                        <div className="flex items-center gap-1.5" title="Page views">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground/40" />
                          <span className="font-price text-sm font-semibold text-foreground">{item.view_count || 0}</span>
                          <span className="text-[10px] text-muted-foreground/50">views</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Watchers">
                          <Heart className="w-3.5 h-3.5 text-rose-300" />
                          <span className="font-price text-sm font-semibold text-foreground">{item.watcher_count || 0}</span>
                          <span className="text-[10px] text-muted-foreground/50">watching</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      {item.status === "first_bids" && item.first_bids_end && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <div>
                            <p className="text-[11px] font-medium text-blue-700">
                              {isPast(new Date(item.first_bids_end)) ? "Ended" : formatDistanceToNow(new Date(item.first_bids_end), { addSuffix: true })}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50">1stBid$ ends</p>
                          </div>
                        </div>
                      )}
                      {item.status === "prisometer" && item.prisometer_activated_at && item.prisometer_duration_hours && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <div>
                            {(() => {
                              const end = new Date(new Date(item.prisometer_activated_at).getTime() + item.prisometer_duration_hours * 3600000);
                              return (
                                <>
                                  <p className={`text-[11px] font-medium ${isPast(end) ? "text-muted-foreground" : "text-red-700"}`}>
                                    {isPast(end) ? "Expired" : formatDistanceToNow(end, { addSuffix: true })}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground/50">PRI$OMETER ends</p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                      {!["first_bids", "prisometer"].includes(item.status) && (
                        <span className="text-[11px] text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== "sold" && (
                          <Link to={`/seller/studio?edit=${item.id}`}>
                            <Button variant="outline" size="sm" className="text-[11px] font-semibold rounded-lg h-8 px-3 border-border/60">
                              {isLive ? "Manage" : item.status === "unsold" ? "Edit & Relist" : "Edit"}
                            </Button>
                          </Link>
                        )}
                        <Link to={`/item/${item.id}`} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {searched.length > 0 && (
        <p className="text-[11px] text-muted-foreground text-right">
          Showing {displayed.length} of {searched.length} item{searched.length !== 1 ? "s" : ""}
          {q ? ` matching "${search}"` : ""}
        </p>
      )}
    </div>
  );
}