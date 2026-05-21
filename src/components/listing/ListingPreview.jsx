import React, { useState } from "react";
import { Monitor, Smartphone, LayoutGrid, MapPin, ChevronDown, ChevronUp, Gavel, ShoppingBag, Heart, Share2, Bell } from "lucide-react";

const CONDITION_LABELS = {
  excellent: "Excellent", very_good: "Very Good", good: "Good", fair: "Fair", as_is: "As Is",
};

const CATEGORY_LABELS = {
  fine_art: "Fine Art", decorative_art: "Decorative Art", jewelry: "Jewelry",
  asian_antiques: "Asian Antiques", fashion_accessories: "Fashion & Accessories",
  watches_clocks: "Watches & Clocks", furniture: "Furniture",
  collectibles: "Collectibles", other: "Other",
};

function Placeholder({ text, className = "" }) {
  return <span className={`italic text-neutral-300 ${className}`}>{text}</span>;
}

function CollapsibleRow({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-neutral-100">
      <button
        className="w-full flex items-center justify-between py-3 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{title}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-neutral-300" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-300" />}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

// ── Full listing preview — matches actual ProductDetail layout ────────────────
function FullPreview({ form }) {
  const [activeImg, setActiveImg] = useState(0);
  const hasImages = form.images?.length > 0;
  const hasEstimate = form.estimated_low || form.estimated_high;
  const categoryLabel = CATEGORY_LABELS[form.category] || form.category?.replace(/_/g, " ");
  const conditionLabel = CONDITION_LABELS[form.condition];
  const hasDetails = form.period || form.materials || form.origin;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm text-sm">
      {/* Gallery */}
      <div className="bg-neutral-50 aspect-[4/3] flex items-center justify-center overflow-hidden relative">
        {hasImages ? (
          <img src={form.images[activeImg]} alt="" className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-300">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-neutral-300" />
            </div>
            <span className="text-xs">Photos will appear here</span>
          </div>
        )}
        {/* First image badge */}
        {hasImages && (
          <div className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            Cover
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasImages && form.images.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-2 overflow-x-auto scrollbar-hide border-b border-neutral-100 pb-2">
          {form.images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`shrink-0 w-10 h-10 rounded overflow-hidden border-2 transition-all ${i === activeImg ? "border-primary" : "border-transparent opacity-60"}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Category badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoryLabel && (
            <span className="text-[10px] font-bold uppercase tracking-widest border border-neutral-200 text-neutral-500 px-2 py-0.5 rounded">
              {categoryLabel}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
            1stBid$™ Preview
          </span>
        </div>

        {/* Title + seller */}
        <div>
          <h2 className="font-serif text-lg font-bold text-neutral-950 leading-tight">
            {form.title || <Placeholder text="Item title will appear here" />}
          </h2>
          {form.maker && <p className="text-xs text-neutral-500 mt-0.5">{form.maker}{form.period ? ` · ${form.period}` : ""}</p>}
          <p className="text-xs text-neutral-400 mt-0.5">Offered by <span className="font-medium text-neutral-600">Your Seller Name</span></p>
        </div>

        {/* Price Convergence block */}
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Starting Price</p>
              <p className="font-price text-2xl font-bold text-neutral-900 mt-0.5 tabular-nums">
                {form.prisometer_start_price
                  ? `$${Number(form.prisometer_start_price).toLocaleString()}`
                  : <Placeholder text="$—" className="font-sans text-xl not-italic" />
                }
              </p>
            </div>
            {hasEstimate && (
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Estimate</p>
                <p className="text-xs font-medium text-neutral-600 mt-0.5">
                  {form.estimated_low ? `$${Number(form.estimated_low).toLocaleString()}` : ""}
                  {form.estimated_low && form.estimated_high ? " – " : ""}
                  {form.estimated_high ? `$${Number(form.estimated_high).toLocaleString()}` : ""}
                </p>
              </div>
            )}
          </div>
          <div className="text-[10px] text-neutral-400 text-center">
            Preview phase — {form.first_bids_duration_hours ? `${form.first_bids_duration_hours / 24}d` : "—"} duration
          </div>
        </div>

        {/* Bid panel mockup */}
        <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Place a Bid</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {["—", "—", "—"].map((_, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg py-2 text-center text-xs text-neutral-300 font-semibold bg-neutral-50">
                Bid {i + 1}
              </div>
            ))}
          </div>
          <button disabled className="w-full h-9 bg-neutral-800 text-white text-xs font-bold opacity-30 rounded-lg cursor-not-allowed">
            Place Bid
          </button>
        </div>

        {/* Make It Mine */}
        <button disabled className="w-full h-10 bg-primary text-white text-xs font-bold opacity-30 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5" /> Make It Mine™
        </button>

        {/* Save + Share + Alert */}
        <div className="flex gap-2">
          <button disabled className="flex-1 h-9 border border-neutral-200 rounded-lg text-xs text-neutral-400 flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
            <Heart className="w-3 h-3" /> Save
          </button>
          <button disabled className="flex-1 h-9 border border-neutral-200 rounded-lg text-xs text-neutral-400 flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
        <button disabled className="w-full h-9 border border-neutral-200 rounded-lg text-xs text-neutral-400 flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed">
          <Bell className="w-3 h-3" /> 🔔 Price Alert
        </button>

        <p className="text-[9px] text-neutral-300 text-center">Buttons disabled in builder preview</p>

        {/* Collapsible sections — matches actual buyer view */}
        {form.description && (
          <CollapsibleRow title="About This Lot" defaultOpen={true}>
            <p className="text-xs text-neutral-600 leading-relaxed line-clamp-4">{form.description}</p>
          </CollapsibleRow>
        )}
        {form.dimensions && (
          <CollapsibleRow title="Dimensions" defaultOpen={true}>
            <p className="text-xs text-neutral-500">{form.dimensions}</p>
          </CollapsibleRow>
        )}
        {form.condition && (
          <CollapsibleRow title="Condition" defaultOpen={false}>
            <p className="text-xs text-neutral-500">{conditionLabel || form.condition}</p>
          </CollapsibleRow>
        )}
        {hasDetails && (
          <CollapsibleRow title="Details" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {form.period && <div><p className="text-[9px] font-bold text-neutral-400 mb-0.5">Period</p><p className="text-xs text-neutral-600">{form.period}</p></div>}
              {form.materials && <div><p className="text-[9px] font-bold text-neutral-400 mb-0.5">Materials</p><p className="text-xs text-neutral-600">{form.materials}</p></div>}
              {form.origin && <div><p className="text-[9px] font-bold text-neutral-400 mb-0.5">Origin</p><p className="text-xs text-neutral-600">{form.origin}</p></div>}
              {form.marks && <div><p className="text-[9px] font-bold text-neutral-400 mb-0.5">Marks</p><p className="text-xs text-neutral-600">{form.marks}</p></div>}
            </div>
          </CollapsibleRow>
        )}
        {form.provenance && (
          <CollapsibleRow title="Provenance" defaultOpen={false}>
            <p className="text-xs text-neutral-500 leading-relaxed">{form.provenance}</p>
          </CollapsibleRow>
        )}
        {form.condition_notes && (
          <CollapsibleRow title="Condition Report" defaultOpen={false}>
            <p className="text-xs text-neutral-500 leading-relaxed">{form.condition_notes}</p>
          </CollapsibleRow>
        )}
        {form.shipping_notes && (
          <CollapsibleRow title="Shipping" defaultOpen={false}>
            <p className="text-xs text-neutral-500 leading-relaxed">{form.shipping_notes}</p>
          </CollapsibleRow>
        )}
        {form.customer_location && (
          <div className="border-t border-neutral-100 pt-3 flex items-center gap-1.5 text-xs text-neutral-400">
            <MapPin className="w-3 h-3" /> {form.customer_location}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Search card preview ───────────────────────────────────────────────────────
function CardPreview({ form }) {
  const hasImages = form.images?.length > 0;
  const categoryLabel = CATEGORY_LABELS[form.category] || form.category?.replace(/_/g, " ");
  return (
    <div className="max-w-[240px] mx-auto bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden text-sm">
      <div className="bg-neutral-100 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {hasImages
          ? <img src={form.images[0]} alt="" className="w-full h-full object-cover" />
          : <LayoutGrid className="w-6 h-6 text-neutral-300" />
        }
      </div>
      <div className="p-3 space-y-1.5">
        {categoryLabel && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/8 px-1.5 py-0.5 rounded">
            {categoryLabel}
          </span>
        )}
        <p className="font-serif text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
          {form.title || <Placeholder text="Item title" />}
        </p>
        {form.maker && <p className="text-[11px] text-neutral-400">{form.maker}</p>}
        <div className="flex items-end justify-between pt-1">
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

// ── Mobile preview ────────────────────────────────────────────────────────────
function MobilePreview({ form }) {
  const hasImages = form.images?.length > 0;
  return (
    <div className="max-w-[300px] mx-auto bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden text-sm">
      <div className="bg-neutral-100 aspect-square flex items-center justify-center overflow-hidden">
        {hasImages
          ? <img src={form.images[0]} alt="" className="w-full h-full object-cover" />
          : <LayoutGrid className="w-8 h-8 text-neutral-300" />
        }
      </div>
      <div className="p-4 space-y-3">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">1stBid$™ Preview</span>
        </div>
        <h2 className="font-serif text-base font-semibold text-neutral-950 leading-tight">
          {form.title || <Placeholder text="Item title" />}
        </h2>
        {form.maker && <p className="text-xs text-neutral-400">{form.maker}</p>}
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Starting at</p>
          <p className="font-price text-xl font-bold text-neutral-900 mt-0.5">
            {form.prisometer_start_price ? `$${Number(form.prisometer_start_price).toLocaleString()}` : "—"}
          </p>
        </div>
        <button disabled className="w-full h-10 bg-primary text-white text-xs font-bold opacity-30 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5" /> Make It Mine™
        </button>
        <button disabled className="w-full h-10 border border-neutral-200 text-neutral-500 text-xs font-bold opacity-30 rounded-xl cursor-not-allowed">
          Place Bid
        </button>
        <p className="text-[9px] text-neutral-300 text-center">Buttons disabled in builder</p>
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
      <div className="flex gap-1 mb-4 bg-neutral-100 rounded-xl p-1 shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === id ? "bg-white shadow-sm text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === "full" && <FullPreview form={form} />}
        {activeTab === "mobile" && <MobilePreview form={form} />}
        {activeTab === "card" && <CardPreview form={form} />}
      </div>
    </div>
  );
}