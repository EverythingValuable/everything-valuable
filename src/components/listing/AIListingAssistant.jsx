import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Circle, AlertCircle, Zap, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Listing Strength Score ────────────────────────────────────────────────────
function ListingStrength({ form }) {
  const checks = [
    { label: "Photos added",        done: form.images?.length > 0,              weight: 20 },
    { label: "Title complete",      done: !!form.title?.trim(),                  weight: 15 },
    { label: "Pricing set",         done: !!form.prisometer_start_price,         weight: 15 },
    { label: "Full description",    done: (form.description?.trim()?.length || 0) > 80, weight: 15 },
    { label: "Short summary",       done: !!form.short_description?.trim(),      weight: 10 },
    { label: "Condition set",       done: !!form.condition,                      weight: 10 },
    { label: "Category selected",   done: !!form.category,                       weight: 10 },
    { label: "Item location",       done: !!form.customer_location?.trim(),      weight: 5  },
  ];

  const score = checks.reduce((acc, c) => acc + (c.done ? c.weight : 0), 0);
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : "bg-primary";
  const textColor = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-primary";
  const label = score >= 80 ? "Strong" : score >= 50 ? "Good" : "Needs Work";

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Listing Strength</h4>
        <span className={cn("text-sm font-bold", textColor)}>{score}/100 · {label}</span>
      </div>
      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${score}%` }} />
      </div>
      <ul className="space-y-1.5">
        {checks.map(({ label, done, weight }) => (
          <li key={label} className="flex items-center gap-2">
            {done
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            }
            <span className={cn("text-xs flex-1", done ? "text-neutral-600" : "text-neutral-400")}>{label}</span>
            <span className="text-[10px] text-neutral-300 font-medium">+{weight}pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Buyer Confidence ──────────────────────────────────────────────────────────
function BuyerConfidence({ form }) {
  const missing = [];
  if (!form.images || form.images.length < 3) missing.push("Add at least 3 photos — buyers need multiple angles");
  if (!form.condition_notes?.trim()) missing.push("Add a condition report — buyers want to know about wear");
  if (!form.provenance?.trim()) missing.push("Add provenance info — increases trust and perceived value");
  if (!form.shipping_notes?.trim()) missing.push("Describe shipping — buyers want to know before bidding");
  if (!form.dimensions?.trim()) missing.push("Add dimensions — essential for furniture, art, and décor");
  if (!form.customer_location?.trim()) missing.push("Set item location — buyers factor this into shipping costs");

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Buyer Confidence</h4>
        {missing.length === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">Excellent</span>}
        {missing.length > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-auto">{missing.length} gaps</span>}
      </div>
      {missing.length === 0 ? (
        <p className="text-xs text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5">
          ✓ Buyers have everything they need to bid with confidence.
        </p>
      ) : (
        <ul className="space-y-2">
          {missing.map((m, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-neutral-500">{m}</span>
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

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-700">AI Listing Assistant</h4>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {!suggestions && !loading && (
            <div className="text-center space-y-3 py-2">
              <p className="text-xs text-neutral-400">
                {hasEnoughData
                  ? "Generate AI-powered improvements for your title, description, keywords, and condition note."
                  : "Fill in some details above (title, category, or description) to unlock AI suggestions."}
              </p>
              <Button
                size="sm"
                onClick={generate}
                disabled={!hasEnoughData}
                className="gap-2 bg-primary hover:bg-primary/90 text-xs w-full"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate AI Suggestions
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-neutral-400 animate-pulse">Analyzing your listing…</p>
            </div>
          )}

          {suggestions && !loading && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Suggested Title</p>
                <p className="text-sm font-serif text-neutral-800 bg-neutral-50 rounded-xl px-3 py-2.5 leading-snug">
                  {suggestions.title}
                </p>
                <Button size="sm" variant="outline" className="text-xs w-full border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => onApply("title", suggestions.title)}>
                  Use This Title
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Suggested Description</p>
                <p className="text-xs text-neutral-600 bg-neutral-50 rounded-xl px-3 py-2.5 leading-relaxed">
                  {suggestions.description}
                </p>
                <Button size="sm" variant="outline" className="text-xs w-full border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => onApply("description", suggestions.description)}>
                  Use This Description
                </Button>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">SEO Keywords</p>
                <p className="text-xs text-neutral-600 bg-neutral-50 rounded-xl px-3 py-2.5 leading-relaxed">
                  {suggestions.keywords}
                </p>
                <Button size="sm" variant="outline" className="text-xs w-full border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => onApply("keywords", suggestions.keywords)}>
                  Add Keywords
                </Button>
              </div>

              {/* Condition Note */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Condition Note</p>
                <p className="text-xs text-neutral-600 bg-neutral-50 rounded-xl px-3 py-2.5 leading-relaxed">
                  {suggestions.condition_note}
                </p>
                <Button size="sm" variant="outline" className="text-xs w-full border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => onApply("condition_notes", suggestions.condition_note)}>
                  Use Condition Note
                </Button>
              </div>

              {/* Regenerate */}
              <Button size="sm" variant="ghost" onClick={generate}
                className="text-xs w-full text-neutral-400 hover:text-neutral-600 gap-1.5">
                <RefreshCw className="w-3 h-3" /> Regenerate
              </Button>
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
    <div className="space-y-4">
      <ListingStrength form={form} />
      <BuyerConfidence form={form} />
      <SmartSuggestions form={form} onApply={onApply} />
    </div>
  );
}