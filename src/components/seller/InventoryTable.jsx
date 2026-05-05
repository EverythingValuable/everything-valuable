import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Package, Trash2, ArrowRight, Clock, Gavel, ShieldCheck } from "lucide-react";
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
  if (item.status === "sold") {
    return { label: "Sold for", value: `$${item.sold_price?.toLocaleString() ?? "—"}`, green: true };
  }
  if (item.status === "prisometer") {
    return { label: "Current", value: item.current_price ? `$${item.current_price.toLocaleString()}` : "—" };
  }
  if (item.status === "first_bids") {
    const bid = item.highest_bid || 0;
    return { label: bid > 0 ? "High bid" : "Starting", value: bid > 0 ? `$${bid.toLocaleString()}` : `$${item.prisometer_start_price?.toLocaleString() ?? "—"}` };
  }
  return { label: "Asking", value: item.prisometer_start_price ? `$${item.prisometer_start_price.toLocaleString()}` : "—" };
}

function CategoryLabel({ cat }) {
  return (
    <span className="capitalize text-[11px] text-muted-foreground">
      {cat?.replace(/_/g, " ") || "—"}
    </span>
  );
}

export default function InventoryTable({ items, view, limit }) {
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const displayed = limit ? items.slice(0, limit) : items;

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

  if (displayed.length === 0) {
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
    <div className="space-y-2">
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

      <div className="rounded-2xl border border-border overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[hsl(40,20%,98%)]">
              <th className="px-5 py-3.5 w-10">
                <input type="checkbox" className="rounded" checked={selected.size === displayed.length && displayed.length > 0} onChange={toggleAll} />
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase">Item</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase">Status</th>
              <th className="text-right px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden lg:table-cell">Price / Reserve</th>
              <th className="text-right px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden xl:table-cell">Bids</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground/50 uppercase hidden xl:table-cell">Timer</th>
              <th className="px-5 py-3.5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {displayed.map(item => {
              const price = itemPriceDisplay(item);
              const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
              const isLive = ["first_bids", "prisometer", "pending_review"].includes(item.status);

              return (
                <tr key={item.id} className={`transition-colors hover:bg-[hsl(40,20%,99%)] ${selected.has(item.id) ? "bg-destructive/3" : ""}`}>
                  <td className="px-5 py-4">
                    <input type="checkbox" className="rounded" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      {item.images?.[0]
                        ? <img src={item.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border/50 shadow-sm" />
                        : <div className="w-14 h-14 rounded-xl bg-secondary shrink-0 flex items-center justify-center text-muted-foreground/40 text-[10px]">No img</div>
                      }
                      <div className="min-w-0">
                        <p className="font-serif text-[15px] font-semibold text-foreground line-clamp-1 leading-snug">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.maker && <span className="text-[11px] text-muted-foreground/70">{item.maker}</span>}
                          {item.period && <span className="text-[11px] text-muted-foreground/40">· {item.period}</span>}
                          {item.lot_number && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">Lot {item.lot_number}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <CategoryLabel cat={item.category} />
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
                  </td>
                  {/* Bids column */}
                  <td className="px-4 py-4 hidden xl:table-cell text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Gavel className="w-3.5 h-3.5 text-muted-foreground/40" />
                      <span className="font-price text-sm font-semibold text-foreground">{item.bid_count || 0}</span>
                    </div>
                    {item.highest_bid > 0 && (
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">High: ${item.highest_bid.toLocaleString()}</p>
                    )}
                  </td>
                  {/* Timer column */}
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
                      {item.status !== "sold" && item.status !== "unsold" && (
                        <Link to={`/seller/studio?edit=${item.id}`}>
                          <Button variant="outline" size="sm" className="text-[11px] font-semibold rounded-lg h-8 px-3 border-border/60">
                            {isLive ? "Manage" : "Edit"}
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
    </div>
  );
}