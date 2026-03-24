import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, DollarSign, Package, Eye } from "lucide-react";

const STATUS_LABELS = {
  draft: "Draft", first_bids: "1stBid$™", prisometer: "PRI$OMETER™",
  sold: "Sold", pending_review: "Pending", unsold: "Unsold", scheduled: "Scheduled"
};

export default function SellerAnalytics({ user }) {
  const { data: items = [] } = useQuery({
    queryKey: ["seller-items", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: bids = [] } = useQuery({
    queryKey: ["seller-bids", user?.email],
    queryFn: async () => {
      const allBids = [];
      for (const item of items) {
        const itemBids = await base44.entities.Bid.filter({ item_id: item.id });
        allBids.push(...itemBids);
      }
      return allBids;
    },
    enabled: items.length > 0,
  });

  const soldItems = items.filter(i => i.status === "sold");
  const liveItems = items.filter(i => ["first_bids", "prisometer"].includes(i.status));
  const totalRevenue = soldItems.reduce((s, i) => s + (i.sold_price || 0), 0);
  const avgSalePrice = soldItems.length ? totalRevenue / soldItems.length : 0;

  // Category breakdown
  const categoryData = Object.entries(
    items.reduce((acc, i) => {
      const cat = i.category?.replace(/_/g, " ") || "other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  // Status breakdown
  const statusData = Object.entries(
    items.reduce((acc, i) => {
      const s = STATUS_LABELS[i.status] || i.status;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  // Top items by bids
  const topItems = items
    .filter(i => (i.bid_count || 0) > 0)
    .sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0))
    .slice(0, 5);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="font-serif text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your selling activity.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Listings", value: items.length, Icon: Package, color: "text-muted-foreground" },
          { label: "Live Now", value: liveItems.length, Icon: TrendingUp, color: "text-green-600" },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, Icon: DollarSign, color: "text-primary" },
          { label: "Avg Sale Price", value: avgSalePrice ? `$${Math.round(avgSalePrice).toLocaleString()}` : "—", Icon: Eye, color: "text-primary" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border px-5 py-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`font-serif text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Listings by category */}
        {categoryData.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4 capitalize">Listings by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, "Items"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status breakdown */}
        {statusData.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4">Listings by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} margin={{ left: 0, right: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, "Items"]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top items by bids */}
      {topItems.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Most Active Listings</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Item</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Bids</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Highest Bid</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topItems.map(item => (
                <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3 font-medium truncate max-w-[200px]">{item.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.bid_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.highest_bid ? `$${item.highest_bid.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary capitalize">
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-muted-foreground">No data yet. Upload your first item to see analytics.</p>
        </div>
      )}
    </div>
  );
}