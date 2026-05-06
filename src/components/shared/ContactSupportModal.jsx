import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, HeadphonesIcon } from "lucide-react";

const CATEGORIES = [
  { value: "bidding_issue", label: "Bidding Issue" },
  { value: "prisometer_issue", label: "PRI$OMETER Issue" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "invoice_issue", label: "Invoice Issue" },
  { value: "shipping_pickup", label: "Shipping / Pickup" },
  { value: "dispute", label: "Dispute" },
  { value: "seller_application", label: "Seller Application" },
  { value: "login_access", label: "Login / Access" },
  { value: "technical", label: "Technical Problem" },
  { value: "other", label: "Other" },
];

export default function ContactSupportModal({ open, onClose, user, defaultCategory }) {
  const [form, setForm] = useState({
    category: defaultCategory || "",
    subject: "",
    description: "",
  });
  const [done, setDone] = useState(false);

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.SupportTicket.create({
      user_email: user?.email || "",
      user_name: user?.full_name || "",
      category: form.category,
      subject: form.subject,
      description: form.description,
      status: "open",
      priority: "medium",
    }),
    onSuccess: () => setDone(true),
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => { setDone(false); setForm({ category: defaultCategory || "", subject: "", description: "" }); }, 300);
  };

  const valid = form.category && form.subject.trim() && form.description.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <HeadphonesIcon className="w-5 h-5 text-primary" /> Contact Support
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-semibold mb-1">Ticket Submitted</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Our team will review your message and get back to you within 1–2 business days.
            </p>
            <Button className="mt-5" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Category *</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Subject *</label>
              <Input
                placeholder="Brief summary of your issue"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Description *</label>
              <Textarea
                placeholder="Please describe your issue in detail…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                className="flex-1"
                disabled={!valid || submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                {submitMutation.isPending ? "Submitting…" : "Submit Ticket"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}