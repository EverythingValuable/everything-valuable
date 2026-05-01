import React, { useState } from "react";
import { Truck, MapPin, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_ADDRESS = "50 Broadway, 12401, Kingston, United States";

export default function DeliveryOptions({ item }) {
  const [address, setAddress] = useState(DEMO_ADDRESS);
  const [editingAddress, setEditingAddress] = useState(false);
  const [draftAddress, setDraftAddress] = useState(DEMO_ADDRESS);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Delivery Options</span>
        </div>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Address row */}
        <div className="flex items-start justify-between gap-3">
          {editingAddress ? (
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={draftAddress}
                onChange={(e) => setDraftAddress(e.target.value)}
                className="w-full text-sm border border-input rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs px-3" onClick={() => { setAddress(draftAddress); setEditingAddress(false); }}>Save</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs px-3" onClick={() => setEditingAddress(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm font-semibold text-foreground leading-snug">{address}</span>
              </div>
              <button
                onClick={() => { setDraftAddress(address); setEditingAddress(true); }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
              >
                Modify
              </button>
            </>
          )}
        </div>

        {/* Seller shipping note */}
        {item?.shipping_notes ? (
          <p className="text-xs text-muted-foreground">{item.shipping_notes}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Shipping fees will be calculated by the seller after purchase.</p>
        )}

        {/* ThePackengers demo row */}
        <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-background">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-600">ThePackengers</span>
            <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">Demo</span>
          </div>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Estimated at $650
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground">* Shipping estimates are for reference only. Final shipping costs will be confirmed by the seller after purchase.</p>
      </div>
    </div>
  );
}