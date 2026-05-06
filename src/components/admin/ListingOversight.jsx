import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function ListingOversight() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
            {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
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
            {item.images?.[0] && (
              <img src={item.images[0]} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">{item.seller_name || item.seller_email} · ${(item.prisometer_start_price || 0).toLocaleString("en-US")}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[item.status] || ""}`}>{item.status}</Badge>
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
    </div>
  );
}