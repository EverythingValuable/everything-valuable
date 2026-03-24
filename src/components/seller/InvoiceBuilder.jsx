import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, FileText, Send, Download, ExternalLink,
  ChevronDown, ChevronUp, Loader2
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

function calcTotal(itemPrice, extras) {
  const base = Number(itemPrice) || 0;
  const extra = (extras || []).reduce((s, li) => {
    const amt = Number(li.amount) || 0;
    return li.type === "discount" ? s - amt : s + amt;
  }, 0);
  return base + extra;
}

export default function InvoiceBuilder({ user }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(null);
  const [form, setForm] = useState(defaultForm());

  function defaultForm() {
    return {
      item_id: "",
      item_title: "",
      buyer_email: "",
      buyer_name: "",
      item_price: "",
      additional_line_items: [],
      payment_instructions: "",
      terms_and_conditions: "",
      notes: "",
      status: "draft",
    };
  }

  const { data: soldItems = [] } = useQuery({
    queryKey: ["seller-sold-items", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: profile } = useQuery({
    queryKey: ["seller-profile", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email,
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["seller-invoices", user?.email],
    queryFn: () => base44.entities.Invoice.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  // Pre-fill defaults from seller profile
  useEffect(() => {
    if (profile && !editingId) {
      setForm(f => ({
        ...f,
        payment_instructions: f.payment_instructions || profile.payment_instructions || "",
        terms_and_conditions: f.terms_and_conditions || profile.terms_and_conditions || "",
      }));
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const total = calcTotal(form.item_price, form.additional_line_items);
      const payload = {
        ...form,
        seller_email: user.email,
        item_price: Number(form.item_price) || 0,
        total_amount: total,
        purchase_method: form.purchase_method || "manual",
      };
      if (editingId) {
        return base44.entities.Invoice.update(editingId, payload);
      }
      return base44.entities.Invoice.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-invoices", user?.email] });
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm());
      toast({ title: editingId ? "Invoice updated" : "Invoice created" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Invoice.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-invoices", user?.email] }),
  });

  const handleEdit = (inv) => {
    setEditingId(inv.id);
    setForm({
      item_id: inv.item_id || "",
      item_title: inv.item_title || "",
      buyer_email: inv.buyer_email || "",
      buyer_name: inv.buyer_name || "",
      item_price: inv.item_price ?? "",
      additional_line_items: inv.additional_line_items || [],
      payment_instructions: inv.payment_instructions || "",
      terms_and_conditions: inv.terms_and_conditions || "",
      notes: inv.notes || "",
      status: inv.status || "draft",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemSelect = (itemId) => {
    const item = soldItems.find(i => i.id === itemId);
    setForm(f => ({
      ...f,
      item_id: itemId,
      item_title: item?.title || "",
      item_price: item?.sold_price || item?.current_price || item?.prisometer_start_price || f.item_price,
      buyer_email: item?.sold_to_email || item?.highest_bidder_email || f.buyer_email,
    }));
  };

  const addLineItem = () => {
    setForm(f => ({
      ...f,
      additional_line_items: [...f.additional_line_items, { description: "", amount: "", type: "tax" }],
    }));
  };

  const updateLineItem = (idx, key, val) => {
    setForm(f => {
      const updated = [...f.additional_line_items];
      updated[idx] = { ...updated[idx], [key]: val };
      return { ...f, additional_line_items: updated };
    });
  };

  const removeLineItem = (idx) => {
    setForm(f => ({ ...f, additional_line_items: f.additional_line_items.filter((_, i) => i !== idx) }));
  };

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

  const total = calcTotal(form.item_price, form.additional_line_items);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold">Invoices</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Create and send invoices to buyers with custom payment terms.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setEditingId(null); setForm(defaultForm()); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        )}
      </div>

      {/* Invoice Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">{editingId ? "Edit Invoice" : "Create Invoice"}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground text-sm">Cancel</button>
          </div>

          {/* Link to item */}
          <Section title="Item">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Select Listed Item (optional)">
                <select
                  value={form.item_id}
                  onChange={e => handleItemSelect(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">— Manual entry —</option>
                  {soldItems.map(item => (
                    <option key={item.id} value={item.id}>{item.title} ({item.status})</option>
                  ))}
                </select>
              </Field>
              <Field label="Item Title">
                <Input value={form.item_title} onChange={e => setForm(f => ({ ...f, item_title: e.target.value }))} placeholder="e.g. Vintage Oil Painting" />
              </Field>
            </div>
          </Section>

          {/* Buyer */}
          <Section title="Buyer">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Buyer Email">
                <Input type="email" value={form.buyer_email} onChange={e => setForm(f => ({ ...f, buyer_email: e.target.value }))} placeholder="buyer@email.com" />
              </Field>
              <Field label="Buyer Name (optional)">
                <Input value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))} placeholder="Full name" />
              </Field>
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Line Items">
            <div className="space-y-3">
              {/* Base item price */}
              <div className="flex items-center gap-3 bg-secondary/30 rounded-lg px-4 py-3">
                <div className="flex-1 text-sm font-medium">{form.item_title || "Item"}</div>
                <div className="text-xs text-muted-foreground">Item</div>
                <div className="w-32">
                  <Input
                    type="number"
                    min="0"
                    value={form.item_price}
                    onChange={e => setForm(f => ({ ...f, item_price: e.target.value }))}
                    placeholder="0.00"
                    className="text-right"
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
                    placeholder="Description (e.g. NY State Tax 8.875%)"
                  />
                  <select
                    value={li.type}
                    onChange={e => updateLineItem(idx, "type", e.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-28"
                  >
                    {LINE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <Input
                    type="number"
                    min="0"
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
              <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
                <span className="font-semibold text-sm">Total Due</span>
                <span className="font-serif text-xl font-semibold text-primary">
                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </Section>

          {/* Payment & Terms */}
          <Section title="Payment Instructions">
            <Textarea
              rows={3}
              value={form.payment_instructions}
              onChange={e => setForm(f => ({ ...f, payment_instructions: e.target.value }))}
              placeholder="e.g. Wire transfer to: Bank Name, Account #12345, Routing #67890. Or PayPal: seller@email.com"
              className="text-sm"
            />
          </Section>

          <Section title="Terms & Conditions">
            <Textarea
              rows={3}
              value={form.terms_and_conditions}
              onChange={e => setForm(f => ({ ...f, terms_and_conditions: e.target.value }))}
              placeholder="e.g. Payment due within 7 days of invoice date. All sales are final. Item ships within 5 business days of cleared payment."
              className="text-sm"
            />
          </Section>

          <Section title="Notes (optional)">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional notes for the buyer…"
              className="text-sm"
            />
          </Section>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
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
              {invoices.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(inv => (
                <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium line-clamp-1">{inv.item_title || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{inv.buyer_email}</p>
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
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
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