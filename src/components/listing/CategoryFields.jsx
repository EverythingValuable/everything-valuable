import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SUBCATEGORIES,
  PERIODS,
  FINE_ART_STYLES,
  CATEGORY_FIELDS,
  CATEGORIES_WITH_PERIODS,
} from "@/lib/categoryConfig";

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label} {required && <span className="text-destructive">*</span>}
        {hint && <span className="text-xs text-muted-foreground font-normal ml-1">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function NativeSelect({ value, onChange, children, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

export default function CategoryFields({ form, set }) {
  const cat = form.category;
  const config = CATEGORY_FIELDS[cat] || CATEGORY_FIELDS.other;
  const subcats = SUBCATEGORIES[cat] || [];
  const hasPeriod = CATEGORIES_WITH_PERIODS.includes(cat);
  const showStyles = cat === "fine_art";

  return (
    <div className="space-y-4">

      {/* Subcategory */}
      {config.showSubcategory && subcats.length > 0 && (
        <Field label="Subcategory">
          <NativeSelect value={form.subcategory} onChange={v => set("subcategory", v)} placeholder="Select subcategory…">
            {subcats.map(s => <option key={s} value={s}>{s}</option>)}
          </NativeSelect>
        </Field>
      )}

      {/* Style (Fine Art only — dropdown) */}
      {showStyles && (
        <Field label="Style / Movement">
          <NativeSelect value={form.style} onChange={v => set("style", v)} placeholder="Select style…">
            {FINE_ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </NativeSelect>
        </Field>
      )}

      {/* Style (Decorative Art / Furniture — free text) */}
      {config.showStyle && !showStyles && (
        <Field label="Style">
          <Input placeholder="e.g. Art Deco, Georgian, Mid-Century Modern" value={form.style || ""} onChange={e => set("style", e.target.value)} />
        </Field>
      )}

      {/* Period dropdown */}
      {hasPeriod && (
        <Field label="Period">
          <NativeSelect value={form.period} onChange={v => set("period", v)} placeholder="Select period…">
            {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
          </NativeSelect>
        </Field>
      )}

      {/* Period (non-dropdown categories — free text) */}
      {!hasPeriod && cat !== "other" && cat !== "collectibles" && (
        <Field label="Period / Date">
          <Input placeholder="e.g. circa 1920s, Victorian, Edo Period" value={form.period || ""} onChange={e => set("period", e.target.value)} />
        </Field>
      )}

      {/* Maker */}
      {config.showMaker && (
        <Field label={config.makerLabel || "Maker"}>
          <Input placeholder={`e.g. ${cat === "fine_art" ? "Joan Miró" : cat === "jewelry" ? "Cartier" : cat === "watches_clocks" ? "Rolex" : "Unknown"}`} value={form.maker || ""} onChange={e => set("maker", e.target.value)} />
        </Field>
      )}

      {/* Watch/Clock extras */}
      {cat === "watches_clocks" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Model">
            <Input placeholder="e.g. Submariner, Tank, Reverso" value={form.model || ""} onChange={e => set("model", e.target.value)} />
          </Field>
          <Field label="Movement Type">
            <NativeSelect value={form.movement_type || ""} onChange={v => set("movement_type", v)} placeholder="Select movement…">
              {["Automatic","Manual Wind","Quartz","Mechanical","Unknown"].map(m => <option key={m} value={m}>{m}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Running Status">
            <NativeSelect value={form.running_status || ""} onChange={v => set("running_status", v)} placeholder="Select status…">
              {["Running","Not Running","Unknown","For Parts"].map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
      )}

      {/* Jewelry extras */}
      {cat === "jewelry" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Metal Purity">
            <Input placeholder="e.g. 18k, 14k, platinum, sterling" value={form.metal_purity || ""} onChange={e => set("metal_purity", e.target.value)} />
          </Field>
          <Field label="Stone Type">
            <Input placeholder="e.g. Diamond, Sapphire, Ruby" value={form.stone_type || ""} onChange={e => set("stone_type", e.target.value)} />
          </Field>
          <Field label="Ring Size (if applicable)">
            <Input placeholder="e.g. US 6.5" value={form.ring_size || ""} onChange={e => set("ring_size", e.target.value)} />
          </Field>
          <Field label="Length (if applicable)">
            <Input placeholder='e.g. 18" necklace, 7" bracelet' value={form.length || ""} onChange={e => set("length", e.target.value)} />
          </Field>
        </div>
      )}

      {/* Materials */}
      {config.showMaterials && (
        <Field label={cat === "watches_clocks" ? "Case Material" : cat === "jewelry" ? "Metal Type" : "Materials"}>
          <Input
            placeholder={
              cat === "jewelry" ? "e.g. Gold, Platinum, Silver" :
              cat === "watches_clocks" ? "e.g. Yellow gold, Stainless steel, Rose gold" :
              "e.g. Oil on canvas, Bronze, Mahogany, Porcelain"
            }
            value={form.materials || ""}
            onChange={e => set("materials", e.target.value)}
          />
        </Field>
      )}

      {/* Technique */}
      {config.showTechnique && (
        <Field label="Technique">
          <Input placeholder="e.g. Hand-painted, Cast bronze, Marquetry, Lithograph" value={form.technique || ""} onChange={e => set("technique", e.target.value)} />
        </Field>
      )}

      {/* Origin */}
      {config.showOrigin && (
        <Field label="Origin / Country">
          <Input placeholder="e.g. France, Japan, England" value={form.origin || ""} onChange={e => set("origin", e.target.value)} />
        </Field>
      )}

      {/* Keywords */}
      {config.showKeywords && (
        <Field label="Keywords / Search Tags" hint="comma-separated">
          <Textarea
            placeholder={config.keywordsPlaceholder}
            value={form.keywords || ""}
            onChange={e => set("keywords", e.target.value)}
            className="h-20"
          />
        </Field>
      )}

    </div>
  );
}