import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

const checks = [
  { key: "photos", label: "Photos added" },
  { key: "title", label: "Title complete" },
  { key: "pricing", label: "Pricing complete" },
  { key: "description", label: "Description complete" },
  { key: "terms", label: "Terms complete" },
];

export default function ListingChecklist({ form }) {
  const status = {
    photos: form.images?.length > 0,
    title: !!form.title?.trim(),
    pricing: !!form.prisometer_start_price,
    description: !!form.description?.trim(),
    terms: !!form.terms_and_conditions?.trim(),
  };

  const done = Object.values(status).filter(Boolean).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Listing Completeness</h4>
        <span className={`text-xs font-bold ${pct === 100 ? "text-emerald-600" : "text-primary"}`}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-neutral-100 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-2">
        {checks.map(({ key, label }) => (
          <li key={key} className="flex items-center gap-2.5">
            {status[key]
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              : <Circle className="w-4 h-4 text-neutral-300 shrink-0" />
            }
            <span className={`text-xs ${status[key] ? "text-neutral-700" : "text-neutral-400"}`}>{label}</span>
          </li>
        ))}
      </ul>
      {pct === 100 && (
        <p className="mt-3 text-[11px] text-emerald-600 font-semibold bg-emerald-50 rounded-lg px-3 py-2">
          ✓ Ready to publish
        </p>
      )}
    </div>
  );
}