import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeadphonesIcon, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  open: "bg-red-50 text-red-700 border-red-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  waiting_on_user: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-muted text-muted-foreground border-border",
};

const CATEGORY_LABELS = {
  login_access: "Login / Access", seller_application: "Seller Application",
  bidding_issue: "Bidding Issue", prisometer_issue: "PRI$OMETER", payment_issue: "Payment",
  invoice_issue: "Invoice", technical: "Technical", dispute: "Dispute",
  shipping_pickup: "Shipping/Pickup", other: "Other",
};

function TicketRow({ ticket }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState(ticket.admin_reply || "");
  const [newStatus, setNewStatus] = useState(ticket.status);

  const { data: relatedItem } = useQuery({
    queryKey: ["ticket-item", ticket.related_item_id],
    queryFn: () => base44.entities.Item.filter({ id: ticket.related_item_id }).then(r => r[0]),
    enabled: !!ticket.related_item_id && expanded,
    staleTime: 300000,
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => base44.entities.SupportTicket.update(ticket.id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-tickets"] }),
  });

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <HeadphonesIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{ticket.subject}</p>
            <p className="text-xs text-muted-foreground truncate">{ticket.user_email} · {CATEGORY_LABELS[ticket.category] || ticket.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[ticket.status]}`}>{ticket.status}</Badge>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20 pt-4 space-y-3">
          <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3">{ticket.description}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["Submitted", ticket.created_date ? new Date(ticket.created_date).toLocaleDateString() : "—"],
              ["Assigned Admin", ticket.assigned_admin || "Unassigned"],
            ].map(([k, v]) => (
              <div key={k}><p className="text-muted-foreground uppercase tracking-wide mb-0.5">{k}</p><p className="font-medium">{v}</p></div>
            ))}
            {ticket.related_item_id && (
              <div className="col-span-2">
                <p className="text-muted-foreground uppercase tracking-wide mb-0.5">Related Item</p>
                <Link
                  to={`/item/${ticket.related_item_id}`}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {relatedItem ? relatedItem.title : ticket.related_item_id}
                </Link>
              </div>
            )}
          </div>
          <Textarea placeholder="Reply to user…" value={reply} onChange={e => setReply(e.target.value)} rows={3} className="text-sm" />
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => updateMutation.mutate({ status: newStatus, admin_reply: reply, resolved_at: ["resolved","closed"].includes(newStatus) ? new Date().toISOString() : undefined })} disabled={updateMutation.isPending}>
              Save & Send Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupportCenter() {
  const [filter, setFilter] = useState("open");
  const [catFilter, setCatFilter] = useState("all");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-all-tickets"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 200),
    staleTime: 30000,
  });

  const filtered = tickets.filter(t => {
    const statusMatch = filter === "all" || t.status === filter;
    const catMatch = catFilter === "all" || t.category === catFilter;
    return statusMatch && catMatch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Customer Support Center</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{tickets.filter(t => t.status === "open").length} open tickets</p>
        </div>
      </div>
      <div className="flex gap-3 mb-5 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="all">All Status</SelectItem>
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <HeadphonesIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-serif text-lg">No tickets</p>
        </div>
      ) : (
        <div className="space-y-3">{filtered.map(t => <TicketRow key={t.id} ticket={t} />)}</div>
      )}
    </div>
  );
}