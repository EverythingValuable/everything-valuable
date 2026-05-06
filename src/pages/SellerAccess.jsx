import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, AlertCircle, Store } from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Under Review", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", icon: CheckCircle, color: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Not Approved", icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" },
  needs_more_info: { label: "More Info Needed", icon: AlertCircle, color: "bg-blue-50 text-blue-700 border-blue-200" },
};

export default function SellerAccess() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: "", business_name: "", email: "", phone: "", address: "",
    seller_type: "", business_website: "", specialty: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["my-seller-application", user?.email],
    queryFn: () => base44.entities.SellerApplication.filter({ user_email: user.email }, "-created_date", 1),
    enabled: !!user?.email,
  });

  const latestApp = applications[0];

  const submitMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke("submitSellerApplication", data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["my-seller-application"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => setError(err?.response?.data?.error || "Submission failed. Please try again."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.seller_type || !form.full_name) {
      setError("Please fill in your full name and seller type.");
      return;
    }
    submitMutation.mutate({ ...form, email: form.email || user?.email, full_name: form.full_name || user?.full_name });
  };

  // Already approved → redirect hint
  if (user?.role === "seller" || user?.seller_status === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-semibold mb-2">You're an Approved Seller</h2>
            <p className="text-muted-foreground mb-6">Your seller account is active. Access your dashboard below.</p>
            <Button onClick={() => window.location.href = "/seller"} className="w-full">Go to Seller Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(40,20%,97%)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7 text-primary" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-1">Seller Access</p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">Apply to Sell on Everything Valuable</h1>
          <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
            Seller access requires approval. Once approved, you'll be able to list items, manage inventory, and receive payments.
          </p>
        </div>

        {/* Existing application status */}
        {latestApp && !submitted && (
          <Card className="mb-8">
            <CardContent className="p-6">
              {(() => {
                const cfg = STATUS_CONFIG[latestApp.application_status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">Application {cfg.label}</p>
                        <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted {latestApp.submitted_at ? new Date(latestApp.submitted_at).toLocaleDateString() : "recently"}.
                        {latestApp.application_status === "pending" && " Our team typically reviews applications within 1–3 business days."}
                        {latestApp.application_status === "needs_more_info" && " An admin will contact you shortly for additional information."}
                        {latestApp.application_status === "rejected" && latestApp.rejection_reason && ` Reason: ${latestApp.rejection_reason}`}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Show form only if no pending application or if rejected (can reapply) */}
        {(!latestApp || latestApp?.application_status === "rejected") && !submitted && (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Seller Application</CardTitle>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Please sign in to apply as a seller.</p>
                  <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}>Sign In / Create Account</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Name *</label>
                      <Input value={form.full_name || user?.full_name || ""} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email *</label>
                      <Input value={form.email || user?.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Contact email" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Phone</label>
                      <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Business / Gallery Name</label>
                      <Input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Optional" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Seller Type *</label>
                      <Select value={form.seller_type} onValueChange={v => setForm(f => ({ ...f, seller_type: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="dealer">Dealer</SelectItem>
                          <SelectItem value="gallery">Gallery</SelectItem>
                          <SelectItem value="auction_house">Auction House</SelectItem>
                          <SelectItem value="estate">Estate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Website</label>
                      <Input value={form.business_website} onChange={e => setForm(f => ({ ...f, business_website: e.target.value }))} placeholder="https://" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Address</label>
                    <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="City, State" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Specialty / Categories</label>
                    <Input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Fine Art, Jewelry, Mid-Century Furniture" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tell Us About Yourself</label>
                    <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Brief background, what you sell, experience, etc." rows={4} />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? "Submitting…" : "Submit Application"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success state */}
        {submitted && (
          <Card className="text-center">
            <CardContent className="pt-10 pb-10">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-semibold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Thank you! We'll review your application and get back to you within 1–3 business days.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}