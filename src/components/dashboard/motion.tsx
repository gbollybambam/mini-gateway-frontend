"use client"

import * as React from "react"

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Animates a number from its previous value to `target`.
 * The first mount counts up from zero, and later updates (e.g. the 5s overview
 * poll) glide from the currently displayed value instead of restarting.
 */
export function useCountUp(target: number, duration = 650) {
  const safeTarget = Number.isFinite(target) ? target : 0
  const [display, setDisplay] = React.useState(0)
  const displayRef = React.useRef(0)
  const frameRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      displayRef.current = safeTarget
      setDisplay(safeTarget)
      return
    }

    const from = displayRef.current
    if (from === safeTarget) {
      setDisplay(safeTarget)
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = from + (safeTarget - from) * eased
      displayRef.current = next
      setDisplay(next)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        displayRef.current = safeTarget
        setDisplay(safeTarget)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [safeTarget, duration])

  return display
}

/** Renders a count-up value while exposing the final value to screen readers. */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number
  format: (value: number) => string
  className?: string
}) {
  const display = useCountUp(value)
  return (
    <span className={className}>
      <span aria-hidden="true">{format(display)}</span>
      <span className="sr-only">{format(Number.isFinite(value) ? value : 0)}</span>
    </span>
  )
}
