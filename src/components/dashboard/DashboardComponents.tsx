"use client"

import * as React from "react"
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  TrendingUp,
} from "@/components/icons"
import { StatusBadge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DashboardIcon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false"; size?: number }>

function AnimatedNumber({ value }: { value: string }) {
  return <span className="tabular-nums">{value}</span>
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-success-tint text-success">
        <TrendingUp size={20} aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  detail,
  icon: Icon = TrendingUp,
  tone = "brand",
}: {
  label: string
  value: string
  detail?: string
  icon?: DashboardIcon
  tone?: "brand" | "success" | "pending" | "danger"
}) {
  const toneClass = {
    brand: "bg-success-tint text-brand-500",
    success: "bg-success-tint text-success",
    pending: "bg-surface-muted text-pending",
    danger: "bg-danger-tint text-danger",
  }[tone]

  return (
    <Card className="dashboard-card dashboard-enter min-w-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("grid size-9 shrink-0 place-items-center rounded-full", toneClass)}>
          <Icon size={18} aria-hidden="true" />
        </div>
        {detail ? <span className="text-xs font-medium text-ink-muted">{detail}</span> : null}
      </div>
      <p className="mt-5 truncate text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold tracking-[-0.02em] text-ink" title={value}>
        <AnimatedNumber value={value} />
      </p>
    </Card>
  )
}

export function ChartCard({
  title = "Payment volume",
  subtitle = "Recent activity",
  points = [],
}: {
  title?: string
  subtitle?: string
  points?: number[]
}) {
  const [mode, setMode] = React.useState<"line" | "bar">("bar")
  const chartPoints = points.length > 0 ? points : []

  return (
    <Card className="dashboard-card min-w-0 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        </div>
        <div className="flex rounded-pill bg-surface-muted p-1" role="group" aria-label="Chart type">
          {(["line", "bar"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                mode === item ? "bg-surface text-ink shadow-card" : "text-ink-muted",
              )}
              aria-pressed={mode === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 h-56 w-full overflow-hidden">
        {chartPoints.length === 0 ? (
          <div className="grid h-full place-items-center rounded-input bg-surface-muted px-6 text-center text-sm text-ink-muted">
            Payment volume will appear after your first transaction.
          </div>
        ) : mode === "line" ? (
          <svg viewBox="0 0 600 220" className="h-full w-full" role="img" aria-label="Payment volume trend">
            <polyline
              points={chartPoints.map((point, index) => `${(index / Math.max(chartPoints.length - 1, 1)) * 600},${220 - point * 2}`).join(" ")}
              fill="none"
              stroke="var(--brand-500)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="dashboard-chart-enter"
            />
          </svg>
        ) : (
          <div className="flex h-full items-end gap-2 sm:gap-3" aria-label="Payment volume by month">
            {chartPoints.map((point, index) => (
              <div key={index} className="flex min-w-0 flex-1 items-end" title={`Month ${index + 1}`}>
                <div
                  className={cn(
                    "dashboard-chart-enter w-full rounded-t-pill",
                    index === chartPoints.length - 2 ? "bg-brand-500" : "bg-track",
                  )}
                  style={{ height: `${point}%`, animationDelay: `${index * 18}ms` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-ink-muted">
        {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((month) => <span key={month}>{month}</span>)}
      </div>
    </Card>
  )
}

type TableColumn<T> = {
  key: string
  label: string
  render: (row: T) => React.ReactNode
  sortable?: boolean
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty,
  loading = false,
  onSort,
}: {
  columns: TableColumn<T>[]
  rows: T[]
  empty: React.ReactNode
  loading?: boolean
  onSort?: (key: string) => void
}) {
  return (
    <div className="dashboard-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs font-semibold text-ink-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="whitespace-nowrap px-5 py-4">
                  {column.sortable ? (
                    <button type="button" className="inline-flex items-center gap-1.5 hover:text-ink" onClick={() => onSort?.(column.key)}>
                      {column.label}
                      <ChevronDown size={14} aria-hidden="true" />
                    </button>
                  ) : column.label}
                </th>
              ))}
              <th scope="col" className="w-12 px-4 py-4"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map((column) => <td key={column.key} className="px-5 py-5"><div className="h-4 w-24 rounded-pill bg-track" /></td>)}
                  <td className="px-4 py-5"><div className="size-5 rounded-full bg-track" /></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length + 1}>{empty}</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-surface-muted/60">
                {columns.map((column) => <td key={column.key} className="max-w-72 px-5 py-4 align-middle">{column.render(row)}</td>)}
                <td className="px-4 py-4 text-right">
                  <button type="button" aria-label={`Actions for ${row.id}`} className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink">
                    <MoreHorizontal size={18} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function BalanceCard({
  amount,
  accountName = "Your merchant account",
  accountNumber,
}: {
  amount: string
  accountNumber?: string
  accountName?: string
}) {
  const [hidden, setHidden] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  async function copyAccount() {
    if (!accountNumber) return
    await navigator.clipboard?.writeText(accountNumber)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Card className="balance-card relative overflow-hidden bg-brand-900 p-6 text-surface shadow-card sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand-800/60 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-surface/70">Your balance na</p>
          <button type="button" aria-label={hidden ? "Show balance" : "Hide balance"} onClick={() => setHidden((value) => !value)} className="grid size-9 place-items-center rounded-full bg-surface-muted text-surface/80 hover:bg-surface-muted/80">
            {hidden ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <p className="mt-3 truncate text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
          {hidden ? "••••••" : amount}
        </p>
        <div className="mt-8 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-surface/60">Account details na</p>
            <p className="mt-1 truncate text-sm font-medium">{accountName}{accountNumber ? ` · ${accountNumber}` : ""}</p>
          </div>
          {accountNumber ? (
            <button type="button" onClick={copyAccount} className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-surface/80 hover:bg-surface-muted/80" aria-label="Copy account number">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          ) : null}
        </div>
      </div>
      {copied ? <span className="absolute bottom-4 right-6 text-xs text-surface/70">Copied</span> : null}
    </Card>
  )
}

export { StatusBadge }
