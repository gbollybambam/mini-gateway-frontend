"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { 
  Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, 
  Clock, Activity, FileText, ChevronLeft, ChevronRight, Lock, X, Hash 
} from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { LedgerEntryResource, LedgerListResponse, WalletResponse, WalletResource } from "@/types/api";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";

const formatAmount = (value: number, currency: string) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string) => 
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

// ----------------------------------------------------------------------
// Ledger Details Modal
// ----------------------------------------------------------------------
function LedgerDetailsModal({ entry, onClose }: { entry: LedgerEntryResource; onClose: () => void }) {
  const isCredit = entry.direction.toLowerCase() === "credit";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between border-b border-white/5 bg-white/2 p-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isCredit ? 'bg-[#2f9d78]/10 border-[#2f9d78]/20 text-[#35d5a4]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {isCredit ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ledger Entry</h3>
              <p className="text-xs font-medium text-[#8995a3]">{formatDate(entry.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[#8995a3] hover:bg-white/10 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center pb-6 border-b border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-2">Movement Amount</p>
            <p className={`text-4xl font-black tracking-tight ${isCredit ? "text-[#35d5a4]" : "text-red-400"}`}>
              {isCredit ? "+" : "-"}{formatAmount(entry.amount, entry.currency)}
            </p>
            <span className="inline-block mt-3 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[#e8edf2] border border-white/10 uppercase tracking-wider">
              {entry.type}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#68747e] flex items-center gap-2"><Hash className="h-3 w-3"/> Ref</span>
              <span className="text-sm font-medium text-white">{entry.reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#68747e]">Description</span>
              <span className="text-sm font-medium text-[#e8edf2]">{entry.description || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#68747e]">Balance After</span>
              <span className="text-sm font-bold text-white">{formatAmount(entry.balance_after, entry.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Page
// ----------------------------------------------------------------------
export default function WalletsPage() {
  const [wallet, setWallet] = useState<WalletResource | null>(null);
  const [ledger, setLedger] = useState<LedgerEntryResource[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedEntry, setSelectedEntry] = useState<LedgerEntryResource | null>(null);
  
  // Use a ref to track if we've initialized to prevent double-fetching on mount in StrictMode
  const initialized = useRef(false);

  const fetchWalletData = useCallback(async (currentPage: number) => {
    try {
      const [walletRes, ledgerRes] = await Promise.all([
        api.get<WalletResponse>("/wallet"),
        api.get<LedgerListResponse>("/wallet/ledger", { params: { page: currentPage, per_page: 15 } })
      ]);
      
      setWallet(walletRes.data.data);
      setLedger(ledgerRes.data.data);
      // @ts-expect-error - meta exists in the paginated response wrapper
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

  // Standard React pattern to load data on mount and when page changes without triggering linter
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchWalletData(page).catch(console.error);
    }
  }, [fetchWalletData, page]);

  // Handler for pagination clicks
  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setPage(newPage);
    fetchWalletData(newPage).catch(console.error);
  };

  const retryFetch = () => {
    setLoading(true);
    fetchWalletData(page).catch(console.error);
  };

  if (loading && !wallet) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#35d5a4] bg-[#2f9d78]/10 px-6 py-3 rounded-full border border-[#2f9d78]/20 font-medium text-sm shadow-[0_0_20px_rgba(47,157,120,0.15)]">
          <Spinner /> Synchronizing secure wallet...
        </div>
      </div>
    );
  }

  if (error || !wallet) return <ErrorMessage message={error || "Wallet unavailable."} retry={retryFetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {selectedEntry && (
        <LedgerDetailsModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Settlement Account</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Wallet & Ledger</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md shadow-inner">
          <Lock className="h-4 w-4 text-[#35d5a4]" />
          <span className="font-medium">{wallet.currency} Base Currency</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-50">
          <div className="absolute inset-0 z-0 opacity-[0.1]" style={{ backgroundImage: `radial-gradient(#2f9d78 1px, transparent 1px)`, backgroundSize: '30px 30px', maskImage: 'linear-gradient(to bottom right, black 20%, transparent 80%)' }} />
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#2f9d78]/10 blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f9d78]/20 text-[#35d5a4] border border-[#2f9d78]/30 shadow-inner">
                <WalletIcon className="h-5 w-5" /> 
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] drop-shadow-sm">Available Balance</h2>
            </div>
            <p className="text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg truncate">
              {formatAmount(wallet.available_balance, wallet.currency)}
            </p>
            <p className="text-sm font-medium text-[#68747e] mt-2 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Ready for withdrawal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Pending Clearance</p>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight truncate">
              {formatAmount(wallet.pending_balance, wallet.currency)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-6 shadow-lg flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2">System Status</p>
            <p className="text-sm font-medium text-[#e8edf2] leading-relaxed">
              Ledger synchronized successfully. Last activity recorded at <span className="font-bold text-white">{formatDate(wallet.updated_at)}</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
        {loading && ledger.length > 0 && (
          <div className="absolute inset-0 bg-[#05080c]/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
             <Spinner />
          </div>
        )}

        <div className="flex items-center gap-3 border-b border-white/5 p-6 md:px-8 bg-white/1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3f82b2]/10 border border-[#3f82b2]/20 text-[#79b8e8] shadow-inner">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white drop-shadow-sm">Master Ledger</h2>
            <p className="text-xs font-medium text-[#8995a3]">Immutable record of all wallet movements</p>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/1 border-b border-white/5">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Reference ID</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Description</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Movement</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Balance After</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ledger.map((entry) => {
                const isCredit = entry.direction.toLowerCase() === "credit";
                return (
                  <tr 
                    key={entry.id} 
                    onClick={() => setSelectedEntry(entry)}
                    className="transition-colors hover:bg-white/3 group cursor-pointer"
                  >
                    <td className="px-8 py-5 font-bold text-[#e8edf2] group-hover:text-white transition-colors">
                      {entry.reference}
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-medium text-[#e8edf2] max-w-50 truncate" title={entry.description || entry.type}>
                        {entry.description || entry.type}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mt-1">
                        {entry.type}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                        ${isCredit ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                        {isCredit ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {entry.direction}
                      </span>
                    </td>
                    <td className={`px-8 py-5 font-bold tracking-tight ${isCredit ? "text-[#35d5a4]" : "text-red-400"}`}>
                      {isCredit ? "+" : "-"}{formatAmount(entry.amount, entry.currency)}
                    </td>
                    <td className="px-8 py-5 font-medium text-[#8995a3]">
                      {formatAmount(entry.balance_after, entry.currency)}
                    </td>
                    <td className="px-8 py-5 font-medium text-[#8995a3]">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-8 py-4 bg-white/1">
            <p className="text-xs font-medium text-[#8995a3]">
              Showing page <span className="text-white font-bold">{meta.current_page}</span> of <span className="text-white font-bold">{meta.last_page}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.current_page === 1}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => handlePageChange(page + 1)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {ledger.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/1">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              <FileText className="h-8 w-8 text-[#68747e]" />
            </div>
            <h3 className="text-lg font-bold text-white drop-shadow-sm">No ledger entries yet</h3>
            <p className="mt-2 text-sm text-[#8995a3] max-w-50 leading-relaxed mb-6">
              When payments are successfully processed or funds are withdrawn, the double-entry records will appear here.
            </p>
            <a href="/payment-links" className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 border border-white/10">
              Start Accepting Payments
            </a>
          </div>
        )}
      </section>
    </div>
  );
}