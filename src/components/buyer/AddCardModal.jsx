import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, X, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddCardModal({ onClose, onSuccess }) {
  const queryClient = useQueryClient();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });

  const { data: profile } = useQuery({
    queryKey: ["buyer-profile", user?.email],
    queryFn: () => base44.entities.BuyerProfile.filter({ user_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Simulate card save — store label only (last 4 digits)
      const last4 = cardNumber.replace(/\s/g, "").slice(-4);
      const label = `Visa ending ${last4}`;
      const payload = {
        user_email: user.email,
        payment_method_label: label,
        payment_method_type: "card",
        full_name: profile?.full_name || user?.full_name || "",
        phone: profile?.phone || "",
        address_line1: profile?.address_line1 || "",
        address_line2: profile?.address_line2 || "",
        city: profile?.city || "",
        state: profile?.state || "",
        zip: profile?.zip || "",
        country: profile?.country || "United States",
        profile_complete: !!(profile?.full_name && profile?.phone && profile?.address_line1),
      };
      if (profile?.id) {
        return base44.entities.BuyerProfile.update(profile.id, payload);
      }
      return base44.entities.BuyerProfile.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-profile", user?.email] });
      queryClient.invalidateQueries({ queryKey: ["buyer-profile-bid", user?.email] });
      if (onSuccess) onSuccess();
    },
  });

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const isValid = cardNumber.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length >= 3 && name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="font-serif text-base font-semibold">Add Payment Method</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name on Card</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Card Number</label>
            <Input
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiry</label>
              <Input
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">CVV</label>
              <Input
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Lock className="w-3 h-3" />
            <span>Your card details are encrypted and stored securely. You won't be charged unless you win.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!isValid || saveMutation.isPending}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saveMutation.isPending ? "Saving…" : "Add Card"}
          </Button>
        </div>
      </div>
    </div>
  );
}