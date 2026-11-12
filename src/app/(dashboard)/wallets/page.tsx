"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { 
  Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, 
  Clock, Activity, FileText, ChevronLeft, ChevronRight, Lock, Hash, CreditCard, ChevronDown, ChevronUp 
} from "@/components/icons";
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
        <div key={i} className="flex items-center justify-between py-6 px-4 md:px-8 border-b border-line">
          <div className="h-4 w-24 md:w-32 bg-surface-muted rounded-full"></div>
          <div className="h-4 w-20 md:w-24 bg-surface-muted rounded-full hidden sm:block"></div>
          <div className="h-6 w-20 bg-surface-muted rounded-full"></div>
          <div className="h-4 w-24 bg-surface-muted rounded-full hidden lg:block"></div>
          <div className="h-4 w-24 bg-surface-muted rounded-full hidden md:block"></div>
          <div className="h-8 w-8 bg-surface-muted rounded-full"></div>
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Settlement Account</p>
          <h1 className="text-2xl font-bold text-ink drop-shadow-sm mt-1">Wallet & Ledger</h1>
        </div>
        <div className="flex items-center gap-2 rounded-input border border-line bg-surface-muted px-4 py-2 text-sm text-ink backdrop-blur-md shadow-inner w-fit">
          <Lock className="h-4 w-4 text-brand-500" />
          <span className="font-medium">
            {loading && !wallet ? <span className="inline-block w-12 h-3 bg-surface-muted rounded animate-pulse" /> : `${wallet?.currency} Base Currency`}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-card border border-line bg-surface backdrop-blur-xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col justify-center min-h-50">
          <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: "radial-gradient(var(--brand-500) 1px, transparent 1px)", backgroundSize: "30px 30px", maskImage: "linear-gradient(to bottom right, black 20%, transparent 80%)" }} />
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-success-tint blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-input bg-success-tint text-brand-500 border border-line shadow-inner shrink-0">
                <WalletIcon className="h-5 w-5" /> 
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted drop-shadow-sm">Available Balance</h2>
            </div>
            
            {loading && !wallet ? (
              <div className="h-12 sm:h-16 w-3/4 max-w-75 bg-surface-muted rounded-card animate-pulse my-2" />
            ) : (
              <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight drop-shadow-lg truncate">
                {formatAmount(wallet!.available_balance, wallet!.currency)}
              </p>
            )}
            
            <p className="text-sm font-medium text-ink-muted mt-2 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Ready for withdrawal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-card border border-line bg-surface backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center min-h-35">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-input bg-surface-muted border border-line text-pending">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Pending Clearance</p>
            </div>
            {loading && !wallet ? (
              <div className="h-8 w-1/2 bg-surface-muted rounded-input animate-pulse" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-ink tracking-tight truncate">
                {formatAmount(wallet!.pending_balance, wallet!.currency)}
              </p>
            )}
          </div>

          <div className="rounded-card border border-line bg-surface backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center min-h-35">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">System Status</p>
            {loading && !wallet ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-surface-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-surface-muted rounded animate-pulse" />
              </div>
            ) : (
              <p className="text-sm font-medium text-ink leading-relaxed">
                Ledger synchronized successfully. Last activity recorded at <span className="font-bold text-ink">{formatDate(wallet!.updated_at)}</span>.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface backdrop-blur-xl shadow-card overflow-hidden flex flex-col relative">
        {loading && ledger.length > 0 && (
          <div className="absolute inset-0 bg-bg/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
             <Spinner />
          </div>
        )}

        <div className="flex items-center gap-3 border-b border-line p-4 sm:p-6 md:px-8 bg-surface">
          <div className="flex h-8 w-8 items-center justify-center rounded-input bg-surface-muted border border-line text-ink-muted shadow-inner shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink drop-shadow-sm">Master Ledger</h2>
            <p className="text-xs font-medium text-ink-muted">Immutable record of all wallet movements</p>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface border-b border-line">
              <tr>
                <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Reference</th>
                <th className="hidden sm:table-cell px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Movement</th>
                <th className="px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Amount</th>
                <th className="hidden lg:table-cell px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Balance After</th>
                <th className="hidden md:table-cell px-4 md:px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Date</th>
                <th className="px-4 md:px-8 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-ink-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && !ledger.length ? (
                <tr><td colSpan={6}><LedgerSkeleton /></td></tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-card bg-surface-muted border border-line shadow-inner">
                        <FileText className="h-8 w-8 text-ink-muted" />
                      </div>
                      <h3 className="text-lg font-bold text-ink drop-shadow-sm">No ledger entries yet</h3>
                      <p className="mt-2 text-sm text-ink-muted max-w-sm leading-relaxed mb-6 whitespace-normal">
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
                        className={`transition-colors cursor-pointer group ${isExpanded ? 'bg-surface-muted' : 'hover:bg-surface'}`}
                      >
                        <td className="px-4 md:px-8 py-5">
                          <p className="font-bold text-ink group-hover:text-ink transition-colors truncate max-w-37.5 sm:max-w-xs">
                            {entry.reference}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mt-1 sm:hidden">
                            {entry.type}
                          </p>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                            ${isCredit ? "bg-success-tint text-brand-500 border border-line" : "bg-danger-tint text-danger border border-line"}`}>
                            {isCredit ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {entry.type}
                          </span>
                        </td>
                        <td className={`px-4 md:px-8 py-5 font-bold tracking-tight ${isCredit ? "text-brand-500" : "text-danger"}`}>
                          {isCredit ? "+" : "-"}{formatAmount(entry.amount, entry.currency)}
                        </td>
                        <td className="hidden lg:table-cell px-8 py-5 font-medium text-ink-muted">
                          {formatAmount(entry.balance_after, entry.currency)}
                        </td>
                        <td className="hidden md:table-cell px-4 md:px-8 py-5 font-medium text-ink-muted">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="px-4 md:px-8 py-5 text-right">
                          <button className="p-2 hover:bg-surface-muted rounded-full transition-colors text-ink-muted group-hover:text-ink">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* DROPDOWN EXPANSION */}
                      {isExpanded && (
                        <tr className={`shadow-inner border-b-2 ${isCredit ? 'bg-bg/40 border-line' : 'bg-danger-tint border-line'}`}>
                          <td colSpan={6} className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-8 animate-in slide-in-from-top-2 fade-in duration-200 whitespace-normal">
                              
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4"/> Movement Breakdown
                                </h4>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-ink-muted">Gross Amount</span>
                                  <span className="font-bold text-ink">{formatAmount(grossAmount, entry.currency)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-ink-muted">Processing Fee Deducted</span>
                                  <span className="font-bold text-danger">-{formatAmount(feeAmount, entry.currency)}</span>
                                </div>
                                <div className="pt-3 border-t border-line flex justify-between items-center">
                                  <span className={`text-xs font-bold uppercase tracking-widest ${isCredit ? 'text-brand-500' : 'text-danger'}`}>Net Applied to Balance</span>
                                  <span className={`text-xl font-black ${isCredit ? 'text-brand-500' : 'text-danger'}`}>
                                    {isCredit ? "+" : "-"}{formatAmount(entry.amount, entry.currency)}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-4 md:border-l border-line md:pl-8">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2">
                                  <Hash className="h-4 w-4"/> Entry Metadata
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Description</span>
                                    <span className="text-sm font-medium text-ink">{entry.description || "System automatic entry"}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Balance Before</span>
                                      <span className="text-sm font-medium text-ink-muted">{formatAmount(entry.balance_before, entry.currency)}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Balance After</span>
                                      <span className="text-sm font-bold text-ink">{formatAmount(entry.balance_after, entry.currency)}</span>
                                    </div>
                                  </div>
                                  <div className="md:hidden pt-2 border-t border-line">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted">Processed At</span>
                                    <span className="text-sm font-medium text-ink">{formatDate(entry.created_at)}</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line p-4 sm:px-8 bg-surface">
            <p className="text-xs font-medium text-ink-muted">
              Page <span className="text-ink font-bold">{meta.current_page}</span> of <span className="text-ink font-bold">{meta.last_page}</span>
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                disabled={meta.current_page === 1}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-input border border-line bg-surface-muted px-4 py-2 text-xs font-medium text-ink transition-all hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => handlePageChange(page + 1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-input border border-line bg-surface-muted px-4 py-2 text-xs font-medium text-ink transition-all hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed"
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