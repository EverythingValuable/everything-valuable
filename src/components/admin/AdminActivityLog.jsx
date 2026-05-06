import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList } from "lucide-react";

const ACTION_COLORS = {
  seller_approved: "bg-green-50 text-green-700 border-green-200",
  seller_rejected: "bg-red-50 text-red-700 border-red-200",
  account_suspended: "bg-red-50 text-red-700 border-red-200",
  account_restored: "bg-green-50 text-green-700 border-green-200",
  role_changed: "bg-purple-50 text-purple-700 border-purple-200",
  listing_removed: "bg-orange-50 text-orange-700 border-orange-200",
  fee_refunded: "bg-amber-50 text-amber-700 border-amber-200",
  dispute_resolved: "bg-blue-50 text-blue-700 border-blue-200",
  ticket_closed: "bg-muted text-muted-foreground border-border",
  note_added: "bg-muted text-muted-foreground border-border",
  financial_adjustment: "bg-amber-50 text-amber-700 border-amber-200",
  other: "bg-muted text-muted-foreground border-border",
};

export default function AdminActivityLog() {
  const [filter, setFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-activity-log"],
    queryFn: () => base44.entities.AdminLog.list("-created_date", 200),
    staleTime: 30000,
  });

  const filtered = filter === "all" ? logs : logs.filter(l => l.action_type === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Admin Activity Log</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{logs.length} actions recorded</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {Object.keys(ACTION_COLORS).map(k => (
              <SelectItem key={k} value={k}>{k.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-serif text-lg">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className="flex items-start gap-4 border border-border rounded-xl bg-card p-4">
              <div className="shrink-0 pt-0.5">
                <Badge variant="outline" className={`text-[10px] ${ACTION_COLORS[log.action_type] || ACTION_COLORS.other}`}>
                  {log.action_type?.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{log.admin_email}</span>
                  {log.affected_user_email && (
                    <span className="text-xs text-muted-foreground">→ {log.affected_user_email}</span>
                  )}
                </div>
                {(log.reason || log.note) && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.reason || log.note}</p>
                )}
                {log.previous_value && log.new_value && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
                    {log.previous_value} → {log.new_value}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                {log.created_date ? new Date(log.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}