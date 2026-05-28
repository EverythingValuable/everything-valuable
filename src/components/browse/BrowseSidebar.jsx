import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { MAIN_CATEGORIES, SUBCATEGORIES, CATEGORIES_WITH_PERIODS, PERIODS } from "@/lib/categoryConfig";

export default function BrowseSidebar({
  category, subcategory, period, expandedCategory, items,
  countByCategory, countBySubcategory,
  handleCategoryClick, handleSubcategoryClick, setPeriod,
}) {
  return (
    <aside className="w-56 flex-shrink-0 space-y-1">
      <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-2">
        Categories
      </h2>

      {/* All */}
      <button
        onClick={() => handleCategoryClick("all")}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
          category === "all" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
        }`}
      >
        <span>All Categories</span>
        {items.length > 0 && <span className="text-xs text-muted-foreground">{items.length}</span>}
      </button>

      {MAIN_CATEGORIES.map(({ value, label }) => {
        const isExpanded = expandedCategory === value;
        const isActive = category === value;
        const subs = SUBCATEGORIES[value] || [];
        const count = countByCategory[value] || 0;

        return (
          <div key={value}>
            <button
              onClick={() => handleCategoryClick(value)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {subs.length > 0 && (
                  isExpanded
                    ? <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    : <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                )}
                {label}
              </span>
              {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
            </button>

            {/* Subcategories */}
            {isExpanded && subs.length > 0 && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-3 mb-1">
                {subs.map(sub => {
                  const subCount = countBySubcategory[sub] || 0;
                  return (
                    <button
                      key={sub}
                      onClick={() => handleSubcategoryClick(sub)}
                      className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors flex items-center justify-between ${
                        subcategory === sub
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{sub}</span>
                      {subCount > 0 && <span className="text-muted-foreground/60">{subCount}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Period filter */}
            {isExpanded && CATEGORIES_WITH_PERIODS.includes(value) && (
              <div className="ml-5 mt-2 mb-2 border-l border-border pl-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-2">Time Period</p>
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(prev => prev === p ? "" : p)}
                    className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors ${
                      period === p ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}