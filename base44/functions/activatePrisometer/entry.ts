import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role to find and update items
    const now = new Date().toISOString();

    // Find all items in first_bids phase where first_bids_end has passed
    const items = await base44.asServiceRole.entities.Item.filter({ status: 'first_bids' });

    const toActivate = items.filter(item => item.first_bids_end && item.first_bids_end <= now);

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
          sold_price: highestBid,
          sold_to_email: item.highest_bidder_email,
          sold_via: 'bid',
        });
        sold++;
      } else {
        // Otherwise activate prisometer
        const prisometerStart = new Date().toISOString();
        await base44.asServiceRole.entities.Item.update(item.id, {
          status: 'prisometer',
          prisometer_activated_at: prisometerStart,
          current_price: item.prisometer_start_price,
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