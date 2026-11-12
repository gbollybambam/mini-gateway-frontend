"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react"
import { Badge, StatusBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { CheckoutSession, CheckoutStatus } from "@/types/checkout"
import { cn } from "@/lib/utils"

function formatCheckoutAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

function getMerchantInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "P"
}

function CheckoutFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("min-h-[100svh] bg-bg px-4 py-6 text-ink sm:px-6 sm:py-10", className)}>{children}</main>
}

function CheckoutSummary({ session }: { session: CheckoutSession }) {
  return (
    <Card className="checkout-enter relative overflow-hidden bg-brand-900 p-6 text-surface shadow-dialog sm:p-8">
      <div className="pointer-events-none absolute -right-14 -top-20 size-56 rounded-full bg-brand-800/70 blur-3xl" />
      <div className="relative space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-surface/70">Pay to</p>
            <h1 className="mt-1 break-words text-xl font-semibold text-surface">{session.merchant.business_name}</h1>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-ink" aria-hidden="true">
            {getMerchantInitials(session.merchant.business_name)}
          </div>
        </div>
        <div>
          <p className="text-sm text-surface/70">{session.description || "Secure payment"}</p>
          <p className="mt-2 break-words text-4xl font-bold tracking-[-0.03em] text-surface sm:text-[40px]">
            {formatCheckoutAmount(session.amount, session.currency)}
          </p>
        </div>
        <dl className="grid gap-3 border-t border-surface/15 pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-surface/60">Reference</dt>
            <dd className="mt-1 break-all font-medium text-surface">{session.reference}</dd>
          </div>
          <div>
            <dt className="text-surface/60">Merchant email</dt>
            <dd className="mt-1 break-all font-medium text-surface">{session.merchant.email}</dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}

function CheckoutSecurityNote() {
  return (
    <div className="flex items-start gap-3 rounded-input bg-success-tint px-4 py-3 text-sm text-brand-900">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
      <div>
        <p className="font-semibold">Secured payment</p>
        <p className="mt-0.5 text-brand-900/75">Your payment details are protected.</p>
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
    <Card className="checkout-enter [animation-delay:60ms]">
      <CardHeader>
        <div>
          <CardTitle>Payment details</CardTitle>
          <p className="mt-1 text-sm text-ink-muted">Enter your details to receive a receipt.</p>
        </div>
        <LockKeyhole className="size-5 text-brand-500" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="checkout-name" className="text-sm font-semibold text-ink">Full name</label>
            <Input id="checkout-name" name="customerName" autoComplete="name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your full name" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="checkout-email" className="text-sm font-semibold text-ink">Email for receipt</label>
            <Input id="checkout-email" name="customerEmail" type="email" inputMode="email" autoComplete="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="you@example.com" required />
          </div>
          {error ? (
            <div role="alert" className="flex items-start gap-3 rounded-input bg-danger-tint px-4 py-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}
          <Button type="submit" variant="primary" className="w-full" disabled={isProcessing} aria-busy={isProcessing}>
            {isProcessing ? "Connecting securely..." : `Pay ${amount}`}
          </Button>
          <CheckoutSecurityNote />
        </form>
      </CardContent>
    </Card>
  )
}

function CheckoutStatusCard({ status, session }: { status: CheckoutStatus; session: CheckoutSession }) {
  const isPending = status === "pending"
  return (
    <Card className="checkout-enter text-center">
      <CardContent className="space-y-5">
        <div className={cn("mx-auto flex size-16 items-center justify-center rounded-full", isPending ? "bg-accent-yellow/25 text-pending" : "bg-danger-tint text-danger")}>
          {isPending ? <LockKeyhole className="size-8" aria-hidden="true" /> : <AlertCircle className="size-8" aria-hidden="true" />}
        </div>
        <div>
          <Badge variant={isPending ? "pending" : "failed"}>{isPending ? "Payment pending" : "Payment failed"}</Badge>
          <h2 className="mt-4 text-2xl font-semibold">{isPending ? "Payment is still processing" : "Payment could not be completed"}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {isPending ? "You can safely close this page. We will update the merchant when the provider responds." : "Please check your details and try again, or use another payment method."}
          </p>
        </div>
        <div className="rounded-input bg-surface-muted p-4 text-left text-sm">
          <div className="flex justify-between gap-4"><span className="text-ink-muted">Amount</span><strong>{formatCheckoutAmount(session.amount, session.currency)}</strong></div>
          <div className="mt-2 flex justify-between gap-4"><span className="text-ink-muted">Reference</span><strong className="max-w-[60%] break-all text-right">{session.reference}</strong></div>
        </div>
        <CheckoutSecurityNote />
      </CardContent>
    </Card>
  )
}

function CheckoutLoading() {
  return (
    <CheckoutFrame>
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-[480px] items-center justify-center">
        <Card className="w-full text-center">
          <CardContent className="space-y-4">
            <div className="mx-auto size-10 animate-spin rounded-full border-4 border-track border-t-brand-500" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-semibold">Loading secure checkout</h1>
              <p className="mt-1 text-sm text-ink-muted">Please wait while we confirm the payment details.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CheckoutFrame>
  )
}

function CheckoutUnavailable({ message }: { message: string }) {
  return (
    <CheckoutFrame>
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-[480px] items-center justify-center">
        <Card className="w-full text-center">
          <CardContent className="space-y-5">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-danger-tint text-danger">
              <AlertCircle className="size-8" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Checkout unavailable</h1>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
            </div>
            <CheckoutSecurityNote />
          </CardContent>
        </Card>
      </div>
    </CheckoutFrame>
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
  const formattedAmount = typeof amount === "number" ? formatCheckoutAmount(amount, currency) : "Payment received"
  const formattedDate = date
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date))
    : "Just now"

  return (
    <CheckoutFrame>
      <div className="mx-auto w-full max-w-[480px]">
        <Card className="checkout-enter text-center">
          <CardContent className="space-y-6">
            <div className="checkout-success-icon mx-auto flex size-20 items-center justify-center rounded-full bg-success-tint text-success" aria-hidden="true">
              <CheckCircle2 className="size-11" strokeWidth={2.25} />
            </div>
            <div>
              <Badge variant="success">Payment successful</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Payment complete</h1>
              <p className="mt-2 text-sm leading-6 text-ink-muted">Your payment was securely processed and the merchant has been notified.</p>
            </div>
            <div className="rounded-card bg-surface-muted p-5 text-left">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ink-muted">Amount paid</p>
                  <p className="mt-1 text-2xl font-bold">{formattedAmount}</p>
                </div>
                <StatusBadge status="success" />
              </div>
              <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-ink-muted">Merchant</dt><dd className="max-w-[65%] break-words text-right font-semibold">{merchantName}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ink-muted">Date</dt><dd className="text-right font-semibold">{formattedDate}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ink-muted">Reference</dt><dd className="max-w-[65%] break-all text-right font-semibold">{reference || "Not available"}</dd></div>
              </dl>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="primary" className="w-full" onClick={() => router.push("/")}>Back to merchant</Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => window.print()}>Download receipt</Button>
            </div>
          </CardContent>
        </Card>
        <p className="mt-5 text-center text-xs text-ink-muted">Keep your reference for any future questions about this payment.</p>
      </div>
    </CheckoutFrame>
  )
}

function CheckoutPreviewHeader({ state, onStateChange }: { state: string; onStateChange: (state: string) => void }) {
  return (
    <div className="mx-auto mb-6 max-w-[480px]">
      <label htmlFor="checkout-preview-state" className="text-sm font-semibold text-ink">Preview state</label>
      <select id="checkout-preview-state" value={state} onChange={(event) => onStateChange(event.target.value)} className="mt-2 h-12 w-full rounded-input border border-line bg-surface px-4 text-base text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15">
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
  CheckoutLoading,
  CheckoutPreviewHeader,
  CheckoutStatusCard,
  CheckoutSuccess,
  CheckoutSummary,
  CheckoutUnavailable,
  formatCheckoutAmount,
}
