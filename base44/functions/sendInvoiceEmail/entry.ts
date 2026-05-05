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

    const balanceDue = Math.max(0, Number(invoice.total_amount ?? invoice.item_price ?? 0) - Number(invoice.service_fee ?? 0));

    const body = `
Dear ${invoice.buyer_name || 'Valued Customer'},

Thank you for your purchase through Everything Valuable. Please find your invoice details below.

Item: ${invoice.item_title || 'Your Purchase'}
Invoice Total: $${Number(invoice.total_amount ?? invoice.item_price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
Balance Due Now: $${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}

${invoice.payment_instructions ? `PAYMENT INSTRUCTIONS:\n${invoice.payment_instructions}\n` : ''}
You can download your invoice PDF here:
${invoice.pdf_url}

${invoice.notes ? `Notes: ${invoice.notes}\n` : ''}
If you have any questions, please contact ${sellerName}.

Thank you,
Everything Valuable
    `.trim();

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