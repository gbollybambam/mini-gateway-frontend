"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";

interface Props {
  transactionId: string;
  onVerified: () => void;
}

export default function VerifyPaymentButton({ transactionId, onVerified }: Props) {
  const [isVerifying, setIsVerifying] = useState(false);

  const verify = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    
    try {
      await api.post(`/transactions/${transactionId}/verify`);
      onVerified(); // Refresh the table
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || "Failed to verify transaction.";
        alert(message);
      } else {
        alert("An unexpected error occurred during verification.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <button
      onClick={verify}
      disabled={isVerifying}
      title="Manually verify this payment"
      className="group flex h-8 items-center gap-1.5 rounded-lg border border-[#3f82b2]/30 bg-[#3f82b2]/10 px-3 text-[10px] font-bold uppercase tracking-wider text-[#79b8e8] transition-all hover:bg-[#3f82b2]/20 hover:text-[#90c6ec] hover:border-[#3f82b2]/50 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
    >
      <RefreshCw className={`h-3 w-3 ${isVerifying ? "animate-spin" : ""}`} />
      {isVerifying ? "Verifying..." : "Verify"}
    </button>
  );
}