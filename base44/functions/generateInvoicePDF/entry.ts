import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
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

    // Try to get item image
    let itemImageBase64 = null;
    let itemImageFormat = 'JPEG';

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    const contentW = pageW - margin * 2;
    const footerH = 36;
    const bottomLimit = pageH - footerH - 20;

    // Color helpers
    function setFill(r,g,b) { doc.setFillColor(r,g,b); }
    function setDraw(r,g,b) { doc.setDrawColor(r,g,b); }
    function setTxt(r,g,b)  { doc.setTextColor(r,g,b); }

    // Named colors
    const C = {
      dark:    [22, 22, 22],
      mid:     [80, 70, 60],
      light:   [130, 115, 95],
      warmBg:  [248, 244, 238],
      line:    [220, 210, 195],
      accent:  [160, 120, 75],
      white:   [255, 255, 255],
    };

    function fmt(n) {
      return `$${Math.abs(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    function ensureSpace(needed) {
      if (y + needed > bottomLimit) {
        drawFooter();
        doc.addPage();
        drawPageHeader();
        y = 80;
      }
    }

    function drawFooter() {
      const ph = doc.internal.pageSize.getHeight();
      setFill(...C.warmBg); doc.rect(0, ph - footerH, pageW, footerH, 'F');
      setDraw(...C.line); doc.setLineWidth(0.5); doc.line(0, ph - footerH, pageW, ph - footerH);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); setTxt(...C.light);
      const sellerLabel = sellerProfile?.display_name || '';
      doc.text(`${sellerLabel}  ·  Invoice #${invoiceId.slice(-8).toUpperCase()}  ·  Everything Valuable Marketplace`, pageW / 2, ph - 13, { align: 'center' });
    }

    function drawPageHeader() {
      setFill(...C.warmBg); doc.rect(0, 0, pageW, 48, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); setTxt(...C.accent);
      doc.text(sellerProfile?.display_name || 'Invoice', margin, 30);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setTxt(...C.light);
      doc.text(`Invoice #${invoiceId.slice(-8).toUpperCase()} (continued)`, pageW - margin, 30, { align: 'right' });
    }

    // ─── PAGE 1 HEADER ───────────────────────────────────────────────────────
    const headerH = 100;
    setFill(...C.dark); doc.rect(0, 0, pageW, headerH, 'F');

    doc.setFont('times', 'bold'); doc.setFontSize(26); setTxt(...C.white);
    doc.text(sellerProfile?.display_name || 'Invoice', margin, 44);

    if (sellerProfile?.website || sellerProfile?.city) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setTxt(190, 175, 155);
      const tagline = [sellerProfile?.city && sellerProfile?.state ? `${sellerProfile.city}, ${sellerProfile.state}` : '', sellerProfile?.website].filter(Boolean).join('  ·  ');
      doc.text(tagline, margin, 62);
    }

    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); setTxt(...C.warmBg);
    doc.text('INVOICE', pageW - margin, 38, { align: 'right' });

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setTxt(175, 160, 140);
    const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`#${invoiceId.slice(-8).toUpperCase()}`, pageW - margin, 54, { align: 'right' });
    doc.text(invoiceDate, pageW - margin, 67, { align: 'right' });
    doc.text((invoice.status || 'draft').toUpperCase(), pageW - margin, 80, { align: 'right' });

    let y = headerH + 28;

    // ─── FROM / BILL TO ──────────────────────────────────────────────────────
    const colMid = pageW / 2 + 10;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setTxt(...C.accent);
    doc.text('FROM', margin, y);
    doc.text('BILL TO', colMid, y);
    y += 13;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); setTxt(...C.dark);

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
      ...(invoice.buyer_address ? doc.splitTextToSize(invoice.buyer_address, contentW / 2 - 20) : []),
    ].filter(Boolean);

    const maxAddrLines = Math.max(sellerLines.length, buyerLines.length);
    for (let i = 0; i < maxAddrLines; i++) {
      if (sellerLines[i]) doc.text(sellerLines[i], margin, y);
      if (buyerLines[i]) doc.text(buyerLines[i], colMid, y);
      y += 14;
    }

    y += 20;

    // ─── ITEM THUMBNAIL + ITEM DETAILS ROW ───────────────────────────────────
    const thumbSize = 90;
    const thumbX = margin;
    const thumbY = y;

    if (itemImageBase64) {
      setFill(...C.white); setDraw(...C.line); doc.setLineWidth(0.75);
      doc.rect(thumbX, thumbY, thumbSize, thumbSize, 'FD');
      try {
        doc.addImage(itemImageBase64, itemImageFormat, thumbX + 2, thumbY + 2, thumbSize - 4, thumbSize - 4, undefined, 'MEDIUM');
      } catch (_) { itemImageBase64 = null; }
    }

    const itemTextX = itemImageBase64 ? thumbX + thumbSize + 16 : margin;
    const itemTextW = itemImageBase64 ? contentW - thumbSize - 16 : contentW;

    // Item title
    doc.setFont('times', 'bold'); doc.setFontSize(13); setTxt(...C.dark);
    const titleLines = doc.splitTextToSize(invoice.item_title || 'Item', itemTextW);
    doc.text(titleLines.slice(0, 3), itemTextX, thumbY + 16);

    let itemMetaY = thumbY + 16 + Math.min(titleLines.length, 3) * 16 + 6;
    if (invoice.purchase_method) {
      const methodLabel = { bid: 'Won via Bid', make_it_mine: 'Make It Mine', seller_accepted: 'Seller Accepted', manual: 'Direct Sale' }[invoice.purchase_method] || invoice.purchase_method;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setTxt(...C.light);
      doc.text(methodLabel.toUpperCase(), itemTextX, itemMetaY);
      itemMetaY += 13;
    }

    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); setTxt(...C.accent);
    doc.text(fmt(invoice.item_price), itemTextX, itemMetaY + 4);

    y = Math.max(y, thumbY + thumbSize) + 28;

    // ─── DIVIDER ─────────────────────────────────────────────────────────────
    setDraw(...C.line); doc.setLineWidth(0.5); doc.line(margin, y, pageW - margin, y);
    y += 18;

    // ─── LINE ITEMS TABLE ─────────────────────────────────────────────────────
    setFill(...C.warmBg); doc.rect(margin, y - 5, contentW, 22, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setTxt(...C.light);
    doc.text('DESCRIPTION', margin + 10, y + 9);
    doc.text('TYPE', pageW - 190, y + 9);
    doc.text('AMOUNT', pageW - margin - 8, y + 9, { align: 'right' });
    y += 26;

    function drawRow(description, type, amount, isCredit = false, isAlt = false) {
      const rowH = 20;
      ensureSpace(rowH);
      if (isAlt) { doc.setFillColor(252, 250, 246); doc.rect(margin, y - 12, contentW, rowH, 'F'); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setTxt(...C.dark);
      const maxDescLen = 68;
      const desc = description.length > maxDescLen ? description.slice(0, maxDescLen - 1) + '…' : description;
      doc.text(desc, margin + 10, y);
      setTxt(...C.mid); doc.text(type, pageW - 190, y);
      doc.setFont('helvetica', isCredit ? 'normal' : 'bold');
      if (isCredit) setTxt(...C.light); else setTxt(...C.dark);
      const prefix = isCredit ? '-' : '';
      doc.text(`${prefix}${fmt(amount)}`, pageW - margin - 8, y, { align: 'right' });
      y += rowH;
    }

    let rowAlt = false;
    drawRow(invoice.item_title || 'Item', 'Item', invoice.item_price, false, rowAlt); rowAlt = !rowAlt;
    if (invoice.fee_credit > 0)  { drawRow('Seller Credit Applied to Item Balance', 'Credit', invoice.fee_credit, true, rowAlt);  rowAlt = !rowAlt; }
    for (const li of (invoice.additional_line_items || [])) {
      drawRow(li.description || '', li.type ? (li.type.charAt(0).toUpperCase() + li.type.slice(1)) : '', li.amount, li.type === 'discount', rowAlt);
      rowAlt = !rowAlt;
    }

    y += 4;
    setDraw(...C.line); doc.setLineWidth(0.5); doc.line(margin, y, pageW - margin, y);
    y += 16;

    // ─── TOTALS ───────────────────────────────────────────────────────────────
    const lblX = pageW - margin - 230;
    const amtX = pageW - margin;

    ensureSpace(90);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); setTxt(...C.mid);
    doc.text('Invoice Total', lblX, y);
    doc.setFont('helvetica', 'bold'); setTxt(...C.dark);
    doc.text(fmt(invoice.total_amount ?? invoice.item_price), amtX, y, { align: 'right' });
    y += 18;

    const balanceDue = Number(invoice.total_amount ?? invoice.item_price ?? 0);
    const isPaid = ['paid', 'shipped', 'delivered'].includes(invoice.status);

    if (isPaid) {
      // Green PAID IN FULL box
      doc.setFillColor(34, 120, 70); doc.rect(lblX - 12, y - 5, amtX - lblX + 12 + margin, 32, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); setTxt(...C.white);
      doc.text('PAID IN FULL', lblX, y + 14);
      doc.setFontSize(12); doc.text(fmt(balanceDue), amtX, y + 14, { align: 'right' });
      y += 46;

      // Payment method block
      const paymentMethodLabels = {
        wire_transfer: 'Wire Transfer', check: 'Check', paypal: 'PayPal',
        venmo: 'Venmo', zelle: 'Zelle', credit_card: 'Credit Card', cash: 'Cash', other: 'Other'
      };
      if (invoice.payment_method) {
        ensureSpace(40);
        const methodLabel = paymentMethodLabels[invoice.payment_method] || invoice.payment_method;
        const paymentText = invoice.payment_method_notes
          ? `${methodLabel} — ${invoice.payment_method_notes}`
          : methodLabel;
        const boxH = 36;
        doc.setFillColor(236, 253, 245); setDraw(34, 120, 70); doc.setLineWidth(0.5);
        doc.rect(margin, y, contentW, boxH, 'FD');
        doc.setFillColor(34, 120, 70); doc.rect(margin, y, 4, boxH, 'F');
        y += 12;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(34, 120, 70);
        doc.text('PAYMENT RECEIVED', margin + 14, y);
        y += 13;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setTxt(...C.dark);
        doc.text(paymentText, margin + 14, y);
        y += 18;
      }
    } else {
      setFill(...C.dark); doc.rect(lblX - 12, y - 5, amtX - lblX + 12 + margin, 32, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); setTxt(...C.white);
      doc.text('BALANCE DUE NOW', lblX, y + 14);
      doc.setFontSize(12); doc.text(fmt(balanceDue), amtX, y + 14, { align: 'right' });
      y += 46;
    }

    // ─── SELLER CREDIT DISCLOSURE NOTE ───────────────────────────────────────
    if (invoice.fee_credit > 0) {
      ensureSpace(32);
      y += 8;
      const noteText = `A seller credit of ${fmt(invoice.fee_credit)} has been applied to this invoice. Any platform service fee paid through Everything Valuable was processed separately and is not part of this invoice.`;
      const noteLines = doc.splitTextToSize(noteText, contentW);
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); setTxt(...C.light);
      doc.text(noteLines, margin, y);
      y += noteLines.length * 11 + 10;
    }

    // ─── PAYMENT INSTRUCTIONS ─────────────────────────────────────────────────
    if (invoice.payment_instructions) {
      const payLines = doc.splitTextToSize(invoice.payment_instructions, contentW - 28);
      const boxH = 20 + payLines.length * 12 + 16;
      ensureSpace(boxH);

      doc.setFillColor(255, 253, 249); setDraw(...C.line); doc.setLineWidth(0.5);
      doc.rect(margin, y, contentW, boxH, 'FD');
      setFill(...C.accent); doc.rect(margin, y, 4, boxH, 'F');

      y += 14;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setTxt(...C.accent);
      doc.text('PAYMENT INSTRUCTIONS', margin + 14, y);
      y += 14;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setTxt(...C.dark);
      doc.text(payLines, margin + 14, y);
      y += payLines.length * 12 + 20;
    }

    // ─── TERMS & CONDITIONS ───────────────────────────────────────────────────
    if (invoice.terms_and_conditions) {
      ensureSpace(40);
      y += 4;
      setDraw(...C.line); doc.line(margin, y, pageW - margin, y);
      y += 14;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setTxt(...C.accent);
      doc.text('TERMS & CONDITIONS', margin, y);
      y += 13;
      const termLines = doc.splitTextToSize(invoice.terms_and_conditions, contentW);
      for (const line of termLines) {
        ensureSpace(12);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setTxt(...C.mid);
        doc.text(line, margin, y);
        y += 12;
      }
      y += 8;
    }

    // ─── NOTES ────────────────────────────────────────────────────────────────
    if (invoice.notes) {
      const noteLines = doc.splitTextToSize(invoice.notes, contentW);
      ensureSpace(14 + noteLines.length * 12 + 8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); setTxt(...C.accent);
      doc.text('NOTES', margin, y);
      y += 13;
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9); setTxt(...C.mid);
      doc.text(noteLines, margin, y);
      y += noteLines.length * 12 + 8;
    }

    drawFooter();

    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], `invoice-${invoiceId.slice(-8)}.pdf`, { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    await base44.asServiceRole.entities.Invoice.update(invoiceId, { pdf_url: file_url });

    return Response.json({ pdf_url: file_url });
  } catch (error) {
    console.error('PDF error:', error.message, error.stack);
    return Response.json({ error: error.message, stack: error.stack?.split('\n').slice(0,5) }, { status: 500 });
  }
});