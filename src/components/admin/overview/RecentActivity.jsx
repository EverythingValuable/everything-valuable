import React from 'react';
import { CheckCircle2, FileText, Edit, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_ICONS = {
  seller_approved: { icon: CheckCircle2, label: 'Seller Approved', color: 'text-green-600' },
  listing_created: { icon: FileText, label: 'Listing Created', color: 'text-blue-600' },
  listing_edited: { icon: Edit, label: 'Listing Edited', color: 'text-amber-600' },
  bid_placed: { icon: TrendingUp, label: 'Bid Placed', color: 'text-foreground' },
  item_sold: { icon: CheckCircle2, label: 'Item Sold', color: 'text-green-600' },
  invoice_sent: { icon: FileText, label: 'Invoice Sent', color: 'text-blue-600' },
  invoice_paid: { icon: DollarSign, label: 'Invoice Paid', color: 'text-green-600' },
  dispute_opened: { icon: AlertCircle, label: 'Dispute Opened', color: 'text-red-600' },
};

export default function RecentActivity({ data }) {
  const { items = [], invoices = [] } = data;

  // Generate mock recent activity
  const activities = [];

  // Recent item sales
  items.filter(i => i.status === 'sold').slice(0, 2).forEach((item) => {
    activities.push({
      type: 'item_sold',
      title: `${item.title?.slice(0, 40)}...`,
      detail: `Sold to ${item.sold_to_email?.split('@')[0]}`,
      timestamp: item.updated_date,
      amount: item.sold_price,
    });
  });

  // Recent invoices sent
  invoices.filter(i => i.status === 'sent').slice(0, 2).forEach((inv) => {
    activities.push({
      type: 'invoice_sent',
      title: `Invoice sent to ${inv.buyer_name || inv.buyer_email}`,
      detail: `$${inv.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      timestamp: inv.updated_date,
    });
  });

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-6 text-center">
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
        {activities.slice(0, 6).map((activity, i) => {
          const config = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.listing_created;
          const Icon = config.icon;

          return (
            <div key={i} className="px-5 py-3 hover:bg-secondary/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{config.label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 line-clamp-1">{activity.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                    {activity.amount && (
                      <p className="text-xs font-semibold text-foreground">
                        ${activity.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}