"use client"

import * as React from "react"
import {
  Check,
  ChevronRight,
  Copy,
  EyeOff,
  Medal,
  Paperclip,
  PaperPlaneTilt,
} from "@/components/icons"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

function CardFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <article className={cn("relative overflow-hidden rounded-card bg-surface shadow-card", className)}>{children}</article>
}

function ProgressTrack({ value, segments }: { value: number; segments?: Array<{ value: number; className: string }> }) {
  return (
    <div className="flex h-2 overflow-hidden rounded-pill bg-track" aria-hidden="true">
      {segments ? segments.map((segment) => <span key={segment.className} className={cn("h-full", segment.className)} style={{ width: `${segment.value}%` }} />) : <span className="h-full rounded-pill bg-brand-500" style={{ width: `${value}%` }} />}
    </div>
  )
}

export function ReplicaBalanceCard() {
  const [hidden, setHidden] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  async function copyAccount() {
    await navigator.clipboard?.writeText("0167819260")
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <CardFrame className="h-full bg-brand-900 p-6 text-surface sm:p-8">
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-brand-800 opacity-60" viewBox="0 0 880 350" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-40 90C90 10 140 180 260 100S390 30 460 100s120 100 220 20 130-40 240 30" fill="none" stroke="currentColor" strokeWidth="38" strokeLinecap="round" />
        <path d="M-30 260c110-90 190 40 310-40s180-100 270-20 170 80 350-10" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" opacity=".8" />
      </svg>
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-surface/70">Your balance na</p>
            <p className="mt-2 text-4xl font-bold tracking-[-0.03em]">{hidden ? "••••••" : formatMoney(2480)}</p>
          </div>
          <button type="button" onClick={() => setHidden((value) => !value)} aria-label={hidden ? "Show balance" : "Hide balance"} className="grid size-10 place-items-center text-surface transition-colors hover:text-surface/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface">
            <EyeOff size={25} aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-surface/70">Account details na</p>
            <p className="mt-2 truncate text-base">Jelil Ajao (0167819260)</p>
          </div>
          <button type="button" onClick={copyAccount} aria-label="Copy account number" className="grid size-9 shrink-0 place-items-center text-surface transition-colors hover:text-surface/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface">
            {copied ? <Check size={22} aria-hidden="true" /> : <Copy size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </CardFrame>
  )
}

export function ReplicaGoalCard() {
  return (
    <CardFrame className="h-full p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Japa saving</h2>
        <ChevronRight size={25} className="text-ink-muted" aria-hidden="true" />
      </div>
      <div className="mt-5 border-t border-line pt-5">
        <div className="flex items-center justify-between gap-4 text-base">
          <p className="text-ink-muted">Saved: <span className="font-semibold text-ink">{formatMoney(1200400, { decimals: 0 })}</span></p>
          <p className="text-brand-500">47% completed</p>
        </div>
        <ProgressTrack value={47} />
        <div className="mt-5 flex items-start justify-between gap-4">
          <p className="max-w-[85%] text-base italic leading-7 text-ink-muted">You don save {formatMoney(350000, { decimals: 0 })} out of {formatMoney(2000000, { decimals: 0 })}. Na 17% be dat. Steady dey drop, you go soon reach your goal.</p>
          <Medal size={39} className="shrink-0 text-pending" aria-hidden="true" />
        </div>
      </div>
    </CardFrame>
  )
}

export function ReplicaSavingsTracker() {
  return (
    <CardFrame className="h-full p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Savings tracker</h2>
        <p className="text-lg text-ink-muted">You don save: <span className="font-semibold text-brand-500">{formatMoney(7000, { decimals: 0 })}</span></p>
      </div>
      <div className="mt-5"><ProgressTrack value={40} /></div>
    </CardFrame>
  )
}

export function ReplicaLimitCard() {
  return (
    <CardFrame className="h-full p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Daily limit</h2>
        <button type="button" className="text-lg text-brand-500 hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">Edit</button>
      </div>
      <div className="mt-5 space-y-5 border-t border-line pt-5 text-lg">
        <div className="flex items-center justify-between gap-4"><span className="text-ink-muted">Transfer limit</span><strong>{formatMoney(30000, { decimals: 0 })}</strong></div>
        <div className="flex items-center justify-between gap-4"><span className="text-ink-muted">Bill payment limit</span><strong>{formatMoney(10000, { decimals: 0 })}</strong></div>
      </div>
    </CardFrame>
  )
}

export function ReplicaSpendingTracker() {
  return (
    <CardFrame className="h-full p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Spending tracker</h2>
        <p className="text-lg text-ink-muted">You don spend: <span className="font-semibold text-danger">{formatMoney(12400, { decimals: 0 })}</span></p>
      </div>
      <div className="mt-5"><ProgressTrack value={0} segments={[
        { value: 18, className: "bg-cat-food" },
        { value: 18, className: "bg-cat-tfare" },
        { value: 12, className: "bg-cat-data" },
        { value: 23, className: "bg-cat-transfer" },
      ]} /></div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink">
        {[["Food", "bg-cat-food"], ["T-fare", "bg-cat-tfare"], ["Data", "bg-cat-data"], ["Transfer", "bg-cat-transfer"]].map(([label, color]) => <span key={label} className="inline-flex items-center gap-2"><span className={cn("size-2 rounded-full", color)} />{label}</span>)}
      </div>
    </CardFrame>
  )
}

function TransactionIcon({ pending }: { pending?: boolean }) {
  return <span className={cn("grid size-16 shrink-0 place-items-center rounded-full", pending ? "bg-success-tint text-success" : "bg-danger-tint text-danger")}><PaperPlaneTilt size={28} weight="fill" aria-hidden="true" /></span>
}

export function ReplicaTransactionCard({ pending = false }: { pending?: boolean }) {
  return (
    <CardFrame className="h-full p-6 sm:p-8">
      <div className="flex items-center gap-5">
        <TransactionIcon pending={pending} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-medium">{pending ? "Olamide Onanuga" : "Veracity Johnson"}</p>
          <p className="mt-2 text-lg text-ink-muted">27th Jan, 2025. | 7:18PM</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-semibold">{formatMoney(pending ? 12400 : 10000, { decimals: 0 })}</p>
          <p className={cn("mt-2 text-lg", pending ? "text-pending" : "text-success")}>{pending ? "Pending" : "Successful"}</p>
        </div>
      </div>
    </CardFrame>
  )
}

export function ReplicaNotificationCard() {
  return (
    <CardFrame className="h-full p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-success-tint text-success"><Paperclip size={25} aria-hidden="true" /></span>
        <h2 className="text-2xl font-medium">You don send Adewale Ayuba money.</h2>
      </div>
      <div className="mt-5 border-t border-line pt-5">
        <p className="text-lg leading-8">You send {formatMoney(20000, { decimals: 0 })} to Adewale Ayuba and him don receive the money.</p>
        <div className="mt-5 flex items-center justify-between gap-4 text-lg">
          <span className="text-ink-muted">Yesterday | 12:37 PM</span>
          <button type="button" className="inline-flex items-center gap-4 text-brand-500 hover:text-brand-800">See details <ChevronRight size={22} aria-hidden="true" /></button>
        </div>
      </div>
    </CardFrame>
  )
}
