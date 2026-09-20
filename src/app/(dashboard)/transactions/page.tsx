"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  Activity, Search, Wallet, Receipt, ChevronLeft, ChevronRight, 
  Calendar, FilterX, X, CreditCard, User, Tag, Hash, Clock 
} from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { TransactionResource } from "@/types/api";
import VerifyPaymentButton from "@/components/VerifyPaymentButton";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";

const formatAmount = (value: number, currency: string) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string | null) => 
  value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "-";

// ----------------------------------------------------------------------
// NEW: Transaction Details Modal Component
// ----------------------------------------------------------------------
function TransactionDetailsModal({ txId, onClose }: { txId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/transactions/${txId}`).then(res => {
      setData(res.data.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [txId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3f82b2]/10 border border-[#3f82b2]/20 text-[#79b8e8]">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Transaction Details</h3>
              <p className="text-xs font-medium text-[#8995a3]">ID: {txId}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[#8995a3] hover:bg-white/10 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner />
            </div>
          ) : !data ? (
            <div className="text-center text-[#8995a3] py-10">Unable to load details.</div>
          ) : (
            <>
              {/* Top Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-1">Gross Amount</p>
                  <p className="text-xl font-bold text-white">{formatAmount(data.amount, data.currency)}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-1">Fee</p>
                  <p className="text-xl font-bold text-red-400">-{formatAmount(data.fee || 0, data.currency)}</p>
                </div>
                <div className="rounded-2xl border border-[#2f9d78]/20 bg-[#2f9d78]/10 p-4 col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#2f9d78] mb-1">Net Settlement</p>
                  <p className="text-2xl font-black text-[#35d5a4]">{formatAmount(data.net_amount || data.amount, data.currency)}</p>
                </div>
              </div>

              {/* Details List */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                  
                  {/* Left Column */}
                  <div className="p-5 space-y-5">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1"><Hash className="h-3 w-3"/> System Reference</div>
                      <p className="text-sm font-medium text-white">{data.reference}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1"><Tag className="h-3 w-3"/> Provider Reference</div>
                      <p className="text-sm font-medium text-[#e8edf2] break-all">{data.provider_reference || "N/A"}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1"><CreditCard className="h-3 w-3"/> Gateway</div>
                      <p className="text-sm font-medium text-white capitalize">{data.provider}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="p-5 space-y-5">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1"><User className="h-3 w-3"/> Customer</div>
                      <p className="text-sm font-medium text-white">{data.customer_email || "Anonymous"}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1"><Activity className="h-3 w-3"/> Final Status</div>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider
                        ${data.status === 'SUCCESS' ? "bg-[#2f9d78]/10 text-[#35d5a4]" : 
                          data.status === 'PENDING' ? "bg-amber-500/10 text-amber-500" : 
                          "bg-red-500/10 text-red-400"}`}>
                        {data.status}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1"><Clock className="h-3 w-3"/> Created At</div>
                      <p className="text-sm font-medium text-[#e8edf2]">{formatDate(data.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// ----------------------------------------------------------------------


export default function TransactionsPage() {
  const [items, setItems] = useState<TransactionResource[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  
  // Advanced Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("created_at:desc"); 
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); 
    setError("");
    try {
      const [sortBy, sortDir] = sort.split(":");
      const response = await api.get("/transactions", { 
        params: { 
          search: search || null, 
          status: status || null, 
          start_date: dateFrom || null,
          end_date: dateTo || null,
          sort_by: sortBy,
          sort_dir: sortDir,
          per_page: 15,
          page: page
        } 
      });
      setItems(response.data.data);
      setMeta(response.data.meta);
    } catch (err: unknown) { 
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || err.response?.data?.error || "Unable to load transactions.");
      } else {
        setError("Unable to load transactions.");
      }
    } finally { 
      setLoading(false); 
    }
  }, [search, status, dateFrom, dateTo, sort, page]);

  useEffect(() => { 
    const timer = window.setTimeout(() => { void load(); }, 300); 
    return () => window.clearTimeout(timer); 
  }, [load]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSort("created_at:desc");
    setPage(1);
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1); 
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Render Modal if a transaction is clicked */}
      {selectedTxId && (
        <TransactionDetailsModal txId={selectedTxId} onClose={() => setSelectedTxId(null)} />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Money movement</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Transactions</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md shadow-inner">
          <Wallet className="h-4 w-4 text-[#35d5a4]" />
          <span className="font-medium">{meta?.total || 0} records</span>
        </div>
      </header>

      {/* FIXED UI: Advanced Filter Control Panel */}
      <section className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5 shadow-lg space-y-4">
        
        {/* Top Row: Search */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Search Ledger</label>
          <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#0a0f16] px-4 focus-within:border-[#35d5a4]/50 focus-within:ring-1 focus-within:ring-[#35d5a4]/50 transition-all shadow-inner">
            <Search className="h-4 w-4 text-[#8995a3]" />
            <input 
              className="w-full bg-transparent text-sm text-white placeholder:text-[#68747e] outline-none font-medium" 
              placeholder="Search by exact amount, reference ID, or customer email..." 
              value={search} 
              onChange={handleFilterChange(setSearch)} 
            />
          </div>
        </div>

        {/* Bottom Row: Filters & Sort */}
        <div className="flex flex-wrap items-end gap-4">
          
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Status</label>
            <select 
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 pr-8 text-sm font-medium text-[#e8edf2] outline-none focus:border-[#35d5a4]/50 transition-all appearance-none cursor-pointer"
              value={status} 
              onChange={handleFilterChange(setStatus)}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238995a3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              {/* FIXED: Added bg-[#0a0f16] so options aren't white-on-white */}
              <option value="" className="bg-[#0a0f16] text-white">Any Status</option>
              <option value="SUCCESS" className="bg-[#0a0f16] text-white">Success</option>
              <option value="PENDING" className="bg-[#0a0f16] text-white">Pending</option>
              <option value="FAILED" className="bg-[#0a0f16] text-white">Failed</option>
            </select>
          </div>

          <div className="flex-1 min-w-[280px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Date Range</label>
            <div className="flex items-center rounded-xl border border-white/10 bg-[#0a0f16] px-3 h-11 gap-2">
              <Calendar className="h-4 w-4 text-[#8995a3]" />
              <input 
                type="date" 
                className="bg-transparent text-sm text-white outline-none w-full [&::-webkit-calendar-picker-indicator]:invert-[0.8] cursor-pointer" 
                value={dateFrom}
                onChange={handleFilterChange(setDateFrom)}
              />
              <span className="text-[#68747e] text-xs font-bold">→</span>
              <input 
                type="date" 
                className="bg-transparent text-sm text-white outline-none w-full [&::-webkit-calendar-picker-indicator]:invert-[0.8] cursor-pointer" 
                value={dateTo}
                onChange={handleFilterChange(setDateTo)}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Sort By</label>
            <select 
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 pr-8 text-sm font-medium text-[#e8edf2] outline-none focus:border-[#35d5a4]/50 transition-all appearance-none cursor-pointer"
              value={sort} 
              onChange={handleFilterChange(setSort)}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238995a3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="created_at:desc" className="bg-[#0a0f16] text-white">Newest First</option>
              <option value="created_at:asc" className="bg-[#0a0f16] text-white">Oldest First</option>
              <option value="amount:desc" className="bg-[#0a0f16] text-white">Highest Amount</option>
              <option value="amount:asc" className="bg-[#0a0f16] text-white">Lowest Amount</option>
            </select>
          </div>

          {(search || status || dateFrom || dateTo || sort !== "created_at:desc") && (
            <div className="flex items-end h-11">
              <button 
                onClick={resetFilters}
                className="h-11 px-4 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <FilterX className="h-4 w-4" /> Reset
              </button>
            </div>
          )}
        </div>
      </section>

      {loading && !items.length ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-[#35d5a4] bg-[#2f9d78]/10 px-6 py-3 rounded-full border border-[#2f9d78]/20 font-medium text-sm shadow-[0_0_20px_rgba(47,157,120,0.15)]">
            <Spinner /> Syncing ledger...
          </div>
        </div>
      ) : error ? (
        <ErrorMessage message={error} retry={load} />
      ) : (
        <section className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 bg-[#05080c]/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
               <Spinner />
            </div>
          )}

          <div className="flex items-center gap-3 border-b border-white/5 p-6 md:px-8 bg-white/[0.01]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#e8edf2] shadow-inner">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white drop-shadow-sm">Payment Ledger</h2>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.01] border-b border-white/5">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Reference</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => {
                  const isSuccess = item.status === "SUCCESS";
                  const isPending = item.status === "PENDING";
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedTxId(item.id)}
                      className="transition-colors hover:bg-white/[0.04] group cursor-pointer" 
                    >
                      <td className="px-8 py-5 font-bold text-[#e8edf2] group-hover:text-white transition-colors">
                        {item.reference}
                      </td>
                      <td className="px-8 py-5 font-medium text-[#8995a3]">
                        {item.customer_email || <span className="text-[#68747e] italic">Anonymous</span>}
                      </td>
                      <td className="px-8 py-5">
                        <div className={`font-bold tracking-tight ${isSuccess ? "text-[#35d5a4]" : "text-[#e8edf2]"}`}>
                          {formatAmount(item.amount, item.currency)}
                        </div>
                        <div className="text-[10px] font-medium text-[#68747e] mt-0.5">
                          Fee: {formatAmount(item.fee, item.currency)}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                          ${isSuccess ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : 
                            isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                            "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-medium text-[#8995a3]">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-8 py-5 flex justify-end">
                        {isPending ? (
                          /* Stop propagation so clicking Verify doesn't open the modal */
                          <div onClick={(e) => e.stopPropagation()}>
                            <VerifyPaymentButton transactionId={item.id} onVerified={load} />
                          </div>
                        ) : (
                          <span className="text-[#68747e] text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                            View Details
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-8 py-4 bg-white/[0.01]">
              <p className="text-xs font-medium text-[#8995a3]">
                Showing page <span className="text-white font-bold">{meta.current_page}</span> of <span className="text-white font-bold">{meta.last_page}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={meta.current_page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01]">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                <FilterX className="h-8 w-8 text-[#68747e]" />
              </div>
              <h3 className="text-lg font-bold text-white drop-shadow-sm">No results found</h3>
              <p className="mt-2 text-sm text-[#8995a3] max-w-sm leading-relaxed mb-6">
                We couldn&apos;t find any transactions matching your current filters.
              </p>
              <button onClick={resetFilters} className="text-xs font-bold text-[#79b8e8] hover:text-[#90c6ec] transition-colors border-b border-transparent hover:border-[#90c6ec] pb-0.5">
                Clear all filters
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}