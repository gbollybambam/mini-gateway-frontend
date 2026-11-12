"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, Plus, Search } from "@/components/icons"
import { useToast } from "@/components/dashboard/ui"
import { useAuth } from "@/components/dashboard/DashboardProviders"

const labels: Record<string, string> = {
  "/": "Overview",
  "/transactions": "Transactions",
  "/payment-links": "Payment links",
  "/wallets": "Wallet",
  "/withdrawals": "Withdrawals",
  "/settings": "Settings",
  "/api-keys": "API keys",
  "/webhooks": "Webhooks",
  "/team": "Team management",
}

export default function AppHeader() {
  const pathname = usePathname()
  const toast = useToast()
  const { user } = useAuth()
  const title = labels[pathname] ?? Object.entries(labels).find(([path]) => path !== "/" && pathname.startsWith(path))?.[1] ?? "Workspace"

  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink-muted">Merchant workspace</p>
        <h1 className="truncate text-lg font-semibold tracking-[-0.02em] text-ink">{title}</h1>
      </div>
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
        <Link href="/payment-links/create" className="hidden sm:inline-flex">
          <span className="inline-flex h-10 items-center gap-2 rounded-pill bg-ink px-4 text-sm font-semibold text-surface hover:bg-ink/90"><Plus size={17} /> Create link</span>
        </Link>
        <button type="button" className="flex items-center gap-2 rounded-pill bg-surface px-2 py-1.5 text-left shadow-card" aria-label="Open account menu">
          <span className="grid size-8 place-items-center rounded-full bg-brand-900 text-xs font-bold uppercase text-surface">{user?.name?.charAt(0) || "U"}</span>
          <span className="hidden max-w-32 truncate text-xs font-semibold text-ink md:block">{user?.name || "Loading..."}</span>
          <ChevronDown size={16} className="text-ink-muted" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
