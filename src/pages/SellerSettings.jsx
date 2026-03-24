import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import BidIncrementEditor from "@/components/seller/BidIncrementEditor";
import { Save } from "lucide-react";

export default function SellerSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: sellerProfile, isLoading } = useQuery({
    queryKey: ["sellerProfile", user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.SellerProfile.filter({ user_email: user.email }).then((p) => p[0])
        : null,
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (sellerProfile) {
      setProfile(sellerProfile);
      setFormData({
        display_name: sellerProfile.display_name || "",
        legal_name: sellerProfile.legal_name || "",
        terms_and_conditions: sellerProfile.terms_and_conditions || "",
        payment_instructions: sellerProfile.payment_instructions || "",
        notes: sellerProfile.notes || "",
        shipping_info: sellerProfile.shipping_info || "",
        bid_increment_tiers: sellerProfile.bid_increment_tiers || [
          { min: 0, max: 1000, increment: 50 },
          { min: 1001, max: 5000, increment: 100 },
          { min: 5001, max: 999999999, increment: 250 },
        ],
      });
    }
  }, [sellerProfile]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        await base44.entities.SellerProfile.update(profile.id, data);
      } else {
        await base44.entities.SellerProfile.create({
          user_email: user.email,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerProfile", user?.email] });
      setIsDirty(false);
      toast({ title: "Saved", description: "Your settings have been updated." });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleBidTiersChange = (tiers) => {
    setFormData((prev) => ({ ...prev, bid_increment_tiers: tiers }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    await updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Seller Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your auction terms, bidding rules, and seller information.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="bidding">Bidding Increments</TabsTrigger>
          <TabsTrigger value="terms">Invoice Defaults</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Display Name</label>
              <Input
                value={formData.display_name || ""}
                onChange={(e) => handleFieldChange("display_name", e.target.value)}
                placeholder="How you appear to buyers"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Legal Name</label>
              <Input
                value={formData.legal_name || ""}
                onChange={(e) => handleFieldChange("legal_name", e.target.value)}
                placeholder="Full legal name"
              />
            </div>
          </div>
        </TabsContent>

        {/* Bidding Tab */}
        <TabsContent value="bidding" className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="font-serif text-lg font-semibold mb-2">Bid Increment Tiers</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Set different bid increments for different price ranges. This ensures bidding pace matches the item value.
              </p>
            </div>
            <BidIncrementEditor
              tiers={formData.bid_increment_tiers}
              onChange={handleBidTiersChange}
            />
            <p className="text-xs text-muted-foreground italic">
              Example: An item at $500 will require $50 increments (first tier). At $3,000, increments jump to $100 (second tier).
            </p>
          </div>
        </TabsContent>

        {/* Terms & Shipping Tab */}
        <TabsContent value="terms" className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="font-serif text-lg font-semibold mb-3">Terms & Conditions of Sale</h3>
              <p className="text-xs text-muted-foreground mb-3">
                These terms will be displayed on item listings and cannot be changed once an auction is live.
              </p>
              <Textarea
                value={formData.terms_and_conditions || ""}
                onChange={(e) => handleFieldChange("terms_and_conditions", e.target.value)}
                placeholder="Enter your terms and conditions of sale..."
                className="min-h-[150px]"
              />
            </div>
            <Separator />
            <div>
              <h3 className="font-serif text-lg font-semibold mb-3">Shipping Information</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Default shipping details for all items. These are locked once an auction begins.
              </p>
              <Textarea
                value={formData.shipping_info || ""}
                onChange={(e) => handleFieldChange("shipping_info", e.target.value)}
                placeholder="Enter your shipping information..."
                className="min-h-[150px]"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isDirty || updateMutation.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}