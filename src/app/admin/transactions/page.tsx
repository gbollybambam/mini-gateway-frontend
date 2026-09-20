"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ListOrdered, FilterX, ChevronLeft, ChevronRight, ArrowLeft, Activity, X, Eye } from "lucide-react";
import { Spinner, ErrorMessage } from "@/components/dashboard/ui";

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  created_at: string;
  merchant?: {
    id: string;
    business_name: string;
    email?: string;
  };
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

const formatCurrency = (amount: number, currency: string = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString));
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/transactions", {
        params: {
          page,
          status: statusFilter || null,
        },
      });
      const paginatedData = res.data.data;
      setTransactions(paginatedData.data || paginatedData);
      setMeta({
        current_page: paginatedData.current_page || 1,
        last_page: paginatedData.last_page || 1,
        total: paginatedData.total || 0,
      });
    } catch (err) {
      setError("Failed to load global transaction ledger.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#8995a3] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Command Center
        </Link>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Global Transaction Ledger</h1>
          <p className="text-sm text-[#8995a3] mt-1">Platform-wide immutable record of all processed payments.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md">
          <Activity className="h-4 w-4 text-[#35d5a4]" />
          <span className="font-medium">{meta?.total || 0} Total Records</span>
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
            <option value="SUCCESS" className="bg-[#0a0f16]">SUCCESS</option>
            <option value="INITIALIZED" className="bg-[#0a0f16]">INITIALIZED</option>
            <option value="PENDING" className="bg-[#0a0f16]">PENDING</option>
            <option value="PROCESSING" className="bg-[#0a0f16]">PROCESSING</option>
            <option value="FAILED" className="bg-[#0a0f16]">FAILED</option>
          </select>
        </div>
        {statusFilter && (
          <div className="flex items-end h-11">
            <button 
              onClick={() => { setStatusFilter(""); setPage(1); }}
              className="h-11 px-4 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <FilterX className="h-4 w-4" /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {isLoading && !transactions.length ? (
        <div className="flex h-64 items-center justify-center"><Spinner /></div>
      ) : error ? (
        <ErrorMessage message={error} retry={loadTransactions} />
      ) : (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.01] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Reference / ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Merchant</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Provider</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const isSuccess = tx.status === "SUCCESS";
                  const isPending = tx.status === "PENDING" || tx.status === "PROCESSING" || tx.status === "INITIALIZED";
                  
                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="transition-colors hover:bg-white/[0.04] group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-white group-hover:text-[#35d5a4] transition-colors">{tx.reference}</p>
                        <p className="text-[10px] text-[#68747e] font-mono mt-0.5">{tx.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#e8edf2]">{tx.merchant?.business_name || 'Direct / Unknown'}</p>
                        <p className="text-[10px] text-[#68747e] font-mono mt-0.5">{tx.merchant?.id?.substring(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4 font-bold tracking-tight text-white">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold uppercase text-[#8995a3] border border-white/5">
                          {tx.provider || 'Cray'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                          ${isSuccess ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : 
                            isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                            "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-medium text-[#8995a3]">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#68747e]">
                      No transactions recorded on the platform yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
              <p className="text-xs font-medium text-[#8995a3]">
                Page <span className="text-white font-bold">{meta.current_page}</span> of {meta.last_page}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={meta.current_page === 1} 
                  onClick={() => setPage(p => p - 1)} 
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button 
                  disabled={meta.current_page === meta.last_page} 
                  onClick={() => setPage(p => p + 1)} 
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0f16] p-6 shadow-2xl relative space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Transaction Audit</p>
                <h2 className="text-lg font-bold text-white mt-0.5">{selectedTx.reference}</h2>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-[#8995a3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[#8995a3]">Internal ID</span>
                <span className="font-mono text-white text-xs">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[#8995a3]">Merchant</span>
                <span className="font-bold text-white">{selectedTx.merchant?.business_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[#8995a3]">Amount</span>
                <span className="font-bold text-[#35d5a4]">{formatCurrency(selectedTx.amount, selectedTx.currency)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[#8995a3]">Status</span>
                <span className="font-bold uppercase text-white">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[#8995a3]">Provider</span>
                <span className="font-bold uppercase text-white">{selectedTx.provider || 'Cray'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[#8995a3]">Timestamp</span>
                <span className="font-medium text-white">{formatDate(selectedTx.created_at)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/10"
              >
                Close Inspection
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}