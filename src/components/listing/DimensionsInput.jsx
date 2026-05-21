import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowLeftRight, Plus, X } from "lucide-react";

const UNITS = ["in", "cm", "mm", "ft"];
const TO_INCHES = { in: 1, cm: 0.393701, mm: 0.0393701, ft: 12 };
const FROM_INCHES = { in: 1, cm: 2.54, mm: 25.4, ft: 0.0833333 };

function convertValue(val, fromUnit, toUnit) {
  if (!val || isNaN(val)) return "";
  const inches = parseFloat(val) * TO_INCHES[fromUnit];
  return parseFloat((inches * FROM_INCHES[toUnit]).toFixed(3)).toString();
}

function parseDimensionsString(str) {
  if (!str) return { w: "", h: "", d: "" };
  const nums = str.match(/[\d.]+/g) || [];
  return { w: nums[0] || "", h: nums[1] || "", d: nums[2] || "" };
}

function buildDimensionsString(w, h, d, unit) {
  const parts = [w, h, d].filter(v => v !== "" && v !== undefined);
  if (parts.length === 0) return "";
  return parts.join(" × ") + " " + unit;
}

function buildFullString(sets) {
  return sets
    .map(s => {
      const str = buildDimensionsString(s.fields.w, s.fields.h, s.fields.d, s.unit);
      return str ? `${s.label}: ${str}` : "";
    })
    .filter(Boolean)
    .join(" | ");
}

function MeasurementSet({ set, onChange, onRemove, showRemove, unit: globalUnit, onUnitChange, synced }) {
  const handleField = (key, val) => {
    onChange({ ...set, fields: { ...set.fields, [key]: val } });
  };

  return (
    <div className="space-y-2.5 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
      {/* Label + remove */}
      <div className="flex items-center gap-2">
        <Input
          value={set.label}
          onChange={e => onChange({ ...set, label: e.target.value })}
          placeholder="Label (e.g. Image, Frame)"
          className="h-7 text-xs font-semibold tracking-wide text-neutral-600 border-0 border-b border-neutral-200 rounded-none bg-transparent px-0 focus-visible:ring-0 w-48"
        />
        {showRemove && (
          <button type="button" onClick={onRemove} className="text-neutral-300 hover:text-neutral-600 transition-colors ml-auto">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* W × H × D */}
      <div className="grid grid-cols-3 gap-3">
        {[["w", "Width"], ["h", "Height"], ["d", "Depth"]].map(([key, label]) => (
          <div key={key} className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="—"
                value={set.fields[key]}
                onChange={e => handleField(key, e.target.value)}
                className="pr-8 text-sm"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-medium pointer-events-none">
                {globalUnit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {(set.fields.w || set.fields.h || set.fields.d) && (
        <p className="text-xs text-neutral-400 font-mono bg-neutral-50 px-3 py-1.5">
          {set.label && <span className="text-neutral-500 font-medium">{set.label}: </span>}
          {buildDimensionsString(set.fields.w, set.fields.h, set.fields.d, globalUnit)}
        </p>
      )}
    </div>
  );
}

export default function DimensionsInput({ value, onChange }) {
  const [unit, setUnit] = useState("in");
  const [synced, setSynced] = useState(false);
  const [sets, setSets] = useState([
    { id: 1, label: "", fields: parseDimensionsString(value) }
  ]);

  const handleUnitChange = (newUnit) => {
    const converted = sets.map(s => ({
      ...s,
      fields: {
        w: convertValue(s.fields.w, unit, newUnit),
        h: convertValue(s.fields.h, unit, newUnit),
        d: convertValue(s.fields.d, unit, newUnit),
      }
    }));
    setSets(converted);
    setUnit(newUnit);
    onChange(buildFullString(converted.map(s => ({ ...s, unit: newUnit }))));
    setSynced(true);
    setTimeout(() => setSynced(false), 1200);
  };

  const updateSet = (idx, updated) => {
    const next = sets.map((s, i) => i === idx ? updated : s);
    setSets(next);
    onChange(buildFullString(next.map(s => ({ ...s, unit }))));
  };

  const addSet = () => {
    setSets(prev => [...prev, { id: Date.now(), label: "", fields: { w: "", h: "", d: "" } }]);
  };

  const removeSet = (idx) => {
    const next = sets.filter((_, i) => i !== idx);
    setSets(next);
    onChange(buildFullString(next.map(s => ({ ...s, unit }))));
  };

  return (
    <div className="space-y-4">
      {/* Unit selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 font-medium">Unit:</span>
        <div className="flex gap-1">
          {UNITS.map(u => (
            <button
              key={u}
              type="button"
              onClick={() => handleUnitChange(u)}
              className={`px-3 py-1 text-xs font-bold border transition-all ${
                unit === u
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        {synced && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <ArrowLeftRight className="w-3 h-3" /> Converted
          </span>
        )}
      </div>

      {/* Measurement sets */}
      <div className="space-y-4">
        {sets.map((s, idx) => (
          <MeasurementSet
            key={s.id}
            set={s}
            onChange={updated => updateSet(idx, updated)}
            onRemove={() => removeSet(idx)}
            showRemove={sets.length > 1}
            unit={unit}
            synced={synced}
          />
        ))}
      </div>

      {/* Add measurement */}
      <button
        type="button"
        onClick={addSet}
        className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
      >
        <Plus className="w-3 h-3" /> Add Measurement
      </button>
    </div>
  );
}