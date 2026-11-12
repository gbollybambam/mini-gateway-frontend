"use client"

import { useEffect, useState } from "react"
import { isAxiosError } from "axios"
import Link from "next/link"
import { ArrowDownToLine, BarChart3, Clock3, Receipt, Wallet } from "@/components/icons"
import { api } from "@/lib/api"
import type { TransactionResource } from "@/types/api"
import { ErrorMessage } from "@/components/dashboard/ui"
import { BalanceCard, ChartCard, DataTable, EmptyState, KpiCard, PageHeader, StatusBadge } from "@/components/dashboard/DashboardComponents"

export interface DashboardOverview {
  currency: string
  balances: { available_balance: number; pending_balance: number }
  metrics: {
    total_payment_volume: number
    transaction_count?: number
    total_withdrawals_volume?: number
    withdrawal_count?: number
  }
  recent_activity: TransactionResource[]
}

const formatNaira = (value: unknown) => `₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)}`
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—"

export default function DashboardOverviewPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let mounted = true
    api.get<{ data: DashboardOverview }>("/dashboard/overview", { signal: controller.signal })
      .then((response) => {
        if (!mounted) return
        setOverview(response.data.data)
        setError("")
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted || controller.signal.aborted) return
        setError(isAxiosError(err) ? err.response?.data?.message || "Unable to load your overview." : "Unable to load your overview.")
        setLoading(false)
      })
    return () => { mounted = false; controller.abort() }
  }, [retryCount])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" description="Your payment activity at a glance." />
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"><div className="h-64 animate-pulse rounded-card bg-brand-900/15" /><div className="h-64 animate-pulse rounded-card bg-surface shadow-card" /></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-card bg-surface shadow-card" />)}</div>
      </div>
    )
  }

  if (error || !overview) {
    return <ErrorMessage message={error || "Unable to load your overview."} retry={() => { setLoading(true); setRetryCount((count) => count + 1) }} />
  }

  const { balances, metrics, recent_activity: activity } = overview
  const rows = activity.map((transaction) => ({ ...transaction, id: String(transaction.id) }))
  const activityAmounts = activity.map((transaction) => Number(transaction.amount) || 0)
  const maxActivityAmount = Math.max(...activityAmounts, 1)
  const chartPoints = activityAmounts.map((amount) => Math.max(12, Math.round((amount / maxActivityAmount) * 100)))

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="Your payment activity at a glance." action={<Link href="/payment-links/create" className="inline-flex h-11 items-center rounded-pill bg-ink px-5 text-sm font-semibold text-ink hover:bg-ink/90">Create payment link</Link>} />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <BalanceCard amount={formatNaira(balances.available_balance)} />
        <div className="dashboard-card flex flex-col justify-between p-6">
          <div>
            <p className="text-sm font-medium text-ink-muted">Pending clearance</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink">{formatNaira(balances.pending_balance)}</p>
          </div>
          <div className="mt-8 rounded-input bg-success-tint p-4 text-sm leading-6 text-ink">
            <span className="font-semibold">Your account is ready.</span> Payments and payouts will appear here as they move.
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total payment volume" value={formatNaira(metrics.total_payment_volume)} icon={BarChart3} detail="All time" />
        <KpiCard label="Total transactions" value={new Intl.NumberFormat("en-NG").format(metrics.transaction_count ?? activity.length)} icon={Receipt} tone="success" />
        <KpiCard label="Total withdrawals" value={formatNaira(metrics.total_withdrawals_volume ?? 0)} icon={ArrowDownToLine} tone="danger" />
        <KpiCard label="Pending balance" value={formatNaira(balances.pending_balance)} icon={Clock3} tone="pending" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard points={chartPoints} />
        <div className="dashboard-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-lg font-semibold text-ink">Recent activity</h2><p className="mt-1 text-sm text-ink-muted">Latest money movement</p></div>
            <Link href="/transactions" className="text-sm font-semibold text-brand-500 hover:text-brand-800">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {activity.length === 0 ? <EmptyState title="No activity yet" description="Your first successful payment will show up here." /> : activity.slice(0, 5).map((transaction) => {
              const status = transaction.status.toLowerCase().includes("success") || transaction.status.toLowerCase().includes("complete") ? "success" : transaction.status.toLowerCase().includes("pending") ? "pending" : "failed"
              return <div key={transaction.id} className="flex min-w-0 items-center justify-between gap-3 py-4">
                <div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-tint text-success"><Wallet size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{transaction.reference}</p><p className="truncate text-xs text-ink-muted">{formatDate(transaction.created_at)}</p></div></div>
                <div className="shrink-0 text-right"><p className="text-sm font-semibold text-ink">{formatNaira(transaction.amount)}</p><StatusBadge status={status} /></div>
              </div>
            })}
          </div>
        </div>
      </div>
      <DataTable
        columns={[
          { key: "reference", label: "Reference", sortable: true, render: (row) => <span className="block truncate font-semibold text-ink" title={row.reference}>{row.reference}</span> },
          { key: "amount", label: "Amount", sortable: true, render: (row) => <span className="font-semibold text-ink">{formatNaira(row.amount)}</span> },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status.toLowerCase().includes("success") ? "success" : row.status.toLowerCase().includes("pending") ? "pending" : "failed"} /> },
          { key: "date", label: "Date", sortable: true, render: (row) => <span className="text-ink-muted">{formatDate(row.created_at)}</span> },
        ]}
        rows={rows}
        empty={<EmptyState title="No transactions yet" description="Transactions generated by your API or payment links will appear here." />}
        loading={false}
      />
    </div>
  )
}
