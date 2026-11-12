"use client"

import Link from "next/link"
import { ArrowUpRight, CheckCircle, CircleAlert, LoaderCircle } from "@/components/icons"

const pages = [
  { label: "Overview", href: "/", states: "Loading · Empty activity · Error · Long references" },
  { label: "Transactions", href: "/transactions", states: "Loading · Empty results · Error · Huge amounts" },
  { label: "Payment links", href: "/payment-links", states: "Loading · Empty links · Error · Long merchant names" },
  { label: "Wallet", href: "/wallets", states: "Loading · Empty ledger · Error · Huge balances" },
  { label: "Withdrawals", href: "/withdrawals", states: "Loading · Empty payouts · Error · Pending/failed" },
  { label: "Team management", href: "/team", states: "Loading · Empty team · Error · Long names" },
  { label: "API keys", href: "/api-keys", states: "Loading · Empty keys · Error · Long labels" },
  { label: "Webhooks", href: "/webhooks", states: "Loading · Empty deliveries · Error · Long URLs" },
  { label: "Settings", href: "/settings", states: "Loading · Error · Long business name" },
]

export default function ReviewIndexPage() {
  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-ink sm:px-8 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-brand-500">Dashboard review</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Every route, one place.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">Use this index to inspect each dashboard surface at mobile and desktop widths without changing the underlying API flow.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Link key={page.href} href={page.href} className="group rounded-card bg-surface p-5 shadow-card transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-success-tint text-success"><ArrowUpRight size={18} /></span>
                <ArrowUpRight size={17} className="text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <h2 className="mt-5 text-base font-semibold">{page.label}</h2>
              <p className="mt-2 text-xs leading-5 text-ink-muted">{page.states}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-card bg-surface p-5 shadow-card"><LoaderCircle className="text-brand-500" /><p className="mt-3 text-sm font-semibold">Loading</p><p className="mt-1 text-xs text-ink-muted">Skeletons keep layout stable.</p></div>
          <div className="rounded-card bg-surface p-5 shadow-card"><CircleAlert className="text-danger" /><p className="mt-3 text-sm font-semibold">Error</p><p className="mt-1 text-xs text-ink-muted">Recovery stays close to the problem.</p></div>
          <div className="rounded-card bg-surface p-5 shadow-card"><CheckCircle className="text-success" /><p className="mt-3 text-sm font-semibold">Ready</p><p className="mt-1 text-xs text-ink-muted">Successful states use text and color.</p></div>
        </div>
      </div>
    </main>
  )
}
