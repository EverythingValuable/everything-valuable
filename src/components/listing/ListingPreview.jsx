import React, { useState } from "react";
import { Monitor, Smartphone, LayoutGrid, MapPin, Tag, Gavel, Gem } from "lucide-react";

const CONDITION_LABELS = {
  excellent: "Excellent",
  very_good: "Very Good",
  good: "Good",
  fair: "Fair",
  as_is: "As Is",
};

function PlaceholderText({ text, className = "" }) {
  return <span className={`italic text-neutral-300 ${className}`}>{text}</span>;
}

// ── Full listing preview ──────────────────────────────────────────────────────
function FullPreview({ form }) {
  const [activeImg, setActiveImg] = useState(0);
  const hasImages = form.images?.length > 0;
  const hasEstimate = form.estimated_low || form.estimated_high;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm text-sm">
      {/* Image */}
      <div className="bg-neutral-100 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {hasImages ? (
          <img src={form.images[activeImg]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-300">
            <Gem className="w-8 h-8" />
            <span className="text-xs">Photos will appear here</span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasImages && form.images.length > 1 && (
        <div className="flex gap-1.5 px-4 pt-3 overflow-x-auto scrollbar-hide">
          {form.images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${i === activeImg ? "border-primary" : "border-transparent"}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title & estimate */}
        <div>
          <h2 className="font-serif text-xl font-semibold text-neutral-950 leading-tight">
            {form.title || <PlaceholderText text="Item title will appear here" />}
          </h2>
          {(form.maker || form.period) && (
            <p className="text-xs text-neutral-500 mt-1">
              {[form.maker, form.period].filter(Boolean).join(" · ")}
            </p>
          )}
          {hasEstimate && (
            <p className="mt-2 text-xs text-neutral-500">
              Estimate: <span className="font-semibold text-neutral-800">
                {form.estimated_low ? `$${Number(form.estimated_low).toLocaleString()}` : ""}
                {form.estimated_low && form.estimated_high ? " – " : ""}
                {form.estimated_high ? `$${Number(form.estimated_high).toLocaleString()}` : ""}
              </span>
            </p>
          )}
        </div>

        {/* Auction status strip */}
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">1stBid$ Preview</p>
              <p className="font-price text-2xl font-bold text-neutral-900 mt-0.5">
                {form.prisometer_start_price
                  ? `$${Number(form.prisometer_start_price).toLocaleString()}`
                  : <PlaceholderText text="$—" className="font-sans text-xl not-italic" />
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Duration</p>
              <p className="text-sm font-semibold text-neutral-700 mt-0.5">{form.first_bids_duration_hours / 24}d preview</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled className="flex-1 h-9 bg-primary text-white text-xs font-bold opacity-40 rounded-lg cursor-not-allowed">
              Place Preview Bid
            </button>
            <button disabled className="flex-1 h-9 border border-neutral-300 text-neutral-500 text-xs font-semibold opacity-40 rounded-lg cursor-not-allowed">
              Make It Mine™
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 text-center">Preview — buttons disabled in builder</p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {[
            ["Category", form.category?.replace(/_/g, " ")],
            ["Condition", CONDITION_LABELS[form.condition]],
            ["Materials", form.materials],
            ["Dimensions", form.dimensions],
            ["Origin", form.origin],
            ["Marks", form.marks],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <p className="text-neutral-400 font-semibold uppercase tracking-widest text-[9px]">{k}</p>
              <p className="text-neutral-800 mt-0.5 capitalize">{v}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {(form.short_description || form.description) && (
          <div className="border-t border-neutral-100 pt-4 space-y-2">
            {form.short_description && (
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">{form.short_description}</p>
            )}
            {form.description && (
              <p className="text-xs text-neutral-500 leading-relaxed line-clamp-4">{form.description}</p>
            )}
          </div>
        )}

        {/* Provenance */}
        {form.provenance && (
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Provenance</p>
            <p className="text-xs text-neutral-600 leading-relaxed">{form.provenance}</p>
          </div>
        )}

        {/* Condition notes */}
        {form.condition_notes && (
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Condition Report</p>
            <p className="text-xs text-neutral-600 leading-relaxed">{form.condition_notes}</p>
          </div>
        )}

        {/* Location */}
        {form.customer_location && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
            <MapPin className="w-3 h-3" />
            {form.customer_location}
          </div>
        )}

        {/* Terms */}
        {form.terms_and_conditions && (
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Seller Terms</p>
            <p className="text-xs text-neutral-500 leading-relaxed">{form.terms_and_conditions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mobile preview ────────────────────────────────────────────────────────────
function MobilePreview({ form }) {
  const hasImages = form.images?.length > 0;
  return (
    <div className="max-w-[320px] mx-auto bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden text-sm">
      <div className="bg-neutral-100 aspect-square flex items-center justify-center overflow-hidden">
        {hasImages
          ? <img src={form.images[0]} alt="" className="w-full h-full object-cover" />
          : <Gem className="w-8 h-8 text-neutral-300" />
        }
      </div>
      <div className="p-4 space-y-3">
        <h2 className="font-serif text-base font-semibold text-neutral-950 leading-tight">
          {form.title || <PlaceholderText text="Item title" />}
        </h2>
        {form.maker && <p className="text-xs text-neutral-400">{form.maker}</p>}
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Starting at</p>
          <p className="font-price text-xl font-bold text-neutral-900 mt-0.5">
            {form.prisometer_start_price ? `$${Number(form.prisometer_start_price).toLocaleString()}` : "—"}
          </p>
        </div>
        <button disabled className="w-full h-10 bg-primary text-white text-xs font-bold opacity-40 rounded-xl cursor-not-allowed">
          Place Preview Bid
        </button>
      </div>
    </div>
  );
}

// ── Search card preview ───────────────────────────────────────────────────────
function CardPreview({ form }) {
  const hasImages = form.images?.length > 0;
  return (
    <div className="max-w-[260px] mx-auto bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden text-sm">
      <div className="bg-neutral-100 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {hasImages
          ? <img src={form.images[0]} alt="" className="w-full h-full object-cover" />
          : <Gem className="w-6 h-6 text-neutral-300" />
        }
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/8 px-1.5 py-0.5 rounded">
            {form.category?.replace(/_/g, " ") || "Category"}
          </span>
        </div>
        <p className="font-serif text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
          {form.title || <PlaceholderText text="Item title" />}
        </p>
        {form.maker && <p className="text-[11px] text-neutral-400 mt-0.5">{form.maker}</p>}
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-[9px] text-neutral-400 uppercase tracking-widest">Starting</p>
            <p className="font-price text-base font-bold text-neutral-900">
              {form.prisometer_start_price ? `$${Number(form.prisometer_start_price).toLocaleString()}` : "—"}
            </p>
          </div>
          {(form.estimated_low || form.estimated_high) && (
            <div className="text-right">
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest">Est.</p>
              <p className="text-xs text-neutral-500">
                {form.estimated_low ? `$${Number(form.estimated_low).toLocaleString()}` : ""}
                {form.estimated_low && form.estimated_high ? "–" : ""}
                {form.estimated_high ? `$${Number(form.estimated_high).toLocaleString()}` : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "full", label: "Full Listing", icon: Monitor },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "card", label: "Search Card", icon: LayoutGrid },
];

export default function ListingPreview({ form }) {
  const [activeTab, setActiveTab] = useState("full");

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-neutral-100 rounded-xl p-1 shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === id
                ? "bg-white shadow-sm text-neutral-900"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "full" && <FullPreview form={form} />}
        {activeTab === "mobile" && <MobilePreview form={form} />}
        {activeTab === "card" && <CardPreview form={form} />}
      </div>
    </div>
  );
}