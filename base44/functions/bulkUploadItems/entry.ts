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

    // Fetch all existing items for this seller up front (one query instead of N queries)
    const existingItems = await base44.entities.Item.filter({ seller_email: user.email });
    const byLot = {};
    const byTitle = {};
    for (const item of existingItems) {
      if (item.lot_number) byLot[String(item.lot_number)] = item;
      if (item.title) byTitle[item.title] = byTitle[item.title] || item;
    }

    const results = { created: 0, updated: 0, errors: [] };

    const processRow = async (row) => {
      try {
        let existingItem = null;
        if (row.id) {
          existingItem = existingItems.find(i => i.id === row.id) || null;
        } else if (row.lot_number) {
          existingItem = byLot[String(row.lot_number)] || null;
        } else if (row.title) {
          existingItem = byTitle[row.title] || null;
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
          lot_number: row.lot_number ? String(row.lot_number) : undefined,
          status: row.status || 'draft',
        };

        if (row.subcategory) payload.subcategory = row.subcategory;
        if (row.maker) payload.maker = row.maker;
        if (row.style) payload.style = row.style;
        if (row.technique) payload.technique = row.technique;
        if (row.keywords) payload.keywords = row.keywords;
        if (row.marks) payload.marks = row.marks;
        if (row.estimated_low) payload.estimated_low = parseFloat(row.estimated_low);
        if (row.estimated_high) payload.estimated_high = parseFloat(row.estimated_high);

        // Remove undefined fields
        Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

        if (existingItem) {
          await base44.entities.Item.update(existingItem.id, payload);
          results.updated++;
        } else {
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
    };

    // Process all rows in parallel
    await Promise.all(rows.map(processRow));

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});