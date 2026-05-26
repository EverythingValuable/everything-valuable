import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { OBJECT_TYPES } from "@/lib/listingTaxonomy";

export default function ObjectTypePicker({ category, value, onChange }) {
  const [search, setSearch] = useState("");
  const types = OBJECT_TYPES[category] || OBJECT_TYPES.other;
  const filtered = search
    ? types.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    : types;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-neutral-400 mb-1">Step 02</p>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">What Type Of Item Is It?</h2>
        <p className="text-sm text-neutral-500 mt-1">This determines the title structure and recommended fields.</p>
      </div>
      <input
        type="text"
        placeholder="Search types…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full h-10 border-0 border-b border-neutral-200 bg-transparent text-sm focus:outline-none focus:border-neutral-600 text-neutral-800 placeholder:text-neutral-300 transition-colors"
      />
      <div className="flex flex-wrap gap-2">
        {filtered.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "px-4 py-2 text-xs font-semibold tracking-[0.08em] border transition-all duration-150",
              value === type
                ? "bg-neutral-900 border-neutral-900 text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-500 hover:text-neutral-900"
            )}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}