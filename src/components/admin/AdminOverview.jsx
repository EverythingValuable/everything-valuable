import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Store, Gavel, TrendingDown, ShoppingBag, DollarSign, AlertTriangle, HeadphonesIcon, Clock, CheckCircle } from "lucide-react";

function StatCard({ label, value, icon: IconComp, accent = "text-primary", bg = "bg-primary/8", loading }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <IconComp className={`w-4 h-4 ${accent}`} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`font-sans text-3xl font-bold leading-none mt-1 ${accent}`}>
        {loading ? <span className="inline-block w-10 h-8 bg-muted rounded animate-pulse" /> : value}
      </p>
    </div>
  );
}

export default function AdminOverview() {
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => base44.entities.User.list("-created_date", 500),
    staleTime: 60000,
  });
  const { data: allItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ["admin-all-items"],
    queryFn: () => base44.entities.Item.list("-created_date", 500),
    staleTime: 60000,
  });
  const { data: allInvoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["admin-all-invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 500),
    staleTime: 60000,
  });
  const { data: allApplications = [] } = useQuery({
    queryKey: ["admin-all-applications"],
    queryFn: () => base44.entities.SellerApplication.list("-created_date", 200),
    staleTime: 60000,
  });
  const { data: allDisputes = [] } = useQuery({
    queryKey: ["admin-all-disputes"],
    queryFn: () => base44.entities.Dispute.list("-created_date", 200),
    staleTime: 60000,
  });
  const { data: allTickets = [] } = useQuery({
    queryKey: ["admin-all-tickets"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 200),
    staleTime: 60000,
  });

  const loading = loadingUsers || loadingItems || loadingInvoices;

  const buyers = allUsers.filter(u => (u.role || "buyer") === "buyer").length;
  const sellers = allUsers.filter(u => u.role === "seller").length;
  const pendingApps = allApplications.filter(a => a.application_status === "pending").length;
  const activeListings = allItems.filter(i => ["first_bids", "prisometer"].includes(i.status)).length;
  const firstBidsItems = allItems.filter(i => i.status === "first_bids").length;
  const prisometerItems = allItems.filter(i => i.status === "prisometer").length;
  const soldItems = allItems.filter(i => i.status === "sold").length;
  const totalGross = allInvoices.reduce((sum, inv) => sum + (inv.item_price || 0), 0);
  const totalFees = allInvoices.reduce((sum, inv) => sum + (inv.service_fee || 0), 0);
  const totalCredits = allInvoices.reduce((sum, inv) => sum + (inv.fee_credit || 0), 0);
  const netFees = totalFees - totalCredits;
  const openDisputes = allDisputes.filter(d => !["resolved", "closed"].includes(d.status)).length;
  const openTickets = allTickets.filter(t => !["resolved", "closed"].includes(t.status)).length;

  const stats = [
    { label: "Total Users", value: allUsers.length, icon: Users, accent: "text-primary", bg: "bg-primary/8" },
    { label: "Buyers", value: buyers, icon: Users, accent: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approved Sellers", value: sellers, icon: Store, accent: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Applications", value: pendingApps, icon: Clock, accent: pendingApps > 0 ? "text-amber-600" : "text-muted-foreground", bg: pendingApps > 0 ? "bg-amber-50" : "bg-muted/50" },
    { label: "Active Listings", value: activeListings, icon: Gavel, accent: "text-primary", bg: "bg-primary/8" },
    { label: "1stBid$ Live", value: firstBidsItems, icon: Gavel, accent: "text-primary", bg: "bg-primary/8" },
    { label: "PRI$OMETER Active", value: prisometerItems, icon: TrendingDown, accent: "text-red-600", bg: "bg-red-50" },
    { label: "Items Sold", value: soldItems, icon: CheckCircle, accent: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Gross Sales", value: `$${totalGross.toLocaleString("en-US")}`, icon: DollarSign, accent: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Fees Collected", value: `$${totalFees.toLocaleString("en-US")}`, icon: DollarSign, accent: "text-primary", bg: "bg-primary/8" },
    { label: "Net Platform Revenue", value: `$${netFees.toLocaleString("en-US")}`, icon: DollarSign, accent: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Open Disputes", value: openDisputes, icon: AlertTriangle, accent: openDisputes > 0 ? "text-red-600" : "text-muted-foreground", bg: openDisputes > 0 ? "bg-red-50" : "bg-muted/50" },
    { label: "Open Support Tickets", value: openTickets, icon: HeadphonesIcon, accent: openTickets > 0 ? "text-orange-600" : "text-muted-foreground", bg: openTickets > 0 ? "bg-orange-50" : "bg-muted/50" },
    { label: "Fee Credits Applied", value: `$${totalCredits.toLocaleString("en-US")}`, icon: ShoppingBag, accent: "text-muted-foreground", bg: "bg-muted/50" },
  ];

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-6">Platform Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>
    </div>
  );
}