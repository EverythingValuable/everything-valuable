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
import ConsignorsPanel from "@/components/seller/ConsignorsPanel";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { format } from "date-fns";
import BelowReserveAlert from "@/components/seller/BelowReserveAlert";
import SellerWelcomeGuide from "@/components/seller/SellerWelcomeGuide";
import MobileSellerNav from "@/components/seller/MobileSellerNav";

const VIEW_LABELS = {
  welcome: "Getting Started",
  listings: "Inventory", draft: "Drafts", first_bids: "1stBid$ Preview",
  prisometer: "PRI$OMETER Live", pending_review: "Under Review",
  sold: "Sold Items", unsold: "Unsold Items", consignors: "Consignors",
};

const PANEL_VIEWS = ["profile", "settings", "messages", "analytics", "invoices", "consignors", "welcome"];

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

function MetricCard({ label, value, subtext, urgent, href }) {
  const inner = (
    <div className={`bg-white border px-5 pt-4 pb-5 group transition-colors ${urgent ? "border-neutral-300 hover:border-neutral-400" : "border-neutral-200 hover:border-neutral-300"}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 leading-tight">{label}</p>
        {urgent && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />}
      </div>
      <p className="text-[32px] font-bold text-neutral-900 leading-none tabular-nums mb-2">{value}</p>
      <div className="h-px bg-neutral-100 mb-2" />
      {subtext && <p className="text-[10px] text-neutral-400 leading-snug">{subtext}</p>}
    </div>
  );
  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}

function SellerIntelligencePanel({ stats, items, issueCount }) {
  const draftsMissingPhotos = items.filter(i => i.status === "draft" && !i.images?.length).length;
  const draftsMissingPricing = items.filter(i => i.status === "draft" && !i.prisometer_start_price).length;
  const lowViewActive = items.filter(i => ["first_bids", "prisometer"].includes(i.status) && (i.view_count || 0) < 3).length;

  const healthItems = [
    { label: "Photos", score: items.length ? Math.round((items.filter(i => i.images?.length >= 3).length / items.length) * 100) : 100 },
    { label: "Titles", score: items.length ? Math.round((items.filter(i => i.title && i.title.length > 20).length / items.length) * 100) : 100 },
    { label: "Condition", score: items.length ? Math.round((items.filter(i => i.condition_notes).length / items.length) * 100) : 100 },
    { label: "Pricing", score: items.length ? Math.round((items.filter(i => i.prisometer_start_price && i.reserve_price).length / items.length) * 100) : 100 },
    { label: "Logistics", score: items.length ? Math.round((items.filter(i => i.customer_location).length / items.length) * 100) : 100 },
  ];
  const portfolioScore = healthItems.length ? Math.round(healthItems.reduce((s, h) => s + h.score, 0) / healthItems.length) : 0;

  const actions = [
    stats.pending > 0 && { text: `${stats.pending} item${stats.pending !== 1 ? "s" : ""} under review`, urgent: true },
    draftsMissingPhotos > 0 && { text: `${draftsMissingPhotos} draft${draftsMissingPhotos !== 1 ? "s" : ""} missing photos`, urgent: true },
    draftsMissingPricing > 0 && { text: `${draftsMissingPricing} draft${draftsMissingPricing !== 1 ? "s" : ""} missing pricing`, urgent: false },
    lowViewActive > 0 && { text: `${lowViewActive} live item${lowViewActive !== 1 ? "s" : ""} with low views`, urgent: false },
  ].filter(Boolean);

  return (
    <div className="border border-neutral-200 bg-white divide-y divide-neutral-100">
      <div className="px-5 py-4">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">Action Needed</p>
        {actions.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No immediate actions required.</p>
        ) : (
          <div className="space-y-2">
            {actions.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${a.urgent ? "bg-primary" : "bg-neutral-300"}`} />
                <p className="text-[11px] text-neutral-600 leading-snug">{a.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Portfolio Health</p>
          <span className="text-sm font-bold text-neutral-900">{portfolioScore}/100</span>
        </div>
        <div className="h-1 bg-neutral-100 mb-4">
          <div className="h-full bg-neutral-800 transition-all" style={{ width: `${portfolioScore}%` }} />
        </div>
        <div className="space-y-2">
          {healthItems.map(h => (
            <div key={h.label} className="flex items-center gap-3">
              <span className="text-[10px] text-neutral-500 w-16 shrink-0">{h.label}</span>
              <div className="flex-1 h-1 bg-neutral-100">
                <div className={`h-full transition-all ${h.score >= 70 ? "bg-neutral-700" : h.score >= 40 ? "bg-neutral-400" : "bg-primary"}`} style={{ width: `${h.score}%` }} />
              </div>
              <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">{h.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Best Action */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">Next Best Action</p>
        {(() => {
          const missingCondition = items.filter(i => ["first_bids","prisometer"].includes(i.status) && !i.condition_notes).length;
          const missingPhotos = items.filter(i => i.status === "draft" && !i.images?.length).length;
          const missingReserve = items.filter(i => ["first_bids","prisometer","draft"].includes(i.status) && !i.reserve_price).length;
          const lowBids = items.filter(i => ["first_bids","prisometer"].includes(i.status) && (i.bid_count || 0) === 0).length;

          let action = null;
          let href = "/seller?view=listings";

          if (missingCondition > 0) {
            action = `Add condition reports to ${missingCondition} active listing${missingCondition !== 1 ? "s" : ""}`;
            href = "/seller?view=first_bids";
          } else if (missingPhotos > 0) {
            action = `Upload photos to ${missingPhotos} draft${missingPhotos !== 1 ? "s" : ""}`;
            href = "/seller?view=draft";
          } else if (missingReserve > 0) {
            action = `Set reserve prices on ${missingReserve} unprotected lot${missingReserve !== 1 ? "s" : ""}`;
            href = "/seller?view=listings";
          } else if (lowBids > 0) {
            action = `Review ${lowBids} live item${lowBids !== 1 ? "s" : ""} with no bids yet`;
            href = "/seller?view=prisometer";
          }

          if (!action) {
            return <p className="text-[11px] text-neutral-400 italic">Your inventory looks healthy. Keep it up.</p>;
          }

          return (
            <div className="space-y-3">
              <p className="text-[12px] text-neutral-800 font-semibold leading-snug">{action}</p>
              <Link to={href}>
                <button className="w-full text-[11px] font-bold tracking-[0.12em] uppercase border border-neutral-300 text-neutral-700 hover:border-neutral-700 hover:text-neutral-900 py-2.5 transition-colors">
                  Review Issues →
                </button>
              </Link>
            </div>
          );
        })()}
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
    staleTime: 5 * 60 * 1000,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["seller-items", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const { data: profile } = useQuery({
    queryKey: ["seller-profile", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: (d) => d[0],
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
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

  const unpaidInvoices = 0; // placeholder — InvoiceBuilder has the real count

  return (
    <div className="flex min-h-screen bg-[#faf9f7]">
      {/* Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0 overflow-y-auto">
        <DashboardSidebar />
      </div>

      <MobileSellerNav user={user} />

      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-neutral-200 bg-[#faf9f7]/95 backdrop-blur px-6 py-4 lg:px-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">{sellerName}</p>
              <h1 className="text-lg font-bold text-neutral-900 leading-tight">
                {view === "overview" ? "Seller Dashboard" : (VIEW_LABELS[view] || view)}
              </h1>
              {view === "overview" && (
                <p className="text-xs text-neutral-400 mt-0.5">
                  Manage listings, live pricing events, bids, invoices, and seller activity.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/seller/bulk-upload">
                <button className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 border border-neutral-200 px-4 h-9 transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Bulk Import
                </button>
              </Link>
              <Link to="/seller/studio">
                <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold tracking-wide px-5 h-9 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Listing
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-10 pb-24 md:pb-10 space-y-6">

          {/* Metric Cards — overview only */}
          {view === "overview" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px bg-neutral-200">
              <MetricCard label="Active Listings" value={activeItems.length} subtext="1stBid$ + PRI$OMETER" href="/seller?view=listings" />
              <MetricCard label="In Preview" value={stats.first_bids} subtext="Early buyer interest" href="/seller?view=first_bids" />
              <MetricCard label="PRI$OMETER Live" value={stats.prisometer} subtext="Price declining now" href="/seller?view=prisometer" />
              <MetricCard label="Under Review" value={stats.pending} subtext={stats.pending > 0 ? "Action needed" : "Nothing pending"} urgent={stats.pending > 0} href="/seller?view=pending_review" />
              <MetricCard label="Sold" value={stats.sold} subtext={stats.revenue > 0 ? `$${stats.revenue.toLocaleString()} revenue` : "No sales yet"} href="/seller?view=sold" />
              <MetricCard label="Drafts" value={stats.drafts} subtext="Not yet published" href="/seller?view=draft" />
            </div>
          )}

          {/* Below reserve alert */}
          {view === "overview" && <BelowReserveAlert user={user} />}

          {/* Sub-panel views */}
          {view === "profile"    && <ProfileEditor />}
          {view === "settings"   && <SellerSettings />}
          {view === "messages"   && <SellerMessages user={user} />}
          {view === "analytics"  && <SellerAnalytics user={user} />}
          {view === "invoices"   && <InvoiceBuilder user={user} />}
          {view === "consignors" && <ConsignorsPanel user={user} />}
          {view === "welcome"    && <SellerWelcomeGuide />}

          {/* Inventory + Intelligence */}
          {!isPanel && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Inventory Command Center</h2>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Track drafts, live events, reserves, bids, invoices, and seller activity.</p>
                  </div>
                  {view === "overview" && items.length > 0 && (
                    <Link to="/seller?view=listings" className="text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors">
                      View all →
                    </Link>
                  )}
                </div>
                <InventoryTable
                  items={filteredItems}
                  view={view}
                  limit={view === "overview" ? 10 : undefined}
                />
              </div>

              {/* Right Intelligence Panel — overview only on desktop */}
              {view === "overview" && (
                <div className="hidden xl:block sticky top-24">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">Seller Intelligence</p>
                  <SellerIntelligencePanel stats={stats} items={items} issueCount={issueCount} />
                </div>
              )}
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