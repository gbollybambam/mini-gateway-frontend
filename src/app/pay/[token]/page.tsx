"use client"

// src/app/pay/[token]/page.tsx
import { use, useEffect, useState } from "react"
import { isAxiosError } from "axios"
import { api } from "@/lib/api"
import {
  CheckoutForm,
  CheckoutFrame,
  CheckoutLayout,
  CheckoutLoading,
  CheckoutStatusCard,
  CheckoutSuccess,
  CheckoutSummary,
  CheckoutUnavailable,
} from "@/components/checkout/CheckoutUI"
import type { CheckoutSession } from "@/types/checkout"

export default function CheckoutPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [paymentError, setPaymentError] = useState("")
  const [retrying, setRetrying] = useState(false)
  const [loadedAt] = useState(() => Date.now())

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await api.get<{ data: CheckoutSession }>(`/checkout/${token}`)
        setSession(response.data.data)
      } catch (err) {
        const message = isAxiosError(err) ? err.response?.data?.message : "Unable to load checkout session."
        setError(message || "This payment link may be invalid or expired.")
      } finally {
        setIsLoading(false)
      }
    }

    void fetchSession()
  }, [token])

  useEffect(() => {
    if (!session) return
    const status = session.status.toLowerCase()
    const isInFlight = status === "pending" || status === "processing" || status === "initialized"
    if (!isInFlight) return

    const intervalId = window.setInterval(() => {
      void api.get<{ data: CheckoutSession }>(`/checkout/${token}`)
        .then((response) => setSession(response.data.data))
        .catch(() => {
          // Keep the current checkout state visible until the next polling attempt.
        })
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [session, token])

  const handlePayNow = async ({ customerName, customerEmail }: { customerName: string; customerEmail: string }) => {
    if (isProcessing) return
    setIsProcessing(true)
    setPaymentError("")

    try {
      const response = await api.post<{ data: { checkout_url: string } }>(`/checkout/${token}`, {
        customer_name: customerName,
        customer_email: customerEmail,
      })

      try {
        sessionStorage.setItem("paymesh:last-payment", JSON.stringify({
          reference: session.reference,
          amount: session.amount,
          currency: session.currency,
          merchant: session.merchant.business_name,
        }))
      } catch {
        // The success page can still use redirect query parameters when storage is unavailable.
      }

      window.location.href = response.data.data.checkout_url
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : "Payment initialization failed."
      setPaymentError(message || "Payment initialization failed. Please try again.")
      setIsProcessing(false)
    }
  }

  if (isLoading) return <CheckoutLoading />
  if (error || !session) return <CheckoutUnavailable message={error || "The requested payment link could not be resolved."} />

  const normalizedStatus = session.status.toLowerCase()
  const isExpired = session.expiry ? new Date(session.expiry).getTime() < loadedAt : false
  if (isExpired || normalizedStatus === "expired" || normalizedStatus === "invalid") {
    return <CheckoutUnavailable message="This payment link has expired. Ask the merchant for a new link." />
  }

  if (["success", "successful", "completed", "paid"].includes(normalizedStatus)) {
    return (
      <CheckoutSuccess
        reference={session.reference}
        amount={session.amount}
        currency={session.currency}
        merchantName={session.merchant.business_name}
      />
    )
  }

  if ((normalizedStatus === "pending" || normalizedStatus === "processing" || normalizedStatus === "initialized" || normalizedStatus === "failed") && !retrying) {
    return (
      <CheckoutFrame>
        <CheckoutLayout summary={<CheckoutSummary session={session} />}>
          <CheckoutStatusCard
            status={normalizedStatus === "failed" ? "failed" : "pending"}
            session={session}
            onRetry={normalizedStatus === "failed" ? () => setRetrying(true) : undefined}
          />
        </CheckoutLayout>
      </CheckoutFrame>
    )
  }

  return (
    <CheckoutFrame>
      <CheckoutLayout summary={<CheckoutSummary session={session} />}>
        <CheckoutForm session={session} isProcessing={isProcessing} error={paymentError} onPay={handlePayNow} />
      </CheckoutLayout>
    </CheckoutFrame>
  )
}