import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

const STATUS_COLORS = {
  draft: "bg-muted text-muted-foreground border-border",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  shipped: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  disputed: "bg-red-50 text-red-700 border-red-200",
};

export default function TransactionOversight() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["admin-all-invoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 500),
    staleTime: 60000,
  });

  const filtered = invoices.filter(inv => {
    const matchSearch = !search || [inv.buyer_email, inv.seller_email, inv.item_title].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Transaction & Invoice Oversight</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{invoices.length} total invoices</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Input placeholder="Search buyer, seller, item…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Item", "Buyer", "Seller", "Sale Price", "Buyer Fee", "Credit", "Total", "Method", "Status", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No transactions found
                </td></tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-[160px] truncate text-xs">{inv.item_title || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[130px]">{inv.buyer_email || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[130px]">{inv.seller_email || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-xs">${(inv.item_price || 0).toLocaleString("en-US")}</td>
                  <td className="px-4 py-3 text-primary text-xs">${(inv.service_fee || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-amber-600 text-xs">-${(inv.fee_credit || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 font-semibold text-xs">${(inv.total_amount || 0).toLocaleString("en-US")}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{inv.purchase_method || "—"}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[inv.status] || ""}`}>{inv.status || "—"}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {inv.created_date ? new Date(inv.created_date).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}