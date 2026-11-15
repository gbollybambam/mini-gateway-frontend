import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "text-ink",
  success: "text-success",
  pending: "text-pending",
  failed: "text-danger",
  danger: "text-danger",
} as const

type BadgeVariant = keyof typeof badgeVariants

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span data-slot="badge" className={cn("inline-flex items-center gap-1.5 text-xs font-medium", badgeVariants[variant], className)} {...props} />
  )
}

function StatusBadge({ status, className }: { status: "success" | "pending" | "failed" | "danger"; className?: string }) {
  const labels = { success: "Successful", pending: "Pending", failed: "Failed", danger: "Failed" }
  return <Badge variant={status} className={className}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{labels[status]}</Badge>
}

export { Badge, StatusBadge }
export type { BadgeVariant }
