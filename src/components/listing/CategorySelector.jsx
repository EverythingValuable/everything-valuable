import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LISTING_CATEGORIES, OBJECT_TYPES, CATEGORY_FIELDS, STYLES } from "@/lib/listingTaxonomy";
import { Search, ArrowRight } from "lucide-react";

// Department abbreviations for the premium monogram display
const DEPT_ABBREV = {
  fine_art: "FA",
  decorative_arts: "DA",
  furniture: "FU",
  lighting: "LT",
  jewelry: "JW",
  watches_clocks: "WC",
  silver: "SV",
  ceramics_porcelain: "CP",
  glass: "GL",
  sculpture: "SC",
  rugs_textiles: "RT",
  asian_works: "AW",
  collectibles: "CO",
  fashion_accessories: "FA",
  books_manuscripts: "BM",
  other: "—",
};

// Fields unlocked per category for the preview panel
const FIELDS_UNLOCKED = {
  fine_art: ["Artist", "Medium", "Support", "Signature", "Subject", "Style", "Period", "Framing", "Edition"],
  decorative_arts: ["Maker", "Origin", "Style", "Primary Material", "Period", "Pattern", "Marks"],
  furniture: ["Designer", "Manufacturer", "Style", "Primary Material", "Period", "Upholstery", "Wood Type"],
  lighting: ["Maker", "Origin", "Style", "Primary Material", "Shade Material", "Period"],
  jewelry: ["Maker", "Metal", "Metal Purity", "Stone", "Carat Weight", "Style", "Ring Size"],
  watches_clocks: ["Maker", "Model", "Movement", "Condition", "Running Status"],
  silver: ["Maker", "Origin", "Silver Type", "Period", "Marks", "Pattern"],
  ceramics_porcelain: ["Maker", "Origin", "Style", "Period", "Pattern", "Backstamp"],
  glass: ["Maker", "Glass Type", "Origin", "Period", "Marks"],
  sculpture: ["Artist", "Material", "Origin", "Style", "Period", "Foundry", "Edition"],
  rugs_textiles: ["Origin", "Style", "Period", "Pattern", "Materials"],
  asian_works: ["Origin", "Dynasty / Period", "Maker", "Reign Mark"],
  collectibles: ["Maker", "Origin", "Period", "Condition"],
  fashion_accessories: ["Brand", "Material", "Style", "Condition"],
  books_manuscripts: ["Author", "Publisher", "Date", "Edition"],
  other: ["Maker", "Origin", "Materials", "Period"],
};

// Example titles per category
const EXAMPLE_TITLES = {
  fine_art: "Signed French Impressionist Oil On Canvas Painting",
  decorative_arts: "Tiffany Studios Art Nouveau Gilt Bronze Vase",
  furniture: "Harvey Probber American Mid-Century Modern Walnut Cabinet",
  lighting: "Tiffany Studios Favrile Glass & Gilt Bronze Table Lamp",
  jewelry: "Signed Cartier 18K Gold Diamond & Sapphire Ring",
  watches_clocks: "Patek Philippe 18K Gold Perpetual Calendar Wristwatch",
  silver: "Paul Storr English Sterling Silver Tea Set",
  ceramics_porcelain: "Meissen Porcelain Blue Onion Pattern Charger",
  glass: "Signed Gallé French Cameo Glass Vase",
  sculpture: "Signed French Bronze Figure After Rodin",
  rugs_textiles: "Antique Persian Tabriz Wool Carpet",
  asian_works: "Chinese Qianlong Period Famille Rose Porcelain Vase",
  collectibles: "Vintage Printed Enamel Advertising Sign",
  fashion_accessories: "Hermès Birkin 35 Togo Leather Handbag",
  books_manuscripts: "First Edition Illuminated Manuscript — 16th Century",
  other: "Antique Scientific Instrument",
};

// Search index — maps keywords to category values
const SEARCH_INDEX = [
  { keywords: ["painting", "oil", "canvas", "watercolor", "drawing", "print", "etching", "lithograph", "photograph", "pastel", "poster", "art", "mixed media"], value: "fine_art" },
  { keywords: ["vase", "tray", "mirror", "box", "inkwell", "paperweight", "centerpiece", "urn", "jardiniere", "decorative", "objets"], value: "decorative_arts" },
  { keywords: ["chair", "table", "cabinet", "sofa", "desk", "bench", "bookcase", "commode", "sideboard", "armchair", "furniture"], value: "furniture" },
  { keywords: ["lamp", "chandelier", "sconce", "lantern", "pendant", "torchère", "lighting", "fixture"], value: "lighting" },
  { keywords: ["ring", "necklace", "bracelet", "brooch", "earring", "pendant", "diamond", "gold", "jewelry", "jewel"], value: "jewelry" },
  { keywords: ["watch", "clock", "wristwatch", "timepiece", "mantel", "pocket watch"], value: "watches_clocks" },
  { keywords: ["silver", "flatware", "sterling", "tea set", "candlestick", "pitcher", "tray"], value: "silver" },
  { keywords: ["ceramic", "porcelain", "bowl", "plate", "figure", "meissen", "sevres", "wedgwood"], value: "ceramics_porcelain" },
  { keywords: ["glass", "crystal", "murano", "galle", "lalique", "daum", "blown", "cameo glass"], value: "glass" },
  { keywords: ["sculpture", "bronze", "bust", "statue", "figure", "marble", "terracotta"], value: "sculpture" },
  { keywords: ["rug", "carpet", "textile", "tapestry", "quilt", "needlework", "kilim"], value: "rugs_textiles" },
  { keywords: ["chinese", "japanese", "asian", "jade", "scroll", "ming", "qing", "imari", "satsuma"], value: "asian_works" },
  { keywords: ["coin", "stamp", "toy", "memorabilia", "vintage", "collectible", "medal"], value: "collectibles" },
  { keywords: ["handbag", "scarf", "belt", "hermès", "louis vuitton", "chanel", "fashion", "accessories"], value: "fashion_accessories" },
  { keywords: ["book", "manuscript", "map", "atlas", "document", "rare book", "letter"], value: "books_manuscripts" },
];

function searchCategories(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results = new Map();
  for (const entry of SEARCH_INDEX) {
    for (const kw of entry.keywords) {
      if (kw.includes(q) || q.includes(kw)) {
        const cat = LISTING_CATEGORIES.find(c => c.value === entry.value);
        if (cat) results.set(cat.value, cat);
      }
    }
  }
  // Also match category labels and descriptions directly
  for (const cat of LISTING_CATEGORIES) {
    if (
      cat.label.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q)
    ) {
      results.set(cat.value, cat);
    }
  }
  return Array.from(results.values());
}

function DeptRow({ cat, selected, onClick }) {
  const abbrev = DEPT_ABBREV[cat.value] || "—";
  return (
    <button
      type="button"
      onClick={() => onClick(cat.value)}
      className={cn(
        "w-full text-left flex items-start gap-4 px-4 py-3.5 border-b transition-all duration-150 group",
        selected
          ? "bg-neutral-900 border-neutral-900"
          : "bg-white border-neutral-100 hover:bg-neutral-50"
      )}
    >
      <span className={cn(
        "shrink-0 font-mono text-[10px] font-bold tracking-[0.15em] pt-0.5 w-6",
        selected ? "text-neutral-400" : "text-neutral-300 group-hover:text-neutral-500"
      )}>
        {abbrev}
      </span>
      <div className="min-w-0">
        <p className={cn(
          "text-sm font-semibold leading-snug",
          selected ? "text-white" : "text-neutral-800"
        )}>
          {cat.label}
        </p>
        <p className={cn(
          "text-[11px] leading-relaxed mt-0.5 truncate",
          selected ? "text-neutral-400" : "text-neutral-400"
        )}>
          {cat.description}
        </p>
      </div>
    </button>
  );
}

function PreviewPanel({ cat, onConfirm }) {
  const fields = FIELDS_UNLOCKED[cat.value] || FIELDS_UNLOCKED.other;
  const objectTypes = OBJECT_TYPES[cat.value] || [];
  const exampleTitle = EXAMPLE_TITLES[cat.value] || "";
  const config = CATEGORY_FIELDS[cat.value] || CATEGORY_FIELDS.default;
  const formula = config.titleFormula || [];

  const formulaLabel = formula
    .map(f => f.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
    .join(" + ");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b border-neutral-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-1">Department</p>
            <h3 className="text-xl font-bold text-neutral-900 leading-tight">{cat.label}</h3>
            <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed max-w-xs">{cat.description}</p>
          </div>
          <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-neutral-300 border border-neutral-200 px-2.5 py-1 shrink-0">
            {DEPT_ABBREV[cat.value]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">

        {/* Common Object Types */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">Common Object Types</p>
          <div className="flex flex-wrap gap-1.5">
            {objectTypes.slice(0, 10).map(t => (
              <span key={t} className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 border border-neutral-200">
                {t}
              </span>
            ))}
            {objectTypes.length > 10 && (
              <span className="text-[11px] text-neutral-400 px-2.5 py-1">
                +{objectTypes.length - 10} more
              </span>
            )}
          </div>
        </div>

        {/* Fields Unlocked */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">Fields This Unlocks</p>
          <div className="flex flex-wrap gap-1.5">
            {fields.map(f => (
              <span key={f} className="text-[11px] font-medium text-neutral-600 bg-white px-2.5 py-1 border border-neutral-200">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Title Formula */}
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">Title Formula</p>
          <p className="text-xs text-neutral-500 leading-relaxed font-mono">{formulaLabel}</p>
        </div>

        {/* Example Title */}
        {exampleTitle && (
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">Example Title</p>
            <p className="text-sm font-semibold text-neutral-800 italic leading-snug">"{exampleTitle}"</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-7 pb-7 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full flex items-center justify-between bg-neutral-900 hover:bg-black text-white px-5 py-3.5 transition-colors group"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase">Continue with {cat.label}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function CategorySelector({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(value || null);

  const searchResults = useMemo(() => searchCategories(search), [search]);
  const displayList = search.trim() ? searchResults : LISTING_CATEGORIES;
  const previewCat = LISTING_CATEGORIES.find(c => c.value === (hovered || value)) || LISTING_CATEGORIES[0];

  const handleSelect = (val) => {
    setHovered(val);
  };

  const handleConfirm = (val) => {
    onChange(val || hovered);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Create Listing</h2>
        <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
          Start with the department this item belongs to.
        </p>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          The department determines available fields, title structure, materials, styles, condition prompts, and buyer-facing suggestions.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by item type, material, or keyword…"
          className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-neutral-200 focus:outline-none focus:border-neutral-500 text-neutral-700 placeholder:text-neutral-400 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600 text-xs"
          >✕</button>
        )}
      </div>

      {/* Search suggestions hint */}
      {search && searchResults.length > 0 && (
        <p className="text-[11px] text-neutral-400 -mt-3">
          <span className="font-semibold text-neutral-600">"{search}"</span> may belong to: {searchResults.map(r => r.label).join(", ")}
        </p>
      )}
      {search && searchResults.length === 0 && (
        <p className="text-[11px] text-neutral-400 -mt-3">No departments matched — showing all categories below.</p>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] border border-neutral-200 overflow-hidden" style={{ minHeight: 480 }}>
        {/* Left: Department List */}
        <div className="border-r border-neutral-200 overflow-y-auto" style={{ maxHeight: 520 }}>
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500">Departments</p>
          </div>
          <div>
            {(search.trim() && searchResults.length === 0 ? LISTING_CATEGORIES : displayList).map(cat => (
              <DeptRow
                key={cat.value}
                cat={cat}
                selected={hovered === cat.value || (!hovered && value === cat.value)}
                onClick={handleSelect}
              />
            ))}
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="bg-white hidden lg:block">
          {previewCat ? (
            <PreviewPanel
              cat={previewCat}
              onConfirm={() => handleConfirm(previewCat.value)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-neutral-400">Select a department to preview.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile confirm button — shows below list on small screens */}
      <div className="lg:hidden">
        {(hovered || value) && (
          <button
            type="button"
            onClick={() => handleConfirm(hovered || value)}
            className="w-full flex items-center justify-between bg-neutral-900 hover:bg-black text-white px-5 py-3.5 transition-colors group"
          >
            <span className="text-xs font-bold tracking-[0.15em] uppercase">
              Continue with {LISTING_CATEGORIES.find(c => c.value === (hovered || value))?.label}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}