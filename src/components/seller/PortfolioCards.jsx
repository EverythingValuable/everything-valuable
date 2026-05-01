import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    key: "drafts",
    label: "Drafts",
    subtext: "Saved, not yet submitted",
    href: "/seller?view=draft",
    color: "text-muted-foreground",
    dot: "bg-gray-300",
  },
  {
    key: "first_bids",
    label: "1stBid$ Preview",
    subtext: "Accepting early interest bids",
    href: "/seller?view=first_bids",
    color: "text-blue-700",
    dot: "bg-blue-400",
  },
  {
    key: "prisometer",
    label: "PRI$OMETER Live",
    subtext: "Price converging in real time",
    href: "/seller?view=prisometer",
    color: "text-red-700",
    dot: "bg-red-500 animate-pulse",
  },
  {
    key: "sold",
    label: "Sold",
    subtext: "Completed sales",
    href: "/seller?view=sold",
    color: "text-green-700",
    dot: "bg-green-500",
  },
  {
    key: "pending",
    label: "Under Review",
    subtext: "Pending platform approval",
    href: "/seller?view=pending_review",
    color: "text-amber-700",
    dot: "bg-amber-400",
  },
  {
    key: "revenue",
    label: "Total Revenue",
    subtext: "Gross from all settled sales",
    href: "/seller?view=sold",
    color: "text-primary",
    dot: "bg-primary",
    isCurrency: true,
  },
];

export default function PortfolioCards({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(card => {
        const raw = card.isCurrency ? stats.revenue : stats[card.key] ?? 0;
        const display = card.isCurrency
          ? `$${Number(raw).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
          : raw;

        return (
          <Link
            key={card.key}
            to={card.href}
            className="group bg-white rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${card.dot}`} />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{card.label}</span>
            </div>
            <div>
              <p className={`font-serif text-3xl font-semibold leading-none mb-1 ${card.color}`}>{display}</p>
              <p className="text-[11px] text-muted-foreground/60 leading-tight">{card.subtext}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        );
      })}
    </div>
  );
}