import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency ($)" },
  { value: "date", label: "Date" },
];

export default function CustomFieldsEditor({ fields, onChange }) {
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");

  const addField = () => {
    const label = newLabel.trim();
    if (!label) return;
    onChange([...fields, { label, type: newType, value: "" }]);
    setNewLabel("");
    setNewType("text");
  };

  const removeField = (idx) => onChange(fields.filter((_, i) => i !== idx));

  const updateValue = (idx, value) =>
    onChange(fields.map((f, i) => (i === idx ? { ...f, value } : f)));

  return (
    <div className="space-y-3">
      {/* Existing custom fields */}
      {fields.map((field, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="w-28 shrink-0">
            <span className="text-xs font-medium text-muted-foreground truncate block">{field.label}</span>
            <span className="text-[10px] text-muted-foreground/60 capitalize">{field.type}</span>
          </div>
          <div className="relative flex-1">
            {field.type === "currency" && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            )}
            <Input
              type={field.type === "currency" ? "number" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              className={cn("h-8 text-sm", field.type === "currency" && "pl-6")}
              value={field.value}
              onChange={e => updateValue(idx, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}…`}
            />
          </div>
          <button onClick={() => removeField(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add new field row */}
      <div className="flex items-center gap-2 pt-1 border-t border-dashed border-border">
        <Input
          className="flex-1 h-8 text-sm"
          placeholder="Field name (e.g. Cost, Insurance Value…)"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addField()}
        />
        <select
          value={newType}
          onChange={e => setNewType(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs w-28"
        >
          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <Button size="sm" variant="outline" onClick={addField} className="h-8 gap-1 px-2.5">
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}