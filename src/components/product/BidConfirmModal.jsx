import { X } from "lucide-react";
import FeeBreakdownDisplay from "./FeeBreakdownDisplay";

export default function BidConfirmModal({ amount, onConfirm, onCancel, isPending }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Modal panel — sits above mobile nav (56px) + safe area */}
      <div
        className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100dvh - 80px)", marginBottom: "56px" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="font-serif text-lg font-semibold">Review Your Bid</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable fee breakdown */}
        <div className="overflow-y-auto flex-1 p-5">
          <FeeBreakdownDisplay amount={amount} showConfirmButton={false} />
        </div>

        {/* Sticky footer with buttons — always visible */}
        <div className="shrink-0 border-t border-border px-5 py-4 space-y-3 bg-card">
          <p className="text-xs text-muted-foreground">
            Your credit card on file will be charged automatically if successful for service fee only.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? "Placing Bid..." : "Confirm Bid"}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 h-12 border border-input bg-background hover:bg-muted text-foreground font-semibold rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}