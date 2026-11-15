"use client"

import { useEffect, useMemo, useState } from "react"
import { isAxiosError } from "axios"
import Link from "next/link"
import { api } from "@/lib/api"
import { formatMoney } from "@/lib/money"
import type { TransactionResource } from "@/types/api"
import { ErrorMessage } from "@/components/dashboard/ui"
import { EmptyState } from "@/components/dashboard/DashboardComponents"
import { AnimatedNumber } from "@/components/dashboard/motion"

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

/* ---------- tiny icon set ---------- */
type IconProps = { className?: string; size?: number }
const Svg = ({ size = 16, className, children, sw = 1.5 }: IconProps & { children: React.ReactNode; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
)
const HistoryIcon = (p: IconProps) => <Svg {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></Svg>
const WalletIcon = (p: IconProps) => <Svg {...p}><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" /><path d="M16 13h2" /></Svg>
const ClockIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
const VolumeIcon = (p: IconProps) => <Svg {...p}><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></Svg>
const CountIcon = (p: IconProps) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Svg>
const ArrowUpRight = (p: IconProps) => <Svg {...p} sw={2}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></Svg>
const PulseIcon = (p: IconProps) => <Svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Svg>
const LinkIcon2 = (p: IconProps) => <Svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Svg>
const CoinIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v8" /><path d="M9.5 10.5h3a2 2 0 0 1 0 4h-1a2 2 0 0 0 0 4h3.5" transform="translate(0 -2.5) scale(1 .85)" /></Svg>

/* ---------- shared surface styles (tokens live in globals.css) ---------- */
const LINE = "border-[var(--pm-line)]"
const BAND = "bg-[var(--pm-band)]"
const BTN =
  "inline-flex w-fit items-center gap-2 rounded-[8px] border border-[var(--pm-line)] bg-[var(--pm-band)] text-[var(--pm-ink)] shadow-[0_1px_2px_rgba(9,9,11,0.06)] transition-all duration-150 hover:bg-[var(--pm-band-hover)] active:scale-[0.98]"

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] border ${LINE} ${BAND} text-[#52525B]`}>
      {children}
    </span>
  )
}

/* ---------- helpers ---------- */
const SUCCESS = ["success", "successful", "complete", "completed", "paid", "settled"]
const FAILED = ["failed", "declined", "error", "reversed"]
const PENDING = ["pending", "processing", "initiated", "initialized"]
const norm = (s?: string | null) => (s || "pending").toLowerCase()

const formatDate = (value: string | null | undefined) =>
  value ? new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—"

const formatAmount = (value: number, currency?: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 2 }).format(value || 0)

const formatCount = (value: number) => new Intl.NumberFormat("en-NG").format(Math.round(value))

const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function niceStep(rough: number) {
  if (rough <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(rough)))
  const f = rough / pow
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nice * pow
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = norm(status)
  const cfg = FAILED.includes(s)
    ? { cls: "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]", dot: "bg-[#EF4444]", pulse: false }
    : SUCCESS.includes(s)
      ? { cls: "bg-[#ECFDF5] border-[#BBF7D0] text-[#059669]", dot: "bg-[#10B981]", pulse: false }
      : PENDING.includes(s)
        ? { cls: "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]", dot: "bg-[#F59E0B]", pulse: true }
        : { cls: "bg-[#F4F4F5] border-[#E4E4E7] text-[#52525B]", dot: "bg-[#A1A1AA]", pulse: false }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium capitalize ${cfg.cls}`}>
      <span className={`size-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "pm-dot-pulse" : ""}`} />
      {status || "Pending"}
    </span>
  )
}

function StatCard({
  icon, label, value, tag, tagClass, description, delay = 0,
}: { icon: React.ReactNode; label: string; value: React.ReactNode; tag: string; tagClass: string; description: string; delay?: number }) {
  return (
    <div
      className={`pm-rise group flex flex-col justify-between rounded-[12px] border ${LINE} bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-[0_8px_24px_-12px_rgba(9,9,11,0.12)]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className={`inline-flex size-9 items-center justify-center rounded-[8px] border ${LINE} ${BAND} text-[#52525B] transition-all duration-200 group-hover:scale-105 group-hover:border-[#09090B] group-hover:bg-[#09090B] group-hover:text-white`}>
            {icon}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tagClass}`}>{tag}</span>
        </div>
        <p className="mb-1 text-[13px] font-medium text-[#71717A]">{label}</p>
        <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#09090B] tabular-nums">{value}</h2>
      </div>
      <p className="mt-5 text-[12px] leading-[1.6] text-[#71717A]">{description}</p>
    </div>
  )
}

/* ---------- revenue chart (real data from recent activity) ---------- */
function RevenueChart({ values, currentMonth, available, delay = 0 }: { values: number[]; currentMonth: number; available: number; delay?: number }) {
  const [view, setView] = useState<"line" | "bar">("bar")
  const [hover, setHover] = useState<number | null>(null)

  const max = Math.max(...values, 0)
  const step = niceStep((max || 4) / 4)
  const top = step * 4
  const ticks = [4, 3, 2, 1, 0].map((i) => i * step)

  const W = 600, H = 220, PAD = 10
  const pts = values.map((v, i) => ({ x: ((i + 0.5) / 12) * W, y: H - PAD - (v / top) * (H - PAD * 2) }))
  const linePath = pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = pts[i - 1]
    const cx = (prev.x + p.x) / 2
    return `${d} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`
  }, "")
  const areaPath = `${linePath} L ${pts[11].x} ${H} L ${pts[0].x} ${H} Z`
  const hasData = values.some((v) => v > 0)

  return (
    <div
      className={`pm-rise flex flex-col overflow-hidden rounded-[12px] border ${LINE} bg-white lg:col-span-2`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header band */}
      <div className={`flex items-start justify-between gap-4 border-b ${LINE} ${BAND} px-6 py-4`}>
        <div>
          <p className="text-[13px] text-[#71717A]">Available Balance</p>
          <h3 className="mt-1 text-[26px] font-bold leading-none tracking-[-0.025em] text-[#09090B] tabular-nums">
            <AnimatedNumber value={available} format={formatMoney} />
          </h3>
          <p className="mt-2 text-[12px] text-[#A1A1AA]">Successful payments by month · {new Date().getFullYear()}</p>
        </div>
        <div className={`flex items-center gap-0.5 rounded-[8px] border ${LINE} ${BAND} p-0.5`} role="tablist" aria-label="Chart view">
          {(["line", "bar"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium capitalize transition-all ${
                view === v
                  ? `border ${LINE} bg-[var(--pm-raised)] text-[var(--pm-ink)] shadow-sm`
                  : "border border-transparent text-[#71717A] hover:text-[var(--pm-ink)]"
              }`}
            >
              {v} view
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-1">
          {/* Y axis labels */}
          <div className="relative mr-3 min-h-52 w-9 shrink-0">
            {ticks.map((t, i) => (
              <span key={t} className="absolute right-0 -translate-y-1/2 text-[11px] font-medium text-[#A1A1AA] tabular-nums" style={{ top: `${(i / 4) * 100}%` }}>
                {t === 0 ? "0" : compact(t)}
              </span>
            ))}
          </div>

          {/* Plot */}
          <div className="relative min-h-52 flex-1">
            {ticks.map((t, i) => (
              <div key={t} className={`absolute inset-x-0 border-t ${i === 4 ? "border-[var(--pm-line)]" : "border-dashed border-[var(--pm-line)] opacity-60"}`} style={{ top: `${(i / 4) * 100}%` }} />
            ))}

            {view === "line" && (
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#09090B" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaFill)" className="pm-area-in" />
                <path
                  d={linePath}
                  pathLength={1}
                  fill="none"
                  stroke="#09090B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="pm-line-draw"
                />
              </svg>
            )}

            <div className="absolute inset-0 flex">
              {values.map((v, i) => {
                const h = top > 0 ? (v / top) * 100 : 0
                const isCurrent = i === currentMonth
                const isHover = hover === i
                return (
                  <div
                    key={i}
                    className="relative flex h-full flex-1 cursor-pointer items-end justify-center"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  >
                    {isHover && (
                      <div className="pointer-events-none absolute z-20 -translate-y-2 whitespace-nowrap rounded-[8px] bg-[#09090B] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg" style={{ bottom: `${Math.min(h, 88)}%` }}>
                        <span className="text-[#A1A1AA]">{MONTHS[i]} · </span>{formatMoney(v)}
                      </div>
                    )}
                    {view === "bar" ? (
                      <div
                        style={{ height: `${Math.max(h, v > 0 ? 2 : 0)}%`, animationDelay: `${i * 28}ms` }}
                        className={`pm-bar-rise w-full max-w-[32px] rounded-t-[5px] transition-all duration-300 ${
                          isHover || isCurrent ? "bg-[#09090B]" : "bg-[#E4E4E7]"
                        }`}
                      />
                    ) : (
                      <span
                        className={`absolute left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white bg-[#09090B] shadow transition-opacity ${
                          isHover || isCurrent ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ bottom: `${(pts[i] ? (H - pts[i].y) / H : 0) * 100}%` }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {!hasData && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <p className={`rounded-full border ${LINE} bg-white px-3 py-1 text-[12px] text-[#71717A]`}>No successful payments this year yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex pl-12 text-[11px] font-medium text-[#A1A1AA] sm:text-[12px]">
          {MONTHS.map((m, i) => (
            <span key={m} className={`flex-1 text-center ${i === currentMonth ? "font-bold text-[#09090B]" : ""}`}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- page ---------- */
export default function DashboardOverviewPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let mounted = true
    const loadOverview = (showLoading: boolean) => {
      if (showLoading) setLoading(true)
      api.get<{ data: DashboardOverview }>("/dashboard/overview", { signal: controller.signal })
        .then((response) => {
          if (!mounted) return
          setOverview(response.data.data)
          setError("")
          setLoading(false)
        })
        .catch((err) => {
          if (!mounted || controller.signal.aborted) return
          if (showLoading) setError(isAxiosError(err) ? err.response?.data?.message || "Unable to load your overview." : "Unable to load your overview.")
          setLoading(false)
        })
    }

    loadOverview(true)
    const intervalId = window.setInterval(() => loadOverview(false), 5000)
    return () => { mounted = false; controller.abort(); window.clearInterval(intervalId) }
  }, [retryCount])

  const activity = useMemo(() => overview?.recent_activity ?? [], [overview])

  const monthly = useMemo(() => {
    const year = new Date().getFullYear()
    const sums = Array(12).fill(0) as number[]
    activity.forEach((t) => {
      if (!SUCCESS.includes(norm(t.status)) || !t.created_at) return
      const d = new Date(t.created_at)
      if (d.getFullYear() === year) sums[d.getMonth()] += Number(t.amount) || 0
    })
    return sums
  }, [activity])

  const insights = useMemo(() => {
    const success = activity.filter((t) => SUCCESS.includes(norm(t.status))).length
    const pending = activity.filter((t) => PENDING.includes(norm(t.status))).length
    const failed = activity.filter((t) => FAILED.includes(norm(t.status))).length
    const rate = activity.length ? Math.round((success / activity.length) * 100) : 0
    return { success, pending, failed, rate }
  }, [activity])

  if (loading) {
    return (
      <div className="min-h-screen space-y-6 bg-white">
        <div className="pm-skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className={`pm-skeleton h-44 rounded-[12px] border ${LINE}`} />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className={`pm-skeleton h-80 rounded-[12px] border ${LINE}`} />
          <div className={`pm-skeleton h-80 rounded-[12px] border ${LINE} lg:col-span-2`} />
        </div>
      </div>
    )
  }

  if (error || !overview) {
    return <ErrorMessage message={error || "Unable to load your overview."} retry={() => { setLoading(true); setRetryCount((c) => c + 1) }} />
  }

  const { balances, metrics } = overview
  const settledShare = balances.available_balance + balances.pending_balance > 0
    ? Math.round((balances.available_balance / (balances.available_balance + balances.pending_balance)) * 100)
    : 0

  const breakdown = [
    { label: "Success", count: insights.success, dot: "bg-[#10B981]" },
    { label: "Pending", count: insights.pending, dot: "bg-[#F59E0B]" },
    { label: "Failed", count: insights.failed, dot: "bg-[#EF4444]" },
  ]

  return (
    <div className="pm-no-page-in space-y-6 bg-white pb-10 font-sans text-[#09090B]">
      {/* Page heading */}
      <div className="pm-rise flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.025em]">Overview</h1>
          <p className="mt-1 text-[13px] text-[#71717A]">Here&apos;s what&apos;s happening with your payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pm-line)] bg-[var(--pm-band)] px-2.5 py-1 text-[11px] font-medium text-[#52525B]"
            title="Updates automatically every 5 seconds"
          >
            <span className="pm-live-dot" aria-hidden="true" />
            Live
          </span>
          <Link href="/transactions" className={`${BTN} px-3.5 py-2 text-[13px] font-medium`}>
            <HistoryIcon size={14} />
            History
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<WalletIcon size={18} />}
          label="Available Balance"
          value={<AnimatedNumber value={balances.available_balance} format={formatMoney} />}
          tag="Active funds"
          tagClass="bg-[#EFF6FF] text-[#2563EB]"
          description="Settled funds currently available for withdrawal to your bank account."
          delay={40}
        />
        <StatCard
          icon={<ClockIcon size={18} />}
          label="Pending Clearance"
          value={<AnimatedNumber value={balances.pending_balance} format={formatMoney} />}
          tag="Processing"
          tagClass="bg-[#FFFBEB] text-[#B45309]"
          description="Confirmed payments still waiting for the standard clearing cycle."
          delay={90}
        />
        <StatCard
          icon={<VolumeIcon size={18} />}
          label="Payment Volume"
          value={<AnimatedNumber value={metrics.total_payment_volume} format={formatMoney} />}
          tag="All time"
          tagClass="bg-[#ECFDF5] text-[#059669]"
          description="Total successful payment volume processed since this workspace began."
          delay={140}
        />
        <StatCard
          icon={<CountIcon size={18} />}
          label="Transactions"
          value={<AnimatedNumber value={metrics.transaction_count ?? activity.length} format={formatCount} />}
          tag="Total count"
          tagClass="bg-[#ECFDF5] text-[#059669]"
          description="Successful and pending transactions processed on this account."
          delay={190}
        />
      </div>

      {/* Insights + chart */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div
          className={`pm-rise flex h-full flex-col overflow-hidden rounded-[12px] border ${LINE} bg-white lg:col-span-1`}
          style={{ animationDelay: "240ms" }}
        >
          <div className={`border-b ${LINE} ${BAND} px-5 py-4`}>
            <h3 className="text-[15px] font-semibold tracking-tight">Workspace Insights</h3>
            <p className="mt-0.5 text-[12px] text-[#71717A]">Automated analysis of your recent activity</p>
          </div>

          <div className="flex flex-1 flex-col px-5">
            {/* Key insight */}
            <div className="py-5">
              <div className="flex items-center gap-3">
                <IconTile><PulseIcon size={16} /></IconTile>
                <span className="text-[13px] font-medium text-[#52525B]">Today&apos;s Key Insight</span>
              </div>
              <h4 className="mt-4 text-[22px] font-bold leading-tight tracking-[-0.02em]">
                {activity.length ? (
                  <>
                    <AnimatedNumber value={insights.rate} format={(value) => `${Math.round(value)}%`} /> success rate
                  </>
                ) : (
                  "Waiting for activity"
                )}
              </h4>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-[#71717A]">
                {activity.length
                  ? `Based on your latest ${activity.length} transactions.`
                  : "Insights will appear once your first payments come in."}
              </p>
              {activity.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {breakdown.map((b) => (
                    <div key={b.label} className={`rounded-[8px] border ${LINE} ${BAND} px-3 py-2`}>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#71717A]">
                        <span className={`size-1.5 rounded-full ${b.dot}`} />
                        {b.label}
                      </div>
                      <p className="mt-1 text-[18px] font-bold leading-none tabular-nums">
                        <AnimatedNumber value={b.count} format={formatCount} />
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action */}
            <Link href="/payment-links" className={`group flex items-center justify-between gap-3 border-t ${LINE} py-4`}>
              <span className="flex items-center gap-3">
                <IconTile><LinkIcon2 size={16} /></IconTile>
                <span className="text-[13px] font-medium text-[#52525B] transition-colors group-hover:text-[#09090B]">Optimize Checkout Links</span>
              </span>
              <span className="text-[#A1A1AA] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#09090B]">
                <ArrowUpRight size={14} />
              </span>
            </Link>

            {/* Progress */}
            <div className={`mt-auto border-t ${LINE} py-5`}>
              <div className="flex items-center gap-3">
                <IconTile><CoinIcon size={16} /></IconTile>
                <span className="flex-1 text-[13px] font-medium text-[#52525B]">Settlement Progress</span>
                <span className="text-[13px] font-semibold tabular-nums">
                  <AnimatedNumber value={settledShare} format={(value) => `${Math.round(value)}%`} />
                </span>
              </div>
              <div className="mt-3.5 h-[6px] w-full overflow-hidden rounded-full bg-[#E4E4E7]">
                <div className="h-full rounded-full bg-[#09090B] transition-all duration-700" style={{ width: `${settledShare}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-[#A1A1AA]">Share of your funds that has fully settled.</p>
            </div>
          </div>
        </div>

        <RevenueChart
          values={monthly}
          currentMonth={new Date().getMonth()}
          available={balances.available_balance}
          delay={290}
        />
      </div>

      {/* Recent activity */}
      <section
        className={`pm-rise overflow-hidden rounded-[12px] border ${LINE} bg-white`}
        style={{ animationDelay: "340ms" }}
      >
        <div className={`flex items-center justify-between border-b ${LINE} ${BAND} px-6 py-4`}>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">Recent Transactions</h3>
            <p className="mt-0.5 text-[12px] text-[#71717A]">Your latest payment activity</p>
          </div>
          <Link href="/transactions" className={`${BTN} px-3 py-1.5 text-[13px] font-medium`}>
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        {activity.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No activity yet" description="Your first successful payment will show up here." />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className={`border-b ${LINE} ${BAND}`}>
                <tr>
                  {["Reference", "Customer", "Date", "Amount", "Method", "Status"].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-3.5 text-[12px] font-medium uppercase tracking-wide text-[#71717A] ${
                        h === "Customer" ? "hidden md:table-cell" : h === "Date" ? "hidden lg:table-cell" : h === "Method" ? "hidden sm:table-cell" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--pm-line)] bg-white">
                {activity.slice(0, 5).map((t, index) => {
                  const raw = t as unknown as Record<string, unknown>
                  const customer = typeof raw.customer === "object" && raw.customer !== null ? (raw.customer as Record<string, unknown>) : null
                  const buyer =
                    (typeof raw.customer_name === "string" && raw.customer_name) ||
                    (typeof raw.payer_name === "string" && raw.payer_name) ||
                    (customer && typeof customer.name === "string" && customer.name) ||
                    (typeof raw.customer_email === "string" && raw.customer_email) ||
                    (typeof raw.payer_email === "string" && raw.payer_email) ||
                    (customer && typeof customer.email === "string" && customer.email) ||
                    "—"
                  const rawDate =
                    (typeof raw.created_at === "string" && raw.created_at) ||
                    (typeof raw.paid_at === "string" && raw.paid_at) ||
                    (typeof raw.date === "string" && raw.date) ||
                    null
                  const method =
                    (typeof raw.channel === "string" && raw.channel) ||
                    (typeof raw.payment_method === "string" && raw.payment_method) ||
                    (typeof raw.method === "string" && raw.method) ||
                    "—"
                  return (
                    <tr key={t.id || index} className="transition-colors hover:bg-[var(--pm-band)]">
                      <td className="whitespace-nowrap px-6 py-4 text-[13px] font-medium">
                        <span className="font-mono text-[12.5px]">{t.reference}</span>
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-4 text-[13px] text-[#52525B] md:table-cell">{buyer}</td>
                      <td className="hidden whitespace-nowrap px-6 py-4 text-[13px] text-[#52525B] lg:table-cell">{formatDate(rawDate)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-[13px] font-semibold tabular-nums">{formatAmount(Number(t.amount), t.currency)}</td>
                      <td className="hidden whitespace-nowrap px-6 py-4 text-[13px] capitalize text-[#52525B] sm:table-cell">{method.replace(/_/g, " ")}</td>
                      <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={t.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}