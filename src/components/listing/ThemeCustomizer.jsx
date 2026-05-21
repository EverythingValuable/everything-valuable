import React from "react";
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
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => onDarkModeChange(!darkMode)}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        style={{
          backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
          border: `2px solid ${darkMode ? "#666" : "#ddd"}`,
          color: darkMode ? "#fbbf24" : "#f59e0b"
        }}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Theme Selector */}
      <div className="flex flex-col gap-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400 px-1">Theme</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(THEMES).map(([key, { label, light, dark }]) => {
            const colors = darkMode ? dark : light;
            return (
              <button
                key={key}
                onClick={() => onThemeChange(key)}
                className={cn(
                  "relative overflow-hidden rounded p-2.5 transition-all border-2",
                  theme === key
                    ? "border-gray-800 dark:border-gray-200 shadow-md"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-500"
                )}
                title={label}
              >
                {/* Color preview */}
                <div className="flex gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div
                    className="w-2 h-2 rounded-full opacity-70"
                    style={{ backgroundColor: colors.bg }}
                  />
                </div>
                <p className="text-[10px] font-semibold mt-1.5 text-gray-700 dark:text-gray-300">{label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}