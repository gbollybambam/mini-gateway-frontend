"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowDownRight, FilterX, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Spinner, ErrorMessage } from "@/components/dashboard/ui";

interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  currency: string;
  status: string;
  bank_details?: Record<string, string>;
  created_at: string;
  merchant?: {
    id: string;
    business_name: string;
  };
}

const formatCurrency = (amount: number, currency: string = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Withdrawal | null>(null);

  const loadWithdrawals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/withdrawals", {
        params: { page, status: statusFilter || null },
      });
      const data = res.data.data;
      setWithdrawals(data.data || data);
      setMeta({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      });
    } catch (err) {
      setError("Failed to load withdrawals queue.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#8995a3] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Command Center
        </Link>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Withdrawals & Payouts</h1>
          <p className="text-sm text-[#8995a3] mt-1">Manage and approve merchant payout requests.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md">
          <ArrowDownRight className="h-4 w-4 text-blue-400" />
          <span className="font-medium">{meta?.total || 0} Requests</span>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl p-5 flex items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Filter by Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-[#e8edf2] outline-none focus:border-[#35d5a4]/50 transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#0a0f16]">All Statuses</option>
            <option value="REQUESTED" className="bg-[#0a0f16]">REQUESTED</option>
            <option value="PROCESSING" className="bg-[#0a0f16]">PROCESSING</option>
            <option value="SUCCESS" className="bg-[#0a0f16]">SUCCESS (Paid)</option>
            <option value="FAILED" className="bg-[#0a0f16]">FAILED</option>
          </select>
        </div>
      </div>

      {isLoading && !withdrawals.length ? (
        <div className="flex h-64 items-center justify-center"><Spinner /></div>
      ) : error ? (
        <ErrorMessage message={error} retry={loadWithdrawals} />
      ) : (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.01] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Merchant</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Fee</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Requested On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map((w) => (
                  <tr key={w.id} onClick={() => setSelected(w)} className="transition-colors hover:bg-white/[0.04] cursor-pointer group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{w.merchant?.business_name}</p>
                      <p className="text-[10px] text-[#68747e] font-mono mt-0.5">{w.id.substring(0,8)}...</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{formatCurrency(w.amount, w.currency)}</td>
                    <td className="px-6 py-4 text-[#8995a3]">{formatCurrency(w.fee, w.currency)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                        ${w.status === "SUCCESS" ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : 
                          w.status === "FAILED" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                          "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-medium text-[#8995a3]">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to inspect withdrawal and eventually approve/reject it */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0f16] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white">Payout Request</h2>
              <button onClick={() => setSelected(null)} className="text-[#8995a3] hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-[#8995a3]">Merchant</span><span className="font-bold text-white">{selected.merchant?.business_name}</span></div>
              <div className="flex justify-between"><span className="text-[#8995a3]">Net Payout</span><span className="font-bold text-blue-400 text-lg">{formatCurrency(selected.amount - selected.fee, selected.currency)}</span></div>
              <div className="flex justify-between"><span className="text-[#8995a3]">Bank Details</span><span className="text-white text-right break-words max-w-[200px]">{JSON.stringify(selected.bank_details || {})}</span></div>
              <div className="flex justify-between"><span className="text-[#8995a3]">Status</span><span className="font-bold text-white">{selected.status}</span></div>
            </div>
            
            {/* We will wire up these backend actions next */}
            {selected.status === 'REQUESTED' && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                <button className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20">Reject</button>
                <button className="flex-1 py-2 rounded-lg bg-[#2f9d78]/10 text-[#35d5a4] font-bold border border-[#2f9d78]/20 hover:bg-[#2f9d78]/20">Approve Payout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}