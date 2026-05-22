import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp, Lock, Unlock, UserCheck, Mail } from "lucide-react";

const ROLE_COLORS = {
  buyer: "bg-blue-50 text-blue-700 border-blue-200",
  pending_seller: "bg-amber-50 text-amber-700 border-amber-200",
  seller: "bg-green-50 text-green-700 border-green-200",
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  super_admin: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_COLORS = {
  active: "bg-green-50 text-green-700 border-green-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  locked: "bg-orange-50 text-orange-700 border-orange-200",
};

function UserRow({ user: u, currentUser }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(u.admin_notes || "");
  const [reason, setReason] = useState("");

  const updateMutation = useMutation({
    mutationFn: (updates) => base44.functions.invoke("adminUpdateUser", {
      target_user_id: u.id,
      updates,
      reason,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
  });

  const isSelf = u.email === currentUser?.email;
  const canEditRole = currentUser?.role === "super_admin" && !isSelf;
  const isSeller = u.role === "seller";

  const resendMutation = useMutation({
    mutationFn: async () => {
      const apps = await base44.entities.SellerApplication.filter({ user_email: u.email });
      const approved = apps.find(a => a.application_status === "approved");
      if (!approved) throw new Error("No approved application found for this seller.");
      return base44.functions.invoke("resendWelcomeEmail", { application_id: approved.id });
    },
    onSuccess: () => alert("Welcome email resent successfully!"),
    onError: (err) => alert(err.message || "Failed to resend email."),
  });

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">{(u.full_name || u.email || "?")[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{u.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <Badge variant="outline" className={`text-[10px] ${ROLE_COLORS[u.role || "buyer"]}`}>{u.role || "buyer"}</Badge>
          {u.account_status && u.account_status !== "active" && (
            <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[u.account_status]}`}>{u.account_status}</Badge>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20 pt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {[
              ["Created", u.created_date ? new Date(u.created_date).toLocaleDateString() : "—"],
              ["Seller Status", u.seller_status || "not_applied"],
              ["Account Status", u.account_status || "active"],
              ["Approved At", u.approved_at ? new Date(u.approved_at).toLocaleDateString() : "—"],
              ["Approved By", u.approved_by || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-muted-foreground uppercase tracking-wide mb-0.5">{k}</p>
                <p className="font-medium text-foreground">{v}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Add admin notes…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <Input
              placeholder="Reason for action (optional)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ admin_notes: notes })} disabled={updateMutation.isPending}>
              Save Notes
            </Button>
            {!isSelf && u.account_status !== "suspended" && (
              <Button size="sm" variant="destructive" onClick={() => updateMutation.mutate({ account_status: "suspended" })} disabled={updateMutation.isPending}>
                <Lock className="w-3.5 h-3.5 mr-1" /> Suspend
              </Button>
            )}
            {!isSelf && u.account_status === "suspended" && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateMutation.mutate({ account_status: "active" })} disabled={updateMutation.isPending}>
                <Unlock className="w-3.5 h-3.5 mr-1" /> Restore
              </Button>
            )}
            {isSeller && (
              <Button size="sm" variant="outline" onClick={() => resendMutation.mutate()} disabled={resendMutation.isPending}>
                <Mail className="w-3.5 h-3.5 mr-1" /> {resendMutation.isPending ? "Sending…" : "Resend Welcome Email"}
              </Button>
            )}
            {canEditRole && (
              <Select onValueChange={role => updateMutation.mutate({ role })}>
                <SelectTrigger className="h-8 text-xs w-36">
                  <SelectValue placeholder="Change Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => base44.entities.User.list("-created_date", 500),
    staleTime: 30000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const filtered = users.filter(u => {
    const matchesSearch = !search || [u.full_name, u.email].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "all" || (u.role || "buyer") === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold">User & Account Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} total users</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="pending_seller">Pending Seller</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-2xl bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => <UserRow key={u.id} user={u} currentUser={currentUser} />)}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No users match your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}