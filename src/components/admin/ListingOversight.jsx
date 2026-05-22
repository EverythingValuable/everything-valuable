import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, ExternalLink, Pencil, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const STATUS_COLORS = {
  draft: "bg-muted text-muted-foreground border-border",
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  first_bids: "bg-primary/10 text-primary border-primary/20",
  prisometer: "bg-red-50 text-red-600 border-red-200",
  sold: "bg-green-50 text-green-700 border-green-200",
  unsold: "bg-muted text-muted-foreground border-border",
  declined: "bg-red-50 text-red-700 border-red-200",
};

const ALL_STATUSES = Object.keys(STATUS_COLORS);

const EDITABLE_FIELDS = [
  { key: "title", label: "Title", type: "text" },
  { key: "status", label: "Status", type: "select", options: ALL_STATUSES },
  { key: "customer_location", label: "Item Location (shown to buyers)", type: "text" },
  { key: "location", label: "Internal Storage Location", type: "text" },
  { key: "prisometer_start_price", label: "Prisometer Start Price", type: "number" },
  { key: "reserve_price", label: "Reserve Price", type: "number" },
  { key: "seller_email", label: "Seller Email", type: "text" },
  { key: "seller_name", label: "Seller Name", type: "text" },
  { key: "category", label: "Category", type: "text" },
  { key: "condition", label: "Condition", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "short_description", label: "Short Description", type: "textarea" },
  { key: "shipping_notes", label: "Shipping Notes", type: "textarea" },
  { key: "inventory_number", label: "Inventory Number", type: "text" },
  { key: "lot_number", label: "Lot Number", type: "text" },
  { key: "maker", label: "Maker / Artist", type: "text" },
  { key: "period", label: "Period", type: "text" },
  { key: "dimensions", label: "Dimensions", type: "text" },
  { key: "materials", label: "Materials", type: "text" },
];

function EditItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    const f = {};
    EDITABLE_FIELDS.forEach(({ key }) => { f[key] = item[key] ?? ""; });
    return f;
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => {
      const updates = {};
      EDITABLE_FIELDS.forEach(({ key, type }) => {
        const val = form[key];
        if (type === "number") {
          updates[key] = val === "" ? undefined : Number(val);
        } else {
          updates[key] = val || undefined;
        }
      });
      return base44.entities.Item.update(item.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-items"] });
      toast({ title: "Item updated", description: `"${form.title}" has been saved.` });
      onClose();
    },
    onError: () => toast({ title: "Save failed", description: "Please try again.", variant: "destructive" }),
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <Pencil className="w-4 h-4 text-primary" />
            Edit Lot: {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {EDITABLE_FIELDS.map(({ key, label, type, options }) => (
            <div key={key} className={type === "textarea" ? "sm:col-span-2" : ""}>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">
                {label}
              </label>
              {type === "textarea" ? (
                <Textarea
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className="text-sm resize-none h-20"
                />
              ) : type === "select" ? (
                <Select value={form[key]} onValueChange={val => set(key, val)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {options.map(o => (
                      <SelectItem key={o} value={o}>{o.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={type}
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className="h-9 text-sm"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
          <Button variant="outline" onClick={onClose} className="gap-1.5">
            <X className="w-3.5 h-3.5" /> Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {saveMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ListingOversight() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingItem, setEditingItem] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-all-items"],
    queryFn: () => base44.entities.Item.list("-created_date", 500),
    staleTime: 60000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => base44.entities.Item.update(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-items"] }),
  });

  const filtered = items.filter(item => {
    const matchSearch = !search || [item.title, item.seller_email, item.seller_name].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Listing Oversight</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} total listings</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Input placeholder="Search by title or seller…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-serif text-lg">No listings found</p>
          </div>
        ) : filtered.map(item => (
          <div key={item.id} className="flex items-center gap-4 border border-border rounded-2xl bg-card p-4">
            {item.images?.[0] ? (
              <img src={item.images[0]} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                <Package className="w-5 h-5 text-muted-foreground/40" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {item.seller_name || item.seller_email} · ${(item.prisometer_start_price || 0).toLocaleString("en-US")}
                {item.customer_location && <span className="ml-1">· 📍 {item.customer_location}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[item.status] || ""}`}>{item.status}</Badge>

              {/* Edit button */}
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={() => setEditingItem(item)}
              >
                <Pencil className="w-3 h-3" /> Edit
              </Button>

              <Link to={`/item/${item.id}`} target="_blank">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
              {["first_bids", "prisometer"].includes(item.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive hover:text-white h-7"
                  onClick={() => updateMutation.mutate({ id: item.id, updates: { status: "declined" } })}
                  disabled={updateMutation.isPending}
                >
                  Remove
                </Button>
              )}
              {item.status === "pending_review" && (
                <Button
                  size="sm"
                  className="text-xs h-7 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => updateMutation.mutate({ id: item.id, updates: { status: "scheduled" } })}
                  disabled={updateMutation.isPending}
                >
                  Approve
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}