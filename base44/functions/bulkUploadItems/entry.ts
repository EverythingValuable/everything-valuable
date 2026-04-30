import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { rows } = await req.json();
    if (!rows || !Array.isArray(rows)) {
      return Response.json({ error: 'rows array is required' }, { status: 400 });
    }

    const results = { created: 0, updated: 0, errors: [] };

    for (const row of rows) {
      try {
        // Determine if this is an update (has id or lot_number matching existing item)
        let existingItem = null;

        if (row.id) {
          const found = await base44.entities.Item.filter({ id: row.id });
          existingItem = found[0] || null;
        } else if (row.lot_number) {
          // Find ALL items with this lot_number for this seller
          const found = await base44.entities.Item.filter({
            lot_number: String(row.lot_number),
            seller_email: user.email
          });
          // If multiple exist (from previous bad uploads), use the first and ignore the rest
          existingItem = found[0] || null;
        } else if (row.title) {
          // Fallback: match by exact title for this seller
          const found = await base44.entities.Item.filter({
            title: row.title,
            seller_email: user.email
          });
          existingItem = found[0] || null;
        }

        const payload = {
          title: row.title || 'Untitled Draft',
          category: row.category || 'other',
          condition: row.condition || 'very_good',
          description: row.description || '',
          provenance: row.provenance || '',
          materials: row.materials || '',
          dimensions: row.dimensions || '',
          period: row.period || '',
          origin: row.origin || '',
          location: row.location || '',
          condition_notes: row.condition_notes || '',
          shipping_notes: row.shipping_notes || '',
          prisometer_start_price: parseFloat(row.prisometer_start_price) || 0,
          reserve_price: parseFloat(row.reserve_price) || 0,
          below_reserve_percent: parseInt(row.below_reserve_percent) || 10,
          prisometer_duration_hours: parseInt(row.prisometer_duration_hours) || 168,
          first_bids_duration_hours: parseInt(row.first_bids_duration_hours) || 168,
          estimated_low: row.estimated_low ? parseFloat(row.estimated_low) : undefined,
          estimated_high: row.estimated_high ? parseFloat(row.estimated_high) : undefined,
          lot_number: row.lot_number ? String(row.lot_number) : undefined,
          status: row.status || 'draft',
        };

        // Remove undefined fields
        Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

        if (existingItem) {
          // Update — don't overwrite images
          await base44.entities.Item.update(existingItem.id, payload);
          results.updated++;
        } else {
          // Create new
          await base44.entities.Item.create({
            ...payload,
            seller_email: user.email,
            seller_name: user.full_name,
            images: [],
          });
          results.created++;
        }
      } catch (rowErr) {
        results.errors.push({ row: row.title || row.lot_number || '?', error: rowErr.message });
      }
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});