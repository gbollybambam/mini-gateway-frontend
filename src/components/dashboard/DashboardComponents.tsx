"use client"

import * as React from "react"
import { Check, ChevronDown, Copy, Eye, EyeOff, MoreHorizontal, TrendingUp } from "@/components/icons"
import { StatusBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type DashboardIcon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false"; size?: number }>

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold leading-tight text-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <TrendingUp size={20} className="text-ink-muted" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export function KpiCard({ label, value, detail, icon: Icon = TrendingUp }: { label: string; value: string; detail?: string; icon?: DashboardIcon }) {
  return (
    <div className="min-w-0 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm text-ink-muted">{label}</p>
        {detail ? <span className="text-xs text-ink-muted">{detail}</span> : null}
      </div>
      <p className="mt-2 whitespace-nowrap text-base font-semibold tabular-nums text-ink sm:text-xl" title={value}>{value}</p>
      <Icon className="sr-only" aria-hidden="true" size={16} />
    </div>
  )
}

export function ChartCard({ title = "Payment volume", subtitle = "Recent activity", points = [] }: { title?: string; subtitle?: string; points?: number[] }) {
  const [mode, setMode] = React.useState<"line" | "bar">("bar")
  return (
    <section className="min-w-0">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
        <div><h2 className="text-sm font-semibold text-ink">{title}</h2><p className="mt-1 text-xs text-ink-muted">{subtitle}</p></div>
        <div className="flex gap-4 text-sm" role="group" aria-label="Chart type">
          {(["line", "bar"] as const).map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={cn("text-ink-muted transition-colors duration-120 hover:text-ink", mode === item && "font-semibold text-ink")} aria-pressed={mode === item}>{item}</button>)}
        </div>
      </div>
      <div className="mt-6 h-56 w-full">
        {points.length === 0 ? <div className="grid h-full place-items-center text-sm text-ink-muted">Payment volume will appear after your first transaction.</div> : mode === "line" ? (
          <svg viewBox="0 0 600 220" className="h-full w-full" role="img" aria-label="Payment volume trend">
            <polyline points={points.map((point, index) => `${(index / Math.max(points.length - 1, 1)) * 600},${220 - point * 2}`).join(" ")} fill="none" stroke="var(--brand-500)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <div className="flex h-full items-end gap-2 sm:gap-3" aria-label="Payment volume by month">
            {points.map((point, index) => <div key={index} className="flex h-full min-w-0 flex-1 items-end"><div className={cn("w-full rounded-t-input", index === points.length - 2 ? "bg-brand-500" : "bg-track")} style={{ height: `${point}%` }} /></div>)}
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-between text-xs text-ink-muted">{["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((month) => <span key={month}>{month}</span>)}</div>
    </section>
  )
}

type TableColumn<T> = { key: string; label: string; render: (row: T) => React.ReactNode; sortable?: boolean }

export function DataTable<T extends { id: string }>({ columns, rows, empty, loading = false, onSort }: { columns: TableColumn<T>[]; rows: T[]; empty: React.ReactNode; loading?: boolean; onSort?: (key: string) => void }) {
  return (
    <div className="overflow-x-auto border-y border-line">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs font-medium text-ink-muted"><tr>{columns.map((column) => <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-3">{column.sortable ? <button type="button" className="inline-flex items-center gap-1 hover:text-ink" onClick={() => onSort?.(column.key)}>{column.label}<ChevronDown size={14} aria-hidden="true" /></button> : column.label}</th>)}<th className="w-12 px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody className="divide-y divide-line">
          {loading ? Array.from({ length: 5 }).map((_, index) => <tr key={index} className="animate-pulse">{columns.map((column) => <td key={column.key} className="px-4 py-5"><div className="h-4 w-24 rounded-input bg-track" /></td>)}<td /></tr>) : rows.length === 0 ? <tr><td colSpan={columns.length + 1}>{empty}</td></tr> : rows.map((row) => <tr key={row.id} className="transition-colors duration-120 hover:bg-surface-muted/60">{columns.map((column) => <td key={column.key} className="max-w-72 px-4 py-4 align-middle">{column.render(row)}</td>)}<td className="px-4 py-4 text-right"><button type="button" aria-label={`Actions for ${row.id}`} className="grid size-8 place-items-center rounded-input text-ink-muted hover:text-ink"><MoreHorizontal size={18} aria-hidden="true" /></button></td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

export function BalanceCard({ amount, accountName = "Your merchant account", accountNumber }: { amount: string; accountNumber?: string; accountName?: string }) {
  const [hidden, setHidden] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  async function copyAccount() {
    if (!accountNumber) return
    await navigator.clipboard?.writeText(accountNumber)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="balance-card relative overflow-hidden rounded-[16px] bg-brand-900 p-6 text-surface sm:p-8">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-20" viewBox="0 0 800 320" preserveAspectRatio="none"><path d="M-40 250C140 80 260 360 450 140S710 60 840 190" fill="none" stroke="var(--brand-500)" strokeWidth="2" /><path d="M-40 290C140 120 260 400 450 180S710 100 840 230" fill="none" stroke="var(--brand-500)" strokeWidth="1" /></svg>
      <div className="relative">
        <div className="flex items-center justify-between gap-4"><p className="text-sm text-surface/70">Your balance</p><button type="button" aria-label={hidden ? "Show balance" : "Hide balance"} onClick={() => setHidden((value) => !value)} className="grid size-9 place-items-center rounded-input text-surface/80 hover:bg-white/10">{hidden ? <Eye size={20} weight="bold" /> : <EyeOff size={20} weight="bold" />}</button></div>
        <p className="mt-4 whitespace-nowrap text-[28px] font-semibold leading-none tabular-nums sm:text-[40px]">{hidden ? "••••••" : amount}</p>
        <div className="mt-10 flex items-end justify-between gap-4"><div className="min-w-0"><p className="text-xs text-surface/60">Account details</p><p className="mt-1 truncate text-sm font-medium">{accountName}{accountNumber ? ` · ${accountNumber}` : ""}</p></div>{accountNumber ? <button type="button" onClick={copyAccount} className="grid size-9 shrink-0 place-items-center rounded-input text-surface/80 hover:bg-white/10" aria-label="Copy account number">{copied ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}</button> : null}</div>
      </div>
      {copied ? <span className="absolute bottom-4 right-6 text-xs text-surface/70">Copied</span> : null}
    </div>
  )
}

export { StatusBadge }
