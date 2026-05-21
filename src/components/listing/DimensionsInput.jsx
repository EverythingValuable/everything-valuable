import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowLeftRight } from "lucide-react";

const UNITS = ["in", "cm", "mm", "ft"];

// Conversion to a common base (inches)
const TO_INCHES = { in: 1, cm: 0.393701, mm: 0.0393701, ft: 12 };
const FROM_INCHES = { in: 1, cm: 2.54, mm: 25.4, ft: 0.0833333 };

function convertValue(val, fromUnit, toUnit) {
  if (!val || isNaN(val)) return "";
  const inches = parseFloat(val) * TO_INCHES[fromUnit];
  const result = inches * FROM_INCHES[toUnit];
  return parseFloat(result.toFixed(3)).toString();
}

// Parse a dimensions string like "60 × 80 cm" or "24 × 36 in" → tries to extract numbers
function parseDimensionsString(str, unit) {
  if (!str) return { w: "", h: "", d: "" };
  const nums = str.match(/[\d.]+/g) || [];
  return { w: nums[0] || "", h: nums[1] || "", d: nums[2] || "" };
}

function buildDimensionsString(w, h, d, unit) {
  const parts = [w, h, d].filter(v => v !== "" && v !== undefined);
  if (parts.length === 0) return "";
  return parts.join(" × ") + " " + unit;
}

export default function DimensionsInput({ value, onChange }) {
  const [unit, setUnit] = useState("in");
  const [fields, setFields] = useState(() => parseDimensionsString(value, unit));
  const [synced, setSynced] = useState(false);

  // When user switches unit, convert existing values
  const handleUnitChange = (newUnit) => {
    const converted = {
      w: convertValue(fields.w, unit, newUnit),
      h: convertValue(fields.h, unit, newUnit),
      d: convertValue(fields.d, unit, newUnit),
    };
    setFields(converted);
    setUnit(newUnit);
    onChange(buildDimensionsString(converted.w, converted.h, converted.d, newUnit));
    setSynced(true);
    setTimeout(() => setSynced(false), 1200);
  };

  const handleField = (key, val) => {
    const next = { ...fields, [key]: val };
    setFields(next);
    onChange(buildDimensionsString(next.w, next.h, next.d, unit));
  };

  return (
    <div className="space-y-3">
      {/* Unit selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 font-medium">Unit:</span>
        <div className="flex gap-1">
          {UNITS.map(u => (
            <button
              key={u}
              type="button"
              onClick={() => handleUnitChange(u)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
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

      {/* W × H × D inputs */}
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
                value={fields[key]}
                onChange={e => handleField(key, e.target.value)}
                className="pr-8 text-sm"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-medium pointer-events-none">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Formatted output preview */}
      {(fields.w || fields.h || fields.d) && (
        <p className="text-xs text-neutral-400 font-mono bg-neutral-50 rounded-lg px-3 py-1.5">
          {buildDimensionsString(fields.w, fields.h, fields.d, unit)}
        </p>
      )}
    </div>
  );
}