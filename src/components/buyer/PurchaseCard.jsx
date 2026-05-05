import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, MessageSquare, Loader2, CheckCircle2, Circle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const STATUS_CONFIG = {
  draft:     { label: "Invoice Pending",  badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  pending:   { label: "Invoice Pending",  badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  sent:      { label: "Invoice Sent",     badge: "bg-blue-50 text-blue-700 border-blue-200" },
  paid:      { label: "Paid",             badge: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold" },
  shipped:   { label: "Shipped",          badge: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered: { label: "Delivered",        badge: "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold" },
  disputed:  { label: "Disputed",         badge: "bg-red-50 text-red-700 border-red-200" },
};

const NEXT_STEP = {
  draft:     "Your invoice is being prepared by the seller.",
  pending:   "Your invoice is being prepared by the seller.",
  sent:      "Review your invoice and arrange payment with the seller.",
  paid:      "Invoice paid. Awaiting shipment, pickup, or release coordination from the seller according to their terms.",
  shipped:   "Your item is on its way. Contact the seller for tracking details.",
  delivered: "Purchase complete. Enjoy your piece.",
  disputed:  "There is an open dispute on this purchase. Contact the seller to resolve.",
};

const STATUS_FLOW = [
  { key: "sent",      label: "Invoice Sent" },
  { key: "paid",      label: "Invoice Paid" },
  { key: "shipped",   label: "Awaiting Fulfillment" },
  { key: "delivered", label: "Fulfilled" },
];

const STATUS_ORDER = ["draft", "pending", "sent", "paid", "shipped", "delivered"];

function StatusTimeline({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const steps = STATUS_FLOW;

  return (
    <div className="flex items-center gap-0 mt-4">
      {steps.map((step, i) => {
        const stepIdx = STATUS_ORDER.indexOf(step.key);
        const done = currentIdx >= stepIdx;
        const active = currentIdx === stepIdx || (step.key === "shipped" && (status === "paid"));
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                done ? "bg-emerald-600 text-white" : "bg-muted border border-border text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3" />}
              </div>
              <span className={`text-center leading-tight whitespace-nowrap text-[10px] font-medium ${
                done ? "text-emerald-700" : "text-muted-foreground"
              } ${active && !done ? "text-primary" : ""}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mb-4 mx-1 ${currentIdx > stepIdx ? "bg-emerald-400" : "bg-border"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function PurchaseCard({ invoice }) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const cfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
  const nextStep = NEXT_STEP[invoice.status] || "";
  const isPaid = ["paid", "shipped", "delivered"].includes(invoice.status);

  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-profile-purchase", invoice.seller_email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: invoice.seller_email }).then(r => r[0]),
    enabled: !!invoice.seller_email,
    staleTime: 300000,
  });

  const { data: item } = useQuery({
    queryKey: ["purchase-item", invoice.item_id],
    queryFn: () => base44.entities.Item.filter({ id: invoice.item_id }).then(r => r[0]),
    enabled: !!invoice.item_id,
    staleTime: 300000,
  });

  const handleDownloadPdf = async () => {
    if (invoice.pdf_url) { window.open(invoice.pdf_url, "_blank"); return; }
    setGeneratingPdf(true);
    const res = await base44.functions.invoke("generateInvoicePDF", { invoiceId: invoice.id });
    setGeneratingPdf(false);
    if (res.data?.pdf_url) window.open(res.data.pdf_url, "_blank");
  };

  const sellerName = sellerProfile?.display_name || invoice.seller_email;

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden shadow-sm ${isPaid ? "border-emerald-200" : "border-border"}`}>
      {/* Header strip */}
      {isPaid && (
        <div className="bg-emerald-600 px-5 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-white tracking-wide uppercase">Purchase Confirmed</span>
          <span className="text-xs text-emerald-100">{invoice.created_date ? format(new Date(invoice.created_date), "MMMM d, yyyy") : ""}</span>
        </div>
      )}

      <div className="p-5 md:p-6">
        {/* Top row: thumbnail + title + badge */}
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
            {item?.images?.[0] ? (
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <span className="font-serif text-xl">EV</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground leading-tight line-clamp-2">
                {invoice.item_title || "Purchase"}
              </h3>
              <Badge variant="outline" className={`shrink-0 text-xs px-2.5 py-1 ${cfg.badge}`}>
                {cfg.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              From{" "}
              {sellerProfile ? (
                <Link
                  to={`/seller/profile?email=${encodeURIComponent(invoice.seller_email)}`}
                  className="text-primary hover:underline font-medium"
                >
                  {sellerName}
                </Link>
              ) : (
                <span className="font-medium">{sellerName}</span>
              )}
              {!isPaid && invoice.created_date && (
                <span className="text-muted-foreground/60"> · {format(new Date(invoice.created_date), "MMM d, yyyy")}</span>
              )}
            </p>

            {/* Financials */}
            <div className="flex items-center gap-5 mt-3">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Purchase Price</p>
                <p className="font-sans font-semibold text-foreground">
                  ${Number(invoice.item_price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Invoice Total</p>
                <p className="font-sans font-bold text-primary text-lg">
                  ${Number(invoice.total_amount || invoice.item_price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              {invoice.payment_method && (
                <>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Paid Via</p>
                    <p className="font-sans font-semibold text-emerald-700 capitalize text-sm">
                      {invoice.payment_method.replace("_", " ")}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status timeline (paid+ only) */}
        {isPaid && <StatusTimeline status={invoice.status} />}

        {/* Next step strip */}
        {nextStep && (
          <div className={`mt-4 rounded-xl px-4 py-3 flex items-start gap-2.5 ${
            isPaid
              ? "bg-emerald-50 border border-emerald-100"
              : "bg-secondary/40 border border-border"
          }`}>
            <Clock className={`w-4 h-4 mt-0.5 shrink-0 ${isPaid ? "text-emerald-600" : "text-muted-foreground"}`} />
            <div>
              <p className={`text-xs font-semibold mb-0.5 ${isPaid ? "text-emerald-800" : "text-foreground"}`}>
                {isPaid ? "What Happens Next" : "Next Step"}
              </p>
              <p className={`text-xs leading-relaxed ${isPaid ? "text-emerald-700" : "text-muted-foreground"}`}>
                {nextStep}
              </p>
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/60 italic mt-3">
          * Invoice total does not include applicable sales tax, shipping, or other fees as outlined in the Terms and Conditions of Sale.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
          {invoice.item_id && (
            <Link to={`/item/${invoice.item_id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="w-3 h-3" /> View Item
              </Button>
            </Link>
          )}
          {(invoice.pdf_url || ["sent", "paid", "shipped", "delivered"].includes(invoice.status)) && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPdf} disabled={generatingPdf}>
              {generatingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              {invoice.pdf_url ? "Download Invoice" : "Get Invoice PDF"}
            </Button>
          )}
          {invoice.seller_email && invoice.item_id && (
            <Link to={`/item/${invoice.item_id}?contact=seller`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5">
                <MessageSquare className="w-3 h-3" /> Contact Seller
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}