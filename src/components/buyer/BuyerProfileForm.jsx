import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Save, AlertTriangle, CreditCard } from "lucide-react";

export default function BuyerProfileForm({ user }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["buyer-profile", user?.email],
    queryFn: () => base44.entities.BuyerProfile.filter({ user_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (profile !== undefined) {
      setForm(profile ? {
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address_line1: profile.address_line1 || "",
        address_line2: profile.address_line2 || "",
        city: profile.city || "",
        state: profile.state || "",
        zip: profile.zip || "",
        country: profile.country || "United States",
        payment_method_label: profile.payment_method_label || "",
        payment_method_type: profile.payment_method_type || "card",
      } : {
        full_name: user?.full_name || "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        zip: "",
        country: "United States",
        payment_method_label: "",
        payment_method_type: "card",
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isComplete = !!(form.full_name && form.phone && form.address_line1 && form.city && form.state && form.zip && form.payment_method_label);
      const payload = { ...form, user_email: user.email, profile_complete: isComplete };
      if (profile?.id) {
        return base44.entities.BuyerProfile.update(profile.id, payload);
      }
      return base44.entities.BuyerProfile.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-profile", user?.email] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (!form) return <div className="text-sm text-muted-foreground py-4">Loading…</div>;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isComplete = !!(form.full_name && form.phone && form.address_line1 && form.city && form.state && form.zip && form.payment_method_label);

  return (
    <div className="space-y-6">
      {!isComplete && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Profile incomplete</p>
            <p className="text-xs text-amber-700 mt-0.5">Full name, phone, shipping address, and payment method are required before you can confirm a purchase.</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Information</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <Input value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Jane Smith" />
            </Field>
            <Field label="Phone Number *">
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipping Address</h4>
          <Field label="Address Line 1 *">
            <Input value={form.address_line1} onChange={e => set("address_line1", e.target.value)} placeholder="123 Main Street" />
          </Field>
          <Field label="Address Line 2">
            <Input value={form.address_line2} onChange={e => set("address_line2", e.target.value)} placeholder="Apt, Suite, Floor…" />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Field label="City *">
                <Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="New York" />
              </Field>
            </div>
            <Field label="State *">
              <Input value={form.state} onChange={e => set("state", e.target.value)} placeholder="NY" />
            </Field>
            <Field label="ZIP *">
              <Input value={form.zip} onChange={e => set("zip", e.target.value)} placeholder="10001" />
            </Field>
          </div>
          <Field label="Country">
            <Input value={form.country} onChange={e => set("country", e.target.value)} placeholder="United States" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Payment Type *">
              <select
                value={form.payment_method_type}
                onChange={e => set("payment_method_type", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="wire">Wire Transfer</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Payment Label *" hint="e.g. Visa ending 4242">
              <Input
                value={form.payment_method_label}
                onChange={e => set("payment_method_label", e.target.value)}
                placeholder={
                  form.payment_method_type === "card" ? "Visa ending 4242"
                  : form.payment_method_type === "paypal" ? "PayPal: you@email.com"
                  : form.payment_method_type === "wire" ? "Bank of America ****5678"
                  : "Payment method details"
                }
              />
            </Field>
          </div>
          <p className="text-xs text-muted-foreground">We store a reference label only — no actual card numbers are stored here.</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saveMutation.isPending ? "Saving…" : "Save Profile"}</>}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex gap-1">
        {label}
        {hint && <span className="text-xs text-muted-foreground font-normal">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}