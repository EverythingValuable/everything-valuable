import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  STYLES, ORIGINS, MEDIUMS, SUPPORTS, SIGNATURE_STATUSES,
  MATERIALS, STONES, METAL_PURITY,
} from "@/lib/listingTaxonomy";

function LineInput({ value, onChange, placeholder, className }) {
  return (
    <input
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full h-11 bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 transition-colors duration-200 text-neutral-800 placeholder:text-neutral-300 text-sm",
        className
      )}
    />
  );
}

function SelectField({ value, onChange, options, placeholder }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="relative">
      {/* Display / trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-11 bg-transparent border-0 border-b border-neutral-200 focus:outline-none text-left text-sm flex items-center justify-between group hover:border-neutral-500 transition-colors"
      >
        <span className={value ? "text-neutral-800" : "text-neutral-300"}>{value || placeholder}</span>
        <span className="text-neutral-300 group-hover:text-neutral-500 transition-colors">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 bg-white border border-neutral-200 shadow-xl max-h-56 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-neutral-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full text-xs bg-transparent focus:outline-none text-neutral-700 placeholder:text-neutral-300"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 transition-colors",
                  value === opt ? "bg-neutral-100 font-semibold text-neutral-900" : "text-neutral-700"
                )}
              >
                {opt}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-neutral-400 italic">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ label, hint, required }) {
  return (
    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 mb-2">
      {label}
      {required && <span className="text-neutral-700 ml-0.5">*</span>}
      {hint && <span className="font-normal normal-case tracking-normal ml-1 text-neutral-300">/ {hint}</span>}
    </label>
  );
}

function FieldBlock({ label, hint, required, children }) {
  return (
    <div className="space-y-0.5">
      <FieldLabel label={label} hint={hint} required={required} />
      {children}
    </div>
  );
}

function PillSelect({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={cn(
            "px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] border transition-all duration-150",
            value === opt
              ? "bg-neutral-900 border-neutral-900 text-white"
              : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Fine Art Fields ──────────────────────────────────────────────────────────
function FineArtFields({ form, set }) {
  const styles = STYLES.fine_art;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FieldBlock label="Artist / Maker">
          <LineInput value={form.artist} onChange={v => set("artist", v)} placeholder="e.g. André Lhote" />
        </FieldBlock>
        <FieldBlock label="Signature Status">
          <SelectField value={form.signatureStatus} onChange={v => set("signatureStatus", v)} options={SIGNATURE_STATUSES} placeholder="Select…" />
        </FieldBlock>
        <FieldBlock label="Medium" required>
          <SelectField value={form.medium} onChange={v => set("medium", v)} options={MEDIUMS} placeholder="Select medium…" />
        </FieldBlock>
        <FieldBlock label="Support" required>
          <SelectField value={form.support} onChange={v => set("support", v)} options={SUPPORTS} placeholder="Select support…" />
        </FieldBlock>
        <FieldBlock label="Style / Movement">
          <SelectField value={form.style} onChange={v => set("style", v)} options={styles} placeholder="Select style…" />
        </FieldBlock>
        <FieldBlock label="Origin / Country">
          <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
        </FieldBlock>
        <FieldBlock label="Period / Date" hint="e.g. circa 1920s, 1934">
          <LineInput value={form.period} onChange={v => set("period", v)} placeholder="circa 1920s" />
        </FieldBlock>
        <FieldBlock label="Subject">
          <LineInput value={form.subject} onChange={v => set("subject", v)} placeholder="e.g. Landscape, Portrait, Abstract" />
        </FieldBlock>
      </div>
      <FieldBlock label="Title of Work" hint="optional — separate from listing title">
        <LineInput value={form.titleOfWork} onChange={v => set("titleOfWork", v)} placeholder="e.g. Composition Abstraite" />
      </FieldBlock>
      <FieldBlock label="Framed">
        <PillSelect value={form.framed} onChange={v => set("framed", v)} options={["Framed", "Unframed"]} />
      </FieldBlock>
      {form.objectType && ["Print", "Lithograph", "Etching", "Screenprint", "Engraving"].includes(form.objectType) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-neutral-50">
          <FieldBlock label="Edition Number">
            <LineInput value={form.printEdition} onChange={v => set("printEdition", v)} placeholder="14/50" />
          </FieldBlock>
          <FieldBlock label="Publisher">
            <LineInput value={form.printPublisher} onChange={v => set("printPublisher", v)} placeholder="Publisher name" />
          </FieldBlock>
          <FieldBlock label="Printer">
            <LineInput value={form.printPrinter} onChange={v => set("printPrinter", v)} placeholder="Printer name" />
          </FieldBlock>
        </div>
      )}
    </div>
  );
}

// ─── Furniture Fields ─────────────────────────────────────────────────────────
function FurnitureFields({ form, set }) {
  const mats = MATERIALS.furniture;
  const styles = STYLES.furniture;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Designer / Maker">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="e.g. Harvey Probber" />
      </FieldBlock>
      <FieldBlock label="Manufacturer">
        <LineInput value={form.manufacturer} onChange={v => set("manufacturer", v)} placeholder="e.g. Knoll, Herman Miller" />
      </FieldBlock>
      <FieldBlock label="Style / Period" required>
        <SelectField value={form.style} onChange={v => set("style", v)} options={styles} placeholder="Select style…" />
      </FieldBlock>
      <FieldBlock label="Origin / Country">
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Primary Material" required>
        <SelectField value={form.primaryMaterial} onChange={v => set("primaryMaterial", v)} options={mats} placeholder="Select material…" />
      </FieldBlock>
      <FieldBlock label="Secondary Material">
        <SelectField value={form.secondaryMaterial} onChange={v => set("secondaryMaterial", v)} options={mats} placeholder="Select material…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="circa 1940s" />
      </FieldBlock>
      <FieldBlock label="Upholstery" hint="if applicable">
        <LineInput value={form.upholsteryMaterial} onChange={v => set("upholsteryMaterial", v)} placeholder="e.g. Original Velvet" />
      </FieldBlock>
    </div>
  );
}

// ─── Decorative Arts Fields ───────────────────────────────────────────────────
function DecorativeArtsFields({ form, set }) {
  const mats = MATERIALS.decorative_arts;
  const styles = STYLES.decorative_arts;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Maker / Designer">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="e.g. Tiffany Studios" />
      </FieldBlock>
      <FieldBlock label="Origin / Country">
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Primary Material" required>
        <SelectField value={form.primaryMaterial} onChange={v => set("primaryMaterial", v)} options={mats} placeholder="Select material…" />
      </FieldBlock>
      <FieldBlock label="Secondary Material">
        <SelectField value={form.secondaryMaterial} onChange={v => set("secondaryMaterial", v)} options={mats} placeholder="Optional second material…" />
      </FieldBlock>
      <FieldBlock label="Style / Period">
        <SelectField value={form.style} onChange={v => set("style", v)} options={styles} placeholder="Select style…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="circa 1910" />
      </FieldBlock>
      <FieldBlock label="Pattern / Model">
        <LineInput value={form.pattern} onChange={v => set("pattern", v)} placeholder="e.g. Favrile, Wisteria" />
      </FieldBlock>
      <FieldBlock label="Marks / Signatures">
        <LineInput value={form.marks} onChange={v => set("marks", v)} placeholder="e.g. Stamped TIFFANY STUDIOS" />
      </FieldBlock>
    </div>
  );
}

// ─── Jewelry Fields ───────────────────────────────────────────────────────────
function JewelryFields({ form, set }) {
  const metals = MATERIALS.jewelry;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Maker / Brand">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="e.g. Cartier, Tiffany & Co." />
      </FieldBlock>
      <FieldBlock label="Signature Status">
        <SelectField value={form.signatureStatus} onChange={v => set("signatureStatus", v)} options={["Signed", "Unsigned", "Attributed To"]} placeholder="Select…" />
      </FieldBlock>
      <FieldBlock label="Metal" required>
        <SelectField value={form.metal} onChange={v => set("metal", v)} options={metals} placeholder="Select metal…" />
      </FieldBlock>
      <FieldBlock label="Metal Purity">
        <SelectField value={form.metalPurity} onChange={v => set("metalPurity", v)} options={METAL_PURITY} placeholder="Select purity…" />
      </FieldBlock>
      <FieldBlock label="Stone Type">
        <SelectField value={form.stone} onChange={v => set("stone", v)} options={STONES} placeholder="Select stone…" />
      </FieldBlock>
      <FieldBlock label="Carat Weight" hint="if applicable">
        <LineInput value={form.caratWeight} onChange={v => set("caratWeight", v)} placeholder="e.g. 1.25 ct" />
      </FieldBlock>
      <FieldBlock label="Style / Period">
        <SelectField value={form.style} onChange={v => set("style", v)} options={STYLES.default} placeholder="Select style…" />
      </FieldBlock>
      {form.objectType === "Ring" && (
        <FieldBlock label="Ring Size">
          <LineInput value={form.ring_size} onChange={v => set("ring_size", v)} placeholder="e.g. 6.5" />
        </FieldBlock>
      )}
    </div>
  );
}

// ─── Ceramics / Porcelain Fields ──────────────────────────────────────────────
function CeramicsFields({ form, set }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Maker / Manufactory">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="e.g. Meissen, Sèvres" />
      </FieldBlock>
      <FieldBlock label="Origin / Country">
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Style / Period" required>
        <SelectField value={form.style} onChange={v => set("style", v)} options={STYLES.ceramics_porcelain} placeholder="Select style…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="e.g. 18th Century" />
      </FieldBlock>
      <FieldBlock label="Pattern / Decoration">
        <LineInput value={form.pattern} onChange={v => set("pattern", v)} placeholder="e.g. Blue Onion, Chinoiserie" />
      </FieldBlock>
      <FieldBlock label="Marks / Backstamp">
        <LineInput value={form.marks} onChange={v => set("marks", v)} placeholder="e.g. Blue underglaze mark" />
      </FieldBlock>
    </div>
  );
}

// ─── Asian Works Fields ───────────────────────────────────────────────────────
function AsianWorksFields({ form, set }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Origin / Country" required>
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={["Chinese", "Japanese", "Korean", "Indian", "Southeast Asian", "Tibetan", "Other"]} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Dynasty / Period" required>
        <SelectField value={form.style} onChange={v => set("style", v)} options={STYLES.asian_works} placeholder="Select period…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="e.g. 19th Century" />
      </FieldBlock>
      <FieldBlock label="Maker / Workshop">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="e.g. Workshop name" />
      </FieldBlock>
      <FieldBlock label="Marks / Reign Mark">
        <LineInput value={form.marks} onChange={v => set("marks", v)} placeholder="e.g. Six-character reign mark" />
      </FieldBlock>
    </div>
  );
}

// ─── Sculpture Fields ─────────────────────────────────────────────────────────
function SculptureFields({ form, set }) {
  const mats = MATERIALS.sculpture;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Artist / Maker">
        <LineInput value={form.artist} onChange={v => set("artist", v)} placeholder="e.g. Rodin" />
      </FieldBlock>
      <FieldBlock label="Signature Status">
        <SelectField value={form.signatureStatus} onChange={v => set("signatureStatus", v)} options={SIGNATURE_STATUSES} placeholder="Select…" />
      </FieldBlock>
      <FieldBlock label="Material" required>
        <SelectField value={form.primaryMaterial} onChange={v => set("primaryMaterial", v)} options={mats} placeholder="Select material…" />
      </FieldBlock>
      <FieldBlock label="Origin / Country">
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Style / Period">
        <SelectField value={form.style} onChange={v => set("style", v)} options={STYLES.fine_art} placeholder="Select style…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="e.g. circa 1900" />
      </FieldBlock>
      <FieldBlock label="Foundry" hint="if applicable">
        <LineInput value={form.foundry} onChange={v => set("foundry", v)} placeholder="e.g. Barbedienne Foundry" />
      </FieldBlock>
      <FieldBlock label="Edition" hint="if applicable">
        <LineInput value={form.edition} onChange={v => set("edition", v)} placeholder="e.g. 4/10" />
      </FieldBlock>
    </div>
  );
}

// ─── Silver Fields ────────────────────────────────────────────────────────────
function SilverFields({ form, set }) {
  const mats = MATERIALS.silver;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Maker / Silversmith">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="e.g. Paul Storr, Gorham" />
      </FieldBlock>
      <FieldBlock label="Origin / Country">
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Silver Type" required>
        <SelectField value={form.silverType} onChange={v => set("silverType", v)} options={mats} placeholder="Select type…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="e.g. circa 1890" />
      </FieldBlock>
      <FieldBlock label="Marks / Hallmarks">
        <LineInput value={form.marks} onChange={v => set("marks", v)} placeholder="e.g. Lion passant, date letter G" />
      </FieldBlock>
      <FieldBlock label="Pattern">
        <LineInput value={form.pattern} onChange={v => set("pattern", v)} placeholder="e.g. King's Pattern" />
      </FieldBlock>
    </div>
  );
}

// ─── Lighting Fields ──────────────────────────────────────────────────────────
function LightingFields({ form, set }) {
  const mats = MATERIALS.lighting;
  const styles = STYLES.decorative_arts;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Maker / Designer">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="e.g. Tiffany Studios, Murano" />
      </FieldBlock>
      <FieldBlock label="Origin / Country">
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Primary Material" required>
        <SelectField value={form.primaryMaterial} onChange={v => set("primaryMaterial", v)} options={mats} placeholder="Select material…" />
      </FieldBlock>
      <FieldBlock label="Shade Material">
        <LineInput value={form.shade_material} onChange={v => set("shade_material", v)} placeholder="e.g. Favrile Glass" />
      </FieldBlock>
      <FieldBlock label="Style / Period">
        <SelectField value={form.style} onChange={v => set("style", v)} options={styles} placeholder="Select style…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="circa 1910" />
      </FieldBlock>
    </div>
  );
}

// ─── Glass Fields ─────────────────────────────────────────────────────────────
function GlassFields({ form, set }) {
  const glassTypes = MATERIALS.glass;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Maker / Studio">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="e.g. Gallé, Daum, Lalique" />
      </FieldBlock>
      <FieldBlock label="Glass Type" required>
        <SelectField value={form.glassType} onChange={v => set("glassType", v)} options={glassTypes} placeholder="Select type…" />
      </FieldBlock>
      <FieldBlock label="Origin / Country">
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="circa 1900" />
      </FieldBlock>
      <FieldBlock label="Marks / Signatures">
        <LineInput value={form.marks} onChange={v => set("marks", v)} placeholder="e.g. Signed in cameo Gallé" />
      </FieldBlock>
    </div>
  );
}

// ─── Default / Generic Fields ─────────────────────────────────────────────────
function DefaultFields({ form, set }) {
  const styles = STYLES.default;
  const mats = MATERIALS.default;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FieldBlock label="Maker / Designer">
        <LineInput value={form.maker} onChange={v => set("maker", v)} placeholder="Maker or artist name" />
      </FieldBlock>
      <FieldBlock label="Origin / Country">
        <SelectField value={form.origin} onChange={v => set("origin", v)} options={ORIGINS} placeholder="Select origin…" />
      </FieldBlock>
      <FieldBlock label="Primary Material">
        <SelectField value={form.primaryMaterial} onChange={v => set("primaryMaterial", v)} options={mats} placeholder="Select material…" />
      </FieldBlock>
      <FieldBlock label="Style / Period">
        <SelectField value={form.style} onChange={v => set("style", v)} options={styles} placeholder="Select style…" />
      </FieldBlock>
      <FieldBlock label="Period / Circa">
        <LineInput value={form.period} onChange={v => set("period", v)} placeholder="e.g. circa 1920s" />
      </FieldBlock>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function TaxonomyFields({ category, form, set }) {
  if (!category) return null;

  const renderFields = () => {
    switch (category) {
      case "fine_art": return <FineArtFields form={form} set={set} />;
      case "furniture": return <FurnitureFields form={form} set={set} />;
      case "decorative_arts": return <DecorativeArtsFields form={form} set={set} />;
      case "jewelry": return <JewelryFields form={form} set={set} />;
      case "ceramics_porcelain": return <CeramicsFields form={form} set={set} />;
      case "asian_works": return <AsianWorksFields form={form} set={set} />;
      case "sculpture": return <SculptureFields form={form} set={set} />;
      case "silver": return <SilverFields form={form} set={set} />;
      case "lighting": return <LightingFields form={form} set={set} />;
      case "glass": return <GlassFields form={form} set={set} />;
      default: return <DefaultFields form={form} set={set} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-t border-neutral-100 pt-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-4">Category-Specific Details</p>
        {renderFields()}
      </div>
    </div>
  );
}