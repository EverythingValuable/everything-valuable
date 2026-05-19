import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, SlidersHorizontal } from "lucide-react";

export default function AdvancedFiltersPanel({ onApply, onClose }) {
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [ownershipType, setOwnershipType] = useState("");
  const [condition, setCondition] = useState("");
  const [hasBids, setHasBids] = useState("");

  const handleApply = () => {
    onApply({ priceMin, priceMax, dateRange, ownershipType, condition, hasBids });
    onClose();
  };

  const handleReset = () => {
    setPriceMin(""); setPriceMax(""); setDateRange("");
    setOwnershipType(""); setCondition(""); setHasBids("");
    onApply({});
    onClose();
  };

  return (
    <div className="border border-border rounded-xl bg-white shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Advanced Filters</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Price range */}
        <div className="col-span-2 sm:col-span-1 md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Price Range</label>
          <div className="flex items-center gap-1.5">
            <Input
              placeholder="Min $"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              type="number"
              className="h-8 text-[12px]"
            />
            <span className="text-muted-foreground text-sm shrink-0">–</span>
            <Input
              placeholder="Max $"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              type="number"
              className="h-8 text-[12px]"
            />
          </div>
        </div>

        {/* Date listed */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Date Listed</label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-full h-8 border border-input bg-white rounded-md px-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Any time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Ownership */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Ownership</label>
          <select
            value={ownershipType}
            onChange={e => setOwnershipType(e.target.value)}
            className="w-full h-8 border border-input bg-white rounded-md px-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="owned">Owned</option>
            <option value="consignment">Consignment</option>
          </select>
        </div>

        {/* Condition */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Condition</label>
          <select
            value={condition}
            onChange={e => setCondition(e.target.value)}
            className="w-full h-8 border border-input bg-white rounded-md px-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="excellent">Excellent</option>
            <option value="very_good">Very Good</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="as_is">As Is</option>
          </select>
        </div>

        {/* Has Bids */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Bids</label>
          <select
            value={hasBids}
            onChange={e => setHasBids(e.target.value)}
            className="w-full h-8 border border-input bg-white rounded-md px-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="yes">Has Bids</option>
            <option value="no">No Bids</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-[12px] h-7">
          Reset All
        </Button>
        <Button size="sm" onClick={handleApply} className="text-[12px] h-7 bg-primary hover:bg-primary/90">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}