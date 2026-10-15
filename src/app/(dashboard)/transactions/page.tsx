"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { 
  Activity, Search, Wallet, Receipt, ChevronLeft, ChevronRight, 
  Calendar, FilterX, CreditCard, Hash, ChevronDown, ChevronUp 
} from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { TransactionResource } from "@/types/api";
import VerifyPaymentButton from "@/components/VerifyPaymentButton";
import { ErrorMessage } from "@/components/dashboard/ui";

const formatAmount = (value: number, currency: string) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string | null) => 
  value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "-";

function LedgerSkeleton() {
  return (
    <div className="animate-pulse flex flex-col mt-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-6 px-4 md:px-8 border-b border-white/5">
          <div className="h-4 w-24 md:w-32 bg-white/10 rounded-full"></div>
          <div className="h-4 w-40 bg-white/5 rounded-full hidden md:block"></div>
          <div className="h-4 w-20 md:w-24 bg-white/10 rounded-full"></div>
          <div className="h-6 w-20 bg-white/5 rounded-full hidden sm:block"></div>
          <div className="h-4 w-24 bg-white/5 rounded-full hidden lg:block"></div>
        </div>
      ))}
    </div>
  );
}

export default function TransactionsPage() {
  const [items, setItems] = useState<TransactionResource[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("created_at:desc"); 
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  
  // Track if we are currently polling to prevent duplicate requests
  const isPollingRef = useRef(false);

  // 1. Primary Load (Shows Skeleton Loader)
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
      setError(isAxiosError(err) ? err.response?.data?.message || "Unable to load transactions." : "System Error");
    } finally { 
      setLoading(false); 
    }
  }, [search, status, dateFrom, dateTo, sort, page]);

// Initial Load
  useEffect(() => { 
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  // 2. THE MAGIC: Silent Background Polling
  useEffect(() => {
    const hasPending = items.some(item => item.status === 'PENDING' || item.status === 'INITIALIZED');
    
    if (!hasPending) return;

    const pollInterval = setInterval(() => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      const [sortBy, sortDir] = sort.split(":");
      api.get("/transactions", { 
        params: { 
          search: search || null, status: status || null, start_date: dateFrom || null,
          end_date: dateTo || null, sort_by: sortBy, sort_dir: sortDir, per_page: 15, page: page
        } 
      })
      .then(response => {
        setItems(response.data.data);
        setMeta(response.data.meta);
      })
      .catch(() => {
        // Ignore background polling errors silently
      })
      .finally(() => {
        isPollingRef.current = false;
      });
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [items, search, status, dateFrom, dateTo, sort, page]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSort("created_at:desc");
    setPage(1);
    setExpandedTxId(null);
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1); 
    setExpandedTxId(null);
  };

  const toggleRow = (id: string) => {
    setExpandedTxId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Money movement</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Transactions</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md shadow-inner w-fit">
          <Wallet className="h-4 w-4 text-[#35d5a4]" />
          <span className="font-medium">{meta?.total || 0} records</span>
        </div>
      </header>

      <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Search Ledger</label>
          <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#0a0f16] px-4 focus-within:border-[#35d5a4]/50 focus-within:ring-1 focus-within:ring-[#35d5a4]/50 transition-all shadow-inner">
            <Search className="h-4 w-4 text-[#8995a3] shrink-0" />
            <input 
              className="w-full bg-transparent text-sm text-white placeholder:text-[#68747e] outline-none font-medium truncate" 
              placeholder="Search amount, ref, or email..." 
              value={search} 
              onChange={handleFilterChange(setSearch)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="w-full">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Status</label>
            <select 
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 pr-8 text-sm font-medium text-[#e8edf2] outline-none focus:border-[#35d5a4]/50 transition-all appearance-none cursor-pointer"
              value={status} 
              onChange={handleFilterChange(setStatus)}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238995a3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="" className="bg-[#0a0f16] text-white">Any Status</option>
              <option value="SUCCESS" className="bg-[#0a0f16] text-white">Success</option>
              <option value="PENDING" className="bg-[#0a0f16] text-white">Pending</option>
              <option value="FAILED" className="bg-[#0a0f16] text-white">Failed</option>
            </select>
          </div>

          <div className="w-full sm:col-span-2 lg:col-span-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Start Date</label>
            <div className="flex items-center rounded-xl border border-white/10 bg-[#0a0f16] px-3 h-11 gap-2">
              <Calendar className="h-4 w-4 text-[#8995a3] shrink-0" />
              <input 
                type="date" 
                className="bg-transparent text-sm text-white outline-none w-full [&::-webkit-calendar-picker-indicator]:invert-[0.8] cursor-pointer" 
                value={dateFrom}
                onChange={handleFilterChange(setDateFrom)}
              />
            </div>
          </div>

          <div className="w-full">
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
            <div className="w-full sm:col-span-2 lg:col-span-1">
              <button 
                onClick={resetFilters}
                className="h-11 w-full px-4 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <FilterX className="h-4 w-4" /> Reset
              </button>
            </div>
          )}
        </div>
      </section>

      {error ? (
        <ErrorMessage message={error} retry={load} />
      ) : (
        <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
          
          <div className="flex items-center gap-3 border-b border-white/5 p-4 sm:p-6 md:px-8 bg-white/1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#e8edf2] shadow-inner shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white drop-shadow-sm">Payment Ledger</h2>
          </div>
          
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/1 border-b border-white/5">
                <tr>
                  <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Reference</th>
                  <th className="hidden md:table-cell px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Customer</th>
                  <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                  <th className="hidden sm:table-cell px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                  <th className="hidden lg:table-cell px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Date</th>
                  <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Action</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-white/5">
                {loading && !items.length ? (
                  <tr><td colSpan={6}><LedgerSkeleton /></td></tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/1">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          <Receipt className="h-8 w-8 text-[#68747e]" />
                        </div>
                        <h3 className="text-lg font-bold text-white drop-shadow-sm">No results found</h3>
                        <p className="mt-2 text-sm text-[#8995a3] max-w-xs sm:max-w-sm leading-relaxed whitespace-normal">
                          We couldn&apos;t find any transactions matching your filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isSuccess = item.status === "SUCCESS";
                    const isPending = item.status === "PENDING" || item.status === "INITIALIZED";
                    const isExpanded = expandedTxId === item.id;
                    
                    return (
                      <React.Fragment key={item.id}>
                        {/* MAIN ROW (RESPONSIVE) */}
                        <tr 
                          onClick={() => toggleRow(item.id)}
                          className={`transition-colors hover:bg-white/4 group cursor-pointer ${isExpanded ? 'bg-white/4' : ''}`}
                        >
                          <td className="px-4 md:px-8 py-5 font-bold text-[#e8edf2] group-hover:text-white transition-colors">
                            {item.reference.substring(0, 12)}...
                          </td>
                          <td className="hidden md:table-cell px-8 py-5 font-medium text-[#8995a3]">
                            {item.customer_email || <span className="text-[#68747e] italic">Anonymous</span>}
                          </td>
                          <td className="px-4 md:px-8 py-5">
                            <div className={`font-bold tracking-tight ${isSuccess ? "text-[#35d5a4]" : "text-[#e8edf2]"}`}>
                              {formatAmount(item.amount, item.currency)}
                            </div>
                            <div className="text-[10px] font-medium text-[#68747e] mt-0.5 sm:hidden">
                              {item.status}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-4 md:px-8 py-5">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                              ${isSuccess ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : 
                                isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                                "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="hidden lg:table-cell px-8 py-5 font-medium text-[#8995a3]">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-4 md:px-8 py-5 text-right">
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#8995a3] group-hover:text-white">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED DETAILS DROPDOWN */}
                        {isExpanded && (
                          <tr className="bg-[#05080c]/40 shadow-inner border-b-2 border-[#2f9d78]/20">
                            <td colSpan={6} className="p-0">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-8 animate-in slide-in-from-top-2 fade-in duration-200 whitespace-normal">
                                
                                <div className="space-y-4 lg:col-span-1">
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4"/> Settlement</h4>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#68747e]">Gross Amount</span>
                                    <span className="font-bold text-[#e8edf2]">{formatAmount(item.amount, item.currency)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#68747e]">Processing Fee</span>
                                    <span className="font-bold text-red-400">-{formatAmount(item.fee, item.currency)}</span>
                                  </div>
                                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#35d5a4]">Net Expected</span>
                                    <span className="text-xl font-black text-[#35d5a4]">{formatAmount(item.net_amount || item.amount, item.currency)}</span>
                                  </div>
                                </div>

                                <div className="space-y-4 lg:col-span-2 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] mb-4 flex items-center gap-2"><Hash className="h-4 w-4"/> Metadata</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Provider Reference</span>
                                      <span className="text-sm font-medium text-white break-all">{(item as TransactionResource & { provider_reference?: string }).provider_reference || "N/A"}</span>
                                    </div>
                                    <div>
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Payment Method</span>
                                      <span className="text-sm font-medium text-white capitalize">{item.payment_method || "N/A"}</span>
                                    </div>
                                    <div className="md:hidden">
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Customer Contact</span>
                                      <span className="text-sm font-medium text-white break-all">{item.customer_email || "Anonymous"}</span>
                                    </div>
                                    <div className="lg:hidden">
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Created At</span>
                                      <span className="text-sm font-medium text-white">{formatDate(item.created_at)}</span>
                                    </div>
                                  </div>
                                  
                                  {isPending && (
                                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
                                      <VerifyPaymentButton transactionId={item.id} onVerified={load} />
                                    </div>
                                  )}
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 p-4 sm:px-8 bg-white/1">
              <p className="text-xs font-medium text-[#8995a3]">
                Page <span className="text-white font-bold">{meta.current_page}</span> of <span className="text-white font-bold">{meta.last_page}</span>
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  disabled={meta.current_page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => setPage(p => p + 1)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}