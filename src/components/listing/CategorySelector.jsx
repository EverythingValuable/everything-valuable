import React from "react";
import { cn } from "@/lib/utils";
import { LISTING_CATEGORIES } from "@/lib/listingTaxonomy";

export default function CategorySelector({ value, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-neutral-400 mb-1">Step 01</p>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">What Are You Listing?</h2>
        <p className="text-sm text-neutral-500 mt-1.5">Choose a category to begin. This controls all fields, styles, and the listing title.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {LISTING_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={cn(
              "text-left p-4 border transition-all duration-150 group",
              value === cat.value
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white hover:border-neutral-500 hover:shadow-sm"
            )}
          >
            <div className="text-2xl mb-2 leading-none">{cat.icon}</div>
            <p className={cn("text-xs font-bold tracking-[0.1em] uppercase mb-1", value === cat.value ? "text-white" : "text-neutral-800")}>
              {cat.label}
            </p>
            <p className={cn("text-[10px] leading-relaxed line-clamp-2", value === cat.value ? "text-neutral-300" : "text-neutral-400")}>
              {cat.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}