import React from 'react';
import { MessageSquare, FileText, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NeedsAttention({ data }) {
  const { openTickets = 0, openDisputes = 0, pendingApplications = 0, items = [] } = data;

  // Get items needing attention
  const itemsNeedingAttention = (items || [])
    .filter(i => i.status === 'prisometer' && i.reserve_price && i.current_price <= i.reserve_price * 0.85)
    .slice(0, 3);

  const hasIssues = openTickets > 0 || openDisputes > 0 || pendingApplications > 0 || itemsNeedingAttention.length > 0;

  if (!hasIssues) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-12 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <p className="font-serif text-lg font-semibold text-foreground">All clear</p>
        <p className="text-sm text-muted-foreground mt-1">No active issues requiring attention.</p>
      </div>
    );
  }

  const issues = [];

  if (openTickets > 0) {
    issues.push({
      type: 'Support Ticket',
      title: 'Support tickets open',
      detail: `${openTickets} ticket${openTickets > 1 ? 's' : ''} awaiting response`,
      icon: MessageSquare,
      action: 'Review Tickets',
      href: '/admin/support',
      priority: 'high',
    });
  }

  if (pendingApplications > 0) {
    issues.push({
      type: 'Seller Application',
      title: 'Applications pending review',
      detail: `${pendingApplications} seller${pendingApplications > 1 ? 's' : ''} awaiting approval`,
      icon: FileText,
      action: 'Review Applications',
      href: '/admin/sellers',
      priority: 'high',
    });
  }

  if (openDisputes > 0) {
    issues.push({
      type: 'Dispute',
      title: 'Open disputes',
      detail: `${openDisputes} dispute${openDisputes > 1 ? 's' : ''} requiring resolution`,
      icon: AlertCircle,
      action: 'Review Disputes',
      href: '/admin/disputes',
      priority: 'urgent',
    });
  }

  itemsNeedingAttention.forEach((item) => {
    issues.push({
      type: 'Listing Alert',
      title: 'Item approaching reserve',
      detail: `${item.title} — current price near reserve`,
      icon: Clock,
      action: 'View Item',
      href: `/admin/listings?id=${item.id}`,
      priority: 'medium',
    });
  });

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Needs Attention</h3>
      </div>
      <div className="divide-y divide-border/50">
        {issues.map((issue, i) => {
          const Icon = issue.icon;
          return (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className={`mt-0.5 ${issue.priority === 'urgent' ? 'text-red-500' : 'text-amber-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{issue.type}</p>
                  <p className="font-medium text-foreground mt-0.5">{issue.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{issue.detail}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                {issue.action}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}