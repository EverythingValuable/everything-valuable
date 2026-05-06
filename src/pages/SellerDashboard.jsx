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
import { Plus, Boxes, ClipboardCheck, DollarSign, AlertTriangle, Upload, ArrowRight, SearchCheck } from "lucide-react";
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

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function getInventoryIssues(item) {
  const issues = [];
  if (!item.images?.length) issues.push("photos");
  if (!item.prisometer_start_price) issues.push("pricing");
  if (!item.condition) issues.push("condition");
  if (!item.short_description && !item.description) issues.push("description");
  return issues;
}

function StatTile({ icon: Icon, label, value, subtext, tone = "default" }) {
  const toneClass = {
    default: "bg-white text-foreground",
    green: "bg-emerald-50 text-emerald-800 border-emerald-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
    blue: "bg-sky-50 text-sky-800 border-sky-100",
  }[tone];

  return (
    <div className={`rounded-lg border border-border p-4 shadow-sm ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-65">{label}</p>
        <Icon className="h-4 w-4 opacity-55" />
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold leading-none">{value}</p>
      <p className="mt-1.5 text-[12px] leading-snug opacity-70">{subtext}</p>
    </div>
  );
}

function WorkflowStrip({ stats, totalItems }) {
  const steps = [
    { label: "Draft", value: stats.drafts, href: "/seller?view=draft" },
    { label: "Review", value: stats.pending, href: "/seller?view=pending_review" },
    { label: "Preview", value: stats.first_bids, href: "/seller?view=first_bids" },
    { label: "Live", value: stats.prisometer, href: "/seller?view=prisometer" },
    { label: "Sold", value: stats.sold, href: "/seller?view=sold" },
  ];

  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold">Listing Workflow</p>
          <p className="text-[12px] text-muted-foreground">Follow each item from draft to sale without guessing where it sits.</p>
        </div>
        <Link to="/seller?view=listings" className="hidden items-center gap-1 text-[12px] font-semibold text-muted-foreground hover:text-foreground sm:flex">
          Full inventory <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {steps.map((step, index) => {
          const percent = totalItems ? Math.round((step.value / totalItems) * 100) : 0;
          return (
            <Link key={step.label} to={step.href} className="group rounded-lg border border-border/70 bg-[hsl(40,25%,98%)] p-3 transition-colors hover:border-primary/30 hover:bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{step.label}</span>
                <span className="font-price text-sm font-bold">{step.value}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(percent, step.value > 0 ? 8 : 0)}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{percent}% of inventory</p>
              {index < steps.length - 1 && <span className="sr-only">Next step</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function InventoryCommandBar({ activeItems, activeValue, issueCount }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-display text-sm font-bold">Today&apos;s Inventory Focus</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeItems.length > 0
              ? `${activeItems.length} live item${activeItems.length !== 1 ? "s" : ""} are carrying ${money(activeValue)} in active value.`
              : "No live items yet. Move completed drafts into review when they are ready."}
            {issueCount > 0 ? ` ${issueCount} item${issueCount !== 1 ? "s" : ""} could use cleanup before buyers see them.` : " Your active inventory looks complete."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/seller/studio">
            <Button className="h-9 gap-2 rounded-lg"><Plus className="h-4 w-4" /> Add item</Button>
          </Link>
          <Link to="/seller/bulk-upload">
            <Button variant="outline" className="h-9 gap-2 rounded-lg"><Upload className="h-4 w-4" /> Bulk import</Button>
          </Link>
          <Link to="/seller?view=listings">
            <Button variant="ghost" className="h-9 gap-2 rounded-lg"><SearchCheck className="h-4 w-4" /> Audit inventory</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import RoleGuard from "@/components/auth/RoleGuard";

function SellerDashboardInner() {
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
    total:     items.length,
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
  const issueCount = items.filter(item => getInventoryIssues(item).length > 0).length;
  const averageValue = items.length ? items.reduce((s, i) => s + (i.sold_price || i.current_price || i.prisometer_start_price || 0), 0) / items.length : 0;

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
    <div className="flex min-h-screen bg-[hsl(40,22%,96%)]">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border/60 bg-[hsl(40,22%,96%)]/95 px-5 py-4 backdrop-blur lg:px-8">
          <div>
            {view === "overview" ? (
              <>
                <h1 className="font-display text-2xl font-extrabold text-foreground leading-tight">
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
                <h1 className="font-display text-xl font-extrabold text-foreground leading-tight">
                  {VIEW_LABELS[view] || view.charAt(0).toUpperCase() + view.slice(1)}
                </h1>
                <p className="text-[13px] text-muted-foreground mt-0.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
              </>
            )}
          </div>
          <Link to="/seller/studio">
            <Button className="gap-2 h-10 px-5 font-semibold shadow-sm rounded-lg">
              <Plus className="w-4 h-4" /> Add Listing
            </Button>
          </Link>
        </div>

        <div className="space-y-6 p-5 lg:p-8">

          {/* Overview-only sections */}
          {view === "overview" && (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatTile icon={Boxes} label="Total Inventory" value={stats.total} subtext={`${activeItems.length} currently live or previewing`} tone="blue" />
                <StatTile icon={DollarSign} label="Active Value" value={money(activeValue)} subtext={`${money(averageValue)} average tracked item value`} tone="green" />
                <StatTile icon={ClipboardCheck} label="Sold Revenue" value={money(stats.revenue)} subtext={`${stats.sold} completed sale${stats.sold !== 1 ? "s" : ""}`} />
                <StatTile icon={AlertTriangle} label="Needs Updates" value={issueCount} subtext="Missing photos, pricing, condition, or copy" tone="amber" />
              </div>
              <InventoryCommandBar activeItems={activeItems} activeValue={activeValue} issueCount={issueCount} />
              <WorkflowStrip stats={stats} totalItems={items.length} />
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
                  <h2 className="font-display text-base font-bold text-foreground">Recent Inventory</h2>
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

export default function SellerDashboard() {
  return (
    <RoleGuard allowedRoles={["seller", "admin", "super_admin"]} redirectTo="/seller-access">
      <SellerDashboardInner />
    </RoleGuard>
  );
}