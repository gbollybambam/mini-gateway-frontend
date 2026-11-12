import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-surface-muted text-ink",
  success: "bg-success-tint text-success",
  pending: "bg-pending/15 text-pending",
  failed: "bg-danger-tint text-danger",
  danger: "bg-danger-tint text-danger",
} as const

type BadgeVariant = keyof typeof badgeVariants

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span data-slot="badge" className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", badgeVariants[variant], className)} {...props} />
  )
}

function StatusBadge({ status, className }: { status: "success" | "pending" | "failed" | "danger"; className?: string }) {
  const labels = { success: "Successful", pending: "Pending", failed: "Failed", danger: "Failed" }
  return <Badge variant={status} className={className}>{labels[status]}</Badge>
}

export { Badge, StatusBadge }
export type { BadgeVariant }
