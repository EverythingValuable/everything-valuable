import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, Store, DollarSign, AlertTriangle, HeadphonesIcon, FileText, Package, ClipboardList } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import AdminOverview from "@/components/admin/AdminOverview";
import SellerApprovalCenter from "@/components/admin/SellerApprovalCenter";
import UserManagement from "@/components/admin/UserManagement";
import FeeDashboard from "@/components/admin/FeeDashboard";
import DisputesCenter from "@/components/admin/DisputesCenter";
import SupportCenter from "@/components/admin/SupportCenter";
import TransactionOversight from "@/components/admin/TransactionOversight";
import ListingOversight from "@/components/admin/ListingOversight";
import AdminActivityLog from "@/components/admin/AdminActivityLog";
import { useLocation } from "react-router-dom";

const TABS = [
  { value: "overview",   label: "Overview",     icon: LayoutDashboard },
  { value: "sellers",    label: "Seller Approvals", icon: Store },
  { value: "users",      label: "Users",        icon: Users },
  { value: "fees",       label: "Fees",         icon: DollarSign },
  { value: "disputes",   label: "Disputes",     icon: AlertTriangle },
  { value: "support",    label: "Support",      icon: HeadphonesIcon },
  { value: "transactions", label: "Transactions", icon: FileText },
  { value: "listings",   label: "Listings",     icon: Package },
  { value: "log",        label: "Activity Log", icon: ClipboardList },
];

function AdminDashboardInner() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [tab, setTab] = useState(params.get("tab") || "overview");

  return (
    <div className="min-h-screen bg-[hsl(40,20%,97%)]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1">Platform Control Center</p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-primary">Platform Live</span>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 bg-transparent p-0 h-auto gap-1 flex-wrap">
            {TABS.map(t => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all
                  data-[state=active]:bg-card data-[state=active]:border data-[state=active]:border-primary/30
                  data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold
                  data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview"><AdminOverview /></TabsContent>
          <TabsContent value="sellers"><SellerApprovalCenter /></TabsContent>
          <TabsContent value="users"><UserManagement /></TabsContent>
          <TabsContent value="fees"><FeeDashboard /></TabsContent>
          <TabsContent value="disputes"><DisputesCenter /></TabsContent>
          <TabsContent value="support"><SupportCenter /></TabsContent>
          <TabsContent value="transactions"><TransactionOversight /></TabsContent>
          <TabsContent value="listings"><ListingOversight /></TabsContent>
          <TabsContent value="log"><AdminActivityLog /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]} fallback="message">
      <AdminDashboardInner />
    </RoleGuard>
  );
}