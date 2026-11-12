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
  { id: "balance", label: "Balance card", width: 880, height: 350, component: <ReplicaBalanceCard />, crop: "/dev-reference/balance.png" },
  { id: "goal", label: "Japa saving", width: 880, height: 360, component: <ReplicaGoalCard />, crop: "/dev-reference/goal.png" },
  { id: "savings", label: "Savings tracker", width: 880, height: 170, component: <ReplicaSavingsTracker />, crop: "/dev-reference/savings.png" },
  { id: "limit", label: "Daily limit", width: 880, height: 282, component: <ReplicaLimitCard />, crop: "/dev-reference/limit.png" },
  { id: "spending", label: "Spending tracker", width: 880, height: 202, component: <ReplicaSpendingTracker />, crop: "/dev-reference/spending.png" },
  { id: "notification", label: "Notification", width: 880, height: 330, component: <ReplicaNotificationCard />, crop: "/dev-reference/notification.png" },
  { id: "success", label: "Successful transaction", width: 880, height: 185, component: <ReplicaTransactionCard />, crop: "/dev-reference/success.png" },
  { id: "pending", label: "Pending transaction", width: 880, height: 185, component: <ReplicaTransactionCard pending />, crop: "/dev-reference/pending.png" },
]

function ScaledReplica({ width, height, children }: { width: number; height: number; children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const update = () => setScale(Math.min(node.clientWidth / width, 1))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [width])

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-card bg-surface" style={{ height: height * scale }}>
      <div className="absolute left-0 top-0" style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  )
}

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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-card bg-surface-muted p-2" style={{ aspectRatio: `${card.width} / ${card.height}` }}>
                  <div className="relative h-full w-full">
                    <Image src={card.crop} alt={`${card.label} reference crop`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-contain" unoptimized />
                    {overlay ? <div className="pointer-events-none absolute inset-2 opacity-50"><ScaledReplica width={card.width} height={card.height}>{card.component}</ScaledReplica></div> : null}
                  </div>
                </div>
                <ScaledReplica width={card.width} height={card.height}>{card.component}</ScaledReplica>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
