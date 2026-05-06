import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  needs_more_info: "bg-blue-50 text-blue-700 border-blue-200",
};

function ApplicationRow({ app }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejection, setRejection] = useState("");

  const actionMutation = useMutation({
    mutationFn: ({ action }) => base44.functions.invoke("adminApproveRejectSeller", {
      application_id: app.id,
      action,
      admin_notes: notes,
      rejection_reason: rejection,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-applications"] });
      setExpanded(false);
    },
    onError: (err) => alert(err?.response?.data?.error || "Action failed. Please try again."),
  });

  const isPending = ["pending", "needs_more_info"].includes(app.application_status);

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="font-serif text-sm font-semibold text-primary">{(app.full_name || "?")[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{app.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{app.user_email} · {app.seller_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {app.submitted_at && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              {new Date(app.submitted_at).toLocaleDateString()}
            </span>
          )}
          <Badge variant="outline" className={STATUS_COLORS[app.application_status]}>{app.application_status}</Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border bg-muted/20 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-sm">
            {[
              ["Business", app.business_name || "—"],
              ["Phone", app.phone || "—"],
              ["Website", app.business_website || "—"],
              ["Address", app.address || "—"],
              ["Specialty", app.specialty || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{k}</p>
                <p className="font-medium text-foreground text-xs">{v}</p>
              </div>
            ))}
          </div>
          {app.message && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Message</p>
              <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3">{app.message}</p>
            </div>
          )}
          {isPending && (
            <div className="space-y-3 pt-2">
              <Textarea
                placeholder="Admin notes (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <Textarea
                placeholder="Rejection reason (required if rejecting)"
                value={rejection}
                onChange={e => setRejection(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={actionMutation.isPending}
                  onClick={() => actionMutation.mutate({ action: "approve" })}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={actionMutation.isPending}
                  onClick={() => actionMutation.mutate({ action: "reject" })}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionMutation.isPending}
                  onClick={() => actionMutation.mutate({ action: "needs_more_info" })}
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> Need More Info
                </Button>
              </div>
            </div>
          )}
          {!isPending && app.admin_notes && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Admin Notes</p>
              <p className="text-sm text-foreground">{app.admin_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SellerApprovalCenter() {
  const [filter, setFilter] = useState("pending");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-all-applications"],
    queryFn: () => base44.entities.SellerApplication.list("-created_date", 200),
    staleTime: 30000,
  });

  const filtered = filter === "all" ? applications : applications.filter(a => a.application_status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Seller Approval Center</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{applications.filter(a => a.application_status === "pending").length} pending review</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="needs_more_info">Needs Info</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-serif text-lg">No {filter === "all" ? "" : filter} applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => <ApplicationRow key={app.id} app={app} />)}
        </div>
      )}
    </div>
  );
}