import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DashboardSidebar from "@/components/seller/DashboardSidebar";
import PortfolioCards from "@/components/seller/PortfolioCards";
import NextBestActions from "@/components/seller/NextBestActions";
import InventoryTable from "@/components/seller/InventoryTable";
import ProfileEditor from "@/components/seller/ProfileEditor";
import SellerSettings from "./SellerSettings";
import SellerMessages from "@/components/seller/SellerMessages";
import SellerAnalytics from "@/components/seller/SellerAnalytics";
import InvoiceBuilder from "@/components/seller/InvoiceBuilder";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";

const VIEW_LABELS = {
  listings: "Inventory", draft: "Drafts", first_bids: "1stBid$ Preview",
  prisometer: "PRI$OMETER Live", pending_review: "Under Review",
  sold: "Sold Items", unsold: "Unsold Items",
};

const PANEL_VIEWS = ["profile", "settings", "messages", "analytics", "invoices"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function SellerDashboard() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "overview";

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: items = [] } = useQuery({
    queryKey: ["seller-items", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: profile } = useQuery({
    queryKey: ["seller-profile", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: (d) => d[0],
    enabled: !!user?.email,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const stats = {
    drafts:    items.filter(i => i.status === "draft").length,
    first_bids: items.filter(i => i.status === "first_bids").length,
    prisometer: items.filter(i => i.status === "prisometer").length,
    sold:      items.filter(i => i.status === "sold").length,
    pending:   items.filter(i => i.status === "pending_review").length,
    revenue:   items.filter(i => i.status === "sold").reduce((s, i) => s + (i.sold_price || 0), 0),
  };

  // Active listings value = sum of asking/current prices for live items
  const activeItems = items.filter(i => ["first_bids", "prisometer"].includes(i.status));
  const activeValue = activeItems.reduce((s, i) => s + (i.current_price || i.prisometer_start_price || 0), 0);

  const filteredItems = view === "overview" || view === "listings"
    ? items
    : items.filter(i => {
        if (view === "first_bids") return i.status === "first_bids";
        if (view === "prisometer") return i.status === "prisometer";
        return i.status === view;
      });

  const isPanel = PANEL_VIEWS.includes(view);
  const sellerName = profile?.display_name || user?.full_name || "Seller";

  return (
    <div className="flex min-h-screen bg-[hsl(40,25%,97%)]">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[hsl(40,25%,97%)]/95 backdrop-blur border-b border-border/60 px-8 py-5 flex items-start justify-between">
          <div>
            {view === "overview" ? (
              <>
                <h1 className="font-serif text-2xl font-semibold text-foreground leading-tight">
                  {getGreeting()}, {sellerName}
                </h1>
                <p className="text-[13px] text-muted-foreground mt-1">
                  {activeItems.length > 0
                    ? `${activeItems.length} active listing${activeItems.length !== 1 ? "s" : ""} with a combined asking value of $${activeValue.toLocaleString()}`
                    : `${format(new Date(), "EEEE, MMMM d, yyyy")} · No active listings yet`}
                </p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-xl font-semibold text-foreground leading-tight">
                  {VIEW_LABELS[view] || view.charAt(0).toUpperCase() + view.slice(1)}
                </h1>
                <p className="text-[13px] text-muted-foreground mt-0.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
              </>
            )}
          </div>
          <Link to="/seller/studio">
            <Button className="gap-2 h-10 px-5 font-semibold shadow-sm">
              <Plus className="w-4 h-4" /> Add Listing
            </Button>
          </Link>
        </div>

        <div className="p-8 space-y-10">

          {/* Overview-only sections */}
          {view === "overview" && (
            <>
              <PortfolioCards stats={stats} />
              <NextBestActions />
            </>
          )}

          {/* Sub-panel views */}
          {view === "profile"   && <ProfileEditor />}
          {view === "settings"  && <SellerSettings />}
          {view === "messages"  && <SellerMessages user={user} />}
          {view === "analytics" && <SellerAnalytics user={user} />}
          {view === "invoices"  && <InvoiceBuilder user={user} />}

          {/* Inventory table — shown for overview + listing views */}
          {!isPanel && (
            <div>
              {view === "overview" && items.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-base font-semibold text-foreground">Recent Listings</h2>
                  <Link to="/seller?view=listings" className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    View all inventory →
                  </Link>
                </div>
              )}
              <InventoryTable
                items={filteredItems}
                view={view}
                limit={view === "overview" ? 8 : undefined}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}