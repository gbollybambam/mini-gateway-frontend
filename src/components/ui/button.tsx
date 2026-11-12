import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-pill border text-sm font-semibold whitespace-nowrap transition duration-200 ease-out outline-none select-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-ink bg-ink text-surface hover:bg-brand-900",
        primary: "border-ink bg-ink text-surface hover:bg-brand-900",
        outline: "border-line bg-surface text-ink shadow-none hover:bg-surface-muted",
        secondary: "border-line bg-surface text-ink hover:bg-surface-muted",
        ghost: "border-transparent text-ink hover:bg-surface-muted",
        "ghost-link": "border-transparent px-0 text-brand-500 hover:text-brand-900",
        destructive: "border-danger/20 bg-danger-tint text-danger hover:bg-danger/20",
        link: "border-transparent px-0 text-brand-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6",
        xs: "h-8 px-3 text-xs",
        sm: "h-10 px-4",
        lg: "h-14 px-7 text-base",
        icon: "size-10",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  arrow,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    arrow?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  const showArrow = arrow ?? variant === "primary"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      {showArrow && !asChild ? <ArrowUpRight aria-hidden="true" /> : null}
    </Comp>
  )
}

export { Button, buttonVariants }
