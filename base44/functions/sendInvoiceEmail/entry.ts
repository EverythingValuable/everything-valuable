import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { invoiceId } = await req.json();
    if (!invoiceId) return Response.json({ error: 'invoiceId required' }, { status: 400 });

    const [invoice] = await base44.asServiceRole.entities.Invoice.filter({ id: invoiceId });
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
    if (invoice.seller_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!invoice.pdf_url) {
      return Response.json({ error: 'Please generate the PDF before sending.' }, { status: 400 });
    }
    if (!invoice.buyer_email) {
      return Response.json({ error: 'No buyer email on this invoice.' }, { status: 400 });
    }

    const [sellerProfile] = await base44.asServiceRole.entities.SellerProfile.filter({ user_email: invoice.seller_email });
    const sellerName = sellerProfile?.display_name || 'Your Seller';

    const balanceDue = Number(invoice.total_amount ?? invoice.item_price ?? 0);

    const totalFormatted = `$${Number(invoice.total_amount ?? invoice.item_price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const balanceFormatted = `$${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const creditNoteHtml = invoice.fee_credit > 0
      ? `<tr><td style="padding:12px 0 0;"><p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;font-style:italic;">A seller credit of $${Number(invoice.fee_credit).toLocaleString('en-US', { minimumFractionDigits: 2 })} has been applied to this invoice. Any platform service fee paid through Everything Valuable was processed separately and is not part of this invoice.</p></td></tr>`
      : '';

    const paymentInstructionsHtml = invoice.payment_instructions
      ? `<tr><td style="padding:24px 0 0;">
           <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Payment Instructions</p>
           <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-size:14px;line-height:1.7;white-space:pre-line;color:#374151;">${invoice.payment_instructions}</div>
         </td></tr>`
      : '';

    const notesHtml = invoice.notes
      ? `<tr><td style="padding:16px 0 0;">
           <p style="margin:0 0 6px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Notes</p>
           <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;white-space:pre-line;">${invoice.notes}</p>
         </td></tr>`
      : '';

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
          <p style="margin:6px 0 0;font-size:13px;color:#9ca3af;">Invoice from ${sellerName}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">

            <!-- Greeting -->
            <tr><td style="padding-bottom:20px;">
              <p style="margin:0;font-size:16px;color:#111827;">Dear ${invoice.buyer_name || 'Valued Customer'},</p>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">Thank you for your purchase through <strong>Everything Valuable</strong>. Please find your invoice details below.</p>
            </td></tr>

            <!-- Divider -->
            <tr><td style="border-top:1px solid #e5e7eb;padding-bottom:20px;"></td></tr>

            <!-- Item -->
            <tr><td style="padding-bottom:4px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Item</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${invoice.item_title || 'Your Purchase'}</p>
            </td></tr>

            <!-- Amounts -->
            <tr><td style="padding:20px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:#4b5563;border-bottom:1px solid #e5e7eb;">Invoice Total</td>
                  <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">${totalFormatted}</td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#111827;">Balance Due Now</td>
                  <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#b45309;text-align:right;">${balanceFormatted}</td>
                </tr>
              </table>
            </td></tr>

            ${creditNoteHtml}

            ${paymentInstructionsHtml}
            ${notesHtml}

            <!-- PDF Button -->
            <tr><td style="padding:28px 0 0;text-align:center;">
              <a href="${invoice.pdf_url}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;letter-spacing:0.01em;">⬇ Download Invoice PDF</a>
            </td></tr>

            <!-- Divider -->
            <tr><td style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:28px;"></td></tr>

            <!-- Footer note -->
            <tr><td style="padding-top:4px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">If you have any questions, please contact <strong>${sellerName}</strong>.</p>
            </td></tr>

          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:18px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© Everything Valuable · This is an automated invoice notification.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Everything Valuable',
      to: invoice.buyer_email,
      subject: `Your Invoice from ${sellerName} — ${invoice.item_title || 'Purchase'}`,
      body,
    });

    // Mark invoice as sent if it was still draft
    if (invoice.status === 'draft') {
      await base44.asServiceRole.entities.Invoice.update(invoiceId, { status: 'sent' });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});