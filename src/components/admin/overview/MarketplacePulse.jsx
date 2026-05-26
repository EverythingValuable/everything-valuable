import React from 'react';
import { FileText, Zap, TrendingDown, CheckCircle2, Clock } from 'lucide-react';

function PulseCard({ number, label, context, icon: Icon }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 text-center">
      <div className="flex justify-center mb-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <p className="text-2xl font-bold text-foreground">{number}</p>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2">{label}</p>
      {context && <p className="text-xs text-muted-foreground mt-2">{context}</p>}
    </div>
  );
}

export default function MarketplacePulse({ data }) {
  const {
    activeListing = 0,
    firstBidsActive = 0,
    prisometerActive = 0,
    itemsSold = 0,
    pendingApplications = 0,
  } = data;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Marketplace Pulse</h2>
      <div className="grid grid-cols-5 gap-3">
        <PulseCard number={activeListing} label="Active Listings" context={`${prisometerActive} PRI$, ${firstBidsActive} 1stBid$`} icon={FileText} />
        <PulseCard number={firstBidsActive} label="1stBid$ Live" context="Preview phase active" icon={Clock} />
        <PulseCard number={prisometerActive} label="PRI$OMETER Active" context="Approaching convergence" icon={Zap} />
        <PulseCard number={itemsSold} label="Items Sold" context="This period" icon={CheckCircle2} />
        <PulseCard number={pendingApplications} label="Pending Applications" context="Awaiting review" icon={TrendingDown} />
      </div>
    </div>
  );
}