import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role to find and update items
    const now = new Date();
    const nowISO = now.toISOString();

    // First, clear expired Make It Mine locks on prisometer items
    const prisometerItems = await base44.asServiceRole.entities.Item.filter({ status: 'prisometer' });
    for (const item of prisometerItems) {
      const expiresMs = item.make_it_mine_expires
        ? new Date(item.make_it_mine_expires).getTime()
        : 0;
      const lockIsInvalidOrExpired =
        item.make_it_mine_active === true &&
        (!expiresMs || Number.isNaN(expiresMs) || expiresMs <= Date.now());
      if (lockIsInvalidOrExpired) {
        await base44.asServiceRole.entities.Item.update(item.id, {
          make_it_mine_active: false,
          make_it_mine_expires: null,
        });
      }
    }

    // Find all items in first_bids phase where first_bids_end has passed
    const items = await base44.asServiceRole.entities.Item.filter({ status: 'first_bids' });

    const toActivate = items.filter(item => {
      const endMs = item.first_bids_end
        ? new Date(item.first_bids_end).getTime()
        : 0;
      return endMs && !Number.isNaN(endMs) && endMs <= Date.now();
    });

    let activated = 0;
    let sold = 0;
    for (const item of toActivate) {
      const highestBid = item.highest_bid || 0;
      const prisometerStartPrice = item.prisometer_start_price || 0;
      const reservePrice = item.reserve_price || 0;

      // If highest preview bid is at or above prisometer start price, mark as sold
      if (highestBid >= prisometerStartPrice) {
        const isSold = highestBid >= reservePrice;
        await base44.asServiceRole.entities.Item.update(item.id, {
          status: isSold ? 'sold' : 'pending_review',
          sold_price: isSold ? highestBid : undefined,
          sold_to_email: isSold ? item.highest_bidder_email : undefined,
          sold_via: isSold ? 'bid' : undefined,
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
            subject: isSold
              ? `Congratulations! You won: ${item.title}`
              : `Your offer is under review: ${item.title}`,
            body: isSold
              ? `Great news! Your bid of $${highestBid.toLocaleString('en-US')} won the auction for "${item.title}".\n\nThe seller will be in touch shortly with an invoice. You can view it in My Account > Purchases.\n\nThank you for bidding on Everything Valuable.`
              : `Your bid of $${highestBid.toLocaleString('en-US')} on "${item.title}" was below the reserve price. The seller is reviewing your offer and will respond shortly.\n\nCheck My Account > Purchases for updates.`,
          });
        }

        // Notify seller
        if (item.seller_email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: item.seller_email,
            subject: isSold
              ? `Your item sold: ${item.title}`
              : `Offer below reserve — review needed: ${item.title}`,
            body: isSold
              ? `Your item "${item.title}" sold for $${highestBid.toLocaleString('en-US')} via 1stBid$™.\n\nAn invoice draft has been created in your Seller Dashboard. Please review and send it to the buyer to proceed with payment.`
              : `The 1stBid$™ phase for "${item.title}" ended with a highest bid of $${highestBid.toLocaleString('en-US')}, which is below the reserve price.\n\nLog into your Seller Dashboard to review and decide whether to accept this offer.`,
          });
        }

        sold++;
      } else {
        // Otherwise activate prisometer
        const prisometerStart = nowISO;
        await base44.asServiceRole.entities.Item.update(item.id, {
          status: 'prisometer',
          prisometer_activated_at: prisometerStart,
          current_price: item.prisometer_start_price,
          make_it_mine_active: false,
          make_it_mine_expires: null,
        });
        activated++;
      }
    }

    return Response.json({
      success: true,
      checked: items.length,
      activated,
      sold,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});