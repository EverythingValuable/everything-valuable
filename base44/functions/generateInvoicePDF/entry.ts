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
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentW = pageW - margin * 2;
    const footerH = 40;
    const bottomLimit = pageH - footerH - 20;

    // Helper: ensure Y has space, add new page if needed
    function ensureSpace(neededHeight) {
      if (y + neededHeight > bottomLimit) {
        drawFooter();
        doc.addPage();
        drawHeader();
        y = 110;
      }
    }

    function drawFooter() {
      const ph = doc.internal.pageSize.getHeight();
      doc.setFillColor(245, 240, 235);
      doc.rect(0, ph - footerH, pageW, footerH, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(140, 120, 95);
      doc.text('Thank you for your business.', pageW / 2, ph - 22, { align: 'center' });
      doc.text(`${sellerProfile?.display_name || ''} · Generated via EV Marketplace`, pageW / 2, ph - 10, { align: 'center' });
    }

    function drawHeader() {
      // Header band
      doc.setFillColor(245, 240, 235);
      doc.rect(0, 0, pageW, 90, 'F');
      // Company name
      doc.setFont('times', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(60, 45, 30);
      doc.text(sellerProfile?.display_name || 'Seller', margin, 38);
      // INVOICE label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(140, 110, 80);
      doc.text('INVOICE', pageW - margin, 30, { align: 'right' });
      // Invoice meta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 90, 80);
      doc.text(`Invoice #: ${invoiceId.slice(-8).toUpperCase()}`, pageW - margin, 44, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - margin, 57, { align: 'right' });
      doc.text(`Status: ${(invoice.status || 'draft').toUpperCase()}`, pageW - margin, 70, { align: 'right' });
    }

    // --- Draw first page header ---
    drawHeader();
    let y = 110;

    // FROM / BILL TO columns
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
      sellerProfile?.address_line1 || '',
      sellerProfile?.city && sellerProfile?.state ? `${sellerProfile.city}, ${sellerProfile.state}` : '',
      sellerProfile?.country || '',
      invoice.seller_email,
    ].filter(Boolean);

    const buyerLines = [
      invoice.buyer_name || '',
      invoice.buyer_email || '',
      invoice.buyer_phone || '',
      ...(invoice.buyer_address ? doc.splitTextToSize(invoice.buyer_address, contentW / 2 - 10) : []),
    ].filter(Boolean);

    const maxLines = Math.max(sellerLines.length, buyerLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (sellerLines[i]) doc.text(sellerLines[i], margin, y);
      if (buyerLines[i]) doc.text(buyerLines[i], pageW / 2, y);
      y += 13;
    }

    y += 24;

    // Divider
    doc.setDrawColor(210, 195, 175);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 18;

    // Line items table header
    doc.setFillColor(245, 240, 235);
    doc.rect(margin, y - 4, contentW, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 85, 65);
    doc.text('DESCRIPTION', margin + 8, y + 10);
    doc.text('TYPE', pageW - 200, y + 10);
    doc.text('AMOUNT', pageW - margin - 8, y + 10, { align: 'right' });
    y += 24;

    // Helper to draw a line item row
    function drawRow(description, type, amount, isCredit = false) {
      ensureSpace(18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40, 35, 30);
      const desc = description.length > 60 ? description.slice(0, 57) + '…' : description;
      doc.text(desc, margin + 8, y);
      doc.text(type, pageW - 200, y);
      const sign = isCredit ? '-' : '';
      doc.text(`${sign}$${Math.abs(Number(amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y, { align: 'right' });
      y += 16;
    }

    // Item row
    drawRow(invoice.item_title || 'Item', 'Item', invoice.item_price);

    // Service fee
    if (invoice.service_fee > 0) {
      drawRow('Platform Service Fee Paid at Close', 'Fee', invoice.service_fee);
    }

    // Fee credit
    if (invoice.fee_credit > 0) {
      drawRow('Fee Credit Applied to Invoice', 'Credit', invoice.fee_credit, true);
    }

    // Additional line items
    for (const li of (invoice.additional_line_items || [])) {
      drawRow(li.description || '', li.type || '', li.amount, li.type === 'discount');
    }

    y += 8;
    ensureSpace(30);
    doc.setDrawColor(210, 195, 175);
    doc.line(margin, y, pageW - margin, y);
    y += 14;

    // Final Invoice Total
    ensureSpace(70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(60, 45, 30);
    doc.text('Final Invoice Total', pageW - 200, y);
    doc.text(`$${Number(invoice.total_amount ?? invoice.item_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y, { align: 'right' });
    y += 18;

    // Less amount already paid
    if (invoice.service_fee > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 90, 80);
      doc.text('Less Amount Already Paid', pageW - 200, y);
      doc.text(`-$${Number(invoice.service_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y, { align: 'right' });
      y += 16;

      // Balance Due Now highlight box
      const balanceDue = Number(invoice.total_amount ?? invoice.item_price) - Number(invoice.service_fee);
      doc.setFillColor(245, 240, 235);
      doc.rect(pageW - 260, y - 4, 260 - margin + margin, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(60, 45, 30);
      doc.text('BALANCE DUE NOW', pageW - 200, y + 12);
      doc.text(`$${Math.max(0, balanceDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageW - margin - 8, y + 12, { align: 'right' });
      y += 32;
    } else {
      y += 14;
    }

    // --- PAYMENT INSTRUCTIONS ---
    if (invoice.payment_instructions) {
      const payLines = doc.splitTextToSize(invoice.payment_instructions, contentW - 24);
      const boxH = 14 + payLines.length * 13 + 14;
      ensureSpace(boxH);

      doc.setFillColor(255, 253, 248);
      doc.setDrawColor(220, 205, 180);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentW, boxH, 4, 4, 'FD');
      y += 12;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(120, 95, 65);
      doc.text('PAYMENT INSTRUCTIONS', margin + 12, y);
      y += 13;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40, 35, 30);
      doc.text(payLines, margin + 12, y);
      y += payLines.length * 13 + 16;
    }

    // --- TERMS & CONDITIONS ---
    if (invoice.terms_and_conditions) {
      ensureSpace(40);
      doc.setDrawColor(210, 195, 175);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageW - margin, y);
      y += 14;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(120, 95, 65);
      doc.text('TERMS & CONDITIONS', margin, y);
      y += 13;

      const termLines = doc.splitTextToSize(invoice.terms_and_conditions, contentW);
      // Render term lines page by page
      for (const line of termLines) {
        ensureSpace(13);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 55, 50);
        doc.text(line, margin, y);
        y += 13;
      }
      y += 8;
    }

    // --- NOTES ---
    if (invoice.notes) {
      const noteLines = doc.splitTextToSize(invoice.notes, contentW);
      ensureSpace(14 + noteLines.length * 13);

      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(8);
      doc.setTextColor(120, 95, 65);
      doc.text('NOTES', margin, y);
      y += 13;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 70, 60);
      doc.text(noteLines, margin, y);
      y += noteLines.length * 13 + 8;
    }

    // Draw footer on last page
    drawFooter();

    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], `invoice-${invoiceId.slice(-8)}.pdf`, { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    await base44.asServiceRole.entities.Invoice.update(invoiceId, { pdf_url: file_url });

    return Response.json({ pdf_url: file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});