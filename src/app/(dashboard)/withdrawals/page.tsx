"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Landmark, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, AlertCircle, Building2, User, ChevronDown, ChevronUp, Plus, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { WithdrawalListResponse, WithdrawalResource, WalletResponse, WalletResource } from "@/types/api";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";
import VerifyWithdrawalButton from "@/components/VerifyWithdrawalButton";

const formatAmount = (value: number, currency: string) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string) => 
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

interface ExtendedWithdrawal extends WithdrawalResource {
  bank_account?: { bank_code: string; account_number: string; account_name: string; };
  failure_reason?: string;
}

function WithdrawalSkeleton() {
  return (
    <div className="animate-pulse flex flex-col">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-6 px-4 md:px-8 border-b border-white/5">
          <div className="h-4 w-24 md:w-32 bg-white/10 rounded-full"></div>
          <div className="h-4 w-20 md:w-24 bg-white/5 rounded-full hidden sm:block"></div>
          <div className="h-4 w-16 bg-white/10 rounded-full hidden md:block"></div>
          <div className="h-6 w-20 bg-white/5 rounded-full"></div>
          <div className="h-4 w-24 bg-white/5 rounded-full hidden lg:block"></div>
          <div className="h-8 w-8 bg-white/5 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}

export default function WithdrawalsPage() {
  const [wallet, setWallet] = useState<WalletResource | null>(null);
  const [items, setItems] = useState<ExtendedWithdrawal[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async (currentPage: number) => {
    try { 
      const [walletRes, withdrawalsRes] = await Promise.all([
        api.get<WalletResponse>("/wallet"),
        api.get<WithdrawalListResponse>("/withdrawals", { params: { page: currentPage, per_page: 15 } })
      ]);
      setWallet(walletRes.data.data);
      setItems(withdrawalsRes.data.data); 
      // @ts-expect-error - meta mapping
      setMeta(withdrawalsRes.data.meta);
      setError("");
    } catch (err: unknown) { 
      setError(isAxiosError(err) ? err.response?.data?.message || "Unable to load payouts." : "Unable to load payouts."); 
    } finally { 
      setLoading(false); 
    } 
  }, []);
  
  // 1. Initial Load
  useEffect(() => { 
    const timer = setTimeout(() => {
      void loadData(page);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData, page]); 

  // 2. THE MAGIC: Silent Background Polling
  const isPollingRef = React.useRef(false);
  
  useEffect(() => {
    const hasPending = items.some((item) => {
      const status = item.status.toUpperCase();
      return status === "PENDING" || status === "PROCESSING" || status === "REQUESTED";
    });

    if (!hasPending) return;

    const interval = window.setInterval(() => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      
      api.get<WithdrawalListResponse>("/withdrawals", { params: { page: page, per_page: 15 } })
        .then(res => {
          setItems(res.data.data);
          // @ts-expect-error - meta mapping
          setMeta(res.data.meta);
        })
        .catch(() => {
          // Silent fail for polling
        })
        .finally(() => {
          isPollingRef.current = false;
        });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [items, page]);

  if (error) return <ErrorMessage message={error} retry={() => { setLoading(true); void loadData(page); }} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Payouts</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Withdrawals</h1>
        </div>
        <Link 
          href="/withdrawals/create"
          className={`flex items-center gap-2 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 border border-white/10 ${loading && !wallet ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Plus className="h-4 w-4" /> Request Payout
        </Link>
      </header>

      <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
        {loading && items.length > 0 && (
          <div className="absolute inset-0 bg-[#05080c]/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
             <Spinner />
          </div>
        )}

        <div className="flex items-center gap-3 border-b border-white/5 p-4 sm:p-6 md:px-8 bg-white/1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3f82b2]/10 border border-[#3f82b2]/20 text-[#79b8e8] shadow-inner shrink-0">
            <Landmark className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white drop-shadow-sm">Transfer History</h2>
            <p className="text-xs font-medium text-[#8995a3]">Track bank payouts and settlements</p>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/1 border-b border-white/5">
              <tr>
                <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Reference</th>
                <th className="hidden sm:table-cell px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                <th className="hidden md:table-cell px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Fee</th>
                <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                <th className="hidden lg:table-cell px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Date</th>
                <th className="px-4 md:px-8 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && !items.length ? (
                <tr><td colSpan={6}><WithdrawalSkeleton /></td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                        <Landmark className="h-8 w-8 text-[#68747e]" />
                      </div>
                      <h3 className="text-lg font-bold text-white drop-shadow-sm">No withdrawals yet</h3>
                      <p className="mt-2 text-sm text-[#8995a3] max-w-sm leading-relaxed mb-6 whitespace-normal">
                        When you request a transfer to your bank account, it will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const statusLabel = item.status.toUpperCase();
                  const isSuccess = statusLabel === "SUCCESS" || statusLabel === "SUCCESSFUL";
                  const isPending = statusLabel === "PENDING" || statusLabel === "PROCESSING" || statusLabel === "REQUESTED";
                  const isFailed = statusLabel === "FAILED" || statusLabel === "REVERSED" || statusLabel === "CANCELLED";
                  const isExpanded = expandedId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      <tr 
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className={`transition-colors cursor-pointer group ${isExpanded ? 'bg-white/4' : 'hover:bg-white/2'}`}
                      >
                        <td className="px-4 md:px-8 py-5">
                          <p className="font-bold text-[#e8edf2] group-hover:text-white transition-colors truncate max-w-37.5 sm:max-w-xs">
                            {item.reference}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mt-1 sm:hidden">
                            {formatAmount(item.amount, item.currency)}
                          </p>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-8 py-5 font-bold tracking-tight text-[#e8edf2]">
                          {formatAmount(item.amount, item.currency)}
                        </td>
                        <td className="hidden md:table-cell px-8 py-5 text-red-400 font-medium">
                          -{formatAmount(item.fee, item.currency)}
                        </td>
                        <td className="px-4 md:px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                            ${isSuccess ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : 
                              isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                              "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                            {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : isPending ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {statusLabel}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-8 py-5 font-medium text-[#8995a3]">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-4 md:px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {isPending && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <VerifyWithdrawalButton id={item.id} onVerified={() => loadData(page)} />
                              </div>
                            )}
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#8995a3] group-hover:text-white">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* DROPDOWN EXPANSION */}
                      {isExpanded && (
                        <tr className="bg-[#05080c]/40 shadow-inner border-b-2 border-white/5">
                          <td colSpan={6} className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-8 animate-in slide-in-from-top-2 fade-in duration-200 whitespace-normal">
                              
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] mb-4 flex items-center gap-2">
                                  <Building2 className="h-4 w-4"/> Destination Details
                                </h4>
                                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-4">
                                  <User className="h-8 w-8 text-[#2f9d78]" />
                                  <div>
                                    <p className="text-xs font-medium text-[#8995a3] mb-0.5">Account Name</p>
                                    <p className="text-sm font-bold text-white uppercase">{item.bank_account?.account_name || "N/A"}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-4">
                                  <Building2 className="h-8 w-8 text-[#3f82b2]" />
                                  <div>
                                    <p className="text-sm font-bold text-white">{item.bank_account?.account_number || "N/A"}</p>
                                    <p className="text-xs font-medium text-[#8995a3]">Bank Code: {item.bank_account?.bank_code || "N/A"}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4 md:border-l border-white/5 md:pl-8">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] mb-4 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4"/> Financial Breakdown
                                </h4>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-[#68747e]">Gross Withdrawal</span>
                                  <span className="font-bold text-[#e8edf2]">{formatAmount(item.amount, item.currency)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-[#68747e]">Network Fee</span>
                                  <span className="font-bold text-red-400">-{formatAmount(item.fee, item.currency)}</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                  <span className="text-xs font-bold uppercase tracking-widest text-[#35d5a4]">Expected Credit</span>
                                  <span className="text-xl font-black text-[#35d5a4]">
                                    {formatAmount(item.amount - item.fee, item.currency)}
                                  </span>
                                </div>

                                {isFailed && (
                                  <div className="mt-6 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                                    <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Transfer Failed</p>
                                      <p className="text-sm font-medium text-[#e8edf2]">{item.failure_reason || "Bank network rejected transfer"}</p>
                                      <p className="text-xs text-[#8995a3] mt-1">Funds have been automatically reversed to your wallet.</p>
                                    </div>
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
                onClick={() => { setLoading(true); setPage(p => Math.max(1, p - 1)); }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => { setLoading(true); setPage(p => p + 1); }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}