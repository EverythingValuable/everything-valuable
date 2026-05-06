import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, CreditCard, ArrowDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function FeeStatCard({ label, value, sub, accent = "text-primary" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <p className={`font-sans text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function FeeDashboard() {
  const [search, setSearch] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["admin-all-invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 500),
    staleTime: 60000,
  });

  const filtered = invoices.filter(inv =>
    !search || [inv.buyer_email, inv.seller_email, inv.item_title].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalFees = invoices.reduce((s, i) => s + (i.service_fee || 0), 0);
  const totalGross = invoices.reduce((s, i) => s + (i.item_price || 0), 0);

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-6">Processing Fee Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <FeeStatCard label="Total Fees Charged" value={`$${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} accent="text-primary" />
        <FeeStatCard label="Net Platform Revenue" value={`$${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} accent="text-emerald-600" />
        <FeeStatCard label="Total Gross Sales" value={`$${totalGross.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} accent="text-foreground" />
      </div>

      <div className="mb-4">
        <Input placeholder="Search by buyer, seller, or item…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Item", "Buyer", "Seller", "Sale Price", "Fee Charged", "Method", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No invoices found</td></tr>
              ) : filtered.map(inv => {
                return (
                  <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{inv.item_title || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[140px]">{inv.buyer_email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[140px]">{inv.seller_email || "—"}</td>
                    <td className="px-4 py-3 font-semibold">${(inv.item_price || 0).toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">${(inv.service_fee || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{inv.purchase_method || "—"}</Badge></td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{inv.status || "—"}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}