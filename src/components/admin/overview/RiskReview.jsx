import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export default function RiskReview({ data }) {
  const { users = [], items = [], invoices = [] } = data;

  // Detect risks
  const risks = [];

  // Check for duplicate email addresses
  const emailCounts = {};
  users.forEach((u) => {
    if (u.email) {
      emailCounts[u.email] = (emailCounts[u.email] || 0) + 1;
    }
  });
  Object.entries(emailCounts).forEach(([email, count]) => {
    if (count > 1) {
      risks.push({
        type: 'duplicate',
        title: 'Duplicate email accounts',
        detail: `${email} appears ${count} times`,
        severity: 'high',
      });
    }
  });

  // Check for items missing reserve
  const itemsMissingReserve = items.filter((i) => i.status === 'prisometer' && !i.reserve_price);
  if (itemsMissingReserve.length > 0) {
    risks.push({
      type: 'missing_reserve',
      title: 'Listings missing reserve price',
      detail: `${itemsMissingReserve.length} live listing${itemsMissingReserve.length > 1 ? 's' : ''}`,
      severity: 'medium',
    });
  }

  // Check for high-value sales
  const highValueSales = items.filter((i) => i.status === 'sold' && (i.sold_price || 0) > 50000);
  if (highValueSales.length > 0) {
    risks.push({
      type: 'high_value',
      title: 'High-value sales over $50k',
      detail: `${highValueSales.length} transaction${highValueSales.length > 1 ? 's' : ''} this period`,
      severity: 'low',
    });
  }

  // Check for unpaid invoices over 7 days
  const unpaidOld = invoices.filter((inv) => {
    if (inv.status !== 'sent' && inv.status !== 'pending') return false;
    const daysOld = (Date.now() - new Date(inv.created_date)) / (1000 * 60 * 60 * 24);
    return daysOld > 7;
  });
  if (unpaidOld.length > 0) {
    risks.push({
      type: 'overdue',
      title: 'Overdue invoices (7+ days)',
      detail: `${unpaidOld.length} unpaid invoice${unpaidOld.length > 1 ? 's' : ''}`,
      severity: 'high',
    });
  }

  if (risks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-6 text-center">
        <div className="flex justify-center mb-3">
          <AlertCircle className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-sm font-medium text-foreground">No active risk flags</p>
        <p className="text-xs text-muted-foreground mt-1">Platform appears healthy.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Risk & Review</h3>
      </div>
      <div className="divide-y divide-border/50">
        {risks.map((risk, i) => (
          <div key={i} className="px-5 py-3 hover:bg-secondary/20 transition-colors">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                risk.severity === 'high' ? 'text-red-500' : risk.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{risk.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{risk.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}