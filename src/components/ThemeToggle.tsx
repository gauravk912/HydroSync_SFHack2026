"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const dark = saved ? saved === "dark" : !!prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? "☾ Dark" : "☀ Light"}
    </button>
  );
}
