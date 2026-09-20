"use client";

import VerifyWithdrawalButton from "@/components/VerifyWithdrawalButton";
import { useEffect, useState, useCallback } from "react";
import { 
  Landmark, Plus, ArrowUpRight, Clock, CheckCircle2, 
  XCircle, ChevronLeft, ChevronRight, X, AlertCircle, Building2, User
} from "lucide-react";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { InitializeWithdrawalRequest, WithdrawalListResponse, WithdrawalResource, WalletResponse, WalletResource } from "@/types/api";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";

const formatAmount = (value: number, currency: string) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string) => 
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

// ----------------------------------------------------------------------
// Types: Extend the base resource to include missing PRD fields safely
// ----------------------------------------------------------------------
interface ExtendedWithdrawal extends WithdrawalResource {
  bank_account?: {
    bank_code: string;
    account_number: string;
    account_name: string;
  };
  failure_reason?: string;
}

// ----------------------------------------------------------------------
// Withdrawal Details Modal
// ----------------------------------------------------------------------
function WithdrawalDetailsModal({ entry, onClose }: { entry: ExtendedWithdrawal; onClose: () => void }) {
  const statusLabel = entry.status.toUpperCase();
  const isSuccess = statusLabel === "SUCCESS" || statusLabel === "SUCCESSFUL";
  const isPending = statusLabel === "PENDING" || statusLabel === "PROCESSING" || statusLabel === "REQUESTED";
  const isFailed = statusLabel === "FAILED" || statusLabel === "REVERSED" || statusLabel === "CANCELLED";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between border-b border-white/5 bg-white/2 p-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isSuccess ? 'bg-[#2f9d78]/10 border-[#2f9d78]/20 text-[#35d5a4]' : 
              isPending ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
              'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Payout Details</h3>
              <p className="text-xs font-medium text-[#8995a3]">{formatDate(entry.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[#8995a3] hover:bg-white/10 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center pb-6 border-b border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-2">Requested Amount</p>
            <p className="text-4xl font-black tracking-tight text-white">
              {formatAmount(entry.amount, entry.currency)}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider
                ${isSuccess ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : 
                  isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                  "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#68747e]">Reference ID</span>
              <span className="text-sm font-medium text-white">{entry.reference}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#68747e]">Network Fee</span>
              <span className="text-sm font-bold text-red-400">-{formatAmount(entry.fee, entry.currency)}</span>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Destination Bank Details</p>
              
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-4">
                <Building2 className="h-8 w-8 text-[#3f82b2]" />
                <div>
                  <p className="text-sm font-bold text-white">{entry.bank_account?.account_number || "N/A"}</p>
                  <p className="text-xs font-medium text-[#8995a3]">Bank Code: {entry.bank_account?.bank_code || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 p-4">
                <User className="h-8 w-8 text-[#2f9d78]" />
                <div>
                  <p className="text-xs font-medium text-[#8995a3] mb-0.5">Account Name</p>
                  <p className="text-sm font-bold text-white uppercase">{entry.bank_account?.account_name || "N/A"}</p>
                </div>
              </div>
            </div>

            {isFailed && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Transfer Failed & Refunded</p>
                  <p className="text-sm font-medium text-[#e8edf2]">{entry.failure_reason || "Bank network rejected transfer"}</p>
                  <p className="text-xs text-[#8995a3] mt-1">Funds have been automatically reversed/refunded to your wallet balance.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Page
// ----------------------------------------------------------------------
export default function WithdrawalsPage() {
  const [wallet, setWallet] = useState<WalletResource | null>(null);
  const [items, setItems] = useState<ExtendedWithdrawal[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedEntry, setSelectedEntry] = useState<ExtendedWithdrawal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  
  const generateRef = () => `WTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  const [form, setForm] = useState<InitializeWithdrawalRequest>({ 
    amount: 0, 
    currency: "", 
    reference: "", 
    bank_code: "", 
    account_number: "", 
    account_name: "", 
    metadata: null 
  });

  const loadData = useCallback(async (currentPage: number) => {
    setLoading(true); 
    setError(""); 
    try { 
      const [walletRes, withdrawalsRes] = await Promise.all([
        api.get<WalletResponse>("/wallet"),
        api.get<WithdrawalListResponse>("/withdrawals", { params: { page: currentPage, per_page: 15 } })
      ]);
      
      setWallet(walletRes.data.data);
      setItems(withdrawalsRes.data.data); 
      // @ts-expect-error - meta exists in the paginated response wrapper
      setMeta(withdrawalsRes.data.meta);
    } catch (err: unknown) { 
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to load payouts."); 
      } else {
        setError("Unable to load payouts."); 
      }
    } finally { 
      setLoading(false); 
    } 
  }, []);
  
  useEffect(() => { 
    const timer = window.setTimeout(() => {
      void loadData(page);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData, page]); 

  const openWithdrawalModal = () => {
    setForm({ 
      ...form, 
      amount: 0, 
      currency: wallet?.currency || "NGN", 
      reference: generateRef(), 
      bank_code: "", 
      account_number: "", 
      account_name: "" 
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const requestWithdrawal = async (event: React.FormEvent) => { 
    event.preventDefault(); 
    setSaving(true); 
    setFormError("");

    try { 
      await api.post("/withdrawals", form); 
      setIsModalOpen(false); 
      await loadData(1); 
    } catch (err: unknown) { 
      if (isAxiosError(err)) {
        const backendMessage = err.response?.data?.message || "Unable to initiate withdrawal.";
        // Avoid duplicate text if the backend already mentioned the refund
        const displayMessage = backendMessage.toLowerCase().includes("refund") || backendMessage.toLowerCase().includes("reverse")
          ? backendMessage
          : `${backendMessage} Funds have been automatically refunded to your wallet.`;
          
        setFormError(displayMessage); 
      } else {
        setFormError("An unexpected error occurred. Funds have been refunded to your wallet."); 
      }
      await loadData(page);
    } finally { 
      setSaving(false); 
    }
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Individual Payout Details Modal */}
      {selectedEntry && (
        <WithdrawalDetailsModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Payouts</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Withdrawals</h1>
        </div>
        <button 
          onClick={openWithdrawalModal} 
          disabled={!wallet}
          className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 disabled:opacity-50 border border-white/10"
        >
          <Plus className="h-4 w-4" /> Request Payout
        </button>
      </header>

      {loading && !items.length ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-[#35d5a4] bg-[#2f9d78]/10 px-6 py-3 rounded-full border border-[#2f9d78]/20 font-medium text-sm shadow-[0_0_20px_rgba(47,157,120,0.15)]">
            <Spinner /> Loading payout history...
          </div>
        </div>
      ) : error ? (
        <ErrorMessage message={error} retry={() => loadData(page)} />
      ) : (
        <section className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 bg-[#05080c]/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
               <Spinner />
            </div>
          )}

          <div className="flex items-center gap-3 border-b border-white/5 p-6 md:px-8 bg-white/1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-inner">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white drop-shadow-sm">Transfer History</h2>
              <p className="text-xs font-medium text-[#8995a3]">Track bank payouts and settlements</p>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/1 border-b border-white/5">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Reference</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Fee</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => {
                  const statusLabel = item.status.toUpperCase();
                  const isSuccess = statusLabel === "SUCCESS" || statusLabel === "SUCCESSFUL";
                  const isPending = statusLabel === "PENDING" || statusLabel === "PROCESSING" || statusLabel === "REQUESTED";
                  
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedEntry(item)}
                      className="transition-colors hover:bg-white/3 group cursor-pointer"
                    >
                      <td className="px-8 py-5 font-bold text-[#e8edf2] group-hover:text-white transition-colors">
                        {item.reference}
                      </td>
                      <td className="px-8 py-5 font-bold tracking-tight text-[#e8edf2]">
                        {formatAmount(item.amount, item.currency)}
                      </td>
                      <td className="px-8 py-5 text-red-400 font-medium">
                        -{formatAmount(item.fee, item.currency)}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                          ${isSuccess ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : 
                            isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                            "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : isPending ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-medium text-[#8995a3]">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-8 py-5 flex justify-end">
                        {isPending ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <VerifyWithdrawalButton id={item.id} onVerified={() => loadData(page)} />
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

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-8 py-4 bg-white/1">
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
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/1">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                <Landmark className="h-8 w-8 text-[#68747e]" />
              </div>
              <h3 className="text-lg font-bold text-white drop-shadow-sm">No withdrawals yet</h3>
              <p className="mt-2 text-sm text-[#8995a3] max-w-sm leading-relaxed mb-6">
                When you request a transfer to your bank account, it will appear here.
              </p>
              <button 
                onClick={openWithdrawalModal} 
                className="text-xs font-bold text-[#79b8e8] hover:text-[#90c6ec] transition-colors border-b border-transparent hover:border-[#90c6ec] pb-0.5"
              >
                Request your first payout
              </button>
            </div>
          )}
        </section>
      )}

      {/* New Withdrawal Request Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d131a] shadow-2xl overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between border-b border-white/5 bg-white/2 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Withdraw Funds</h3>
                  <p className="text-xs font-medium text-[#8995a3]">Transfer to your bank account</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-[#8995a3] hover:bg-white/10 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={requestWithdrawal} className="p-6 space-y-5">
              
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Amount</label>
                  <input 
                    type="number" 
                    min="1" 
                    step="0.01"
                    required
                    value={form.amount || ""}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full h-11 rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm text-white placeholder:text-[#68747e] outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Currency</label>
                  <div className="w-full h-11 flex items-center rounded-xl border border-white/5 bg-white/5 px-4 text-sm font-bold text-[#8995a3] cursor-not-allowed shadow-inner">
                    {wallet?.currency || "---"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Bank Code</label>
                  <input 
                    required
                    value={form.bank_code}
                    onChange={(e) => setForm({ ...form, bank_code: e.target.value })}
                    className="w-full h-11 rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                    placeholder="e.g. 058 (GTB)"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Account Number</label>
                  <input 
                    required
                    value={form.account_number}
                    onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                    className="w-full h-11 rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Account Name</label>
                <input 
                  required
                  value={form.account_name}
                  onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                  placeholder="John Doe"
                />
              </div>

              <input type="hidden" value={form.reference} />

              <div className="pt-4 border-t border-white/5">
                <button 
                  type="submit" 
                  disabled={saving || form.amount <= 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                >
                  {saving ? <Spinner /> : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}