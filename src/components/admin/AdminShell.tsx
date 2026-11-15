"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Toaster } from "react-hot-toast"
import {
  ArrowUpRight,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Server,
  ShieldCheck,
  Users,
  X,
} from "@/components/icons"
import { api } from "@/lib/api"
import ThemeToggle from "@/components/ThemeToggle"

type NavEntry = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false"; size?: number }>
}

const navigation: NavEntry[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Merchants", href: "/admin/merchants", icon: Users },
  { name: "Transactions", href: "/admin/transactions", icon: Receipt },
  { name: "Withdrawals", href: "/admin/withdrawals", icon: Landmark },
]

const systemNav: NavEntry[] = [
  { name: "Providers", href: "/admin/providers", icon: Server },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
]

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/merchants": "Merchant Directory",
  "/admin/transactions": "Global Ledger",
  "/admin/withdrawals": "Withdrawals & Payouts",
  "/admin/providers": "Provider Management",
  "/admin/audit-logs": "System Audit Logs",
}

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

function getPageTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const segment = pathname.split("/").filter(Boolean).pop()
  if (!segment) return "Admin"
  return segment.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A1A1AA]">{children}</p>
}

function NavItem({ item, pathname, onNavigate }: { item: NavEntry; pathname: string; onNavigate?: () => void }) {
  const active = isActivePath(pathname, item.href)
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-9 items-center gap-3 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-[var(--pm-active)] text-[var(--pm-ink)]"
          : "text-[#71717A] hover:bg-[var(--pm-band-hover)] hover:text-[var(--pm-ink)]"
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[#09090B]" />}
      <item.icon
        size={16}
        className={`transition-colors ${active ? "text-[#09090B]" : "text-[#A1A1AA] group-hover:text-[#52525B]"}`}
        aria-hidden="true"
      />
      <span>{item.name}</span>
    </Link>
  )
}

function Brand() {
  return (
    <Link href="/admin/dashboard" className="inline-flex items-center gap-3" aria-label="PayMesh admin dashboard">
      <div className="grid size-8 place-items-center rounded-[8px] bg-gradient-to-b from-[#27272A] to-[#09090B] text-[13px] font-bold text-white shadow-sm ring-1 ring-black/10">
        P
      </div>
      <span className="flex items-center gap-2">
        <span className="text-[15px] font-semibold tracking-tight text-[var(--pm-ink)]">PayMesh</span>
        <span className="rounded-full border border-[var(--pm-line)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
          Admin
        </span>
      </span>
    </Link>
  )
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const mobileRef = useRef<HTMLDivElement>(null)

  // Login renders bare — no sidebar chrome.
  const bare = pathname === "/admin/login"

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [mobileOpen])

  const handleLogout = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await api.post("/admin/logout")
    } catch {
      try {
        await api.post("/auth/logout")
      } catch {
        /* session may already be gone */
      }
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token")
        localStorage.removeItem("token")
      }
      router.replace("/admin/login")
    }
  }

  if (bare) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] font-sans text-[#09090B] antialiased">
        {children}
        <Toaster position="bottom-right" toastOptions={{ className: "text-sm font-medium" }} />
      </div>
    )
  }

  const currentTitle = getPageTitle(pathname)
  const CurrentIcon =
    [...navigation, ...systemNav].find((item) => isActivePath(pathname, item.href))?.icon ?? ShieldCheck

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col bg-[var(--pm-band)] px-4 py-6">
      <div className="mb-8 px-2">
        <Brand />
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto pb-4" aria-label="Admin navigation">
        <div>
          <SectionLabel>Operations</SectionLabel>
          <div className="space-y-0.5">
            {navigation.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>System</SectionLabel>
          <div className="space-y-0.5">
            {systemNav.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto space-y-1 border-t border-[var(--pm-line)] pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-h-9 items-center gap-3 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#71717A] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[var(--pm-ink)]"
        >
          <ArrowUpRight size={16} className="text-[#A1A1AA]" aria-hidden="true" />
          View storefront
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="flex min-h-9 w-full items-center gap-3 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#EF4444] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60"
        >
          <LogOut size={16} aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white font-sans text-[#09090B] antialiased">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-[var(--pm-line)] md:block">
        {sidebar()}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" ref={mobileRef}>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-[#09090B]/30 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] border-r border-[var(--pm-line)] bg-[var(--pm-band)] shadow-[0_24px_60px_-12px_rgba(9,9,11,0.35)] animate-in slide-in-from-left-2 duration-200">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 inline-flex size-8 items-center justify-center rounded-[8px] text-[#71717A] hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]"
            >
              <X size={16} aria-hidden="true" />
            </button>
            {sidebar(() => setMobileOpen(false))}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white md:pl-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[var(--pm-line)] bg-[var(--pm-band)] px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-[8px] text-[#71717A] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B] md:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <span className="hidden shrink-0 text-[#71717A] sm:inline-flex">
              <CurrentIcon size={15} />
            </span>
            <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-[var(--pm-ink)]">
              {currentTitle}
            </span>
            <span className="hidden rounded-full border border-[var(--pm-line)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#71717A] md:inline">
              System admin
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/docs"
              className="hidden h-9 items-center gap-1.5 rounded-[8px] px-3 text-[12px] font-medium text-[#71717A] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B] lg:inline-flex"
            >
              Docs
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <Link
              href="/"
              className="hidden h-9 items-center gap-1.5 rounded-[8px] px-3 text-[12px] font-medium text-[#71717A] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B] lg:inline-flex"
            >
              Storefront
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[var(--pm-line)] bg-white px-3 text-[12px] font-semibold text-[#52525B] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-colors hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626] disabled:opacity-60"
            >
              <LogOut size={14} aria-hidden="true" />
              <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] bg-white px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      <Toaster position="bottom-right" toastOptions={{ className: "text-sm font-medium" }} />
    </div>
  )
}
