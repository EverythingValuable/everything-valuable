import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_COLORS = {
  open: "bg-red-50 text-red-700 border-red-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  waiting_on_buyer: "bg-blue-50 text-blue-700 border-blue-200",
  waiting_on_seller: "bg-purple-50 text-purple-700 border-purple-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-muted text-muted-foreground border-border",
};

const PRIORITY_COLORS = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
};

function DisputeRow({ dispute }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(dispute.notes || "");
  const [resolution, setResolution] = useState(dispute.resolution_summary || "");
  const [newStatus, setNewStatus] = useState(dispute.status);

  const updateMutation = useMutation({
    mutationFn: (updates) => base44.entities.Dispute.update(dispute.id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-disputes"] }),
  });

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <AlertTriangle className={`w-4 h-4 shrink-0 ${dispute.priority === "urgent" ? "text-red-500" : "text-amber-500"}`} />
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{dispute.item_title || "Item Dispute"}</p>
            <p className="text-xs text-muted-foreground truncate">{dispute.buyer_email} vs {dispute.seller_email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[dispute.priority]}`}>{dispute.priority}</Badge>
          <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[dispute.status]}`}>{dispute.status}</Badge>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20 pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["Reason", dispute.reason],
              ["Opened", dispute.created_date ? new Date(dispute.created_date).toLocaleDateString() : "—"],
              ["Assigned Admin", dispute.assigned_admin || "Unassigned"],
            ].map(([k, v]) => (
              <div key={k}><p className="text-muted-foreground uppercase tracking-wide mb-0.5">{k}</p><p className="font-medium">{v}</p></div>
            ))}
          </div>
          {dispute.description && <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3">{dispute.description}</p>}
          <Textarea placeholder="Admin notes…" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="text-sm" />
          <Textarea placeholder="Resolution summary…" value={resolution} onChange={e => setResolution(e.target.value)} rows={2} className="text-sm" />
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => updateMutation.mutate({ status: newStatus, notes, resolution_summary: resolution, resolved_at: ["resolved","closed"].includes(newStatus) ? new Date().toISOString() : undefined })} disabled={updateMutation.isPending}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DisputesCenter() {
  const [filter, setFilter] = useState("open");

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["admin-all-disputes"],
    queryFn: () => base44.entities.Dispute.list("-created_date", 200),
    staleTime: 30000,
  });

  const filtered = filter === "all" ? disputes : disputes.filter(d => d.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Disputes Center</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{disputes.filter(d => d.status === "open").length} open disputes</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-serif text-lg">No {filter === "all" ? "" : filter} disputes</p>
        </div>
      ) : (
        <div className="space-y-3">{filtered.map(d => <DisputeRow key={d.id} dispute={d} />)}</div>
      )}
    </div>
  );
}