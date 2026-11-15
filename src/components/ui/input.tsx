import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full rounded-input border border-line bg-surface px-4 text-base text-ink shadow-none outline-none transition duration-200 placeholder:text-ink-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = "Input"

export { Input }
