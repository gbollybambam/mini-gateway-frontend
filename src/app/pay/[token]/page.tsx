"use client";

import { useEffect, useState, use } from "react";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { ShieldCheck, CreditCard, Lock, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/dashboard/ui";

interface CheckoutSession {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  expiry: string | null;
  merchant: {
    business_name: string;
    email: string;
  };
}

export default function CheckoutPage({ params }: { params: Promise<{ token: string }> }) {
  // Unwrap Next.js 15+ dynamic route params safely using React.use()
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Customer input states for processing payment
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await api.get<{ data: CheckoutSession }>(`/checkout/${token}`);
        setSession(response.data.data);
      } catch (err) {
        const msg = isAxiosError(err) ? err.response?.data?.message : "Unable to load checkout session.";
        setError(msg || "This payment link may be invalid or expired.");
      } finally {
        setIsLoading(false);
      }
    }
    void fetchSession();
  }, [token]);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      // Calls your CheckoutController@process endpoint
      const response = await api.post<{ data: { checkout_url: string } }>(`/checkout/${token}`, {
        customer_name: customerName,
        customer_email: customerEmail,
      });

      const checkoutUrl = response.data.data.checkout_url;

      // Redirect the customer to Cray's hosted test payment gateway URL
      window.location.href = checkoutUrl;
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : "Payment initialization failed.";
      setError(msg);
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d14]">
        <div className="flex items-center gap-3 text-[#35d5a4] bg-[#2f9d78]/10 px-6 py-3 rounded-full border border-[#2f9d78]/20 font-medium text-sm">
          <Spinner /> Loading secure checkout...
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d14] px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#121820] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Checkout Unavailable</h2>
          <p className="text-sm text-[#8995a3] mb-6">{error || "The requested payment link could not be resolved."}</p>
          <div className="text-xs text-[#68747e] flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Secured by Payflow Infrastructure
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#090d14] p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 w-[600px] h-[400px] bg-[#2f9d78]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-[#121820] p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2f9d78] to-[#1a6b50] rounded-t-[2.5rem]" />

        {/* Merchant Branding Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Pay to</p>
            <h2 className="text-lg font-bold text-white">{session.merchant.business_name}</h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] text-[#090d14] font-black text-lg">
            P
          </div>
        </div>

        {/* Payment Summary */}
        <div className="text-center space-y-2 mb-8 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
          <p className="text-sm font-medium text-[#8995a3]">{session.description}</p>
          <p className="text-5xl font-black text-white tracking-tight py-2">
            {formatAmount(session.amount, session.currency)}
          </p>
          <p className="text-xs text-[#68747e]">Reference: {session.reference}</p>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayNow} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Your Full Name</label>
            <input 
              required
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#090d14]/60 px-4 text-sm font-medium text-[#e8edf2] placeholder:text-[#68747e] outline-none focus:border-[#2f9d78] focus:ring-1 focus:ring-[#2f9d78]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Email Address for Receipt</label>
            <input 
              required
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#090d14]/60 px-4 text-sm font-medium text-[#e8edf2] placeholder:text-[#68747e] outline-none focus:border-[#2f9d78] focus:ring-1 focus:ring-[#2f9d78]"
            />
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f9d78] to-[#1a6b50] text-base font-bold text-white transition-all hover:shadow-[0_0_25px_rgba(47,157,120,0.4)] hover:brightness-110 disabled:opacity-50"
          >
            {isProcessing ? <Spinner /> : <CreditCard className="h-5 w-5" />}
            {isProcessing ? "Connecting to Provider..." : `Pay ${formatAmount(session.amount, session.currency)}`}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[#68747e]">
          <ShieldCheck className="h-4 w-4 text-[#35d5a4]" />
          <span className="text-xs font-medium">Secured by 256-Bit Cryptographic Encryption</span>
        </div>
      </div>
    </main>
  );
}