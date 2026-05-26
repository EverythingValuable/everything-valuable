import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { generateTitle } from "@/lib/listingTaxonomy";
import { RefreshCw, Pencil, AlertTriangle } from "lucide-react";

const MAX_CHARS = 65;

export default function GeneratedTitlePanel({ form, set, category }) {
  const [editMode, setEditMode] = useState(false);
  const [manualTitle, setManualTitle] = useState(form.title || "");

  const generated = generateTitle(form, category);

  // Auto-update title from fields when not in manual mode
  useEffect(() => {
    if (!editMode && generated) {
      set("title", generated);
      setManualTitle(generated);
    }
  }, [generated, editMode]);

  const handleManualChange = (val) => {
    setManualTitle(val);
    set("title", val);
  };

  const handleRegenerate = () => {
    setEditMode(false);
    set("title", generated);
    setManualTitle(generated);
  };

  const displayTitle = editMode ? manualTitle : (form.title || generated);
  const charCount = displayTitle?.length || 0;
  const isOverLimit = charCount > MAX_CHARS;
  const isTooShort = charCount < 15;

  const strength = charCount === 0 ? "empty"
    : isOverLimit ? "too_long"
    : charCount < 30 ? "weak"
    : charCount < 50 ? "good"
    : "strong";

  const strengthConfig = {
    empty: { label: "No Title", color: "text-neutral-300", bar: "bg-neutral-200", width: "w-0" },
    too_long: { label: "Too Long", color: "text-red-500", bar: "bg-red-400", width: "w-full" },
    weak: { label: "Weak", color: "text-amber-500", bar: "bg-amber-400", width: "w-1/3" },
    good: { label: "Good", color: "text-emerald-500", bar: "bg-emerald-400", width: "w-2/3" },
    strong: { label: "Strong", color: "text-emerald-600", bar: "bg-emerald-500", width: "w-full" },
  }[strength];

  // Derive chips from filled fields
  const chips = [
    form.signatureStatus && form.signatureStatus !== "Unsigned" ? form.signatureStatus : null,
    form.artist || form.maker || null,
    form.origin || null,
    form.style || null,
    form.medium ? `${form.medium}${form.support ? ` On ${form.support}` : ""}` : form.primaryMaterial || null,
    form.objectType || null,
  ].filter(Boolean);

  if (!form.objectType && !form.category) return null;

  return (
    <div className="border border-neutral-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Generated Listing Title</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRegenerate}
            className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Regenerate
          </button>
          <button
            type="button"
            onClick={() => setEditMode(v => !v)}
            className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <Pencil className="w-3 h-3" /> {editMode ? "Lock Title" : "Edit Manually"}
          </button>
        </div>
      </div>

      {/* Title Preview / Edit */}
      {editMode ? (
        <div className="space-y-1">
          <input
            autoFocus
            value={manualTitle}
            onChange={e => handleManualChange(e.target.value)}
            maxLength={80}
            className={cn(
              "w-full text-lg font-bold text-neutral-900 bg-transparent border-0 border-b pb-1 focus:outline-none transition-colors",
              isOverLimit ? "border-red-300 focus:border-red-500" : "border-neutral-300 focus:border-neutral-700"
            )}
          />
          <p className="text-[10px] text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Manual edits may reduce listing consistency. Keep titles under {MAX_CHARS} characters.
          </p>
        </div>
      ) : (
        <p className={cn(
          "text-lg font-bold leading-snug",
          displayTitle ? "text-neutral-900" : "text-neutral-300 italic"
        )}>
          {displayTitle || "Fill in details above to generate a title…"}
        </p>
      )}

      {/* Char count + strength */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wide text-neutral-500">Title Strength:</span>
            <span className={cn("text-[10px] font-bold tracking-wide", strengthConfig.color)}>{strengthConfig.label}</span>
          </div>
          <span className={cn("text-[10px] font-mono", isOverLimit ? "text-red-500 font-bold" : "text-neutral-400")}>
            {charCount} / {MAX_CHARS}
          </span>
        </div>
        <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-300", strengthConfig.bar, strengthConfig.width)} />
        </div>
      </div>

      {/* Field chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-neutral-50">
          {chips.map((chip, i) => (
            <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}