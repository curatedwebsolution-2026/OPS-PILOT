"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center rounded-full border border-slate-700 bg-slate-900/90 p-1 shadow-inner backdrop-blur-sm transition-colors">
      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Switch to Light Theme"
        aria-label="Switch to Light Theme"
        aria-pressed={!isDark}
        className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
          !isDark
            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-105"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
      >
        <Sun className={`h-3.5 w-3.5 ${!isDark ? "text-slate-950 fill-amber-950/20" : "text-amber-400"}`} />
        <span>Light</span>
      </button>

      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Switch to Dark Theme"
        aria-label="Switch to Dark Theme"
        aria-pressed={isDark}
        className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
          isDark
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
        }`}
      >
        <Moon className={`h-3.5 w-3.5 ${isDark ? "text-white fill-blue-400/20" : "text-blue-500"}`} />
        <span>Dark</span>
      </button>
    </div>
  );
}
