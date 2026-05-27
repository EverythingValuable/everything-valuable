import React from 'react';
import { TrendingUp } from 'lucide-react';

function StatCard({ label, value, subtext, icon: Icon, trend }) {
  return (
    <div className="rounded-lg border border-border bg-white p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2 font-price tabular-nums">
            {typeof value === 'number' ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : value}
          </p>
        </div>
        {Icon && <Icon className="w-5 h-5 text-muted-foreground/40" />}
      </div>
      <div className="space-y-1 border-t border-border/50 pt-3">
        <p className="text-xs text-muted-foreground">{subtext}</p>
        {trend && <p className="text-xs font-medium text-green-600">+{trend}% vs prior period</p>}
      </div>
    </div>
  );
}

export default function ExecutiveSummary({ data }) {
  const { grossSales = 0, netRevenue = 0, serviceFees = 0, activeListing = 0 } = data;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Executive Summary</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Gross Marketplace Sales"
          value={grossSales}
          subtext="Total completed marketplace sales"
          trend={12.4}
        />
        <StatCard
          label="Service Fees Collected"
          value={serviceFees}
          subtext="Buyer service fees collected"
        />
        <StatCard
          label="Active Marketplace Value"
          value={activeListing > 0 ? `${activeListing} listings` : '—'}
          subtext="Current live inventory exposure"
        />
      </div>
    </div>
  );
}