import React, { useState } from "react";
import { X, ChevronRight, Check } from "lucide-react";
import { MAIN_CATEGORIES, SUBCATEGORIES } from "@/lib/categoryConfig";

export default function CategoryPickerModal({ value, subcategory, onSave, onClose }) {
  const [selectedCat, setSelectedCat] = useState(value || "");
  const [selectedSub, setSelectedSub] = useState(subcategory || "");

  const subcats = selectedCat ? (SUBCATEGORIES[selectedCat] || []) : [];

  const handleCatClick = (catVal) => {
    setSelectedCat(catVal);
    setSelectedSub(""); // reset subcategory when category changes
  };

  const handleSave = () => {
    if (!selectedCat) return;
    onSave(selectedCat, selectedSub);
    onClose();
  };

  const breadcrumb = [
    selectedCat ? MAIN_CATEGORIES.find(c => c.value === selectedCat)?.label : null,
    selectedSub || null,
  ].filter(Boolean).join(" › ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-neutral-900">Select Category</h2>
            <div className="w-10 h-0.5 bg-neutral-300 mt-1.5" />
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center justify-between px-8 py-3 border-b border-neutral-100 min-h-[44px]">
          <p className="text-sm text-neutral-600">
            {breadcrumb
              ? <span>Category: <span className="font-medium text-neutral-900">{breadcrumb}</span></span>
              : <span className="text-neutral-400">No category selected</span>
            }
          </p>
          {(selectedCat || selectedSub) && (
            <button
              onClick={() => { setSelectedCat(""); setSelectedSub(""); }}
              className="text-primary text-sm hover:underline font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Column browser */}
        <div className="flex flex-1 overflow-hidden divide-x divide-neutral-100">

          {/* Column 1: Main categories */}
          <div className="w-1/2 overflow-y-auto">
            {MAIN_CATEGORIES.map(cat => {
              const hasSubs = (SUBCATEGORIES[cat.value] || []).length > 0;
              const isSelected = selectedCat === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCatClick(cat.value)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-sm text-left transition-colors border-b border-neutral-50
                    ${isSelected
                      ? "bg-neutral-100 font-semibold text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                >
                  <span>{cat.label}</span>
                  {hasSubs && <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Column 2: Subcategories */}
          <div className="w-1/2 overflow-y-auto">
            {!selectedCat && (
              <div className="flex items-center justify-center h-full text-neutral-300 text-sm italic px-6 text-center py-12">
                Select a category to see subcategories
              </div>
            )}
            {selectedCat && subcats.length === 0 && (
              <div className="flex items-center justify-center h-full text-neutral-400 text-sm px-6 text-center py-12">
                No subcategories for this category
              </div>
            )}
            {subcats.map(sub => {
              const isSelected = selectedSub === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSub(isSelected ? "" : sub)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-sm text-left transition-colors border-b border-neutral-50
                    ${isSelected
                      ? "bg-neutral-100 font-semibold text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                >
                  <span>{sub}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {selectedCat
              ? selectedSub
                ? `${MAIN_CATEGORIES.find(c => c.value === selectedCat)?.label} › ${selectedSub}`
                : MAIN_CATEGORIES.find(c => c.value === selectedCat)?.label
              : "Choose a category above"
            }
          </p>
          <button
            onClick={handleSave}
            disabled={!selectedCat}
            className="h-10 px-8 bg-neutral-800 text-white text-sm font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-900 transition-colors"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}