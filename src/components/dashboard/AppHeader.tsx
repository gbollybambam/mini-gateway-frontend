"use client"

import { Bell, ChevronDown, Search } from "@/components/icons"
import { useToast } from "@/components/dashboard/ui"
import { useAuth } from "@/components/dashboard/DashboardProviders"

export default function AppHeader() {
  const toast = useToast()
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-end gap-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
      <div className="hidden min-w-56 flex-1 justify-center lg:flex">
        <button type="button" className="flex h-11 w-full max-w-sm items-center justify-between rounded-input bg-surface px-4 text-sm text-ink-muted shadow-card" aria-label="Search">
          <span className="flex items-center gap-2"><Search size={18} aria-hidden="true" /> What do you want to do today?</span>
          <kbd className="rounded-input bg-surface-muted px-2 py-1 text-[11px] text-ink-muted">⌘K</kbd>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button type="button" onClick={() => toast.success("No new alerts.")} aria-label="Notifications" className="relative grid size-10 place-items-center rounded-full bg-surface text-ink-muted shadow-card hover:text-ink">
          <Bell size={18} aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-500" />
        </button>
        <button type="button" className="flex items-center gap-2 rounded-input bg-surface px-2 py-1.5 text-left" aria-label="Open account menu">
          <span className="grid size-8 place-items-center rounded-full bg-brand-900 text-xs font-bold uppercase text-surface">{user?.name?.charAt(0) || "U"}</span>
          <span className="hidden max-w-32 truncate text-xs font-semibold text-ink md:block">{user?.name || "Loading..."}</span>
          <ChevronDown size={16} className="text-ink-muted" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
