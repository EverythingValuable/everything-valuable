import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { jsPDF } from 'npm:jspdf@4.0.0';

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

    const [sellerProfile] = await base44.asServiceRole.entities.SellerProfile.filter({ user_email: invoice.seller_email });

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 50;
    let y = 50;

    // Header band
    doc.setFillColor(245, 240, 235);
    doc.rect(0, 0, pageW, 90, 'F');

    // Company name
    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(60, 45, 30);
    doc.text(sellerProfile?.display_name || 'Seller', margin, 38);

    // INVOICE label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(140, 110, 80);
    doc.text('INVOICE', pageW - margin, 30, { align: 'right' });

    // Invoice number & date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 90, 80);
    doc.text(`Invoice #: ${invoiceId.slice(-8).toUpperCase()}`, pageW - margin, 44, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - margin, 57, { align: 'right' });
    doc.text(`Status: ${(invoice.status || 'draft').toUpperCase()}`, pageW - margin, 70, { align: 'right' });

    y = 110;

    // Seller & Buyer columns
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(140, 110, 80);
    doc.text('FROM', margin, y);
    doc.text('BILL TO', pageW / 2, y);

    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 35, 30);

    const sellerLines = [
      sellerProfile?.display_name || invoice.seller_email,
      sellerProfile?.city && sellerProfile?.state ? `${sellerProfile.city}, ${sellerProfile.state}` : '',
      sellerProfile?.country || '',
      invoice.seller_email,
    ].filter(Boolean);

    const buyerLines = [
      invoice.buyer_name || invoice.buyer_email,
      invoice.buyer_email,
      invoice.buyer_phone || "",
      invoice.buyer_address || "",
    ].filter(Boolean);

    const maxLines = Math.max(sellerLines.length, buyerLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (sellerLines[i]) doc.text(sellerLines[i], margin, y);
      if (buyerLines[i]) doc.text(buyerLines[i], pageW / 2, y);
      y += 13;
    }

    y += 20;

    // Divider
    doc.setDrawColor(210, 195, 175);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 20;

    // Line items table header
    doc.setFillColor(245, 240, 235);
    doc.rect(margin, y - 4, pageW - margin * 2, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 85, 65);
    doc.text('DESCRIPTION', margin + 8, y + 10);
    doc.text('TYPE', pageW - 200, y + 10);
    doc.text('AMOUNT', pageW - margin - 8, y + 10, { align: 'right' });
    y += 24;

    // Item row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 35, 30);
    const itemTitle = invoice.item_title || 'Item';
    doc.text(itemTitle.length > 55 ? itemTitle.slice(0, 52) + '…' : itemTitle, margin + 8, y);
    doc.text('Item', pageW - 200, y);
    doc.text(`$${Number(invoice.item_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y, { align: 'right' });
    y += 16;

    // Service fee row
    if (invoice.service_fee > 0) {
      doc.text('Platform Service Fee', margin + 8, y);
      doc.text('Fee', pageW - 200, y);
      doc.text(`$${Number(invoice.service_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y, { align: 'right' });
      y += 16;
    }

    // Fee credit row
    if (invoice.fee_credit > 0) {
      doc.text('Fee Credit Applied', margin + 8, y);
      doc.text('Credit', pageW - 200, y);
      doc.text(`-$${Number(invoice.fee_credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y, { align: 'right' });
      y += 16;
    }

    // Additional line items
    const extras = invoice.additional_line_items || [];
    for (const li of extras) {
      doc.text(li.description || '', margin + 8, y);
      doc.text(li.type || '', pageW - 200, y);
      const amt = Number(li.amount);
      const sign = li.type === 'discount' ? '-' : '';
      doc.text(`${sign}$${Math.abs(amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y, { align: 'right' });
      y += 16;
    }

    y += 8;
    doc.setDrawColor(210, 195, 175);
    doc.line(margin, y, pageW - margin, y);
    y += 14;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(60, 45, 30);
    doc.text('TOTAL DUE', pageW - 200, y);
    doc.text(`$${Number(invoice.total_amount ?? invoice.item_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y, { align: 'right' });

    y += 30;

    // Payment instructions
    if (invoice.payment_instructions) {
      doc.setFillColor(255, 253, 248);
      doc.setDrawColor(220, 205, 180);
      doc.roundedRect(margin, y, pageW - margin * 2, 16 + Math.ceil(invoice.payment_instructions.length / 90) * 12, 4, 4, 'FD');
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(120, 95, 65);
      doc.text('PAYMENT INSTRUCTIONS', margin + 10, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 40, 30);
      const payLines = doc.splitTextToSize(invoice.payment_instructions, pageW - margin * 2 - 20);
      doc.text(payLines, margin + 10, y);
      y += payLines.length * 12 + 14;
    }

    // Terms
    if (invoice.terms_and_conditions) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(120, 95, 65);
      doc.text('TERMS & CONDITIONS', margin, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 90, 80);
      const termLines = doc.splitTextToSize(invoice.terms_and_conditions, pageW - margin * 2);
      doc.text(termLines, margin, y);
      y += termLines.length * 11 + 12;
    }

    // Notes
    if (invoice.notes) {
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(8);
      doc.setTextColor(120, 95, 65);
      doc.text('NOTES', margin, y);
      y += 12;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 90, 80);
      const noteLines = doc.splitTextToSize(invoice.notes, pageW - margin * 2);
      doc.text(noteLines, margin, y);
    }

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(245, 240, 235);
    doc.rect(0, pageH - 36, pageW, 36, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 120, 95);
    doc.text('Thank you for your business.', pageW / 2, pageH - 20, { align: 'center' });
    doc.text('Generated via EV Marketplace', pageW / 2, pageH - 10, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });

    // Save PDF url back to invoice
    await base44.asServiceRole.entities.Invoice.update(invoiceId, { pdf_url: file_url });

    return Response.json({ pdf_url: file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});