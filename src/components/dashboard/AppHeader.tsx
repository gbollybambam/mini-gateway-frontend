"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, LayoutDashboard, Receipt, LinkIcon, Wallet, Landmark, Users, KeyRound, Webhook, Settings, Plus } from "@/components/icons"
import ThemeToggle from "@/components/ThemeToggle"

type PageIcon = React.ComponentType<{ size?: number; className?: string }>

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/transactions": "Transactions",
  "/payment-links": "Payment Links",
  "/payment-links/create": "Create Payment Link",
  "/wallets": "Wallet",
  "/withdrawals": "Withdrawals",
  "/withdrawals/create": "Create Withdrawal",
  "/team": "Team Management",
  "/api-keys": "API Keys",
  "/webhooks": "Webhooks",
  "/settings": "Settings",
}

const PAGE_ICONS: Record<string, PageIcon> = {
  "/overview": LayoutDashboard,
  "/transactions": Receipt,
  "/payment-links": LinkIcon,
  "/payment-links/create": Plus,
  "/wallets": Wallet,
  "/withdrawals": Landmark,
  "/withdrawals/create": Plus,
  "/team": Users,
  "/api-keys": KeyRound,
  "/webhooks": Webhook,
  "/settings": Settings,
}

const COMMANDS = [
  { label: "Go to Overview", href: "/overview", hint: "Dashboard" },
  { label: "View Transactions", href: "/transactions", hint: "Ledger" },
  { label: "Create Payment Link", href: "/payment-links/create", hint: "Collect" },
  { label: "Payment Links", href: "/payment-links", hint: "Collect" },
  { label: "Wallet", href: "/wallets", hint: "Money" },
  { label: "Create Withdrawal", href: "/withdrawals/create", hint: "Money" },
  { label: "Withdrawals", href: "/withdrawals", hint: "Money" },
  { label: "API Keys", href: "/api-keys", hint: "Developers" },
  { label: "Webhooks", href: "/webhooks", hint: "Developers" },
  { label: "Team Management", href: "/team", hint: "Workspace" },
  { label: "Settings", href: "/settings", hint: "Workspace" },
  { label: "API Documentation", href: "/docs", hint: "Developers" },
]

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const segment = pathname.split("/").filter(Boolean).pop()
  if (!segment) return "Overview"
  return segment.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

const PageGridIcon: PageIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

function getPageIcon(pathname: string): PageIcon {
  if (PAGE_ICONS[pathname]) return PAGE_ICONS[pathname]
  const nested = Object.keys(PAGE_ICONS)
    .filter((path) => path !== "/" && pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0]
  return nested ? PAGE_ICONS[nested] : PageGridIcon
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)) : COMMANDS
  }, [query])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 10)
      return () => clearTimeout(t)
    }
  }, [open])

  const go = (href: string) => {
    onClose()
    setQuery("")
    setActive(0)
    router.push(href)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[14vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[#09090B]/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[14px] border border-[var(--pm-line)] bg-white shadow-[0_24px_60px_-12px_rgba(9,9,11,0.3)] animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-200">
        <div className="flex items-center gap-2.5 border-b border-[var(--pm-line)] bg-[var(--pm-band)] px-4">
          <Search size={16} className="shrink-0 text-[#71717A]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
              if (e.key === "Enter" && results[active]) go(results[active].href)
              if (e.key === "Escape") onClose()
            }}
            placeholder="Search pages and actions..."
            className="h-12 w-full bg-transparent text-[14px] text-[#09090B] outline-none placeholder:text-[#A1A1AA]"
          />
          <kbd className="rounded-[4px] border border-[var(--pm-line)] bg-[var(--pm-raised)] px-1.5 py-0.5 text-[10px] font-medium text-[#71717A]">ESC</kbd>
        </div>
        <ul className="max-h-[320px] overflow-y-auto p-1.5">
          {results.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-[#71717A]">No results found.</li>}
          {results.map((c, i) => (
            <li key={c.href}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(c.href)}
                className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                  i === active ? "bg-[var(--pm-band-hover)] text-[#09090B]" : "text-[#52525B]"
                }`}
              >
                {c.label}
                <span className="text-[11px] font-normal text-[#A1A1AA]">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function AppHeader() {
  const pathname = usePathname()
  const currentTitle = getPageTitle(pathname)
  const CurrentPageIcon = getPageIcon(pathname)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 animate-in fade-in slide-in-from-top-1 items-center justify-between gap-4 border-b border-[var(--pm-line)] bg-[var(--pm-band)] px-4 duration-200 sm:px-6 lg:px-8">
        {/* Left: current page */}
        <div className="flex min-w-0 items-center gap-2 text-[var(--pm-ink)] lg:w-[220px]">
          <span className="shrink-0 text-[#71717A]"><CurrentPageIcon size={15} /></span>
          <span className="truncate text-[13px] font-medium tracking-[-0.01em]">{currentTitle}</span>
        </div>

        {/* Center: command search (desktop) */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open search"
            className="flex h-9 w-full max-w-[400px] items-center justify-between rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-raised)] px-3 text-[13px] text-[#A1A1AA] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-colors hover:border-[#D4D4D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09090B]/10"
          >
            <span className="flex items-center gap-2 truncate">
              <Search size={14} className="shrink-0 text-[#71717A]" aria-hidden="true" />
              <span className="truncate">What do you want to do today?</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-[var(--pm-line)] bg-[var(--pm-band)] px-1.5 text-[11px] font-medium text-[#71717A]">⌘</kbd>
              <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-[var(--pm-line)] bg-[var(--pm-band)] px-1.5 text-[11px] font-medium text-[#71717A]">K</kbd>
            </span>
          </button>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center justify-end gap-1 lg:w-[220px]">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open search"
            className="inline-flex size-9 items-center justify-center rounded-[8px] text-[#71717A] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B] lg:hidden"
          >
            <Search size={16} aria-hidden="true" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}