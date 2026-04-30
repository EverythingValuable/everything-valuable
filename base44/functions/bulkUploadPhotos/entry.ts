import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Parses lot number from filename like: 1_1.jpg, 1_01.jpg, 2_3.png, 10_02.jpg
// Returns the lot number portion (before the first underscore)
function parseLotNumber(filename) {
  const base = filename.split('.')[0]; // remove extension
  const parts = base.split('_');
  if (parts.length >= 2) {
    return parts[0]; // e.g. "1" from "1_01"
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { photos } = await req.json();
    // photos: [{ filename: "1_01.jpg", file_url: "https://..." }, ...]
    if (!photos || !Array.isArray(photos)) {
      return Response.json({ error: 'photos array is required' }, { status: 400 });
    }

    // Group photos by lot number
    const byLot = {};
    for (const photo of photos) {
      const lot = parseLotNumber(photo.filename);
      if (!lot) continue;
      if (!byLot[lot]) byLot[lot] = [];
      byLot[lot].push(photo.file_url);
    }

    const results = { updated: 0, skipped: 0, errors: [] };

    for (const [lotNum, urls] of Object.entries(byLot)) {
      try {
        const found = await base44.entities.Item.filter({
          lot_number: lotNum,
          seller_email: user.email
        });

        if (!found.length) {
          results.skipped++;
          results.errors.push({ lot: lotNum, error: `No item found with lot_number "${lotNum}" for your account` });
          continue;
        }

        const item = found[0];
        // APPEND — never overwrite existing images
        const existingImages = item.images || [];
        const merged = [...existingImages, ...urls];

        await base44.entities.Item.update(item.id, { images: merged });
        results.updated++;
      } catch (err) {
        results.errors.push({ lot: lotNum, error: err.message });
      }
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});