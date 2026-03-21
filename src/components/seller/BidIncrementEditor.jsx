import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

export default function BidIncrementEditor({ tiers, onChange }) {
  const [localTiers, setLocalTiers] = useState(tiers || [
    { min: 0, max: 1000, increment: 50 },
    { min: 1001, max: 5000, increment: 100 },
    { min: 5001, max: 999999999, increment: 250 },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...localTiers];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setLocalTiers(updated);
    onChange(updated);
  };

  const handleAdd = () => {
    const lastTier = localTiers[localTiers.length - 1];
    const newTier = {
      min: lastTier.max + 1,
      max: lastTier.max + 10000,
      increment: lastTier.increment,
    };
    const updated = [...localTiers, newTier];
    setLocalTiers(updated);
    onChange(updated);
  };

  const handleRemove = (index) => {
    if (localTiers.length > 1) {
      const updated = localTiers.filter((_, i) => i !== index);
      setLocalTiers(updated);
      onChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {localTiers.map((tier, idx) => (
          <div key={idx} className="flex gap-3 items-end pb-3 border-b border-border">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Min</label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={tier.min}
                  onChange={(e) => handleChange(idx, "min", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Max</label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={tier.max}
                  onChange={(e) => handleChange(idx, "max", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Increment</label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={tier.increment}
                  onChange={(e) => handleChange(idx, "increment", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(idx)}
              disabled={localTiers.length === 1}
              className="text-destructive hover:text-destructive/80 h-9 w-9"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={handleAdd}
        variant="outline"
        size="sm"
        className="w-full gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Tier
      </Button>
    </div>
  );
}