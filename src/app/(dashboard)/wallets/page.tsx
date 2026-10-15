"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { 
  Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, 
  Clock, Activity, FileText, ChevronLeft, ChevronRight, Lock, Hash, CreditCard, ChevronDown, ChevronUp 
} from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { LedgerEntryResource, LedgerListResponse, WalletResponse, WalletResource } from "@/types/api";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

const formatAmount = (value: number, currency: string) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string | undefined) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
};

// Locally extend the API type to satisfy TypeScript without touching global files
interface ExtendedLedgerEntry extends LedgerEntryResource {
  balance_before: number;
  balance_after: number;
  transaction?: { amount: number; fee: number; net_amount: number };
}

function LedgerSkeleton() {
  return (
    
    <div className="animate-pulse flex flex-col">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-6 px-4 md:px-8 border-b border-white/5">
          <div className="h-4 w-24 md:w-32 bg-white/10 rounded-full"></div>
          <div className="h-4 w-20 md:w-24 bg-white/5 rounded-full hidden sm:block"></div>
          <div className="h-6 w-20 bg-white/10 rounded-full"></div>
          <div className="h-4 w-24 bg-white/5 rounded-full hidden lg:block"></div>
          <div className="h-4 w-24 bg-white/5 rounded-full hidden md:block"></div>
          <div className="h-8 w-8 bg-white/5 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}

export default function WalletsPage() {
  const [wallet, setWallet] = useState<WalletResource | null>(null);
  const [ledger, setLedger] = useState<ExtendedLedgerEntry[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const initialized = useRef(false);

  const fetchWalletData = useCallback(async (currentPage: number) => {
    try {
      const [walletRes, ledgerRes] = await Promise.all([
        api.get<WalletResponse>("/wallet"),
        api.get<LedgerListResponse>("/wallet/ledger", { params: { page: currentPage, per_page: 15 } })
      ]);
      
      setWallet(walletRes.data.data);
      // Safely cast to our extended type to satisfy TypeScript
      setLedger(ledgerRes.data.data as ExtendedLedgerEntry[]);
      // @ts-expect-error - meta exists in paginated wrapper
      setMeta(ledgerRes.data.meta);
      setError("");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || err.response?.data?.error || "Unable to load wallet data.");
      } else {
        setError("Unable to load wallet data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchWalletData(page).catch(console.error);
    }
  }, [fetchWalletData, page]);

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setPage(newPage);
    fetchWalletData(newPage).catch(console.error);
    setExpandedId(null);
  };

  if (error) return <ErrorMessage message={error} retry={() => handlePageChange(page)} />;

  return (
    <RoleGuard allowedRoles={["admin", "finance"]}>
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Settlement Account</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Wallet & Ledger</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md shadow-inner w-fit">
          <Lock className="h-4 w-4 text-[#35d5a4]" />
          <span className="font-medium">
            {loading && !wallet ? <span className="inline-block w-12 h-3 bg-white/20 rounded animate-pulse" /> : `${wallet?.currency} Base Currency`}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-50">
          <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: `radial-gradient(#2f9d78 1px, transparent 1px)`, backgroundSize: '30px 30px', maskImage: 'linear-gradient(to bottom right, black 20%, transparent 80%)' }} />
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#2f9d78]/10 blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f9d78]/20 text-[#35d5a4] border border-[#2f9d78]/30 shadow-inner shrink-0">
                <WalletIcon className="h-5 w-5" /> 
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] drop-shadow-sm">Available Balance</h2>
            </div>
            
            {loading && !wallet ? (
              <div className="h-12 sm:h-16 w-3/4 max-w-75 bg-white/10 rounded-2xl animate-pulse my-2" />
            ) : (
              <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg truncate">
                {formatAmount(wallet!.available_balance, wallet!.currency)}
              </p>
            )}
            
            <p className="text-sm font-medium text-[#68747e] mt-2 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Ready for withdrawal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center min-h-35">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Pending Clearance</p>
            </div>
            {loading && !wallet ? (
              <div className="h-8 w-1/2 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                {formatAmount(wallet!.pending_balance, wallet!.currency)}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center min-h-35">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2">System Status</p>
            {loading && !wallet ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
              </div>
            ) : (
              <p className="text-sm font-medium text-[#e8edf2] leading-relaxed">
                Ledger synchronized successfully. Last activity recorded at <span className="font-bold text-white">{formatDate(wallet!.updated_at)}</span>.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
        {loading && ledger.length > 0 && (
          <div className="absolute inset-0 bg-[#05080c]/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
             <Spinner />
          </div>
        )}

        <div className="flex items-center gap-3 border-b border-white/5 p-4 sm:p-6 md:px-8 bg-white/1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3f82b2]/10 border border-[#3f82b2]/20 text-[#79b8e8] shadow-inner shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white drop-shadow-sm">Master Ledger</h2>
            <p className="text-xs font-medium text-[#8995a3]">Immutable record of all wallet movements</p>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/1 border-b border-white/5">
              <tr>
                <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Reference</th>
                <th className="hidden sm:table-cell px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Movement</th>
                <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                <th className="hidden lg:table-cell px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Balance After</th>
                <th className="hidden md:table-cell px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Date</th>
                <th className="px-4 md:px-8 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && !ledger.length ? (
                <tr><td colSpan={6}><LedgerSkeleton /></td></tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                        <FileText className="h-8 w-8 text-[#68747e]" />
                      </div>
                      <h3 className="text-lg font-bold text-white drop-shadow-sm">No ledger entries yet</h3>
                      <p className="mt-2 text-sm text-[#8995a3] max-w-sm leading-relaxed mb-6 whitespace-normal">
                        When payments are successfully processed or funds are withdrawn, the immutable records will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                ledger.map((entry) => {
                  const isCredit = entry.direction.toLowerCase() === "credit";
                  const isExpanded = expandedId === entry.id;
                  
                  const grossAmount = entry.transaction ? entry.transaction.amount : entry.amount;
                  const feeAmount = entry.transaction ? entry.transaction.fee : 0;

                  return (
                    <React.Fragment key={entry.id}>
                      {/* MAIN ROW */}
                      <tr 
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className={`transition-colors cursor-pointer group ${isExpanded ? 'bg-white/4' : 'hover:bg-white/2'}`}
                      >
                        <td className="px-4 md:px-8 py-5">
                          <p className="font-bold text-[#e8edf2] group-hover:text-white transition-colors truncate max-w-37.5 sm:max-w-xs">
                            {entry.reference}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mt-1 sm:hidden">
                            {entry.type}
                          </p>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                            ${isCredit ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                            {isCredit ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {entry.type}
                          </span>
                        </td>
                        <td className={`px-4 md:px-8 py-5 font-bold tracking-tight ${isCredit ? "text-[#35d5a4]" : "text-red-400"}`}>
                          {isCredit ? "+" : "-"}{formatAmount(entry.amount, entry.currency)}
                        </td>
                        <td className="hidden lg:table-cell px-8 py-5 font-medium text-[#8995a3]">
                          {formatAmount(entry.balance_after, entry.currency)}
                        </td>
                        <td className="hidden md:table-cell px-4 md:px-8 py-5 font-medium text-[#8995a3]">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="px-4 md:px-8 py-5 text-right">
                          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#8995a3] group-hover:text-white">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* DROPDOWN EXPANSION */}
                      {isExpanded && (
                        <tr className={`shadow-inner border-b-2 ${isCredit ? 'bg-[#05080c]/40 border-[#2f9d78]/20' : 'bg-[#0a0505]/40 border-red-500/20'}`}>
                          <td colSpan={6} className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-8 animate-in slide-in-from-top-2 fade-in duration-200 whitespace-normal">
                              
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] mb-4 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4"/> Movement Breakdown
                                </h4>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-[#68747e]">Gross Amount</span>
                                  <span className="font-bold text-[#e8edf2]">{formatAmount(grossAmount, entry.currency)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-[#68747e]">Processing Fee Deducted</span>
                                  <span className="font-bold text-red-400">-{formatAmount(feeAmount, entry.currency)}</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                  <span className={`text-xs font-bold uppercase tracking-widest ${isCredit ? 'text-[#35d5a4]' : 'text-red-400'}`}>Net Applied to Balance</span>
                                  <span className={`text-xl font-black ${isCredit ? 'text-[#35d5a4]' : 'text-red-400'}`}>
                                    {isCredit ? "+" : "-"}{formatAmount(entry.amount, entry.currency)}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-4 md:border-l border-white/5 md:pl-8">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] mb-4 flex items-center gap-2">
                                  <Hash className="h-4 w-4"/> Entry Metadata
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Description</span>
                                    <span className="text-sm font-medium text-white">{entry.description || "System automatic entry"}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Balance Before</span>
                                      <span className="text-sm font-medium text-[#8995a3]">{formatAmount(entry.balance_before, entry.currency)}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Balance After</span>
                                      <span className="text-sm font-bold text-white">{formatAmount(entry.balance_after, entry.currency)}</span>
                                    </div>
                                  </div>
                                  <div className="md:hidden pt-2 border-t border-white/5">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Processed At</span>
                                    <span className="text-sm font-medium text-white">{formatDate(entry.created_at)}</span>
                                  </div>
                                </div>
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
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => handlePageChange(page + 1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
    </RoleGuard>
  );
}