import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { bidId, itemId } = await req.json();

    if (!bidId || !itemId) {
      return Response.json({ error: 'bidId and itemId required' }, { status: 400 });
    }

    // Delete the bid
    await base44.asServiceRole.entities.Bid.delete(bidId);

    // Reset item's highest_bid to 0
    await base44.asServiceRole.entities.Item.update(itemId, {
      highest_bid: 0,
      bid_count: 0,
    });

    return Response.json({ success: true, message: 'Bid removed and item reset' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});