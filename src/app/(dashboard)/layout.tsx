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
import { useEffect } from "react"
import { useState } from "react"

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Payment Links", href: "/payment-links", icon: LinkIcon },
  { name: "Wallet", href: "/wallets", icon: Wallet },
  { name: "Withdrawals", href: "/withdrawals", icon: Landmark },
]

const settingsNav = [
  { name: "Team Management", href: "/team", icon: Users },
  { name: "API Keys", href: "/api-keys", icon: KeyRound },
  { name: "Webhooks", href: "/webhooks", icon: Webhook },
  { name: "Settings", href: "/settings", icon: Settings },
]

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    if (loading || !user) return
    const role = user.role
    if (role === "owner" || role === "admin") return

    const restrictedForDeveloper = ["/wallets", "/withdrawals", "/team"]
    const restrictedForFinance = ["/api-keys", "/webhooks", "/team"]
    const isRestricted = (paths: string[]) => paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    if (role === "developer" && isRestricted(restrictedForDeveloper)) router.replace("/")
    if (role === "finance" && isRestricted(restrictedForFinance)) router.replace("/")
  }, [pathname, user, loading, router])

  const getAllowedNav = <T extends { name: string }>(items: T[]) => {
    if (!user || user.role === "owner" || user.role === "admin") return items
    if (user.role === "developer") return items.filter((item) => !["Wallet", "Withdrawals", "Team Management"].includes(item.name))
    if (user.role === "finance") return items.filter((item) => !["API Keys", "Webhooks", "Team Management"].includes(item.name))
    return items
  }

  const allowedNavigation = getAllowedNav(navigation)
  const allowedSettingsNav = getAllowedNav(settingsNav)
  const isRestricted = user?.role === "developer"
    ? ["/wallets", "/withdrawals", "/team"]
    : user?.role === "finance"
      ? ["/api-keys", "/webhooks", "/team"]
      : []

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="size-10 animate-pulse rounded-full bg-brand-500" aria-label="Loading dashboard" />
      </div>
    )
  }

  if (isRestricted.some((path) => pathname.startsWith(path))) return null

  const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false"; size?: number }> } }) => {
    const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
    return (
      <Link
        href={item.href}
        className={`group flex min-h-11 items-center gap-3 rounded-input px-4 text-sm font-medium transition-colors ${
          active ? "bg-surface-muted text-ink" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
        }`}
      >
        <item.icon size={19} className={active ? "text-brand-500" : "text-ink-muted group-hover:text-ink"} aria-hidden="true" />
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <div className="dashboard-root min-h-screen bg-bg text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-surface px-4 py-6 shadow-card md:flex">
        <Link href="/" className="mb-10 flex items-center gap-3 px-3" aria-label="Payflow overview">
          <span className="grid size-9 place-items-center rounded-input bg-brand-900 text-lg font-bold text-surface">P</span>
          <span className="text-lg font-bold tracking-[-0.03em] text-ink">Payflow</span>
        </Link>
        <nav className="flex-1 space-y-8" aria-label="Dashboard navigation">
          <div>
            <p className="mb-2 px-4 text-xs font-semibold text-ink-muted">Operations</p>
            <div className="space-y-1">{allowedNavigation.map((item) => <NavItem key={item.href} item={item} />)}</div>
          </div>
          <div>
            <p className="mb-2 px-4 text-xs font-semibold text-ink-muted">Workspace</p>
            <div className="space-y-1">{allowedSettingsNav.map((item) => <NavItem key={item.href} item={item} />)}</div>
          </div>
        </nav>
        <button type="button" onClick={logout} className="flex min-h-11 items-center gap-3 rounded-input px-4 text-sm font-medium text-ink-muted hover:bg-danger-tint hover:text-danger">
          <LogOut size={19} aria-hidden="true" /> Sign out
        </button>
      </aside>

      <div className="min-h-screen md:pl-64">
        <AppHeader />
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 px-2 py-2 shadow-card backdrop-blur md:hidden" aria-label="Mobile dashboard navigation">
        {allowedNavigation.slice(0, 4).map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-input text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${active ? "bg-surface-muted text-ink" : "text-ink-muted"}`}>
              <item.icon size={19} className={active ? "text-brand-500" : ""} aria-hidden="true" />
              <span>{item.name === "Payment Links" ? "Links" : item.name}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setMobileMoreOpen((open) => !open)}
          aria-expanded={mobileMoreOpen}
          aria-controls="mobile-more-menu"
          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-input text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${mobileMoreOpen ? "bg-surface-muted text-ink" : "text-ink-muted"}`}
        >
          <Settings size={19} className={mobileMoreOpen ? "text-brand-500" : ""} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
      {mobileMoreOpen ? (
        <div id="mobile-more-menu" className="fixed inset-x-3 bottom-20 z-50 rounded-card bg-surface p-3 shadow-card md:hidden" aria-label="More dashboard navigation">
          <div className="grid gap-1">
            {[...allowedNavigation.slice(4), ...allowedSettingsNav].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMoreOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                <item.icon size={18} aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardProviders><DashboardLayoutContent>{children}</DashboardLayoutContent></DashboardProviders>
}
