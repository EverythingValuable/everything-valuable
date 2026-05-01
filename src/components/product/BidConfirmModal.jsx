import { X } from "lucide-react";
import FeeBreakdownDisplay from "./FeeBreakdownDisplay";

export default function BidConfirmModal({ amount, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-serif text-lg font-semibold">Review Your Bid</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable fee breakdown */}
        <div className="overflow-y-auto max-h-[70vh] p-5">
          <FeeBreakdownDisplay
            amount={amount}
            onConfirmBid={onConfirm}
            onCancel={onCancel}
            showConfirmButton={true}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
}