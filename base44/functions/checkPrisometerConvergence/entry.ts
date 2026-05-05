import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all active prisometer items
    const items = await base44.asServiceRole.entities.Item.filter({ status: 'prisometer' });

    let converged = 0;

    for (const item of items) {
      // Skip if paused for Make It Mine
      if (item.make_it_mine_active) continue;

      const highestBid = item.highest_bid || 0;
      if (highestBid <= 0) continue;

      // Calculate current live price
      if (!item.prisometer_activated_at || !item.prisometer_duration_hours || !item.prisometer_start_price) continue;

      const startTime = new Date(item.prisometer_activated_at).getTime();
      const startPrice = item.prisometer_start_price;
      const reservePrice = item.reserve_price || startPrice * 0.5;
      const belowPercent = item.below_reserve_percent || 10;
      const floorPrice = reservePrice * (1 - belowPercent / 100);
      const durationMs = item.prisometer_duration_hours * 3600000;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const calculatedPrice = startPrice - (startPrice - floorPrice) * progress;
      // Current price never goes below highest bid
      const currentPrice = Math.max(calculatedPrice, highestBid);

      // Check if prisometer has expired (ran full duration)
      const isExpired = elapsed >= durationMs;

      // Convergence: live price has dropped to meet or go below highest bid, OR timer expired
      const hasConverged = calculatedPrice <= highestBid || isExpired;

      if (!hasConverged) continue;

      // Determine sale outcome
      const aboveReserve = highestBid >= reservePrice;
      const newStatus = aboveReserve ? 'sold' : 'pending_review';

      await base44.asServiceRole.entities.Item.update(item.id, {
        status: newStatus,
        sold_price: aboveReserve ? highestBid : undefined,
        sold_to_email: aboveReserve ? item.highest_bidder_email : undefined,
        sold_via: aboveReserve ? 'bid' : undefined,
        make_it_mine_active: false,
        make_it_mine_expires: null,
      });

      // Create invoice draft
      if (item.highest_bidder_email && item.seller_email) {
        const serviceFee = highestBid * 0.10 + 30;
        const feeCredit = serviceFee * 0.50;
        await base44.asServiceRole.entities.Invoice.create({
          item_id: item.id,
          item_title: item.title,
          buyer_email: item.highest_bidder_email,
          seller_email: item.seller_email,
          item_price: highestBid,
          service_fee: serviceFee,
          fee_credit: feeCredit,
          purchase_method: 'bid',
          total_amount: highestBid + serviceFee - feeCredit,
          status: 'draft',
        });
      }

      // Notify buyer
      if (item.highest_bidder_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: item.highest_bidder_email,
          subject: aboveReserve
            ? `Congratulations! You won: ${item.title}`
            : `Your offer is under review: ${item.title}`,
          body: aboveReserve
            ? `Great news! Your bid of $${highestBid.toLocaleString('en-US')} won the auction for "${item.title}".\n\nThe seller will be in touch shortly with an invoice. You can view it at any time in My Account > Purchases.\n\nThank you for bidding on Everything Valuable.`
            : `Your bid of $${highestBid.toLocaleString('en-US')} on "${item.title}" was below the reserve price. The seller is reviewing your offer and will respond shortly.\n\nCheck My Account > Purchases for updates.`,
        });
      }

      // Notify seller
      if (item.seller_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: item.seller_email,
          subject: aboveReserve
            ? `Your item sold: ${item.title}`
            : `Offer below reserve — review needed: ${item.title}`,
          body: aboveReserve
            ? `Your item "${item.title}" has sold for $${highestBid.toLocaleString('en-US')} via PRI$OMETER™ convergence.\n\nAn invoice draft has been created in your Seller Dashboard. Please review and send it to the buyer to proceed with payment and fulfillment.`
            : `The PRI$OMETER™ for "${item.title}" has ended with a highest bid of $${highestBid.toLocaleString('en-US')}, which is below the reserve price.\n\nPlease log into your Seller Dashboard to review and decide whether to accept this offer.`,
        });
      }

      converged++;
    }

    return Response.json({ success: true, checked: items.length, converged });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});