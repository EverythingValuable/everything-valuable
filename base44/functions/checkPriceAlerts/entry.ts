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

        await base44.integrations.Core.SendEmail({
          to: alert.user_email,
          subject: `Price Alert: ${item.title}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a; margin-bottom: 20px;">Your Price Alert Triggered!</h2>
              
              ${item.images?.[0] ? `<img src="${item.images[0]}" alt="${item.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" />` : ''}
              
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${item.title}</h3>
                ${triggerReason === "first_bids_started"
                  ? `<p style="margin: 0; color: #666; font-size: 14px;">1stBid$ phase has started!</p>`
                  : `<p style="margin: 0; color: #666; font-size: 14px;">Current price: <strong style="color: #1a1a1a; font-size: 16px;">$${item.current_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>
                    <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">Your target: $${alert.target_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>`
                }
              </div>
              
              <a href="https://everythingvaluable.com/item/${item.id}" style="display: inline-block; background: #8b6f47; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">View Item</a>
              
              <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                This alert has been automatically marked as triggered and won't send again.
              </p>
            </div>
          `
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