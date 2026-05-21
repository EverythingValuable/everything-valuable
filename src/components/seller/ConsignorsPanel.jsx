import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronRight, Mail, Phone, CheckCircle2, Circle, User } from "lucide-react";
import { cn } from "@/lib/utils";

function NewConsignorModal({ sellerEmail, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "",
    default_commission_percent: "", notes: "", contract_mailed: false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const consignor = await base44.entities.Consignor.create({
      ...form,
      seller_email: sellerEmail,
      default_commission_percent: +form.default_commission_percent || undefined,
    });
    setSaving(false);
    onSaved(consignor);
  };

  const lineClass = "w-full bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 transition-colors h-10 text-sm text-neutral-800 placeholder:text-neutral-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-neutral-100">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-neutral-700">New Consignor</h2>
        </div>
        <div className="px-8 py-6 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Name <span className="text-neutral-800">*</span></label>
            <input className={lineClass} placeholder="Full name or business" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Email</label>
              <input className={lineClass} type="email" placeholder="email@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Phone</label>
              <input className={lineClass} placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Address</label>
            <input className={lineClass} placeholder="Street, City, State, ZIP" value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Default Commission % <span className="text-neutral-400 font-normal">(seller keeps)</span></label>
            <div className="relative">
              <input className={lineClass + " pr-5"} type="number" placeholder="30" value={form.default_commission_percent} onChange={e => set("default_commission_percent", e.target.value)} />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-300 text-sm pointer-events-none">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Notes</label>
            <textarea
              rows={2}
              className="w-full bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 transition-colors py-2 text-sm text-neutral-800 placeholder:text-neutral-400 resize-none"
              placeholder="Any additional notes…"
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => set("contract_mailed", !form.contract_mailed)} className="shrink-0">
              {form.contract_mailed
                ? <CheckCircle2 className="w-4 h-4 text-neutral-700" />
                : <Circle className="w-4 h-4 text-neutral-300" />
              }
            </button>
            <span className="text-xs text-neutral-500 tracking-wide">Contract mailed</span>
          </label>
        </div>
        <div className="px-8 py-5 border-t border-neutral-100 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="flex-1 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase h-10 transition-colors disabled:opacity-30"
          >
            {saving ? "Saving…" : "Create Consignor"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-neutral-200 text-[10px] font-bold tracking-[0.2em] uppercase h-10 text-neutral-600 hover:border-neutral-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConsignorsPanel({ user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState("all"); // all | consignment | owned

  const { data: consignors = [], isLoading } = useQuery({
    queryKey: ["consignors", user?.email],
    queryFn: () => base44.entities.Consignor.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["items-for-consignors", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  // Build stats per consignor
  const itemsByConsignor = {};
  allItems.forEach(item => {
    const key = item.consignor_name;
    if (!key) return;
    if (!itemsByConsignor[key]) itemsByConsignor[key] = { total: 0, sold: 0, active: 0 };
    itemsByConsignor[key].total++;
    if (item.status === "sold") itemsByConsignor[key].sold++;
    if (["first_bids", "prisometer"].includes(item.status)) itemsByConsignor[key].active++;
  });

  const ownedItems = allItems.filter(i => !i.ownership_type || i.ownership_type === "owned");
  const ownedStats = { total: ownedItems.length, sold: ownedItems.filter(i => i.status === "sold").length, active: ownedItems.filter(i => ["first_bids","prisometer"].includes(i.status)).length };

  const filtered = consignors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = (consignor) => {
    queryClient.invalidateQueries({ queryKey: ["consignors"] });
    setShowNew(false);
    navigate(`/seller/consignor/${consignor.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-neutral-700">Consignors & Inventory</h2>
          <p className="text-xs text-neutral-400 mt-1">{consignors.length} consignors · {allItems.length} total items</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-5 h-9 transition-colors"
        >
          <Plus className="w-3 h-3" /> New Consignor
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 border-b border-neutral-100">
        {[["all", "All"], ["consignment", "Consignment"], ["owned", "Gallery Owned"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              "text-[10px] font-bold tracking-[0.18em] uppercase px-5 py-3 border-b-2 transition-colors",
              filter === val
                ? "border-neutral-800 text-neutral-800"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      {filter !== "owned" && (
        <div className="relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
          <input
            className="w-full pl-6 bg-transparent border-0 border-b border-neutral-100 focus:outline-none focus:border-neutral-400 h-9 text-sm placeholder:text-neutral-300 text-neutral-700"
            placeholder="Search consignors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Gallery Owned Row */}
      {(filter === "all" || filter === "owned") && (
        <button
          onClick={() => navigate("/seller?ownership=owned")}
          className="w-full flex items-center justify-between px-6 py-5 border border-neutral-100 hover:border-neutral-300 transition-colors group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-neutral-900 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-700">Gallery / Self-Owned</p>
              <p className="text-xs text-neutral-400 mt-0.5">Items owned outright by your gallery</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-neutral-700 tabular-nums">{ownedStats.total}</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">items</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-neutral-700 tabular-nums">{ownedStats.sold}</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">sold</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-neutral-700 tabular-nums">{ownedStats.active}</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">live</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
          </div>
        </button>
      )}

      {/* Consignor Rows */}
      {(filter === "all" || filter === "consignment") && (
        <div className="space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-4 h-4 border border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-neutral-400 text-sm">
              {search ? "No consignors match your search." : "No consignors yet — add your first one."}
            </div>
          )}
          {filtered.map(c => {
            const stats = itemsByConsignor[c.name] || { total: 0, sold: 0, active: 0 };
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/seller/consignor/${c.id}`)}
                className="w-full flex items-center justify-between px-6 py-5 border border-neutral-100 hover:border-neutral-300 transition-colors group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-neutral-100 flex items-center justify-center shrink-0 text-xs font-bold text-neutral-500">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-neutral-700">{c.name}</p>
                      {c.contract_mailed && (
                        <span className="text-[9px] font-bold tracking-[0.12em] uppercase border border-neutral-200 text-neutral-400 px-2 py-0.5">Contract Mailed</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {c.email && <span className="text-xs text-neutral-400 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                      {c.phone && <span className="text-xs text-neutral-400 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                      {c.default_commission_percent && (
                        <span className="text-xs text-neutral-400">{c.default_commission_percent}% commission</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-neutral-700 tabular-nums">{stats.total}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wide">items</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-neutral-700 tabular-nums">{stats.sold}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wide">sold</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-neutral-700 tabular-nums">{stats.active}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wide">live</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showNew && (
        <NewConsignorModal
          sellerEmail={user?.email}
          onClose={() => setShowNew(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}