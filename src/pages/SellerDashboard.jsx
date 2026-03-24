import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DashboardSidebar from "@/components/seller/DashboardSidebar";
import ProfileEditor from "@/components/seller/ProfileEditor";
import SellerSettings from "./SellerSettings";
import SellerMessages from "@/components/seller/SellerMessages";
import SellerAnalytics from "@/components/seller/SellerAnalytics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload, TrendingUp, Package, CheckCircle2, Clock,
  XCircle, DollarSign, Eye, ArrowRight, Plus
} from "lucide-react";
import { format } from "date-fns";

const STATUS_LABELS = {
  draft: "Draft", first_bids: "1stBid$™", prisometer: "PRI$OMETER™",
  sold: "Sold", pending_review: "Pending", unsold: "Unsold", scheduled: "Scheduled"
};
const STATUS_STYLES = {
  draft: "bg-secondary text-foreground",
  first_bids: "bg-blue-100 text-blue-800",
  prisometer: "bg-red-100 text-red-700",
  sold: "bg-green-100 text-green-700",
  pending_review: "bg-amber-100 text-amber-700",
  unsold: "bg-gray-100 text-gray-600",
  scheduled: "bg-purple-100 text-purple-700",
};

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
    live:      items.filter(i => ["first_bids","prisometer"].includes(i.status)).length,
    sold:      items.filter(i => i.status === "sold").length,
    pending:   items.filter(i => i.status === "pending_review").length,
    revenue:   items.filter(i => i.status === "sold").reduce((s, i) => s + (i.sold_price || 0), 0),
  };

  const filteredItems = view === "overview" || view === "listings"
    ? items
    : items.filter(i => {
        if (view === "first_bids") return i.status === "first_bids";
        if (view === "prisometer") return i.status === "prisometer";
        return i.status === view;
      });

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-semibold">
              {view === "overview" ? `Welcome back${profile?.display_name ? `, ${profile.display_name}` : ""}` : viewTitle(view)}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(), "EEEE, MMMM do yyyy")}</p>
          </div>
          <Link to="/seller/studio">
            <Button className="gap-2"><Upload className="w-4 h-4" /> Upload Item</Button>
          </Link>
        </div>

        <div className="p-8 space-y-8">

          {/* Stats row */}
          {view === "overview" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Drafts" value={stats.drafts} icon={Package} color="text-muted-foreground" />
                <StatCard label="Live Now" value={stats.live} icon={TrendingUp} color="text-green-600" />
                <StatCard label="Sold" value={stats.sold} icon={CheckCircle2} color="text-primary" />
                <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-amber-600" />
                <StatCard label="Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} color="text-primary" wide />
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionCard
                  title="Upload a New Item"
                  desc="Start the guided listing studio to upload photos, details and configure your PRI$OMETER."
                  href="/seller/studio"
                  cta="Open Studio"
                  icon={<Upload className="w-5 h-5" />}
                />
                <ActionCard
                  title="Complete Your Profile"
                  desc="A complete seller profile helps buyers trust you and boosts your listings."
                  href="/seller?view=profile"
                  cta="Edit Profile"
                  icon={<Eye className="w-5 h-5" />}
                />
                <ActionCard
                  title="View Sold Items"
                  desc="Review your completed sales, download invoices, and track shipments."
                  href="/seller?view=sold"
                  cta="View Sales"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                />
              </div>
            </>
          )}

          {/* Profile Editor */}
          {view === "profile" && <ProfileEditor />}

          {/* Settings */}
          {view === "settings" && <SellerSettings />}

          {/* Messages */}
          {view === "messages" && <SellerMessages user={user} />}

          {/* Analytics */}
          {view === "analytics" && <SellerAnalytics user={user} />}

          {/* Listings table */}
          <div className={["profile", "settings", "messages", "analytics"].includes(view) ? "hidden" : ""}>
            {view !== "overview" && (
              <h2 className="font-serif text-lg font-semibold mb-4">{viewTitle(view)}</h2>
            )}
            {view === "overview" && items.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-semibold">Recent Listings</h2>
                <Link to="/seller?view=listings" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {filteredItems.length === 0 ? (
              <EmptyState view={view} />
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Price</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(view === "overview" ? filteredItems.slice(0, 8) : filteredItems).map(item => (
                      <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {item.images?.[0]
                              ? <img src={item.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
                              : <div className="w-10 h-10 rounded-lg bg-secondary shrink-0 flex items-center justify-center text-muted-foreground text-xs">No img</div>
                            }
                            <span className="font-medium line-clamp-1">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell text-muted-foreground capitalize">{item.category?.replace(/_/g," ")}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.status] || "bg-secondary"}`}>
                            {STATUS_LABELS[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground">
                          {item.status === "sold"
                            ? <span className="text-green-700 font-medium">${item.sold_price?.toLocaleString()}</span>
                            : item.current_price
                            ? `$${item.current_price.toLocaleString()}`
                            : item.prisometer_start_price
                            ? `$${item.prisometer_start_price.toLocaleString()}`
                            : "—"
                          }
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/seller/studio?edit=${item.id}`}>
                              <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                            </Link>
                            <Link to={`/item/${item.id}`}>
                              <Button variant="ghost" size="sm" className="text-xs">View</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: IconComp, color, wide }) {
  const Icon = IconComp;
  return (
    <div className="bg-card rounded-xl border border-border px-5 py-4 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`font-serif text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function ActionCard({ title, desc, href, cta, icon }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
      <div>
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">{icon}</div>
        <h3 className="font-serif text-sm font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <Link to={href}>
        <Button variant="outline" size="sm" className="w-full text-xs gap-1">{cta} <ArrowRight className="w-3 h-3" /></Button>
      </Link>
    </div>
  );
}

function EmptyState({ view }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center space-y-3">
      <Package className="w-8 h-8 text-muted-foreground/40 mx-auto" />
      <h3 className="font-serif text-lg font-medium text-muted-foreground">No items here yet</h3>
      <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
        {view === "draft" ? "Start a listing and save it as a draft to see it here."
        : view === "sold" ? "Your sold items will appear here once a sale completes."
        : "Nothing here yet. Upload your first item to get started."}
      </p>
      <Link to="/seller/studio">
        <Button className="mt-2 gap-2"><Plus className="w-4 h-4" /> Upload an Item</Button>
      </Link>
    </div>
  );
}

function viewTitle(view) {
  const map = {
    listings: "All Listings", draft: "Drafts", first_bids: "Live in 1stBid$™",
    prisometer: "Live in PRI$OMETER™", pending_review: "Pending Review",
    sold: "Sold Items", unsold: "Unsold Items", messages: "Messages",
    analytics: "Analytics", profile: "My Profile", settings: "Settings",
  };
  return map[view] || "Overview";
}