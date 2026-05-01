export default function FeeBreakdownDisplay({ amount, onConfirmBid, onCancel, showConfirmButton = true, isPending = false }) {
  const serviceFee = amount * 0.10 + 30;
  const feeCredit = serviceFee * 0.50;
  const remainingBalance = amount + feeCredit - serviceFee;
  const totalPaid = serviceFee + remainingBalance;

  return (
    <div className="rounded-lg border border-border bg-background/50 p-4 space-y-4 text-sm w-full overflow-hidden">
      <div className="space-y-2">
        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Item Price</p>
        <div className="flex justify-between gap-2 min-w-0">
          <span className="text-muted-foreground">Price</span>
          <span className="shrink-0">${amount.toLocaleString("en-US")}.00</span>
        </div>
      </div>

      <div className="space-y-2">
         <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Service Fee</p>
        <div className="text-xs text-muted-foreground mb-2">10% of item price + $30</div>
        <div className="flex justify-between gap-2 min-w-0">
          <span></span>
          <span className="shrink-0">${serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Due Now If You Win</p>
        <div className="text-xs text-muted-foreground mb-2">Upfront Service Fee Payment</div>
        <div className="flex justify-between gap-2 min-w-0 font-semibold">
          <span></span>
          <span className="shrink-0">${serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <p className="text-xs text-muted-foreground italic mt-2">This payment secures your winning position. If the sale is completed, 50% of this fee is credited back on your final invoice.</p>
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Final Invoice From Seller</p>
        <div className="flex justify-between gap-2 min-w-0 text-xs">
          <span className="text-muted-foreground">Item Price</span>
          <span className="shrink-0">${amount.toLocaleString("en-US")}.00</span>
        </div>
        <div className="flex justify-between gap-2 min-w-0 text-xs text-green-600">
          <span className="text-muted-foreground">Less Service Fee Credit</span>
          <span className="shrink-0">-${feeCredit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between gap-2 min-w-0 font-semibold">
          <span className="text-muted-foreground">Remaining Balance Due</span>
          <span className="shrink-0">${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Total Paid</p>
        <div className="flex justify-between gap-2 min-w-0 text-xs">
          <span className="text-muted-foreground">Paid Upfront</span>
          <span className="shrink-0">${serviceFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between gap-2 min-w-0 text-xs">
          <span className="text-muted-foreground">Paid on Final Invoice</span>
          <span className="shrink-0">${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="border-t border-border mt-2 pt-2 flex justify-between gap-2 min-w-0 font-semibold">
          <span className="text-muted-foreground">Total Paid Before Tax / Shipping</span>
          <span className="shrink-0">${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic">Does not include sales tax, shipping, or other fees. Invoice will be sent by seller if successful.</p>
      
      {showConfirmButton && (
        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs text-muted-foreground">Your credit card on file will be charged automatically if successful for service fee only.</p>
          <div className="flex gap-3">
            <button
              onClick={onConfirmBid}
              disabled={isPending}
              className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? "Placing Bid..." : "Confirm Bid"}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 h-11 border border-input bg-background hover:bg-muted text-foreground font-semibold rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      

    </div>
  );
}