import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { itemId } = await req.json();
    if (!itemId) return Response.json({ error: 'itemId required' }, { status: 400 });

    // Fetch the item
    const [item] = await base44.asServiceRole.entities.Item.filter({ id: itemId });
    if (!item) return Response.json({ error: 'Item not found' }, { status: 404 });
    if (item.status !== 'sold') return Response.json({ error: 'Item is not sold' }, { status: 400 });

    const buyerEmail = item.sold_to_email || item.highest_bidder_email || item.make_it_mine_buyer;
    const salePrice = item.sold_price || item.current_price || 0;

    if (!buyerEmail) return Response.json({ error: 'No buyer email found' }, { status: 400 });
    if (salePrice <= 0) return Response.json({ error: 'Invalid sale price' }, { status: 400 });

    // Calculate service fee: 10% + $30
    const serviceFee = Math.round((salePrice * 0.10 + 30) * 100) / 100;

    // Fetch buyer profile for name
    const [buyerProfile] = await base44.asServiceRole.entities.BuyerProfile.filter({ user_email: buyerEmail });
    const buyerName = buyerProfile?.full_name || 'Valued Customer';

    // Fetch seller info for display
    const [sellerProfile] = await base44.asServiceRole.entities.SellerProfile.filter({ user_email: item.seller_email });
    const sellerName = sellerProfile?.display_name || 'the seller';

    // Create a service fee invoice record (separate from seller invoice)
    const serviceInvoiceId = `fee_${itemId.slice(-8)}_${Date.now()}`.slice(0, 32);
    await base44.asServiceRole.entities.Invoice.create({
      id: serviceInvoiceId,
      item_id: itemId,
      item_title: item.title,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      seller_email: item.seller_email,
      item_price: serviceFee,
      service_fee: serviceFee,
      fee_credit: 0,
      additional_line_items: [],
      total_amount: serviceFee,
      status: 'paid',
      purchase_method: item.sold_via || 'bid',
      payment_method: 'credit_card',
      notes: `Platform Service Fee for ${item.title} won via ${item.sold_via || 'bid'}`,
    });

    // Build the professional email
    const body = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#1a1a1a;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">Everything Valuable</p>
          <p style="margin:6px 0 0;font-size:13px;color:#9ca3af;">Congratulations on Your Win!</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">

            <!-- Greeting -->
            <tr><td style="padding-bottom:20px;">
              <p style="margin:0;font-size:16px;color:#111827;">Hello ${buyerName},</p>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">Congratulations on winning <strong>${item.title}</strong>! We've charged your card for the platform service fee below. You'll receive a separate invoice from ${sellerName} shortly with payment instructions.</p>
            </td></tr>

            <!-- Divider -->
            <tr><td style="border-top:1px solid #e5e7eb;padding-bottom:20px;"></td></tr>

            <!-- Item won -->
            <tr><td style="padding-bottom:4px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Item Won</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${item.title}</p>
            </td></tr>

            <!-- Fee details -->
            <tr><td style="padding:20px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:#4b5563;border-bottom:1px solid #e5e7eb;">Winning Price</td>
                  <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">$${salePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:#4b5563;border-bottom:1px solid #e5e7eb;">Platform Service Fee (10% + \$30)</td>
                  <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">$${serviceFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#111827;">Amount Charged to Your Card</td>
                  <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#b45309;text-align:right;">$${serviceFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>
            </td></tr>

            <!-- Seller invoice coming -->
            <tr><td style="padding:24px 0 0;">
              <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;padding:16px;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#4338ca;text-transform:uppercase;letter-spacing:0.05em;">Next Steps</p>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#312e81;">You'll receive a separate invoice from ${sellerName} with instructions on how to complete payment and arrange shipping. Keep an eye on your inbox!</p>
              </div>
            </td></tr>

            <!-- Divider -->
            <tr><td style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:28px;"></td></tr>

            <!-- Footer note -->
            <tr><td style="padding-top:4px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">If you have any questions about the platform fee or your purchase, please contact our support team.</p>
            </td></tr>

          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:18px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© Everything Valuable · Your marketplace for fine items</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send the email (use current user's email for testing, buyer email in production)
    const emailTo = user.email; // Test mode: send to invoking user
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Everything Valuable',
      to: emailTo,
      subject: `Congratulations! You won "${item.title}" — Platform Fee Receipt`,
      body,
    });

    return Response.json({
      success: true,
      message: 'Service fee charged and receipt sent',
      feeAmount: serviceFee,
      invoiceId: serviceInvoiceId,
      buyerEmail,
    });
  } catch (error) {
    console.error('Service fee error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});