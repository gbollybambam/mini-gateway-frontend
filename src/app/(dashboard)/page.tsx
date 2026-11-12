"use client"

import { useEffect, useState } from "react"
import { isAxiosError } from "axios"
import Link from "next/link"
import { api } from "@/lib/api"
import { formatMoney } from "@/lib/money"
import type { TransactionResource } from "@/types/api"
import { ErrorMessage } from "@/components/dashboard/ui"
import { BalanceCard, ChartCard, EmptyState, KpiCard, PageHeader, StatusBadge } from "@/components/dashboard/DashboardComponents"

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

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
  : "—"

function getStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized.includes("success") || normalized.includes("complete") ? "success" : normalized.includes("pending") ? "pending" : "failed"
}

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
    return <div className="space-y-10"><PageHeader title="Overview" description="Your payment activity at a glance." /><div className="h-64 animate-pulse rounded-[16px] bg-brand-900/15" /><div className="h-20 animate-pulse border-y border-line bg-surface-muted" /><div className="h-72 animate-pulse bg-surface-muted" /></div>
  }

  if (error || !overview) return <ErrorMessage message={error || "Unable to load your overview."} retry={() => { setLoading(true); setRetryCount((count) => count + 1) }} />

  const { balances, metrics, recent_activity: activity } = overview
  const activityAmounts = activity.map((transaction) => Number(transaction.amount) || 0)
  const maxActivityAmount = Math.max(...activityAmounts, 1)
  const chartPoints = activityAmounts.map((amount) => Math.max(12, Math.round((amount / maxActivityAmount) * 100)))

  return (
    <div className="space-y-10">
      <PageHeader title="Overview" description="Your payment activity at a glance." action={<Link href="/payment-links/create" className="inline-flex h-10 items-center rounded-input bg-ink px-4 text-sm font-semibold text-surface transition-colors duration-120 hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-brand-500">Create payment link</Link>} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
        <div className="min-w-0 space-y-8">
          <BalanceCard amount={formatMoney(balances.available_balance)} />
          <section aria-labelledby="summary-title">
            <div className="flex items-center justify-between border-b border-line pb-3"><h2 id="summary-title" className="text-sm font-semibold text-ink">Summary</h2><span className="text-xs text-ink-muted">All time</span></div>
            <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-4 md:divide-x md:divide-y-0">
              <KpiCard label="Payment volume" value={formatMoney(metrics.total_payment_volume)} />
              <KpiCard label="Transactions" value={new Intl.NumberFormat("en-NG").format(metrics.transaction_count ?? activity.length)} />
              <KpiCard label="Withdrawals" value={formatMoney(metrics.total_withdrawals_volume ?? 0)} />
              <KpiCard label="Pending" value={formatMoney(balances.pending_balance)} />
            </div>
          </section>
          <ChartCard points={chartPoints} />
        </div>

        <aside className="hidden border-y border-line xl:block">
          <div className="border-b border-line py-3"><h2 className="text-sm font-semibold text-ink">Pending clearance</h2></div>
          <dl className="divide-y divide-line">
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-ink-muted">Pending balance</dt><dd className="text-sm font-semibold tabular-nums text-ink">{formatMoney(balances.pending_balance)}</dd></div>
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-ink-muted">Next payout</dt><dd className="text-sm text-ink">When cleared</dd></div>
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-ink-muted">Account status</dt><dd className="text-sm text-success">Ready</dd></div>
          </dl>
        </aside>
      </div>

      <section aria-labelledby="activity-title">
        <div className="flex items-center justify-between border-b border-line pb-3"><h2 id="activity-title" className="text-sm font-semibold text-ink">Recent activity</h2><Link href="/transactions" className="text-sm text-ink-muted transition-colors duration-120 hover:text-ink">View all</Link></div>
        {activity.length === 0 ? <EmptyState title="No activity yet" description="Your first successful payment will show up here." /> : <div className="divide-y divide-line">{activity.slice(0, 5).map((transaction) => <div key={transaction.id} className="flex min-w-0 items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-ink" title={transaction.reference}>{transaction.reference}</p><p className="mt-1 truncate text-xs text-ink-muted">{formatDate(transaction.created_at)}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold tabular-nums text-ink">{formatMoney(transaction.amount)}</p><StatusBadge status={getStatus(transaction.status)} /></div></div>)}</div>}
      </section>
    </div>
  )
}
