import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

export default function TermsAndConditions({ terms, isExpanded = false, onAgree = null }) {
  const [expanded, setExpanded] = useState(isExpanded);

  if (!terms) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Terms & Conditions</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          <div className="prose prose-sm max-w-none text-sm text-foreground leading-relaxed">
            <div className="whitespace-pre-wrap text-muted-foreground">{terms}</div>
          </div>

          {onAgree && (
            <div className="flex items-start gap-3 pt-2 border-t border-border">
              <input
                type="checkbox"
                id="agree-terms"
                onChange={(e) => onAgree(e.target.checked)}
                className="w-4 h-4 rounded border-border mt-0.5 cursor-pointer accent-primary"
              />
              <label htmlFor="agree-terms" className="text-xs text-muted-foreground cursor-pointer flex-1">
                I agree to the terms and conditions for this auction
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}