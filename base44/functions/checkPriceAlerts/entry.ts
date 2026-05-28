import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { item_id, trigger_type } = payload;

    if (!item_id) {
      return Response.json({ error: 'Missing item_id' }, { status: 400 });
    }

    // Fetch the item
    const item = await base44.entities.Item.filter({ id: item_id }).then(r => r[0]);
    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    // Find all active alerts for this item
    const alerts = await base44.entities.PriceAlert.filter({
      item_id: item_id,
      status: "active"
    });

    const notifications = [];

    for (const alert of alerts) {
      let shouldNotify = false;
      let triggerReason = null;

      // Check if 1stBid$ just started
      if (trigger_type === "first_bids_started" && item.status === "first_bids") {
        shouldNotify = true;
        triggerReason = "first_bids_started";
      }
      // Check if current price reached or fell below target
      else if (trigger_type === "price_changed" && item.current_price && item.current_price <= alert.target_price) {
        shouldNotify = true;
        triggerReason = "target_price_reached";
      }

      if (shouldNotify) {
        // Send email notification
        const emailBody = triggerReason === "first_bids_started"
          ? `Great news! ${item.title} just entered 1stBid$ phase. Check it out now!`
          : `Perfect timing! ${item.title} is now available at $${item.current_price.toLocaleString("en-US")} — your target price!`;

        const itemImageHtml = item.images?.[0]
          ? `<img src="${item.images[0]}" alt="${item.title}" width="100%" style="display:block;max-height:260px;object-fit:cover;margin:0 0 24px;" />`
          : '';

        const alertBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0ede8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">
        <tr><td style="padding-bottom:20px;text-align:center;">
          <img src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3a2676053_LOGOEV.png" alt="Everything Valuable" width="140" style="height:auto;display:block;margin:0 auto;" />
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #ddd8d0;overflow:hidden;">
          <div style="height:3px;background:#c0392b;"></div>
          <div style="padding:36px 40px 28px;border-bottom:1px solid #ede9e3;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c0392b;">Price Alert</p>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#111111;line-height:1.25;">${triggerReason === "first_bids_started" ? "Bidding Has Opened" : "Your Target Price Was Reached"}</h1>
          </div>
          <div style="padding:32px 40px;">
            ${itemImageHtml}
            <div style="background:#f8f6f3;border:1px solid #ede9e3;padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Item</p>
              <p style="margin:0 0 14px;font-size:16px;font-weight:600;color:#111;">${item.title}</p>
              ${triggerReason === "first_bids_started"
                ? `<p style="margin:0;font-size:14px;color:#555;">The 1stBid$™ preview phase has begun — you can now place a bid.</p>`
                : `<p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Current Price</p>
                   <p style="margin:0 0 10px;font-size:22px;font-weight:700;color:#c0392b;">$${item.current_price.toLocaleString("en-US")}</p>
                   <p style="margin:0;font-size:12px;color:#999;">Your target: $${alert.target_price.toLocaleString("en-US")}</p>`
              }
            </div>
            <a href="https://everythingvaluable.com/item/${item.id}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:13px 28px;">View Item Now</a>
          </div>
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

        await base44.integrations.Core.SendEmail({
          from_name: 'Everything Valuable',
          to: alert.user_email,
          subject: triggerReason === "first_bids_started"
            ? `Bidding Now Open: ${item.title}`
            : `Price Alert: ${item.title} Has Reached Your Target`,
          body: alertBody,
        });

        // Update alert status to triggered
        await base44.entities.PriceAlert.update(alert.id, {
          status: "triggered",
          triggered_at: new Date().toISOString(),
          triggered_price: item.current_price,
          trigger_reason: triggerReason
        });

        notifications.push({
          alert_id: alert.id,
          user_email: alert.user_email,
          reason: triggerReason
        });
      }
    }

    return Response.json({
      success: true,
      notifications_sent: notifications.length,
      notifications: notifications
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});