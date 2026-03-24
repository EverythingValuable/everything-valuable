import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, FileText, Download, Loader2,
  BookTemplate, Save, CheckCircle2, AlertTriangle, User
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const LINE_TYPES = ["tax", "shipping", "discount", "fee", "other"];

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  disputed: "bg-red-100 text-red-700",
};

// service_fee = (item_price * 0.10) + 30
// credit_on_invoice = service_fee * 0.50
// final_invoice_total = item_price + service_fee - credit_on_invoice
// remaining_due = final_invoice_total - service_fee (= item_price - credit_on_invoice)

function computeServiceFee(itemPrice) {
  const base = Number(itemPrice) || 0;
  return Math.round((base * 0.10 + 30) * 100) / 100;
}

function computeTotal(itemPrice, _unused, feeCredit, extras) {
  const base = Number(itemPrice) || 0;
  const fee = computeServiceFee(base);
  const credit = Number(feeCredit) || 0;
  const extra = (extras || []).reduce((s, li) => {
    const amt = Number(li.amount) || 0;
    return li.type === "discount" ? s - amt : s + amt;
  }, 0);
  // final_invoice_total = item_price + service_fee - credit + extras
  return { fee, total: base + fee - credit + extra };
}

function defaultForm(profileDefaults = {}) {
  return {
    item_id: "",
    item_title: "",
    buyer_email: "",
    buyer_name: "",
    buyer_phone: "",
    buyer_address: "",
    item_price: "",
    service_fee_pct: 10,
    fee_credit: "",
    additional_line_items: [],
    payment_instructions: profileDefaults.payment_instructions || "",
    terms_and_conditions: profileDefaults.terms_and_conditions || "",
    notes: "",
    status: "draft",
    purchase_method: "manual",
  };
}

export default function InvoiceBuilder({ user }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [buyerProfileWarning, setBuyerProfileWarning] = useState(false);

  const { data: allItems = [] } = useQuery({
    queryKey: ["seller-all-items", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: profile } = useQuery({
    queryKey: ["seller-profile", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["invoice-templates", user?.email],
    queryFn: () => base44.entities.InvoiceTemplate.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["seller-invoices", user?.email],
    queryFn: () => base44.entities.Invoice.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  // Pre-fill defaults from seller profile when opening a new form
  useEffect(() => {
    if (profile && !editingId && showForm) {
      setForm(f => ({
        ...f,
        payment_instructions: f.payment_instructions || profile.payment_instructions || "",
        terms_and_conditions: f.terms_and_conditions || profile.terms_and_conditions || "",
        notes: f.notes || profile.notes || "",
      }));
    }
  }, [profile, showForm]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // When an item is selected, auto-populate everything
  const handleItemSelect = async (itemId) => {
    if (!itemId) {
      set("item_id", "");
      return;
    }
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const soldPrice = item.sold_price || item.current_price || item.prisometer_start_price || 0;
    const buyerEmail = item.sold_to_email || item.highest_bidder_email || "";

    // Try to load buyer profile
    let buyerProfile = null;
    if (buyerEmail) {
      const results = await base44.entities.BuyerProfile.filter({ user_email: buyerEmail });
      buyerProfile = results[0] || null;
    }

    const computedFee = computeServiceFee(soldPrice);
    const feeCredit = item.fee_credit || computedFee * 0.50;
    const purchaseMethod = item.sold_via || "bid";

    const buyerAddress = buyerProfile
      ? [buyerProfile.address_line1, buyerProfile.address_line2, buyerProfile.city, buyerProfile.state, buyerProfile.zip, buyerProfile.country].filter(Boolean).join(", ")
      : "";

    setBuyerProfileWarning(!!buyerEmail && !buyerProfile?.profile_complete);

    setForm(f => ({
      ...f,
      item_id: itemId,
      item_title: item.title || "",
      item_price: soldPrice,
      service_fee_pct: 10,
      fee_credit: feeCredit,
      purchase_method: purchaseMethod,
      buyer_email: buyerEmail,
      buyer_name: buyerProfile?.full_name || f.buyer_name,
      buyer_phone: buyerProfile?.phone || f.buyer_phone,
      buyer_address: buyerAddress || f.buyer_address,
    }));
  };

  // Load a template
  const handleLoadTemplate = (templateId) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) return;
    setForm(f => ({
      ...f,
      payment_instructions: tmpl.payment_instructions || f.payment_instructions,
      terms_and_conditions: tmpl.terms_and_conditions || f.terms_and_conditions,
      notes: tmpl.notes || f.notes,
      additional_line_items: tmpl.additional_line_items?.length
        ? tmpl.additional_line_items.map(li => ({ ...li, amount: li.amount || "" }))
        : f.additional_line_items,
    }));
    toast({ title: `Template "${tmpl.name}" loaded` });
  };

  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.InvoiceTemplate.create({
        seller_email: user.email,
        name: templateName,
        payment_instructions: form.payment_instructions,
        terms_and_conditions: form.terms_and_conditions,
        notes: form.notes,
        additional_line_items: form.additional_line_items,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-templates", user?.email] });
      setShowSaveTemplate(false);
      setTemplateName("");
      toast({ title: "Template saved" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { fee, total } = computeTotal(form.item_price, form.service_fee_pct, form.fee_credit, form.additional_line_items);
      const payload = {
        item_id: form.item_id || undefined,
        item_title: form.item_title,
        buyer_email: form.buyer_email,
        buyer_name: form.buyer_name,
        buyer_phone: form.buyer_phone,
        buyer_address: form.buyer_address,
        seller_email: user.email,
        item_price: Number(form.item_price) || 0,
        service_fee: fee,
        fee_credit: Number(form.fee_credit) || 0,
        additional_line_items: form.additional_line_items.map(li => ({ ...li, amount: Number(li.amount) || 0 })),
        total_amount: total,
        purchase_method: form.purchase_method || "manual",
        payment_instructions: form.payment_instructions,
        terms_and_conditions: form.terms_and_conditions,
        notes: form.notes,
        status: form.status,
      };
      if (editingId) return base44.entities.Invoice.update(editingId, payload);
      return base44.entities.Invoice.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-invoices", user?.email] });
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm());
      setBuyerProfileWarning(false);
      toast({ title: editingId ? "Invoice updated" : "Invoice created" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Invoice.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-invoices", user?.email] }),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.InvoiceTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoice-templates", user?.email] }),
  });

  const handleEdit = (inv) => {
    setEditingId(inv.id);
    setForm({
      item_id: inv.item_id || "",
      item_title: inv.item_title || "",
      buyer_email: inv.buyer_email || "",
      buyer_name: inv.buyer_name || "",
      buyer_phone: inv.buyer_phone || "",
      buyer_address: inv.buyer_address || "",
      item_price: inv.item_price ?? "",
      service_fee_pct: 10,
      fee_credit: inv.fee_credit ?? "",
      additional_line_items: inv.additional_line_items || [],
      payment_instructions: inv.payment_instructions || "",
      terms_and_conditions: inv.terms_and_conditions || "",
      notes: inv.notes || "",
      status: inv.status || "draft",
      purchase_method: inv.purchase_method || "manual",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addLineItem = () => setForm(f => ({
    ...f,
    additional_line_items: [...f.additional_line_items, { description: "", amount: "", type: "tax" }],
  }));

  const updateLineItem = (idx, key, val) => setForm(f => {
    const updated = [...f.additional_line_items];
    updated[idx] = { ...updated[idx], [key]: val };
    return { ...f, additional_line_items: updated };
  });

  const removeLineItem = (idx) => setForm(f => ({
    ...f, additional_line_items: f.additional_line_items.filter((_, i) => i !== idx),
  }));

  const handleGeneratePdf = async (invoiceId) => {
    setGeneratingPdf(invoiceId);
    const res = await base44.functions.invoke("generateInvoicePDF", { invoiceId });
    setGeneratingPdf(null);
    if (res.data?.pdf_url) {
      queryClient.invalidateQueries({ queryKey: ["seller-invoices", user?.email] });
      window.open(res.data.pdf_url, "_blank");
    } else {
      toast({ title: "PDF generation failed", variant: "destructive" });
    }
  };

  const { fee: liveServiceFee, total: liveTotal } = computeTotal(form.item_price, form.service_fee_pct, form.fee_credit, form.additional_line_items);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold">Invoices</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Create and send invoices with auto-populated buyer info and pricing.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setEditingId(null); setForm(defaultForm({ payment_instructions: profile?.payment_instructions, terms_and_conditions: profile?.terms_and_conditions })); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        )}
      </div>

      {/* Invoice Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">{editingId ? "Edit Invoice" : "Create Invoice"}</h3>
            <div className="flex items-center gap-3">
              {/* Load template */}
              {templates.length > 0 && (
                <select
                  onChange={e => { if (e.target.value) handleLoadTemplate(e.target.value); e.target.value = ""; }}
                  className="h-8 rounded-md border border-input bg-transparent px-3 text-xs text-muted-foreground"
                  defaultValue=""
                >
                  <option value="">Load template…</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
              <button onClick={() => { setShowForm(false); setEditingId(null); setBuyerProfileWarning(false); }} className="text-muted-foreground hover:text-foreground text-sm">Cancel</button>
            </div>
          </div>

          {buyerProfileWarning && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">Buyer has not completed their profile — some fields may be missing. They should add their shipping address and payment info in their account settings.</p>
            </div>
          )}

          {/* Item Selection */}
          <Section title="Item">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Select Listed Item">
                <select
                  value={form.item_id}
                  onChange={e => handleItemSelect(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">— Manual entry —</option>
                  {allItems.map(item => (
                    <option key={item.id} value={item.id}>{item.title} ({item.status})</option>
                  ))}
                </select>
              </Field>
              <Field label="Item Title">
                <Input value={form.item_title} onChange={e => set("item_title", e.target.value)} placeholder="e.g. Vintage Oil Painting" />
              </Field>
            </div>
          </Section>

          {/* Buyer Info — auto-populated */}
          <Section title="Buyer Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Buyer Email">
                <Input type="email" value={form.buyer_email} onChange={e => set("buyer_email", e.target.value)} placeholder="buyer@email.com" />
              </Field>
              <Field label="Full Name">
                <Input value={form.buyer_name} onChange={e => set("buyer_name", e.target.value)} placeholder="Jane Smith" />
              </Field>
              <Field label="Phone">
                <Input value={form.buyer_phone} onChange={e => set("buyer_phone", e.target.value)} placeholder="+1 (555) 000-0000" />
              </Field>
              <Field label="Shipping Address">
                <Input value={form.buyer_address} onChange={e => set("buyer_address", e.target.value)} placeholder="Auto-filled from buyer profile" />
              </Field>
            </div>
            {form.buyer_email && !form.buyer_phone && !form.buyer_name && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <User className="w-3 h-3" />
                <span>Buyer profile info will auto-fill when you select an item with a known buyer.</span>
              </div>
            )}
          </Section>

          {/* Line Items */}
          <Section title="Line Items">
            <div className="space-y-3">
              {/* Base price */}
              <div className="flex items-center gap-3 bg-secondary/30 rounded-lg px-4 py-3">
                <div className="flex-1 text-sm font-medium">{form.item_title || "Item"}</div>
                <span className="text-xs text-muted-foreground w-20 text-center">Item</span>
                <Input
                  type="number" min="0"
                  value={form.item_price}
                  onChange={e => set("item_price", e.target.value)}
                  placeholder="0.00"
                  className="w-32 text-right"
                />
              </div>

              {/* Service fee row */}
              <div className="flex items-center gap-3 bg-secondary/20 rounded-lg px-4 py-3">
                <div className="flex-1 text-sm text-muted-foreground">
                  Platform Service Fee
                  <span className="text-xs ml-1 text-muted-foreground/70">(10% + $30)</span>
                </div>
                <span className="text-xs text-muted-foreground w-20 text-center">Fee</span>
                <span className="w-32 text-right text-sm font-medium">
                  ${liveServiceFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Fee credit row */}
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="flex-1 text-sm text-muted-foreground">Fee Credit Applied</div>
                <span className="text-xs text-muted-foreground w-20 text-center">Credit</span>
                <div className="w-32 flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">−$</span>
                  <Input
                    type="number" min="0"
                    value={form.fee_credit}
                    onChange={e => set("fee_credit", e.target.value)}
                    placeholder="0.00"
                    className="text-right flex-1"
                  />
                </div>
              </div>

              {/* Additional line items */}
              {form.additional_line_items.map((li, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Input
                    className="flex-1"
                    value={li.description}
                    onChange={e => updateLineItem(idx, "description", e.target.value)}
                    placeholder="e.g. NY State Tax 8.875%"
                  />
                  <select
                    value={li.type}
                    onChange={e => updateLineItem(idx, "type", e.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-28"
                  >
                    {LINE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <Input
                    type="number" min="0"
                    className="w-32 text-right"
                    value={li.amount}
                    onChange={e => updateLineItem(idx, "amount", e.target.value)}
                    placeholder="0.00"
                  />
                  <button onClick={() => removeLineItem(idx)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addLineItem} className="gap-2 text-xs">
                <Plus className="w-3 h-3" /> Add Line Item
              </Button>

              {/* Total */}
              <div className="border-t border-border pt-3 mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Final Invoice Total</span>
                  <span className="font-serif text-xl font-semibold text-primary">
                    ${liveTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Remaining due after upfront service fee payment</span>
                  <span className="font-medium text-foreground">
                    ${Math.max(0, liveTotal - liveServiceFee).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* Payment Instructions */}
          <Section title="Payment Instructions">
            <Textarea
              rows={3}
              value={form.payment_instructions}
              onChange={e => set("payment_instructions", e.target.value)}
              placeholder="e.g. Wire transfer to: Bank Name, Account #12345. Or PayPal: seller@email.com"
              className="text-sm"
            />
          </Section>

          {/* Terms */}
          <Section title="Terms & Conditions">
            <Textarea
              rows={3}
              value={form.terms_and_conditions}
              onChange={e => set("terms_and_conditions", e.target.value)}
              placeholder="e.g. Payment due within 7 days. All sales are final. Ships within 5 business days of cleared payment."
              className="text-sm"
            />
          </Section>

          {/* Notes */}
          <Section title="Notes (optional)">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Any additional notes for the buyer…"
              className="text-sm"
            />
          </Section>

          {/* Save as Template */}
          {showSaveTemplate ? (
            <div className="flex items-center gap-3 bg-secondary/30 rounded-lg px-4 py-3">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="Template name, e.g. Standard Sale"
                className="flex-1 text-sm"
              />
              <Button size="sm" variant="outline" onClick={() => { setShowSaveTemplate(false); setTemplateName(""); }}>Cancel</Button>
              <Button size="sm" onClick={() => saveTemplateMutation.mutate()} disabled={!templateName.trim() || saveTemplateMutation.isPending} className="gap-1">
                {saveTemplateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
            </div>
          ) : (
            <button onClick={() => setShowSaveTemplate(true)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
              <Save className="w-3 h-3" /> Save current settings as template
            </button>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {["draft", "sent", "paid", "shipped", "delivered", "disputed"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {editingId ? "Save Changes" : "Create Invoice"}
            </Button>
          </div>
        </div>
      )}

      {/* Templates list (collapsible) */}
      {templates.length > 0 && !showForm && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Saved Templates</p>
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{t.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{format(new Date(t.created_date), "MMM d, yyyy")}</span>
                  <button onClick={() => deleteTemplateMutation.mutate(t.id)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice List */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading invoices…</div>
      ) : invoices.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center space-y-2">
          <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="font-serif text-lg text-muted-foreground">No invoices yet</p>
          <p className="text-sm text-muted-foreground/60">Create your first invoice to send to a buyer.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item / Buyer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...invoices].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(inv => (
                <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium line-clamp-1">{inv.item_title || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{inv.buyer_name ? `${inv.buyer_name} · ` : ""}{inv.buyer_email}</p>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-muted-foreground text-xs">
                    {format(new Date(inv.created_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-4 font-price font-semibold text-primary">
                    ${Number(inv.total_amount ?? inv.item_price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={inv.status || "draft"}
                      onChange={e => statusMutation.mutate({ id: inv.id, status: e.target.value })}
                      className={`rounded-full text-xs font-medium px-2.5 py-1 border-0 cursor-pointer ${STATUS_STYLES[inv.status] || STATUS_STYLES.draft}`}
                    >
                      {["draft", "sent", "paid", "shipped", "delivered", "disputed"].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleEdit(inv)}>Edit</Button>
                      {inv.pdf_url ? (
                        <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs gap-1">
                            <Download className="w-3 h-3" /> PDF
                          </Button>
                        </a>
                      ) : (
                        <Button
                          variant="outline" size="sm" className="text-xs gap-1"
                          onClick={() => handleGeneratePdf(inv.id)}
                          disabled={generatingPdf === inv.id}
                        >
                          {generatingPdf === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                          Generate PDF
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}