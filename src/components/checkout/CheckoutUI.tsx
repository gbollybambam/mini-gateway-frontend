"use client"

// src/components/checkout/CheckoutUI.tsx
import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, LockKeyhole, ShieldCheck } from "@/components/icons"
import ThemeToggle from "@/components/ThemeToggle"
import type { CheckoutSession, CheckoutStatus } from "@/types/checkout"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCheckoutAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount)
}

function getMerchantInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "P"
  )
}

function formatLongDate(value?: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(d)
}

/** Big amount with a quieter fraction: ₦5,000 .00 */
function Amount({
  value,
  currency,
  className,
  fractionClassName,
}: {
  value: number
  currency: string
  className?: string
  fractionClassName?: string
}) {
  const parts = new Intl.NumberFormat("en-NG", { style: "currency", currency }).formatToParts(value)
  const decimalIndex = parts.findIndex((p) => p.type === "decimal")
  return (
    <span className={cn("tabular-nums", className)}>
      {parts.map((p, i) =>
        decimalIndex !== -1 && i >= decimalIndex ? (
          <span key={i} className={fractionClassName}>
            {p.value}
          </span>
        ) : (
          <React.Fragment key={i}>{p.value}</React.Fragment>
        ),
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* tiny icons                                                         */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string }
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}
const CopyIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
)
const CheckIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2.5} className={className}><path d="M20 6 9 17l-5-5" /></svg>
)
const UserIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
)
const MailIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
)
const ClockIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
const PrinterIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="9" rx="2" /><path d="M7 14h10v7H7z" /></svg>
)
const ArrowRightIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
const ArrowLeftIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2} className={className}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
)
const RefreshIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
)
const Spinner = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={cn("animate-spin", className)} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

/* ------------------------------------------------------------------ */
/* primitives                                                         */
/* ------------------------------------------------------------------ */

const cardCls = "rounded-[20px] border border-line bg-surface shadow-card"

const PILL_TONES = {
  success: "bg-success-tint text-success",
  pending: "bg-pending/15 text-[#946C0B] dark:text-pending",
  danger: "bg-danger-tint text-danger",
} as const

function Pill({ tone, children }: { tone: keyof typeof PILL_TONES; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold", PILL_TONES[tone])}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

function CopyButton({ value, label, onBrand = false }: { value: string; label: string; onBrand?: boolean }) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60",
        copied
          ? "bg-brand-500/20 text-brand-500"
          : onBrand
            ? "text-white/60 hover:bg-white/10 hover:text-white"
            : "text-ink-muted hover:bg-surface-muted hover:text-ink",
      )}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </button>
  )
}

function SecurityNote({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-input bg-success-tint px-4 py-3 text-sm text-ink">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
      <div>
        <p className="font-semibold">Secured payment</p>
        <p className="mt-0.5 text-ink-muted">{children ?? "Your payment details are encrypted end to end."}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* frame + layout                                                     */
/* ------------------------------------------------------------------ */

function CheckoutFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-bg text-ink">
      <div aria-hidden="true" className="checkout-glow pointer-events-none absolute inset-x-0 top-0 h-[460px]" />

      <header className="no-print relative mx-auto flex w-full max-w-[1040px] items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-[10px] bg-brand-900 text-sm font-extrabold text-brand-500 ring-1 ring-brand-500/30">
            P
          </div>
          <span className="text-sm font-semibold tracking-[-0.01em]">PayMesh</span>
          <span className="hidden text-sm text-ink-muted sm:inline">/ Secure checkout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted sm:inline-flex">
            <LockKeyhole className="size-3.5 text-brand-500" aria-hidden="true" />
            SSL encrypted
          </span>
          <ThemeToggle className="!text-ink hover:!bg-surface-muted" />
        </div>
      </header>

      <main className={cn("relative mx-auto w-full max-w-[1040px] px-4 pb-10 pt-2 sm:px-6 sm:pt-4", className)}>{children}</main>

      <footer className="no-print relative mx-auto flex w-full max-w-[1040px] flex-col items-center justify-between gap-2 px-4 pb-8 text-xs text-ink-muted sm:flex-row sm:px-6">
        <p>Powered by <span className="font-semibold text-ink">PayMesh</span></p>
        <p>Never share your PIN or OTP with anyone.</p>
      </footer>
    </div>
  )
}

/** Two columns on desktop (summary | action), single column on mobile. */
function CheckoutLayout({ summary, children }: { summary: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[460px] gap-5 lg:max-w-[980px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
      {summary}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* summary panel                                                      */
/* ------------------------------------------------------------------ */

function CheckoutSummary({ session }: { session: CheckoutSession }) {
  const expires = formatLongDate(session.expiry)
  return (
    <section className="checkout-enter checkout-summary relative isolate flex flex-col justify-between gap-10 overflow-hidden rounded-[20px] bg-brand-900 p-6 text-white shadow-dialog ring-1 ring-white/10 sm:p-8 lg:min-h-[520px] lg:p-10">
      <div className="relative space-y-10">
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-brand-500 text-lg font-extrabold text-brand-900 shadow-[0_8px_24px_-8px_rgba(9,9,11,0.3)]"
            aria-hidden="true"
          >
            {getMerchantInitials(session.merchant.business_name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/50">Paying</p>
            <h1 className="truncate text-lg font-semibold tracking-[-0.01em]">{session.merchant.business_name}</h1>
          </div>
        </div>

        <div>
          <p className="text-sm text-white/60">{session.description || "Secure payment"}</p>
          <p className="mt-3 break-words">
            <Amount
              value={session.amount}
              currency={session.currency}
              className="text-[44px] font-bold leading-none tracking-[-0.035em] sm:text-[52px]"
              fractionClassName="text-[0.55em] font-semibold text-white/45"
            />
          </p>
        </div>
      </div>

      <div className="relative space-y-5">
        <dl className="space-y-3.5 border-t border-white/10 pt-5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-white/50">Reference</dt>
            <dd className="flex min-w-0 items-center gap-1.5">
              <span className="truncate font-mono text-[13px] text-white/90">{session.reference}</span>
              <CopyButton value={session.reference} label="reference" onBrand />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-white/50">Merchant</dt>
            <dd className="truncate text-white/90">{session.merchant.email}</dd>
          </div>
          {expires && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/50">Link expires</dt>
              <dd className="flex items-center gap-1.5 text-white/90">
                <ClockIcon className="size-3.5 text-brand-500" />
                {expires}
              </dd>
            </div>
          )}
        </dl>

        <div className="flex items-center gap-2 rounded-input bg-white/[0.06] px-3.5 py-2.5 text-xs text-white/70 ring-1 ring-white/10">
          <ShieldCheck className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
          Verified merchant · Protected by PayMesh
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* form                                                               */
/* ------------------------------------------------------------------ */

const inputCls =
  "h-12 w-full rounded-input border border-line bg-bg pl-11 pr-4 text-base text-ink outline-none transition-[border-color,box-shadow,background-color] placeholder:text-ink-muted/70 hover:border-ink-muted/40 focus:border-brand-500 focus:bg-surface focus:ring-4 focus:ring-brand-500/15"

function Field({
  id, label, icon, children,
}: { id: string; label: string; icon: React.ReactNode; children: (cls: string) => React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand-500">
          {icon}
        </span>
        {children(inputCls)}
      </div>
    </div>
  )
}

function CheckoutForm({
  session,
  isProcessing = false,
  error,
  onPay,
}: {
  session: CheckoutSession
  isProcessing?: boolean
  error?: string
  onPay?: (values: { customerName: string; customerEmail: string }) => void | Promise<void>
}) {
  const [customerName, setCustomerName] = React.useState("")
  const [customerEmail, setCustomerEmail] = React.useState("")
  const amount = formatCheckoutAmount(session.amount, session.currency)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onPay?.({ customerName, customerEmail })
  }

  return (
    <section className={cn(cardCls, "checkout-enter p-6 [animation-delay:70ms] sm:p-8 lg:flex-1")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.02em]">Payment details</h2>
          <p className="mt-1 text-sm text-ink-muted">Tell us where to send your receipt.</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-success-tint text-success">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <Field id="checkout-name" label="Full name" icon={<UserIcon className="size-[18px]" />}>
          {(cls) => (
            <input id="checkout-name" name="customerName" autoComplete="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your full name" required className={cls} />
          )}
        </Field>
        <Field id="checkout-email" label="Email for receipt" icon={<MailIcon className="size-[18px]" />}>
          {(cls) => (
            <input id="checkout-email" name="customerEmail" type="email" inputMode="email" autoComplete="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@example.com" required className={cls} />
          )}
        </Field>

        {error ? (
          <div role="alert" className="flex items-start gap-3 rounded-input bg-danger-tint px-4 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isProcessing}
          aria-busy={isProcessing}
          className="group relative flex h-[52px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-input bg-brand-500 text-[15px] font-bold text-brand-900 shadow-[0_10px_24px_-10px_rgba(9,9,11,0.3)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_14px_30px_-10px_rgba(9,9,11,0.4)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-none"
        >
          {isProcessing ? (
            <>
              <Spinner className="size-5" />
              Connecting securely…
            </>
          ) : (
            <>
              <LockKeyhole className="size-[18px]" aria-hidden="true" />
              Pay {amount}
              <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <SecurityNote>
          You&apos;ll complete payment on our secure provider&apos;s page. Card details are never entered here.
        </SecurityNote>
      </form>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* pending / failed                                                   */
/* ------------------------------------------------------------------ */

function CheckoutStatusCard({
  status,
  session,
  onRetry,
}: {
  status: CheckoutStatus
  session: CheckoutSession
  onRetry?: () => void
}) {
  const isPending = status === "pending"
  return (
    <section className={cn(cardCls, "checkout-enter p-6 text-center sm:p-8 lg:flex-1")}>
      <div className="relative mx-auto flex size-20 items-center justify-center">
        {isPending && <span className="checkout-pulse absolute inset-0 rounded-full bg-pending/25" aria-hidden="true" />}
        <div className={cn("relative flex size-16 items-center justify-center rounded-full", isPending ? "bg-pending/15 text-pending" : "bg-danger-tint text-danger")}>
          {isPending ? <ClockIcon className="size-8" /> : <AlertCircle className="size-8" aria-hidden="true" />}
        </div>
      </div>

      <div className="mt-6">
        <Pill tone={isPending ? "pending" : "danger"}>{isPending ? "Payment pending" : "Payment failed"}</Pill>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em]">
          {isPending ? "Payment is still processing" : "Payment could not be completed"}
        </h2>
        <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-6 text-ink-muted">
          {isPending
            ? "You can safely close this page. We'll update the merchant as soon as the provider responds."
            : "Please check your details and try again, or use another payment method."}
        </p>
      </div>

      <div className="mt-6 rounded-input bg-surface-muted p-4 text-left text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-ink-muted">Amount</span>
          <strong className="tabular-nums">{formatCheckoutAmount(session.amount, session.currency)}</strong>
        </div>
        <div className="mt-2.5 flex justify-between gap-4">
          <span className="text-ink-muted">Reference</span>
          <strong className="max-w-[60%] break-all text-right font-mono text-[13px]">{session.reference}</strong>
        </div>
      </div>

      <div className="mt-5">
        {isPending ? (
          <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-input border border-line bg-surface text-sm font-semibold transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
            <RefreshIcon className="size-4" /> Refresh status
          </button>
        ) : onRetry ? (
          <button type="button" onClick={onRetry} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-input bg-brand-500 text-sm font-bold text-brand-900 transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 active:scale-[0.985]">
            <RefreshIcon className="size-4" /> Try again
          </button>
        ) : null}
      </div>

      <div className="mt-4 text-left">
        <SecurityNote />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* loading                                                            */
/* ------------------------------------------------------------------ */

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[8px] bg-surface-muted", className)} />
}

function CheckoutLoading() {
  return (
    <CheckoutFrame>
      <div role="status" aria-live="polite" className="mx-auto grid w-full max-w-[460px] gap-5 lg:max-w-[980px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
        <span className="sr-only">Loading secure checkout</span>
        <div className="flex flex-col justify-between gap-10 rounded-[20px] bg-brand-900 p-6 ring-1 ring-white/10 sm:p-8 lg:min-h-[520px] lg:p-10">
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="size-12 animate-pulse rounded-[14px] bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-36 animate-pulse rounded bg-white/15" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3.5 w-40 animate-pulse rounded bg-white/10" />
              <div className="h-12 w-56 animate-pulse rounded-[10px] bg-white/15" />
            </div>
          </div>
          <div className="space-y-3 border-t border-white/10 pt-5">
            <div className="h-3.5 w-full animate-pulse rounded bg-white/10" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/10" />
          </div>
        </div>

        <div className={cn(cardCls, "space-y-6 p-6 sm:p-8")}>
          <div className="space-y-2">
            <Bone className="h-6 w-44" />
            <Bone className="h-4 w-56" />
          </div>
          <div className="space-y-5 pt-2">
            <Bone className="h-12 w-full rounded-input" />
            <Bone className="h-12 w-full rounded-input" />
            <Bone className="h-[52px] w-full rounded-input" />
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 text-sm text-ink-muted">
            <Spinner className="size-4 text-brand-500" />
            Securing your checkout…
          </div>
        </div>
      </div>
    </CheckoutFrame>
  )
}

/* ------------------------------------------------------------------ */
/* unavailable                                                        */
/* ------------------------------------------------------------------ */

function CheckoutUnavailable({ message }: { message: string }) {
  return (
    <CheckoutFrame>
      <div className="mx-auto flex min-h-[60svh] w-full max-w-[460px] items-center">
        <section className={cn(cardCls, "checkout-enter w-full p-8 text-center")}>
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-danger-tint text-danger">
            <AlertCircle className="size-8" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">Checkout unavailable</h1>
          <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-6 text-ink-muted">{message}</p>
          <div className="mt-7 text-left">
            <SecurityNote>No payment was taken. If you think this is a mistake, contact the merchant for a fresh link.</SecurityNote>
          </div>
        </section>
      </div>
    </CheckoutFrame>
  )
}

/* ------------------------------------------------------------------ */
/* success receipt                                                    */
/* ------------------------------------------------------------------ */

function ReceiptRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right font-semibold">{children}</dd>
    </div>
  )
}

function CheckoutSuccess({
  reference,
  amount,
  currency = "NGN",
  date,
  merchantName = "Merchant",
}: {
  reference?: string | null
  amount?: number | null
  currency?: string
  date?: string | null
  merchantName?: string
}) {
  const router = useRouter()
  const formattedDate = formatLongDate(date) ?? "Just now"

  return (
    <CheckoutFrame>
      <div className="mx-auto w-full max-w-[460px]">
        <div className="ticket-wrap checkout-enter">
          {/* top half */}
          <div className="ticket-top relative overflow-hidden border border-b-0 border-line bg-surface px-6 pb-8 pt-9 text-center sm:px-8">
            <div aria-hidden="true" className="checkout-success-glow pointer-events-none absolute inset-x-0 top-0 h-48" />
            <div className="checkout-success-icon relative mx-auto flex size-20 items-center justify-center rounded-full bg-success-tint text-success" aria-hidden="true">
              <svg viewBox="0 0 52 52" className="size-12" fill="none">
                <circle className="checkout-draw-circle" cx="26" cy="26" r="23" stroke="currentColor" strokeWidth="2.5" />
                <path className="checkout-draw-check" d="M15 27l8 8 14-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="relative mt-5">
              <Pill tone="success">Payment successful</Pill>
              <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.03em]">Payment complete</h1>
              <p className="mx-auto mt-2 max-w-[32ch] text-sm leading-6 text-ink-muted">
                Your payment was securely processed and the merchant has been notified.
              </p>
            </div>
            <div className="relative mt-7">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">Amount paid</p>
              <p className="mt-1.5">
                {typeof amount === "number" ? (
                  <Amount value={amount} currency={currency} className="text-[40px] font-bold leading-none tracking-[-0.035em]" fractionClassName="text-[0.55em] font-semibold text-ink-muted" />
                ) : (
                  <span className="text-2xl font-bold">Payment received</span>
                )}
              </p>
            </div>
          </div>

          {/* tear line */}
          <div className="relative h-0 border-l border-r border-line bg-surface">
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-line" />
          </div>

          {/* bottom half */}
          <div className="ticket-bottom border border-t-0 border-line bg-surface px-6 pb-6 pt-8 sm:px-8 sm:pb-8">
            <dl className="space-y-3.5">
              <ReceiptRow label="Merchant"><span className="break-words">{merchantName}</span></ReceiptRow>
              <ReceiptRow label="Date">{formattedDate}</ReceiptRow>
              <ReceiptRow label="Reference">
                <span className="inline-flex items-center gap-1.5">
                  <span className="break-all font-mono text-[13px]">{reference || "Not available"}</span>
                  {reference ? <CopyButton value={reference} label="reference" /> : null}
                </span>
              </ReceiptRow>
              <ReceiptRow label="Status"><Pill tone="success">Successful</Pill></ReceiptRow>
            </dl>

            <div className="no-print mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) window.history.back()
                  else router.push("/overview")
                }}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-input bg-brand-500 text-sm font-bold text-brand-900 shadow-[0_10px_24px_-12px_rgba(9,9,11,0.3)] transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 active:scale-[0.985]"
              >
                <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
                Back to merchant
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-input border border-line bg-surface text-sm font-semibold transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 active:scale-[0.985]"
              >
                <PrinterIcon className="size-4" />
                Download receipt
              </button>
            </div>
          </div>
        </div>

        <p className="no-print mt-5 text-center text-xs text-ink-muted">
          Keep your reference for any future questions about this payment.
        </p>
      </div>
    </CheckoutFrame>
  )
}

/* ------------------------------------------------------------------ */
/* preview helper                                                     */
/* ------------------------------------------------------------------ */

function CheckoutPreviewHeader({ state, onStateChange }: { state: string; onStateChange: (state: string) => void }) {
  return (
    <div className="mx-auto mb-6 max-w-[460px] lg:max-w-[980px]">
      <label htmlFor="checkout-preview-state" className="text-sm font-semibold text-ink">Preview state</label>
      <select
        id="checkout-preview-state"
        value={state}
        onChange={(event) => onStateChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-input border border-line bg-surface px-4 text-base text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 lg:max-w-[320px]"
      >
        <option value="ready">Ready</option>
        <option value="loading">Loading</option>
        <option value="invalid">Invalid / expired</option>
        <option value="failed">Failed payment</option>
        <option value="pending">Pending payment</option>
        <option value="success">Success</option>
      </select>
    </div>
  )
}

export {
  CheckoutForm,
  CheckoutFrame,
  CheckoutLayout,
  CheckoutLoading,
  CheckoutPreviewHeader,
  CheckoutStatusCard,
  CheckoutSuccess,
  CheckoutSummary,
  CheckoutUnavailable,
  formatCheckoutAmount,
}