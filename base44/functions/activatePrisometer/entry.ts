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

    // Clear expired Make It Mine locks on active-phase items
    const activeItems = await base44.asServiceRole.entities.Item.filter({ status: ['buy_now', 'prisometer'] });
    for (const item of activeItems) {
      const expiresMs = item.make_it_mine_expires ? new Date(item.make_it_mine_expires).getTime() : 0;
      if (item.make_it_mine_active === true && (!expiresMs || Number.isNaN(expiresMs) || expiresMs <= now)) {
        await base44.asServiceRole.entities.Item.update(item.id, {
          make_it_mine_active: false,
          make_it_mine_expires: null,
        });
      }
    }

    // Phase 1 (first_bids) items whose preview has ended
    const items = await base44.asServiceRole.entities.Item.filter({ status: 'first_bids' });
    const expired = items.filter(item => {
      const endMs = item.first_bids_end ? new Date(item.first_bids_end).getTime() : 0;
      return endMs && !Number.isNaN(endMs) && endMs <= now;
    });

    let extended = 0;
    let sold = 0;
    let activated = 0;

    for (const item of expired) {
      const highestBid = item.highest_bid || 0;
      const prisometerStart = item.prisometer_start_price || 0;
      const reservePrice = item.reserve_price || 0;
      const antiSnipeWindowMin = item.anti_snipe_window_minutes || 10;

      // A bid at or above the stagnant displayed price means the seller underpriced —
      // anti-snipe lets competing buyers counter before the highest bidder wins.
      if (prisometerStart > 0 && highestBid >= prisometerStart) {
        // Check for a qualifying bid placed within the anti-snipe window
        const bids = await base44.asServiceRole.entities.Bid.filter({ item_id: item.id });
        const recentQualifying = bids.some(b => {
          const created = b.created_date ? new Date(b.created_date).getTime() : 0;
          return b.amount >= prisometerStart && (now - created) < antiSnipeWindowMin * 60000;
        });

        if (recentQualifying) {
          // Extend Phase 1 so competing buyers can counter
          const newEnd = new Date(now + antiSnipeWindowMin * 60000).toISOString();
          await base44.asServiceRole.entities.Item.update(item.id, { first_bids_end: newEnd });
          extended++;
          continue;
        }

        // No further qualifying activity — highest bidder wins
        // (their offer was at/above the displayed price, hence above the minimum reserve)
        await base44.asServiceRole.entities.Item.update(item.id, {
          status: 'sold',
          sold_price: highestBid,
          sold_to_email: item.highest_bidder_email,
          sold_via: 'bid',
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
          await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'Everything Valuable',
            to: item.highest_bidder_email,
            subject: `Congratulations! You won: ${item.title}`,
            body: evEmail({
              preheader: `Your bid of $${highestBid.toLocaleString('en-US')} won!`,
              title: '🎉 Congratulations, You Won!',
              subtitle: 'Auction Result',
              bodyHtml: `
                <div style="background:#f8f6f3;border:1px solid #ede9e3;padding:20px 24px;margin:0 0 24px;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Item</p>
                  <p style="margin:0 0 14px;font-size:16px;font-weight:600;color:#111;">${item.title}</p>
                  <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Your Bid</p>
                  <p style="margin:0;font-size:22px;font-weight:700;color:#c0392b;">$${highestBid.toLocaleString('en-US')}</p>
                </div>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#555;">Your bid met the PRI$OMETER™ price during the preview phase and the item is yours. The seller will send you an invoice shortly.</p>
                <a href="https://everythingvaluable.com/buyer" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:13px 28px;">View My Purchases</a>
              `,
            }),
          });
        }

        if (item.seller_email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'Everything Valuable',
            to: item.seller_email,
            subject: `Your item sold: ${item.title}`,
            body: evEmail({
              preheader: `Sold for $${highestBid.toLocaleString('en-US')} — invoice draft created.`,
              title: 'Your Item Has Sold',
              subtitle: 'Sale Confirmed',
              bodyHtml: `
                <div style="background:#f8f6f3;border:1px solid #ede9e3;padding:20px 24px;margin:0 0 24px;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Item</p>
                  <p style="margin:0 0 14px;font-size:16px;font-weight:600;color:#111;">${item.title}</p>
                  <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Highest Bid</p>
                  <p style="margin:0;font-size:22px;font-weight:700;color:#c0392b;">$${highestBid.toLocaleString('en-US')}</p>
                </div>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#555;">Your item sold during the 1stBid$™ preview phase — the highest bid met your PRI$OMETER™ price. An invoice draft has been created in your Seller Dashboard.</p>
                <a href="https://everythingvaluable.com/seller" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:13px 28px;">Go to Seller Dashboard</a>
              `,
            }),
          });
        }

        sold++;
      } else {
        // No offer reached the displayed price — activate Phase 2 (stagnant + Buy Now)
        const phase2Hours = item.phase_2_duration_hours || 72;
        const phase2End = new Date(now + phase2Hours * 3600000).toISOString();
        await base44.asServiceRole.entities.Item.update(item.id, {
          status: 'buy_now',
          phase_2_start: nowISO,
          phase_2_end: phase2End,
          current_price: prisometerStart,
          make_it_mine_active: false,
          make_it_mine_expires: null,
        });
        activated++;
      }
    }

    return Response.json({
      success: true,
      checked: items.length,
      extended,
      sold,
      activated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});