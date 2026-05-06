import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Bell, Check } from "lucide-react";

export default function SetPriceAlertModal({ isOpen, onClose, item, user }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: existingAlert } = useQuery({
    queryKey: ["price-alert", item?.id, user?.email],
    queryFn: () =>
      base44.entities.PriceAlert.filter({
        item_id: item?.id,
        user_email: user?.email,
        status: "active"
      }).then(r => r[0]),
    enabled: !!item?.id && !!user?.email,
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.PriceAlert.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alert"] });
      setSubmitted(true);
      setTimeout(() => {
        setTargetPrice("");
        setSubmitted(false);
        onClose();
      }, 2000);
    },
  });

  const cancelAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.PriceAlert.delete(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alert"] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetPrice || parseFloat(targetPrice) <= 0) return;

    createAlertMutation.mutate({
      item_id: item.id,
      user_email: user.email,
      target_price: parseFloat(targetPrice),
      item_title: item.title,
      item_image_url: item.images?.[0] || "",
    });
  };

  const handleCancel = () => {
    if (existingAlert?.id) {
      cancelAlertMutation.mutate(existingAlert.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Price Alert
          </DialogTitle>
          <DialogDescription>
            Get notified when {item?.title} reaches your target price or when PRI$OMETER™ activates.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="flex justify-center">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <p className="font-medium text-foreground">Alert set!</p>
            <p className="text-sm text-muted-foreground">We'll email you when the price drops to ${parseFloat(targetPrice).toLocaleString("en-US")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Target Price</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter target price"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="flex-1"
                />
              </div>
              {item?.current_price && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Current price: ${item.current_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                You'll also be notified when PRI$OMETER™ activates on this item, regardless of your target price.
              </p>
            </div>

            {existingAlert ? (
              <div className="space-y-2">
                <Button type="submit" disabled={!targetPrice} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Update Alert
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={cancelAlertMutation.isPending}
                  className="w-full"
                >
                  Cancel Alert
                </Button>
              </div>
            ) : (
              <Button type="submit" disabled={!targetPrice} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Set Price Alert
              </Button>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}