// lib/theme.ts
// Tiny external store for light/dark theme. The <html> element's "dark" class is the source of truth.

export type Theme = "light" | "dark"

const listeners = new Set<() => void>()

export function getTheme(): Theme {
  if (typeof document === "undefined") return "light"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function setTheme(next: Theme) {
  const root = document.documentElement
  // Briefly disable transitions so the whole page flips in one frame
  root.classList.add("theme-switching")
  root.classList.toggle("dark", next === "dark")
  root.style.colorScheme = next
  try {
    localStorage.setItem("theme", next)
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l())
  window.setTimeout(() => root.classList.remove("theme-switching"), 60)
}

export function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

// Inline this in <head> (see app/layout.tsx) so there is no flash of the wrong theme.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var r=document.documentElement;if(t==="dark"){r.classList.add("dark")}else{r.classList.remove("dark")}r.style.colorScheme=t}catch(e){}})()`