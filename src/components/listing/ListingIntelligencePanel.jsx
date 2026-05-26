import React from "react";
import { cn } from "@/lib/utils";
import { getListingStrength } from "@/lib/listingTaxonomy";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";

const CATEGORY_SUGGESTIONS = {
  fine_art: [
    "Add a photo of the signature",
    "Add a photo of the back",
    "Include frame condition",
    "Add dimensions sight and framed",
    "Specify medium and support",
  ],
  furniture: [
    "Add seat height to dimensions",
    "Add wood type if not specified",
    "Include underside or construction photo",
    "Add upholstery condition",
    "Note any restoration or repairs",
  ],
  jewelry: [
    "Add total weight in grams",
    "Add metal purity marks",
    "Include stone measurements",
    "Add photo of maker's mark",
    "Specify ring size if applicable",
  ],
  lighting: [
    "Add height and base dimensions",
    "Note shade condition separately",
    "Add photo of shade interior",
    "Include wiring condition",
    "Note if original hardware is present",
  ],
  ceramics_porcelain: [
    "Add photo of maker's mark",
    "Note any firing cracks or chips",
    "Add measurements height and diameter",
    "Include glaze condition notes",
    "Add photo of bottom",
  ],
  default: [
    "Add at least 3 clear photos",
    "Include dimensions and weight",
    "Add provenance if known",
    "Include detailed condition notes",
    "Add shipping information",
  ],
};

export default function ListingIntelligencePanel({ form, category }) {
  const { score, missing, checks } = getListingStrength(form, category);
  const suggestions = CATEGORY_SUGGESTIONS[category] || CATEGORY_SUGGESTIONS.default;

  const scoreColor = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-500" : "text-red-500";
  const scoreBg = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Listing Intelligence</p>
      </div>

      {/* Strength Score */}
      <div className="px-5 py-5 space-y-3 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-wide text-neutral-600">Listing Strength</p>
          <span className={cn("text-xl font-bold tabular-nums", scoreColor)}>{score}<span className="text-xs text-neutral-400">/100</span></span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", scoreBg)}
            style={{ width: `${score}%` }}
          />
        </div>
        {/* Field checks */}
        <div className="space-y-1.5 pt-1">
          {checks.map(c => {
            const passed = c.pass(form);
            return (
              <div key={c.key} className="flex items-center gap-2">
                {passed
                  ? <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                  : <Circle className="w-3 h-3 text-neutral-300 shrink-0" />}
                <span className={cn("text-[11px]", passed ? "text-neutral-500" : "text-neutral-400")}>{c.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Info */}
      {missing.length > 0 && (
        <div className="px-5 py-4 space-y-2 border-b border-neutral-100">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Missing Information</p>
          <div className="space-y-1.5">
            {missing.map(m => (
              <div key={m} className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[11px] text-neutral-500">Add {m.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">
          {category ? "Category Suggestions" : "Suggestions"}
        </p>
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
              <span className="text-[11px] text-neutral-500 leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}