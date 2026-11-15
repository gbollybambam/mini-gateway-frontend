"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CheckoutLoading, CheckoutSuccess } from "@/components/checkout/CheckoutUI"

function PaymentReceipt() {
  const searchParams = useSearchParams()
  const [storedReceipt, setStoredReceipt] = useState<{ reference?: string; amount?: number; currency?: string; merchant?: string } | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("paymesh:last-payment")
      if (raw) setStoredReceipt(JSON.parse(raw))
    } catch {
      setStoredReceipt(null)
    }
  }, [])

  const reference = searchParams.get("reference") || storedReceipt?.reference
  const amountValue = Number(searchParams.get("amount") || storedReceipt?.amount)
  const amount = Number.isFinite(amountValue) && amountValue > 0 ? amountValue : null

  return (
    <CheckoutSuccess
      reference={reference}
      amount={amount}
      currency={searchParams.get("currency") || storedReceipt?.currency || "NGN"}
      date={searchParams.get("date")}
      merchantName={searchParams.get("merchant") || storedReceipt?.merchant || "Merchant"}
    />
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <PaymentReceipt />
    </Suspense>
  )
}