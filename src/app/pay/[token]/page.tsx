"use client"

import { use, useEffect, useState } from "react"
import { isAxiosError } from "axios"
import { api } from "@/lib/api"
import {
  CheckoutForm,
  CheckoutFrame,
  CheckoutLoading,
  CheckoutStatusCard,
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

  const handlePayNow = async ({ customerName, customerEmail }: { customerName: string; customerEmail: string }) => {
    if (isProcessing) return
    setIsProcessing(true)
    setPaymentError("")

    try {
      const response = await api.post<{ data: { checkout_url: string } }>(`/checkout/${token}`, {
        customer_name: customerName,
        customer_email: customerEmail,
      })

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

  if (normalizedStatus === "pending" || normalizedStatus === "failed") {
    return (
      <CheckoutFrame>
        <div className="mx-auto grid w-full max-w-[480px] gap-4">
          <CheckoutSummary session={session} />
          <CheckoutStatusCard status={normalizedStatus} session={session} />
        </div>
      </CheckoutFrame>
    )
  }

  return (
    <CheckoutFrame>
      <div className="mx-auto grid w-full max-w-[480px] gap-4">
        <CheckoutSummary session={session} />
        <CheckoutForm session={session} isProcessing={isProcessing} error={paymentError} onPay={handlePayNow} />
      </div>
    </CheckoutFrame>
  )
}
