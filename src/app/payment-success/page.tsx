"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckoutLoading, CheckoutSuccess } from "@/components/checkout/CheckoutUI"

function PaymentReceipt() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const amountValue = Number(searchParams.get("amount"))
  const amount = Number.isFinite(amountValue) && amountValue > 0 ? amountValue : null

  return (
    <CheckoutSuccess
      reference={reference}
      amount={amount}
      currency={searchParams.get("currency") || "NGN"}
      date={searchParams.get("date")}
      merchantName={searchParams.get("merchant") || "Merchant"}
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