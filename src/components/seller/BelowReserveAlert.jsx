import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function BelowReserveAlert({ user }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(null); // itemId being processed

  // Items in prisometer status where highest_bid > 0 but below reserve, and prisometer has expired
  const { data: items = [] } = useQuery({
    queryKey: ["seller-items-below-reserve", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email, status: "prisometer" }),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  // Filter: prisometer ended + has bids + highest_bid < reserve_price
  const belowReserveItems = items.filter(item => {
    if (!item.reserve_price || !item.highest_bid || item.highest_bid <= 0) return false;
    if (item.highest_bid >= item.reserve_price) return false;
    // Check if prisometer time has expired
    if (!item.prisometer_activated_at || !item.prisometer_duration_hours) return false;
    const end = new Date(item.prisometer_activated_at).getTime() + item.prisometer_duration_hours * 3600000;
    return Date.now() > end;
  });

  const handleAccept = async (item) => {
    setProcessing(item.id);
    // Mark as sold at highest bid price
    await base44.entities.Item.update(item.id, {
      status: "sold",
      sold_price: item.highest_bid,
      sold_to_email: item.highest_bidder_email,
      sold_via: "seller_accepted",
    });
    // Notify buyer
    await base44.integrations.Core.SendEmail({
      to: item.highest_bidder_email,
      subject: `Congratulations — Your bid on "${item.title}" has been accepted!`,
      body: `Hi,\n\nGreat news! The seller has accepted your bid of $${item.highest_bid.toLocaleString("en-US")} on "${item.title}".\n\nYou will receive an invoice shortly with payment instructions.\n\nThank you for bidding on Everything Valuable.`,
    });
    queryClient.invalidateQueries({ queryKey: ["seller-items-below-reserve", user?.email] });
    queryClient.invalidateQueries({ queryKey: ["seller-items", user?.email] });
    setProcessing(null);
    toast({ title: "Bid accepted — buyer has been notified." });
  };

  const handleDecline = async (item) => {
    setProcessing(item.id);
    // Mark as unsold
    await base44.entities.Item.update(item.id, {
      status: "unsold",
    });
    // Notify buyer
    if (item.highest_bidder_email) {
      await base44.integrations.Core.SendEmail({
        to: item.highest_bidder_email,
        subject: `Update on your bid for "${item.title}"`,
        body: `Hi,\n\nThank you for your bid of $${item.highest_bid.toLocaleString("en-US")} on "${item.title}".\n\nUnfortunately, your bid did not meet the seller's reserve price and the item was not sold at this time.\n\nPlease continue browsing Everything Valuable for other great finds.\n\nThank you for your interest.`,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["seller-items-below-reserve", user?.email] });
    queryClient.invalidateQueries({ queryKey: ["seller-items", user?.email] });
    setProcessing(null);
    toast({ title: "Declined — buyer has been notified." });
  };

  if (belowReserveItems.length === 0) return null;

  return (
    <div className="space-y-3">
      {belowReserveItems.map(item => (
        <div key={item.id} className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-amber-900 text-sm leading-tight truncate">{item.title}</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Highest bid: <span className="font-bold">${item.highest_bid.toLocaleString("en-US")}</span>
                {" "}·{" "}
                Reserve: <span className="font-bold">${item.reserve_price.toLocaleString("en-US")}</span>
                {" "}·{" "}
                Bidder: <span className="font-medium">{item.highest_bidder_email}</span>
              </p>
              <p className="text-xs text-amber-600 mt-1 font-medium">
                PRI$OMETER ended below reserve — accept or decline this bid.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleAccept(item)}
              disabled={processing === item.id}
            >
              {processing === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Accept Bid
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-amber-400 text-amber-800 hover:bg-amber-100"
              onClick={() => handleDecline(item)}
              disabled={processing === item.id}
            >
              {processing === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}