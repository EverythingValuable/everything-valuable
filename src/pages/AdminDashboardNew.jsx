import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminShell from '@/components/admin/AdminShell';
import ExecutiveSummary from '@/components/admin/overview/ExecutiveSummary';
import MarketplacePulse from '@/components/admin/overview/MarketplacePulse';
import NeedsAttention from '@/components/admin/overview/NeedsAttention';
import RecentActivity from '@/components/admin/overview/RecentActivity';
import RiskReview from '@/components/admin/overview/RiskReview';

export default function AdminDashboardNew() {
  // Fetch overview data
  const { data: overviewData = {} } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const [items, invoices, users, tickets, disputes, applications] = await Promise.all([
        base44.entities.Item.list(),
        base44.entities.Invoice.list(),
        base44.entities.User.list(),
        base44.entities.SupportTicket.list(),
        base44.entities.Dispute.list(),
        base44.entities.SellerApplication.list(),
      ]);

      // Calculate financial metrics
      const soldItems = items.filter(i => i.status === 'sold');
      const grossSales = soldItems.reduce((sum, i) => sum + (i.sold_price || 0), 0);
      const serviceFees = soldItems.reduce((sum, i) => {
        const price = i.sold_price || 0;
        return sum + (price * 0.1 + 30);
      }, 0);
      const feeCredits = serviceFees * 0.5;
      const netRevenue = serviceFees - feeCredits;

      // Active listings
      const activeListing = items.filter(i => ['first_bids', 'prisometer'].includes(i.status));
      const firstBidsActive = items.filter(i => i.status === 'first_bids').length;
      const prisometerActive = items.filter(i => i.status === 'prisometer').length;

      return {
        grossSales,
        serviceFees,
        feeCredits,
        netRevenue,
        activeListing: activeListing.length,
        firstBidsActive,
        prisometerActive,
        itemsSold: soldItems.length,
        pendingApplications: applications.filter(a => a.application_status === 'pending').length,
        totalUsers: users.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        openDisputes: disputes.filter(d => d.status === 'open').length,
        items,
        invoices,
        users,
        tickets,
        disputes,
        applications,
      };
    },
    refetchInterval: 60000,
  });

  return (
    <AdminShell
      pageTitle="Admin Dashboard"
      pageSubtitle="Marketplace operations, financial controls, and platform activity."
    >
      <div className="space-y-8">
        {/* Executive Summary */}
        <ExecutiveSummary data={overviewData} />

        {/* Marketplace Pulse */}
        <MarketplacePulse data={overviewData} />

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left 2/3: Needs Attention */}
          <div className="col-span-2">
            <NeedsAttention data={overviewData} />
          </div>

          {/* Right 1/3: Recent Activity + Risk Review */}
          <div className="space-y-6">
            <RecentActivity data={overviewData} />
            <RiskReview data={overviewData} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}