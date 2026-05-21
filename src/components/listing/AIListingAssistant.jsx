import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, CheckCircle2, Circle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Listing Strength Score ────────────────────────────────────────────────────
function ListingStrength({ form }) {
  const checks = [
    { label: "Photos added",      done: form.images?.length > 0,                       weight: 20 },
    { label: "Title complete",    done: !!form.title?.trim(),                           weight: 15 },
    { label: "Pricing set",       done: !!form.prisometer_start_price,                  weight: 15 },
    { label: "Full description",  done: (form.description?.trim()?.length || 0) > 80,  weight: 15 },
    { label: "Short summary",     done: !!form.short_description?.trim(),               weight: 10 },
    { label: "Condition set",     done: !!form.condition,                               weight: 10 },
    { label: "Category selected", done: !!form.category,                               weight: 10 },
    { label: "Item location",     done: !!form.customer_location?.trim(),               weight: 5  },
  ];

  const score = checks.reduce((acc, c) => acc + (c.done ? c.weight : 0), 0);
  const label = score >= 80 ? "Strong" : score >= 50 ? "Good" : "Needs Work";

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Listing Strength</h4>
        <span className="text-[11px] font-bold text-neutral-700 tabular-nums">{score}/100</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="w-full h-1 bg-neutral-100 overflow-hidden">
          <div
            className="h-full bg-neutral-800 transition-all duration-700 ease-out"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[10px] tracking-[0.12em] uppercase text-neutral-300">{label}</p>
      </div>

      <ul className="space-y-2 pt-1">
        {checks.map(({ label, done, weight }) => (
          <li key={label} className="flex items-center gap-2.5">
            {done
              ? <CheckCircle2 className="w-3 h-3 text-neutral-600 shrink-0" />
              : <Circle className="w-3 h-3 text-neutral-200 shrink-0" />
            }
            <span className={cn("text-[11px] flex-1 leading-none", done ? "text-neutral-600" : "text-neutral-300")}>
              {label}
            </span>
            <span className="text-[10px] text-neutral-200 tabular-nums font-mono">+{weight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Buyer Confidence ──────────────────────────────────────────────────────────
function BuyerConfidence({ form }) {
  const missing = [];
  if (!form.images || form.images.length < 3)  missing.push("Add at least 3 photos — buyers need multiple angles");
  if (!form.condition_notes?.trim())            missing.push("Add a condition report — buyers want to know about wear");
  if (!form.provenance?.trim())                 missing.push("Provenance increases trust and perceived value");
  if (!form.shipping_notes?.trim())             missing.push("Describe shipping before buyers have to ask");
  if (!form.dimensions?.trim())                 missing.push("Dimensions are essential for furniture, art & décor");
  if (!form.customer_location?.trim())          missing.push("Set item location — factors into shipping estimates");

  return (
    <div className="p-5 space-y-3 border-t border-neutral-100">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Buyer Confidence</h4>
        <span className="text-[10px] tracking-[0.12em] uppercase text-neutral-300">
          {missing.length === 0 ? "✓ Complete" : `${missing.length} gaps`}
        </span>
      </div>
      {missing.length === 0 ? (
        <p className="text-[11px] text-neutral-400 leading-relaxed">Buyers have everything they need to bid with confidence.</p>
      ) : (
        <ul className="space-y-2">
          {missing.map((m, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertCircle className="w-3 h-3 text-neutral-300 shrink-0 mt-0.5" />
              <span className="text-[11px] text-neutral-400 leading-snug">{m}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── AI Smart Suggestions ──────────────────────────────────────────────────────
function SmartSuggestions({ form, onApply }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const hasEnoughData = form.title?.trim() || form.description?.trim() || form.category;

  const generate = async () => {
    if (!hasEnoughData) return;
    setLoading(true);
    setSuggestions(null);
    try {
      const prompt = `You are an expert auction house copywriter. A seller is listing an item with the following details:

Title: ${form.title || "(none)"}
Category: ${form.category || "(none)"}
Subcategory: ${form.subcategory || "(none)"}
Description: ${form.description || "(none)"}
Condition: ${form.condition || "(none)"}
Maker: ${form.maker || "(none)"}
Period: ${form.period || "(none)"}
Materials: ${form.materials || "(none)"}
Dimensions: ${form.dimensions || "(none)"}

Generate:
1. An improved auction title (max 80 chars, lead with maker/artist if known)
2. A compelling full description (3–5 sentences, include style, context, significance)
3. 5–8 SEO keywords (comma-separated, relevant to the item)
4. A brief condition note (1–2 sentences, professional auction-house tone)

Return as JSON with keys: title, description, keywords, condition_note`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            keywords: { type: "string" },
            condition_note: { type: "string" },
          }
        }
      });
      setSuggestions(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const ITEMS = [
    { key: "title",  label: "Title",          value: suggestions?.title,          applyKey: "title",           applyLabel: "Use Title" },
    { key: "desc",   label: "Description",    value: suggestions?.description,    applyKey: "description",     applyLabel: "Use Description" },
    { key: "kw",     label: "SEO Keywords",   value: suggestions?.keywords,       applyKey: "keywords",        applyLabel: "Add Keywords" },
    { key: "cond",   label: "Condition Note", value: suggestions?.condition_note, applyKey: "condition_notes", applyLabel: "Use Note" },
  ];

  return (
    <div className="border-t border-neutral-100 overflow-hidden">
      <button
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-neutral-500" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">AI Assistant</span>
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-neutral-300" />
          : <ChevronDown className="w-3.5 h-3.5 text-neutral-300" />
        }
      </button>

      {expanded && (
        <div className="px-5 pb-6 pt-1 space-y-5">
          {!suggestions && !loading && (
            <div className="space-y-4">
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {hasEnoughData
                  ? "Generate AI-powered improvements for your title, description, keywords and condition note."
                  : "Add some listing details above to unlock AI suggestions."}
              </p>
              <button
                onClick={generate}
                disabled={!hasEnoughData}
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase h-10 transition-colors disabled:opacity-30"
              >
                <Sparkles className="w-3 h-3" />
                Generate Suggestions
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-5 h-5 border border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
              <p className="text-[10px] text-neutral-300 tracking-[0.2em] uppercase animate-pulse">Analyzing…</p>
            </div>
          )}

          {suggestions && !loading && (
            <div className="space-y-0">
              {ITEMS.map(({ key, label, value, applyKey, applyLabel }) => (
                <div key={key} className="border-b border-neutral-50 py-4 last:border-0 space-y-2">
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-300">{label}</p>
                  <p className="text-[11px] text-neutral-600 leading-relaxed bg-neutral-50 px-3 py-2.5">{value}</p>
                  <button
                    onClick={() => onApply(applyKey, value)}
                    className="text-[10px] font-bold tracking-[0.15em] uppercase border border-neutral-200 px-3 py-1.5 text-neutral-500 hover:border-neutral-800 hover:text-neutral-800 transition-colors"
                  >
                    {applyLabel}
                  </button>
                </div>
              ))}

              <button
                onClick={generate}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] text-neutral-300 hover:text-neutral-600 tracking-[0.15em] uppercase transition-colors pt-3"
              >
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function AIListingAssistant({ form, onApply }) {
  return (
    <div>
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-300">Listing Quality</h3>
      </div>
      <ListingStrength form={form} />
      <BuyerConfidence form={form} />
      <SmartSuggestions form={form} onApply={onApply} />
    </div>
  );
}