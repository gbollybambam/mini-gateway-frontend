"use client"

import * as React from "react"
import Image from "next/image"
import {
  ReplicaBalanceCard,
  ReplicaGoalCard,
  ReplicaLimitCard,
  ReplicaNotificationCard,
  ReplicaSavingsTracker,
  ReplicaSpendingTracker,
  ReplicaTransactionCard,
} from "@/components/replica/ReplicaCards"

const cards = [
  { id: "balance", label: "Balance card", width: 733, height: 312, component: <ReplicaBalanceCard />, crop: "/dev-reference/balance.png" },
  { id: "goal", label: "Japa saving", width: 733, height: 325, component: <ReplicaGoalCard />, crop: "/dev-reference/goal.png" },
  { id: "savings", label: "Savings tracker", width: 733, height: 179, component: <ReplicaSavingsTracker />, crop: "/dev-reference/savings.png" },
  { id: "limit", label: "Daily limit", width: 733, height: 268, component: <ReplicaLimitCard />, crop: "/dev-reference/limit.png" },
  { id: "spending", label: "Spending tracker", width: 733, height: 201, component: <ReplicaSpendingTracker />, crop: "/dev-reference/spending.png" },
  { id: "notification", label: "Notification", width: 733, height: 312, component: <ReplicaNotificationCard />, crop: "/dev-reference/notification.png" },
  { id: "success", label: "Successful transaction", width: 733, height: 188, component: <ReplicaTransactionCard />, crop: "/dev-reference/success.png" },
  { id: "pending", label: "Pending transaction", width: 733, height: 189, component: <ReplicaTransactionCard pending />, crop: "/dev-reference/pending.png" },
]

export default function ReplicaPage() {
  const [overlay, setOverlay] = React.useState(false)

  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Card replica gate</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">Reference crops and real components at the same scale.</p>
          </div>
          <label className="inline-flex items-center gap-3 text-sm text-ink-muted">
            <input type="checkbox" checked={overlay} onChange={(event) => setOverlay(event.target.checked)} className="size-4 accent-brand-500" />
            Overlay reference
          </label>
        </div>
        <div className="mt-8 grid gap-8">
          {cards.map((card) => (
            <section key={card.id} data-replica-card={card.id} className="min-w-0">
              <h2 className="mb-3 text-sm font-medium text-ink-muted">{card.label}</h2>
              <div className="flex min-w-0 gap-4 overflow-x-auto pb-2" data-replica-pair={card.id}>
                <div className="relative shrink-0 overflow-hidden rounded-card bg-surface-muted" style={{ width: card.width / 2, height: card.height / 2 }}>
                  <Image src={card.crop} alt={`${card.label} reference crop`} width={card.width} height={card.height} className="block h-full w-full" unoptimized />
                  {overlay ? <div className="pointer-events-none absolute inset-0 p-3 opacity-50">{card.component}</div> : null}
                </div>
                <div className="relative shrink-0 p-3" data-replica-render style={{ width: card.width / 2, height: card.height / 2 }}>{card.component}</div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
