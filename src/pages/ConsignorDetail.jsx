import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Mail, Phone, MapPin, Pencil, CheckCircle2, Circle, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
  draft: "Draft", first_bids: "1stBids", prisometer: "Live",
  sold: "Sold", unsold: "Unsold", scheduled: "Scheduled",
  pending_review: "Review", declined: "Declined",
};
const STATUS_COLORS = {
  draft: "text-neutral-400 border-neutral-200",
  first_bids: "text-blue-600 border-blue-200",
  prisometer: "text-green-700 border-green-200",
  sold: "text-neutral-600 border-neutral-300",
  unsold: "text-amber-600 border-amber-200",
  pending_review: "text-orange-600 border-orange-200",
  declined: "text-red-600 border-red-200",
  scheduled: "text-purple-600 border-purple-200",
};

function EditConsignorModal({ consignor, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: consignor.name || "",
    email: consignor.email || "",
    phone: consignor.phone || "",
    address: consignor.address || "",
    default_commission_percent: consignor.default_commission_percent || "",
    notes: consignor.notes || "",
    contract_mailed: consignor.contract_mailed || false,
    status: consignor.status || "active",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Consignor.update(consignor.id, {
      ...form,
      default_commission_percent: +form.default_commission_percent || undefined,
      contract_mailed_date: form.contract_mailed && !consignor.contract_mailed ? new Date().toISOString() : consignor.contract_mailed_date,
    });
    setSaving(false);
    onSaved();
  };

  const lineClass = "w-full bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 transition-colors h-10 text-sm text-neutral-800 placeholder:text-neutral-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-neutral-100">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-neutral-700">Edit Consignor</h2>
        </div>
        <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Name *</label>
            <input className={lineClass} value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Email</label>
              <input className={lineClass} type="email" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Phone</label>
              <input className={lineClass} value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Address</label>
            <input className={lineClass} value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Default Commission %</label>
            <div className="relative">
              <input className={lineClass + " pr-5"} type="number" value={form.default_commission_percent} onChange={e => set("default_commission_percent", e.target.value)} />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-300 text-sm">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Notes</label>
            <textarea rows={2} className="w-full bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 transition-colors py-2 text-sm resize-none placeholder:text-neutral-400" value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => set("contract_mailed", !form.contract_mailed)}>
              {form.contract_mailed ? <CheckCircle2 className="w-4 h-4 text-neutral-700" /> : <Circle className="w-4 h-4 text-neutral-300" />}
            </button>
            <span className="text-xs text-neutral-500">Contract mailed</span>
          </label>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full h-10 border-0 border-b border-neutral-200 bg-transparent text-sm text-neutral-800 focus:outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="px-8 py-5 border-t border-neutral-100 flex gap-3">
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase h-10 transition-colors disabled:opacity-30">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={onClose} className="flex-1 border border-neutral-200 text-[10px] font-bold tracking-[0.2em] uppercase h-10 text-neutral-600 hover:border-neutral-500 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConsignorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: consignor, isLoading: loadingConsignor } = useQuery({
    queryKey: ["consignor", id],
    queryFn: () => base44.entities.Consignor.get(id),
  });

  const { data: allItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ["consignor-items", consignor?.name],
    queryFn: () => base44.entities.Item.filter({ consignor_name: consignor.name }),
    enabled: !!consignor?.name,
  });

  const handleEditSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["consignor", id] });
    queryClient.invalidateQueries({ queryKey: ["consignors"] });
    setEditOpen(false);
  };

  const statuses = ["all", "first_bids", "prisometer", "sold", "unsold", "draft"];
  const filteredItems = statusFilter === "all" ? allItems : allItems.filter(i => i.status === statusFilter);

  const totalValue = allItems.filter(i => i.status === "sold").reduce((s, i) => s + (i.sold_price || 0), 0);
  const payoutDue = allItems.filter(i => i.status === "sold").reduce((s, i) => {
    const comm = i.consignor_commission_percent ?? consignor?.default_commission_percent ?? 0;
    return s + ((i.sold_price || 0) * (1 - comm / 100));
  }, 0);

  if (loadingConsignor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-5 h-5 border border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!consignor) {
    return <div className="min-h-screen flex items-center justify-center text-neutral-400">Consignor not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="w-full px-6 md:px-16 h-14 flex items-center gap-5">
          <button onClick={() => navigate("/seller?tab=consignors")} className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-800 transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Consignors</span>
          </button>
          <div className="w-px h-4 bg-neutral-100" />
          <span className="text-xs font-serif italic text-neutral-500 flex-1 truncate">{consignor.name}</span>
          {consignor.contract_mailed && (
            <span className="text-[9px] font-bold tracking-[0.12em] uppercase border border-neutral-200 text-neutral-400 px-2 py-0.5 hidden sm:block">Contract Mailed</span>
          )}
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 hover:text-neutral-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => navigate(`/seller/studio?consignor=${id}&consignor_name=${encodeURIComponent(consignor.name)}&commission=${consignor.default_commission_percent || ""}`)}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-5 h-9 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Item
          </button>
        </div>
      </header>

      <div className="w-full px-6 md:px-16 py-12 space-y-10">
        {/* Consignor Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center text-white text-lg font-bold">
                {consignor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-serif">{consignor.name}</h1>
                <span className={cn("text-[9px] font-bold tracking-[0.12em] uppercase border px-2 py-0.5",
                  consignor.status === "active" ? "border-neutral-300 text-neutral-500" : "border-neutral-100 text-neutral-300"
                )}>{consignor.status || "active"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
              {consignor.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{consignor.email}</span>}
              {consignor.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{consignor.phone}</span>}
              {consignor.address && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{consignor.address}</span>}
              {consignor.default_commission_percent && <span className="text-neutral-500">{consignor.default_commission_percent}% default commission</span>}
            </div>
            {consignor.notes && <p className="text-sm text-neutral-400 leading-relaxed">{consignor.notes}</p>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-800 tabular-nums">{allItems.length}</p>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400 mt-1">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-800 tabular-nums">{allItems.filter(i => i.status === "sold").length}</p>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400 mt-1">Sold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-800 tabular-nums">${payoutDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400 mt-1">Payout Due</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Status filter */}
        <div className="flex gap-0 border-b border-neutral-100 overflow-x-auto scrollbar-hide">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "text-[10px] font-bold tracking-[0.18em] uppercase px-5 py-3 border-b-2 transition-colors whitespace-nowrap shrink-0",
                statusFilter === s ? "border-neutral-800 text-neutral-800" : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              {s === "all" ? `All (${allItems.length})` : `${STATUS_LABELS[s] || s} (${allItems.filter(i => i.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Items table */}
        {loadingItems ? (
          <div className="flex justify-center py-12">
            <div className="w-4 h-4 border border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-neutral-400 text-sm">No items yet for this consignor.</p>
            <button
              onClick={() => navigate(`/seller/studio?consignor=${id}&consignor_name=${encodeURIComponent(consignor.name)}&commission=${consignor.default_commission_percent || ""}`)}
              className="flex items-center gap-2 mx-auto bg-neutral-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase px-6 h-9 hover:bg-black transition-colors"
            >
              <Plus className="w-3 h-3" /> Add First Item
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => (
              <Link
                key={item.id}
                to={`/seller/studio?edit=${item.id}`}
                className="flex items-center gap-4 px-5 py-4 border border-neutral-100 hover:border-neutral-300 transition-colors group"
              >
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt="" className="w-12 h-12 object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-neutral-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700 truncate">{item.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{item.category?.replace(/_/g, " ")} {item.inventory_number ? `· ${item.inventory_number}` : ""}</p>
                </div>
                <div className="hidden sm:flex items-center gap-8 text-right shrink-0">
                  <div>
                    <p className="text-xs font-bold text-neutral-700 tabular-nums">${(item.prisometer_start_price || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wide">start</p>
                  </div>
                  {item.status === "sold" && (
                    <div>
                      <p className="text-xs font-bold text-neutral-700 tabular-nums">${(item.sold_price || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wide">sold</p>
                    </div>
                  )}
                  <span className={cn("text-[9px] font-bold tracking-[0.12em] uppercase border px-2 py-0.5 shrink-0", STATUS_COLORS[item.status] || "border-neutral-200 text-neutral-400")}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-200 group-hover:text-neutral-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {editOpen && (
        <EditConsignorModal consignor={consignor} onClose={() => setEditOpen(false)} onSaved={handleEditSaved} />
      )}
    </div>
  );
}