import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function evEmail({ preheader = '', title, subtitle = '', bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0ede8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">
        <tr><td style="padding-bottom:20px;text-align:center;">
          <img src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3a2676053_LOGOEV.png" alt="Everything Valuable" width="140" style="height:auto;display:block;margin:0 auto;" />
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #ddd8d0;overflow:hidden;">
          <div style="height:3px;background:#c0392b;"></div>
          <div style="padding:36px 40px 28px;border-bottom:1px solid #ede9e3;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c0392b;">${subtitle}</p>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#111111;line-height:1.25;">${title}</h1>
          </div>
          <div style="padding:32px 40px;">${bodyHtml}</div>
          <div style="background:#f8f6f3;border-top:1px solid #ede9e3;padding:20px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#999;">© Everything Valuable — Fine Art, Antiques & Collectibles</p>
            <p style="margin:0;font-size:11px;color:#bbb;"><a href="https://everythingvaluable.com" style="color:#bbb;text-decoration:none;">everythingvaluable.com</a></p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    const nowISO = new Date(now).toISOString();

    // ── Phase 2 → Phase 3 transition ──────────────────────────────────
    // When the Buy Now phase ends with no purchase, activate the declining phase.
    const buyNowItems = await base44.asServiceRole.entities.Item.filter({ status: 'buy_now' });
    let phase3Activated = 0;
    for (const item of buyNowItems) {
      if (item.make_it_mine_active) continue; // a Buy Now checkout is in progress
      const endMs = item.phase_2_end ? new Date(item.phase_2_end).getTime() : 0;
      if (endMs && !Number.isNaN(endMs) && endMs <= now) {
        const prisometerStart = item.prisometer_start_price || 0;
        await base44.asServiceRole.entities.Item.update(item.id, {
          status: 'prisometer',
          prisometer_activated_at: nowISO,
          current_price: prisometerStart,
          make_it_mine_active: false,
          make_it_mine_expires: null,
        });
        phase3Activated++;
      }
    }

    // ── Phase 3 convergence ────────────────────────────────────────────
    const items = await base44.asServiceRole.entities.Item.filter({ status: 'prisometer' });
    let converged = 0;

    for (const item of items) {
      if (item.make_it_mine_active) continue;

      const highestBid = item.highest_bid || 0;

      if (!item.prisometer_activated_at || !item.prisometer_duration_hours || !item.prisometer_start_price) continue;

      const startTime = new Date(item.prisometer_activated_at).getTime();
      const startPrice = item.prisometer_start_price;
      const reservePrice = item.reserve_price || startPrice * 0.5;
      const belowPercent = item.below_reserve_percent || 10;
      const floorPrice = reservePrice * (1 - belowPercent / 100);
      const durationMs = item.prisometer_duration_hours * 3600000;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const calculatedPrice = startPrice - (startPrice - floorPrice) * progress;
      const isExpired = elapsed >= durationMs;

      // No bids and timer expired — mark as unsold
      if (highestBid <= 0) {
        if (durationMs > 0 && isExpired) {
          await base44.asServiceRole.entities.Item.update(item.id, { status: 'unsold' });
          if (item.seller_email) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              from_name: 'Everything Valuable',
              to: item.seller_email,
              subject: `Item unsold: ${item.title}`,
              body: evEmail({
                preheader: `Your listing ended with no bids.`,
                title: 'Your Item Was Not Sold',
                subtitle: 'Listing Update',
                bodyHtml: `
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#333;">Your listing has completed its full sale cycle with no bids placed.</p>
                  <div style="background:#f8f6f3;border:1px solid #ede9e3;padding:20px 24px;margin:0 0 24px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Item</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#111;">${item.title}</p>
                  </div>
                  <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#555;">You can reoffer it for sale at any time from your Seller Dashboard.</p>
                  <a href="https://everythingvaluable.com/seller" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:13px 28px;">Go to Seller Dashboard</a>
                `,
              }),
            });
          }
        }
        continue;
      }

      // Convergence: declining price has dropped to meet/beat the highest bid, OR timer expired
      const hasConverged = calculatedPrice <= highestBid || isExpired;
      if (!hasConverged) continue;

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

      if (item.highest_bidder_email) {
        const itemImageHtml = item.images?.[0]
          ? `<img src="${item.images[0]}" alt="${item.title}" width="100%" style="display:block;max-height:260px;object-fit:cover;margin:0 0 24px;" />`
          : '';

        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Everything Valuable',
          to: item.highest_bidder_email,
          subject: aboveReserve
            ? `Congratulations — You Won: ${item.title}`
            : `Your Offer Is Under Review: ${item.title}`,
          body: evEmail({
            preheader: aboveReserve ? `Your bid of $${highestBid.toLocaleString('en-US')} won!` : `The seller is reviewing your offer.`,
            title: aboveReserve ? '🎉 Congratulations, You Won!' : 'Your Offer Is Under Review',
            subtitle: aboveReserve ? 'Auction Result' : 'Pending Review',
            bodyHtml: `
              ${itemImageHtml}
              <div style="background:#f8f6f3;border:1px solid #ede9e3;padding:20px 24px;margin:0 0 24px;">
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Item</p>
                <p style="margin:0 0 14px;font-size:16px;font-weight:600;color:#111;">${item.title}</p>
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Your Bid</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#c0392b;">$${highestBid.toLocaleString('en-US')}</p>
              </div>
              ${aboveReserve
                ? `<p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#555;">The declining PRI$OMETER™ price met your bid and your bid was at or above the reserve — the item is yours. The seller will send you an invoice shortly.</p>
                   <a href="https://everythingvaluable.com/buyer" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:13px 28px;">View My Purchases</a>`
                : `<p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#555;">The declining PRI$OMETER™ price met your bid, but your bid is below the seller's reserve. The seller is reviewing your offer and will get back to you shortly.</p>
                   <a href="https://everythingvaluable.com/buyer" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:13px 28px;">View My Account</a>`
              }
            `,
          }),
        });
      }

      if (item.seller_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Everything Valuable',
          to: item.seller_email,
          subject: aboveReserve
            ? `Your Item Sold: ${item.title}`
            : `Offer Below Reserve — Review Needed: ${item.title}`,
          body: evEmail({
            preheader: aboveReserve ? `Sold for $${highestBid.toLocaleString('en-US')} — invoice draft created.` : `A bid came in below reserve. Your review is needed.`,
            title: aboveReserve ? 'Your Item Has Sold' : 'Offer Below Reserve',
            subtitle: aboveReserve ? 'Sale Confirmed' : 'Action Required',
            bodyHtml: `
              <div style="background:#f8f6f3;border:1px solid #ede9e3;padding:20px 24px;margin:0 0 24px;">
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Item</p>
                <p style="margin:0 0 14px;font-size:16px;font-weight:600;color:#111;">${item.title}</p>
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Highest Bid</p>
                <p style="margin:0;font-size:22px;font-weight:700;color:#c0392b;">$${highestBid.toLocaleString('en-US')}</p>
              </div>
              ${aboveReserve
                ? `<p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#555;">The declining PRI$OMETER™ price converged with the highest bid at or above your reserve. Your item has sold and an invoice draft has been created.</p>`
                : `<p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#555;">The declining PRI$OMETER™ price converged with the highest bid, but the bid is below your reserve price. Please log into your Seller Dashboard to review the offer and decide whether to accept.</p>`
              }
              <a href="https://everythingvaluable.com/seller" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:13px 28px;">Go to Seller Dashboard</a>
            `,
          }),
        });
      }

      converged++;
    }

    return Response.json({ success: true, checked: items.length, converged, phase3Activated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});