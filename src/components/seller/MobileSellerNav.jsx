import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Plus, Package, MessageSquare, BarChart2,
  X, FileText, Gavel, Activity, Clock, CheckCircle2, XCircle,
  Upload, User, Settings, Users, BookOpen, ChevronLeft,
  HeadphonesIcon, Tag, Layers
} from "lucide-react";
import ContactSupportModal from "@/components/shared/ContactSupportModal";
import { AnimatePresence, motion } from "framer-motion";

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

// Bottom nav tabs — the 5 most important actions
const bottomTabs = [
  { label: "Overview", icon: LayoutDashboard, href: "/seller", exact: true },
  { label: "Inventory", icon: Layers, href: "/seller?view=listings" },
  { label: "Add", icon: Plus, href: "/seller/studio", primary: true },
  { label: "Messages", icon: MessageSquare, href: "/seller?view=messages" },
  { label: "More", icon: Package, isMenu: true },
];

export default function MobileSellerNav({ user }) {
  const location = useLocation();
  const urlView = new URLSearchParams(location.search).get("view");
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["seller-profile", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["unread-messages", user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user?.email, read: false }),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const { data: pendingInvoices = [] } = useQuery({
    queryKey: ["pending-invoices", user?.email],
    queryFn: () => base44.entities.Invoice.filter({ seller_email: user?.email }),
    select: d => d.filter(inv => ["draft", "pending"].includes(inv.status)),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sellerItems = [] } = useQuery({
    queryKey: ["seller-items", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const unreadCount = unreadMessages.length;
  const pendingInvoiceCount = pendingInvoices.length;
  const draftCount = sellerItems.filter(i => i.status === "draft").length;
  const reviewCount = sellerItems.filter(i => i.status === "pending_review").length;

  const isActive = (item) => {
    if (item.exact) return location.pathname === "/seller" && !urlView;
    if (item.href.includes("?view=")) return urlView === item.href.split("?view=")[1];
    return location.pathname.startsWith(item.href);
  };

  const getBadge = (href) => {
    if (href.includes("view=messages") && unreadCount > 0) return unreadCount;
    if (href.includes("view=invoices") && pendingInvoiceCount > 0) return pendingInvoiceCount;
    if (href.includes("view=draft") && draftCount > 0) return draftCount;
    if (href.includes("view=pending_review") && reviewCount > 0) return reviewCount;
    return null;
  };

  return (
    <>
      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex items-stretch h-16 safe-area-bottom md:hidden">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const active = !tab.isMenu && !tab.primary && isActive(tab);
          const badge = !tab.isMenu && !tab.primary && getBadge(tab.href);

          if (tab.primary) {
            return (
              <Link key={tab.href} to={tab.href} className="flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-md -mt-4">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </Link>
            );
          }

          if (tab.isMenu) {
            return (
              <button
                key="more"
                onClick={() => setMenuOpen(true)}
                className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 relative",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[8px] font-bold rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Full-screen slide-up menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl max-h-[85vh] overflow-y-auto md:hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div>
                  <p className="font-semibold text-sm">{profile?.display_name || "Seller Portal"}</p>
                  <Link to="/" className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5" onClick={() => setMenuOpen(false)}>
                    <ChevronLeft className="w-3 h-3" /> Back to marketplace
                  </Link>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Nav groups */}
              <div className="px-4 py-4 space-y-5 pb-8">
                {navGroups.map((group, gi) => (
                  <div key={gi}>
                    {group.label && (
                      <p className="text-[9px] font-bold tracking-[0.15em] text-muted-foreground/50 uppercase px-2 mb-2">
                        {group.label}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const badge = getBadge(item.href);
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all",
                              item.highlight
                                ? "bg-primary text-primary-foreground font-semibold"
                                : active
                                ? "bg-muted text-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {badge && (
                              <span className="bg-destructive text-white text-[9px] font-bold rounded-full min-w-[1rem] h-4 px-1 flex items-center justify-center">
                                {badge > 9 ? "9+" : badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="border-t border-border pt-4">
                  <button
                    onClick={() => { setSupportOpen(true); setMenuOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full"
                  >
                    <HeadphonesIcon className="w-4 h-4" /> Contact Support
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} user={user} />
    </>
  );
}