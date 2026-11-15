"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  LinkIcon,
  Landmark,
  LogOut,
  Receipt,
  Settings,
  Users,
  Wallet,
  Webhook,
  KeyRound,
} from "@/components/icons"
import DashboardProviders, { useAuth } from "@/components/dashboard/DashboardProviders"
import AppHeader from "@/components/dashboard/AppHeader"
import { useEffect, useRef, useState } from "react"

type NavEntry = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false"; size?: number }>
}

const navigation: NavEntry[] = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Payment Links", href: "/payment-links", icon: LinkIcon },
  { name: "Wallet", href: "/wallets", icon: Wallet },
  { name: "Withdrawals", href: "/withdrawals", icon: Landmark },
]

const settingsNav: NavEntry[] = [
  { name: "Team Management", href: "/team", icon: Users },
  { name: "API Keys", href: "/api-keys", icon: KeyRound },
  { name: "Webhooks", href: "/webhooks", icon: Webhook },
  { name: "Settings", href: "/settings", icon: Settings },
]

const RESTRICTED_FOR_DEVELOPER = ["/wallets", "/withdrawals", "/team"]
const RESTRICTED_FOR_FINANCE = ["/api-keys", "/webhooks", "/team"]

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

function NavItem({ item, pathname }: { item: NavEntry; pathname: string }) {
  const active = isActivePath(pathname, item.href)
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-9 items-center gap-3 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-[var(--pm-active)] text-[var(--pm-ink)]"
          : "text-[#71717A] hover:bg-[var(--pm-band-hover)] hover:text-[var(--pm-ink)]"
      }`}
    >
      {active && <span className="pm-nav-indicator absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[#09090B]" />}
      <item.icon
        size={16}
        className={`transition-colors ${active ? "text-[#09090B]" : "text-[#A1A1AA] group-hover:text-[#52525B]"}`}
        aria-hidden="true"
      />
      <span>{item.name}</span>
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A1A1AA]">{children}</p>
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { user, loading, logout } = useAuth()

  const role = user?.role
  const restrictedPaths =
    role === "developer" ? RESTRICTED_FOR_DEVELOPER : role === "finance" ? RESTRICTED_FOR_FINANCE : []
  const blocked = matchesPath(pathname, restrictedPaths)

  useEffect(() => {
    if (loading || !user) return
    if (blocked) router.replace("/overview")
  }, [blocked, user, loading, router])

  // Close profile menu on outside click / Escape
  useEffect(() => {
    if (!profileMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setProfileMenuOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [profileMenuOpen])

  const getAllowedNav = (items: NavEntry[]) => {
    if (!user || role === "owner" || role === "admin") return items
    if (role === "developer") return items.filter((i) => !["Wallet", "Withdrawals", "Team Management"].includes(i.name))
    if (role === "finance") return items.filter((i) => !["API Keys", "Webhooks", "Team Management"].includes(i.name))
    return items
  }

  const allowedNavigation = getAllowedNav(navigation)
  const allowedSettingsNav = getAllowedNav(settingsNav)

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <div className="pm-skeleton size-10 rounded-full" aria-label="Loading dashboard" />
      </div>
    )
  }

  if (blocked) return null

  const displayName = user?.name || "Account"
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member"

  return (
    <div className="dashboard-root min-h-screen bg-white font-sans text-[#09090B] antialiased">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-[var(--pm-line)] bg-[var(--pm-band)] px-4 py-6 md:flex">
        <div className="mb-8 px-2">
          <Link href="/overview" className="inline-flex items-center gap-3" aria-label="PayMesh overview">
            <div className="grid size-8 place-items-center rounded-[8px] bg-gradient-to-b from-[#27272A] to-[#09090B] text-[13px] font-bold text-white shadow-sm ring-1 ring-black/10">
              P
            </div>
            <span className="text-[15px] font-semibold tracking-tight">PayMesh</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto pb-4" aria-label="Dashboard navigation">
          <div>
            <SectionLabel>Menu</SectionLabel>
            <div className="space-y-0.5">
              {allowedNavigation.map((item) => <NavItem key={item.href} item={item} pathname={pathname} />)}
            </div>
          </div>
          <div>
            <SectionLabel>Workspace</SectionLabel>
            <div className="space-y-0.5">
              {allowedSettingsNav.map((item) => <NavItem key={item.href} item={item} pathname={pathname} />)}
            </div>
          </div>
        </nav>

        {/* Profile */}
        <div ref={profileRef} className="relative mt-auto border-t border-[var(--pm-line)] pt-4">
          {profileMenuOpen && (
            <div className="absolute bottom-[calc(100%-4px)] left-0 w-full origin-bottom rounded-[10px] border border-[var(--pm-line)] bg-white p-1 shadow-[0_8px_24px_-8px_rgba(9,9,11,0.15)] animate-in fade-in slide-in-from-bottom-1 duration-150">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-[6px] px-3 py-2 text-[13px] font-medium text-[#EF4444] transition-colors hover:bg-[#FEF2F2]"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}

          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-[var(--pm-band-hover)]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--pm-line)] bg-gradient-to-b from-white to-[var(--pm-band)] text-[12px] font-semibold text-[#52525B]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-medium">{displayName}</span>
                <span className="truncate text-[11px] text-[#71717A]">{roleLabel} · Starter Plan</span>
              </div>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              className={`shrink-0 text-[#A1A1AA] transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="min-h-screen bg-white md:pl-[260px]">
        <AppHeader />
        <main className="mx-auto max-w-[1600px] bg-white px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--pm-line)] bg-white/95 px-2 py-2 backdrop-blur md:hidden"
        aria-label="Mobile dashboard navigation"
      >
        {allowedNavigation.slice(0, 4).map((item) => {
          const active = isActivePath(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMoreOpen(false)}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-[8px] text-[11px] font-medium transition-colors ${
                active ? "bg-[var(--pm-active)] text-[var(--pm-ink)]" : "text-[#71717A]"
              }`}
            >
              <item.icon size={18} aria-hidden="true" />
              <span>{item.name === "Payment Links" ? "Links" : item.name}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setMobileMoreOpen((o) => !o)}
          aria-expanded={mobileMoreOpen}
          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-[8px] text-[11px] font-medium transition-colors ${
            mobileMoreOpen ? "bg-[var(--pm-active)] text-[var(--pm-ink)]" : "text-[#71717A]"
          }`}
        >
          <Settings size={18} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile more menu */}
      {mobileMoreOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMoreOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
          />
          <div
            id="mobile-more-menu"
            className="fixed inset-x-3 bottom-20 z-50 rounded-[14px] border border-[var(--pm-line)] bg-white p-2 shadow-[0_16px_40px_-12px_rgba(9,9,11,0.25)] animate-in fade-in slide-in-from-bottom-2 duration-150 md:hidden"
            aria-label="More dashboard navigation"
          >
            <div className="grid gap-0.5">
              {[...allowedNavigation.slice(4), ...allowedSettingsNav].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMoreOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-[8px] px-3 text-[13px] font-medium text-[#52525B] hover:bg-[var(--pm-band-hover)] hover:text-[var(--pm-ink)]"
                >
                  <item.icon size={18} aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
              <div className="my-1 h-px bg-[var(--pm-line)]" />
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 text-[13px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]"
              >
                <LogOut size={18} aria-hidden="true" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProviders>
  )
}