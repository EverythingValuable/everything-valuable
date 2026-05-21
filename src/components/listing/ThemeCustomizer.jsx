import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = {
  minimal: {
    label: "Minimal",
    light: { bg: "#faf9f7", text: "#1a1a1a", primary: "#d63859" },
    dark: { bg: "#0f0e0d", text: "#f5f5f5", primary: "#ff4081" }
  },
  warm: {
    label: "Warm",
    light: { bg: "#fef5f1", text: "#3a2520", primary: "#c85a54" },
    dark: { bg: "#1a0f0a", text: "#fbe8e0", primary: "#e8956a" }
  },
  modern: {
    label: "Modern",
    light: { bg: "#f0f4f8", text: "#1a2a3a", primary: "#0066cc" },
    dark: { bg: "#0a1628", text: "#e8f0ff", primary: "#4d94ff" }
  },
  classic: {
    label: "Classic",
    light: { bg: "#fffbf5", text: "#2c2c2c", primary: "#8b5a3c" },
    dark: { bg: "#1a1410", text: "#f5f1ec", primary: "#d4a574" }
  }
};

export default function ThemeCustomizer({ theme, darkMode, onThemeChange, onDarkModeChange }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="flex items-center gap-3">
      {/* Theme Swatches (visible in header) */}
      <div className="hidden sm:flex items-center gap-1.5">
        {Object.entries(THEMES).map(([key, { label, light }]) => (
          <button
            key={key}
            onClick={() => onThemeChange(key)}
            className={cn(
              "w-5 h-5 rounded-full transition-all border-2",
              theme === key ? "border-neutral-800 shadow-md scale-110" : "border-neutral-300 hover:border-neutral-500"
            )}
            style={{ backgroundColor: light.primary }}
            title={label}
          />
        ))}
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => onDarkModeChange(!darkMode)}
        className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-neutral-800 transition-colors"
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-neutral-800"
      >
        ⚙️
      </button>

      {/* Mobile theme menu */}
      {open && (
        <div className="absolute top-14 right-6 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 z-50">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-500 mb-2">Theme</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(THEMES).map(([key, { label, light }]) => (
              <button
                key={key}
                onClick={() => { onThemeChange(key); setOpen(false); }}
                className={cn(
                  "p-2 rounded border-2 transition-all text-xs font-semibold",
                  theme === key
                    ? "border-neutral-800 bg-neutral-50"
                    : "border-neutral-200 hover:border-neutral-500"
                )}
                style={{ color: light.primary }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}