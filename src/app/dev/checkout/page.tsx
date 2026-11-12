"use client"

import { useState } from "react"
import {
  CheckoutForm,
  CheckoutFrame,
  CheckoutLoading,
  CheckoutPreviewHeader,
  CheckoutStatusCard,
  CheckoutSuccess,
  CheckoutSummary,
  CheckoutUnavailable,
} from "@/components/checkout/CheckoutUI"
import type { CheckoutSession } from "@/types/checkout"

const previewSession: CheckoutSession = {
  id: "preview-session",
  reference: "PAY-2025-08-01482",
  amount: 2480,
  currency: "NGN",
  description: "Wallet top-up",
  status: "pending",
  expiry: null,
  merchant: {
    business_name: "Mango Market",
    email: "hello@mangomarket.ng",
  },
}

export default function CheckoutPreviewPage() {
  const [state, setState] = useState("ready")

  return (
    <div className="min-h-[100svh] bg-bg px-4 py-6 sm:px-6 sm:py-10">
      <CheckoutPreviewHeader state={state} onStateChange={setState} />
      {state === "loading" ? <CheckoutLoading /> : null}
      {state === "invalid" ? <CheckoutUnavailable message="This payment link has expired. Ask the merchant for a new link." /> : null}
      {state === "failed" || state === "pending" ? (
        <div className="mx-auto grid w-full max-w-[480px] gap-4">
          <CheckoutSummary session={previewSession} />
          <CheckoutStatusCard status={state} session={previewSession} />
        </div>
      ) : null}
      {state === "ready" ? (
        <CheckoutFrame>
          <div className="mx-auto grid w-full max-w-[480px] gap-4">
            <CheckoutSummary session={previewSession} />
            <CheckoutForm session={previewSession} />
          </div>
        </CheckoutFrame>
      ) : null}
      {state === "success" ? (
        <CheckoutSuccess
          reference={previewSession.reference}
          amount={previewSession.amount}
          currency={previewSession.currency}
          merchantName={previewSession.merchant.business_name}
        />
      ) : null}
    </div>
  )
}
