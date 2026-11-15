"use client"

// components/ThemeToggle.tsx
import { useSyncExternalStore } from "react"
import { getTheme, setTheme, subscribe } from "@/lib/theme"

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as const)
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative inline-flex size-9 items-center justify-center overflow-hidden rounded-[8px] text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 ${className}`}
    >
      {/* Sun */}
      <svg
        width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        className={`absolute transition-all duration-300 ease-out ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      {/* Moon */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        className={`absolute transition-all duration-300 ease-out ${isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
}