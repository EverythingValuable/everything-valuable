import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, DollarSign, AlertTriangle,
  MessageSquare, Flag, ClipboardList, Settings, Activity,
  ChevronDown, TrendingUp, CheckSquare
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const NAV_SECTIONS = [
  {
    label: 'Command',
    items: [
      { icon: LayoutDashboard, label: 'Overview', path: '/admin', badge: null },
      { icon: TrendingUp, label: 'Marketplace Health', path: '/admin/health', badge: null },
      { icon: Activity, label: 'Activity Log', path: '/admin/activity', badge: null },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: CheckSquare, label: 'Seller Approvals', path: '/admin/sellers', badge: 'pending_sellers' },
      { icon: Users, label: 'Users', path: '/admin/users', badge: null },
      { icon: FileText, label: 'Listings', path: '/admin/listings', badge: null },
      { icon: TrendingUp, label: 'Transactions', path: '/admin/transactions', badge: null },
      { icon: FileText, label: 'Invoices', path: '/admin/invoices', badge: null },
    ],
  },
  {
    label: 'Financial',
    items: [
      { icon: DollarSign, label: 'Fees', path: '/admin/fees', badge: null },
      { icon: DollarSign, label: 'Revenue', path: '/admin/revenue', badge: null },
      { icon: DollarSign, label: 'Payouts', path: '/admin/payouts', badge: null },
    ],
  },
  {
    label: 'Trust & Support',
    items: [
      { icon: Flag, label: 'Disputes', path: '/admin/disputes', badge: 'open_disputes' },
      { icon: MessageSquare, label: 'Support Tickets', path: '/admin/support', badge: 'open_tickets' },
      { icon: AlertTriangle, label: 'Risk Flags', path: '/admin/risk', badge: null },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'Settings', path: '/admin/settings', badge: null },
      { icon: Users, label: 'Admin Roles', path: '/admin/roles', badge: null },
    ],
  },
];

export default function AdminSidebar({ open, onToggle }) {
  const location = useLocation();
  const [badgeCounts, setBadgeCounts] = useState({});

  // Fetch badge counts
  useQuery({
    queryKey: ['admin-badge-counts'],
    queryFn: async () => {
      const [apps, tickets, disputes] = await Promise.all([
        base44.entities.SellerApplication.filter({ application_status: 'pending' }),
        base44.entities.SupportTicket.filter({ status: 'open' }),
        base44.entities.Dispute.filter({ status: 'open' }),
      ]);
      
      setBadgeCounts({
        pending_sellers: apps.length,
        open_tickets: tickets.length,
        open_disputes: disputes.length,
      });
      return { apps, tickets, disputes };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className={`w-64 bg-white border-r border-border overflow-y-auto transition-all ${!open ? '-ml-64' : ''}`}>
      {/* Brand Area */}
      <div className="px-6 py-8 border-b border-border">
        <p className="font-serif text-lg font-bold text-foreground">EVERYTHING VALUABLE</p>
        <p className="text-xs font-semibold tracking-widest text-muted-foreground mt-1">ADMIN CONTROL CENTER</p>
        
        {/* Platform Status */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-green-50 rounded-full border border-green-200 w-fit">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-700">Platform Live</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="px-3 py-6 space-y-8">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const badgeCount = item.badge ? badgeCounts[item.badge] : null;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                      active
                        ? 'bg-amber-50/60 text-foreground border-l-3 border-foreground'
                        : 'text-muted-foreground hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {badgeCount !== null && badgeCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}