import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function calculateFees(itemPrice) {
  const serviceFee = itemPrice * 0.10 + 30;
  const feeCredit = serviceFee * 0.50;
  const finalInvoice = itemPrice - feeCredit;
  const totalCost = itemPrice + serviceFee - feeCredit;
  return { serviceFee, feeCredit, finalInvoice, totalCost };
}

export default function FeeCalculator({ price, showDetailed = false }) {
  if (!price || price <= 0) return null;

  const { serviceFee, feeCredit, finalInvoice, totalCost } = calculateFees(price);

  const formatCurrency = (val) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Make It Mine — Fee Preview
          </h4>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">No traditional buyer's premium. Instead, you pay a transparent processing fee — half of which is credited back to your invoice.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Item Price</span>
            <span className="text-sm font-medium">{formatCurrency(price)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Service Fee</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground/50" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">10% of item price + $30 flat fee</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-medium">{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between items-baseline text-primary">
            <span className="text-sm">Fee Credit</span>
            <span className="text-sm font-medium">-{formatCurrency(feeCredit)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-baseline">
            <span className="text-sm font-semibold">Final Invoice</span>
            <span className="text-sm font-semibold">{formatCurrency(finalInvoice)}</span>
          </div>
          {showDetailed && (
            <>
              <div className="border-t border-border pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold">Total Cost</span>
                <span className="text-lg font-serif font-bold">{formatCurrency(totalCost)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping, taxes, and duties billed separately
              </p>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}