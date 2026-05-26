import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Plus, Upload, Package, FileText,
  Gavel, Activity, Clock, CheckCircle2, XCircle,
  MessageSquare, BarChart2, User, Settings, ChevronLeft,
  Tag, Layers, HeadphonesIcon, Users, BookOpen
} from "lucide-react";
import ContactSupportModal from "@/components/shared/ContactSupportModal";

const navGroups = [
  {
    items: [
      { label: "Overview", icon: LayoutDashboard, href: "/seller", exact: true },
      { label: "Getting Started", icon: BookOpen, href: "/seller?view=welcome" },
    ]
  },
  {
    label: "CREATE",
    items: [
      { label: "Add Listing", icon: Plus, href: "/seller/studio", highlight: true },
      { label: "Bulk Import", icon: Upload, href: "/seller/bulk-upload" },
    ]
  },
  {
    label: "INVENTORY",
    items: [
      { label: "Inventory", icon: Layers, href: "/seller?view=listings" },
      { label: "Drafts", icon: FileText, href: "/seller?view=draft" },
      { label: "1stBid$ Preview", icon: Gavel, href: "/seller?view=first_bids" },
      { label: "PRI$OMETER Live", icon: Activity, href: "/seller?view=prisometer" },
      { label: "Under Review", icon: Clock, href: "/seller?view=pending_review" },
      { label: "Sold Items", icon: CheckCircle2, href: "/seller?view=sold" },
      { label: "Unsold Items", icon: XCircle, href: "/seller?view=unsold" },
      { label: "Consignors", icon: Users, href: "/seller?view=consignors" },
    ]
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Messages", icon: MessageSquare, href: "/seller?view=messages" },
      { label: "Invoices", icon: FileText, href: "/seller?view=invoices" },
      { label: "Analytics", icon: BarChart2, href: "/seller?view=analytics" },
      { label: "Seller Profile", icon: User, href: "/seller?view=profile" },
      { label: "Settings", icon: Settings, href: "/seller?view=settings" },
    ]
  }
];

export default function DashboardSidebar() {
  const location = useLocation();
  const urlView = new URLSearchParams(location.search).get("view");
  const [supportOpen, setSupportOpen] = useState(false);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me(), staleTime: 5 * 60 * 1000 });
  const { data: profile } = useQuery({
    queryKey: ["seller-profile", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["unread-messages", user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email, read: false }),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
  const unreadCount = unreadMessages.length;

  const { data: pendingInvoices = [] } = useQuery({
    queryKey: ["pending-invoices", user?.email],
    queryFn: () => base44.entities.Invoice.filter({ seller_email: user.email }),
    select: d => d.filter(inv => ["draft", "pending"].includes(inv.status)),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
  const pendingInvoiceCount = pendingInvoices.length;

  // Reuse the same cache key as the main dashboard to avoid duplicate requests
  const { data: sellerItems = [] } = useQuery({
    queryKey: ["seller-items", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user.email }),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
  const draftCount = sellerItems.filter(i => i.status === "draft").length;
  const reviewCount = sellerItems.filter(i => i.status === "pending_review").length;

  const isActive = (item) => {
    if (item.exact) return location.pathname === "/seller" && !urlView;
    if (item.href.includes("?view=")) {
      return urlView === item.href.split("?view=")[1];
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <aside className="w-56 min-h-screen bg-[#faf9f7] border-r border-neutral-200 flex flex-col shrink-0">
      {/* Brand / seller identity */}
      <div className="px-5 pt-6 pb-5 border-b border-neutral-200">
        <Link to="/" className="flex items-center gap-1.5 mb-5 text-neutral-400 hover:text-neutral-700 transition-colors text-[11px] tracking-wide">
          <ChevronLeft className="w-3 h-3" /> Marketplace
        </Link>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 mb-1">Everything Valuable</p>
        <p className="text-sm font-bold text-neutral-900 leading-tight">
          {profile?.display_name || "Seller Portal"}
        </p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.label && (
              <p className="px-5 pb-2 pt-1 text-[9px] font-bold tracking-[0.2em] text-neutral-400/60 uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-0">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-5 py-2 text-[12px] transition-all",
                      item.highlight
                        ? "text-primary font-bold hover:bg-primary/5"
                        : active
                        ? "bg-white text-neutral-900 font-semibold border-l-2 border-neutral-900"
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-white/60"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 leading-none">{item.label}</span>
                    {item.href.includes("view=messages") && unreadCount > 0 && (
                      <span className="bg-primary text-white text-[9px] font-bold rounded-full min-w-[1rem] h-4 px-1 flex items-center justify-center shrink-0">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    {item.href.includes("view=invoices") && pendingInvoiceCount > 0 && (
                      <span className="bg-primary text-white text-[9px] font-bold rounded-full min-w-[1rem] h-4 px-1 flex items-center justify-center shrink-0">
                        {pendingInvoiceCount > 9 ? "9+" : pendingInvoiceCount}
                      </span>
                    )}
                    {item.href.includes("view=draft") && draftCount > 0 && (
                      <span className="bg-neutral-400 text-white text-[9px] font-bold rounded-full min-w-[1rem] h-4 px-1 flex items-center justify-center shrink-0">
                        {draftCount > 9 ? "9+" : draftCount}
                      </span>
                    )}
                    {item.href.includes("view=pending_review") && reviewCount > 0 && (
                      <span className="bg-primary text-white text-[9px] font-bold rounded-full min-w-[1rem] h-4 px-1 flex items-center justify-center shrink-0">
                        {reviewCount > 9 ? "9+" : reviewCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-neutral-200 space-y-2">
        <button
          onClick={() => setSupportOpen(true)}
          className="flex items-center gap-2 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors w-full"
        >
          <HeadphonesIcon className="w-3 h-3" /> Contact Support
        </button>
        <p className="text-[10px] text-neutral-300 tracking-wide">© Everything Valuable</p>
      </div>

      <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} user={user} />
    </aside>
  );
}