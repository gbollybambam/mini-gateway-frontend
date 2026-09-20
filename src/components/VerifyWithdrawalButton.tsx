"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";

export default function VerifyWithdrawalButton({ id, onVerified }: { id: string, onVerified: () => void }) {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop row click from opening the details modal
    if (verifying) return;
    
    setVerifying(true);
    try {
      await api.post(`/withdrawals/${id}/verify`);
      onVerified();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to verify payout.");
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <button
      onClick={handleVerify}
      disabled={verifying}
      className="flex items-center gap-1.5 rounded-lg border border-[#3f82b2]/30 bg-[#3f82b2]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#79b8e8] transition-all hover:bg-[#3f82b2]/20 hover:text-[#90c6ec] disabled:opacity-50"
    >
      <RefreshCw className={`h-3 w-3 ${verifying ? "animate-spin" : ""}`} />
      {verifying ? "Syncing..." : "Verify"}
    </button>
  );
}