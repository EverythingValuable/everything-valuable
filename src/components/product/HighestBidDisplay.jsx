export default function HighestBidDisplay({ item }) {
  if (!item.highest_bid || item.highest_bid === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
      <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
        {item.status === "first_bids" ? "Highest Preview Bid" : "Highest Bid"}
      </p>
      <p className="font-price text-3xl font-bold text-foreground">
        ${item.highest_bid?.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">
        {item.bid_count} bid{item.bid_count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}