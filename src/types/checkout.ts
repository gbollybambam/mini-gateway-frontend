export interface CheckoutSession {
  id: string
  reference: string
  amount: number
  currency: string
  description: string
  status: string
  expiry: string | null
  merchant: {
    business_name: string
    email: string
  }
}

export type CheckoutStatus = "pending" | "failed"
