import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Package, Upload, FileText,
  Gavel, TrendingDown, Clock, CheckCircle2,
  XCircle, MessageSquare, BarChart2, User, Settings, ChevronLeft
} from "lucide-react";

const navGroups = [
  {
    items: [
      { label: "Overview", icon: LayoutDashboard, href: "/seller", exact: true },
    ]
  },
  {
    label: "LISTINGS",
    items: [
      { label: "Upload New Item", icon: Upload, href: "/seller/studio", highlight: true },
      { label: "Bulk Upload", icon: Upload, href: "/seller/bulk-upload" },
      { label: "All Listings", icon: Package, href: "/seller?view=listings" },
      { label: "Drafts", icon: FileText, href: "/seller?view=draft" },
      { label: "Live in 1stBid$™", icon: Gavel, href: "/seller?view=first_bids" },
      { label: "Live in PRI$OMETER™", icon: TrendingDown, href: "/seller?view=prisometer" },
      { label: "Pending Review", icon: Clock, href: "/seller?view=pending_review" },
      { label: "Sold", icon: CheckCircle2, href: "/seller?view=sold" },
      { label: "Unsold", icon: XCircle, href: "/seller?view=unsold" },
    ]
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Messages", icon: MessageSquare, href: "/seller?view=messages" },
      { label: "Invoices", icon: FileText, href: "/seller?view=invoices" },
      { label: "Analytics", icon: BarChart2, href: "/seller?view=analytics" },
      { label: "My Profile", icon: User, href: "/seller?view=profile" },
      { label: "Settings", icon: Settings, href: "/seller?view=settings" },
    ]
  }
];

export default function DashboardSidebar() {
  const location = useLocation();
  const urlView = new URLSearchParams(location.search).get("view");

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["unread-messages", user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email, read: false }),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });
  const unreadCount = unreadMessages.length;

  const isActive = (item) => {
    if (item.exact) return location.pathname === "/seller" && !urlView;
    if (item.href.includes("?view=")) {
      const itemView = item.href.split("?view=")[1];
      return urlView === itemView;
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-border flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <div>
          <p className="font-serif text-base font-semibold text-foreground">Seller Studio</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide">Everything Valuable</p>
        </div>
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.label && (
              <p className="px-5 pb-1 text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    item.highlight && "bg-primary text-primary-foreground hover:bg-primary/90 font-medium my-1",
                    !item.highlight && active && "bg-secondary text-foreground font-medium",
                    !item.highlight && !active && "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.href.includes("view=messages") && unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground/50">© Everything Valuable</p>
      </div>
    </aside>
  );
}