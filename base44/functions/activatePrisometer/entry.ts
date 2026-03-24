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
    for (const item of toActivate) {
      const prisometerStart = new Date().toISOString();
      await base44.asServiceRole.entities.Item.update(item.id, {
        status: 'prisometer',
        prisometer_activated_at: prisometerStart,
        current_price: item.prisometer_start_price,
      });
      activated++;
    }

    return Response.json({
      success: true,
      checked: items.length,
      activated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});