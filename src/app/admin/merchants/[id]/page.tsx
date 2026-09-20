"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { Spinner, ErrorMessage, useToast } from "@/components/dashboard/ui";
import { ArrowLeft, ShieldAlert, CheckCircle, Activity, ArrowDownRight, Wallet, Banknote, AlertCircle } from "lucide-react";

interface MerchantDetails {
  merchant: {
    id: string;
    business_name: string;
    email: string;
    phone: string;
    country: string;
    status: string;
    wallets: Array<{ id: string; currency: string; available_balance: number }>;
  };
  financial_summary: {
    total_transactions: number;
    successful_payment_volume: number;
    total_withdrawn: number;
  };
}

export default function MerchantDetailOperations() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToast();

  const [data, setData] = useState<MerchantDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Adjustment Form & Inline Error State
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ amount: "", direction: "CREDIT", description: "", currency: "" });
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const fetchMerchant = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/merchants/${id}`);
      setData(res.data.data);
      if (res.data.data.merchant.wallets.length > 0) {
        setAdjustForm(prev => ({ ...prev, currency: res.data.data.merchant.wallets[0].currency }));
      }
    } catch (err) {
      setError("Failed to load merchant details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        fetchMerchant();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [id, fetchMerchant]);

  const toggleStatus = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    
    try {
      const res = await api.patch(`/admin/merchants/${id}/toggle-status`);
      const updatedStatus = res.data?.data?.status;

      // Immediately update local state with normalized uppercase status
      setData(prev => prev ? { 
        ...prev, 
        merchant: { ...prev.merchant, status: updatedStatus ? updatedStatus.toUpperCase() : 'ACTIVE' } 
      } : null);

      toast.success(res.data.message || `Merchant status updated.`);
      
      // Force a re-fetch to fully synchronize with backend source of truth
      await fetchMerchant();
    } catch (err: unknown) {
      const message = isAxiosError(err) ? err.response?.data?.message : "Failed to change status.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAdjustError(null);

    try {
      await api.post(`/admin/merchants/${id}/adjust-balance`, adjustForm);
      toast.success("Ledger adjusted successfully.");
      setShowAdjust(false);
      setAdjustForm(prev => ({ ...prev, amount: "", description: "" }));
      await fetchMerchant(); 
    } catch (err: unknown) {
      const errorMessage = isAxiosError(err) 
        ? err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || "Adjustment failed."
        : "An unexpected error occurred.";
      
      setAdjustError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && !data) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  if (error || !data) return <ErrorMessage message={error} retry={fetchMerchant} />;

  const { merchant, financial_summary: fin } = data;
  
  // Robust case-insensitive check for suspension status
  const isSuspended = merchant.status?.toUpperCase() === 'SUSPENDED';

  return (
    <div className="space-y-6">
      
      <div className="mb-4">
        <Link href="/admin/merchants" className="inline-flex items-center gap-2 text-xs font-bold text-[#8995a3] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Merchant Directory
        </Link>
      </div>
          
      {/* Header & Status Toggle */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{merchant.business_name}</h1>
          <p className="text-sm text-[#8995a3] mt-1">{merchant.email} • {merchant.country}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider
            ${isSuspended ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20"}`}>
            {merchant.status}
          </span>
          <button 
            type="button"
            onClick={toggleStatus}
            disabled={isProcessing}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border cursor-pointer ${
              isSuspended 
                ? 'bg-[#2f9d78]/10 text-[#35d5a4] border-[#2f9d78]/30 hover:bg-[#2f9d78]/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
            } disabled:opacity-50`}
          >
            {isSuspended ? (
              <span className="flex items-center gap-2 pointer-events-none"><CheckCircle className="h-4 w-4"/> Restore Access</span>
            ) : (
              <span className="flex items-center gap-2 pointer-events-none"><ShieldAlert className="h-4 w-4"/> Suspend Merchant</span>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Activity */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white drop-shadow-sm">Financial Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5">
              <div className="flex items-center gap-2 text-[#8995a3] mb-2"><Activity className="h-4 w-4"/> Success Volume</div>
              <h2 className="text-2xl font-bold text-white">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: merchant.wallets[0]?.currency || 'NGN' }).format(fin.successful_payment_volume)}
              </h2>
              <p className="text-xs text-[#68747e] mt-1">{fin.total_transactions} total transactions</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5">
              <div className="flex items-center gap-2 text-[#8995a3] mb-2"><ArrowDownRight className="h-4 w-4"/> Total Withdrawn</div>
              <h2 className="text-2xl font-bold text-white">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: merchant.wallets[0]?.currency || 'NGN' }).format(fin.total_withdrawn)}
              </h2>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white drop-shadow-sm pt-4">Wallet Balances</h3>
          <div className="space-y-4">
            {merchant.wallets.map(w => (
              <div key={w.id} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl"><Wallet className="h-5 w-5 text-blue-400" /></div>
                  <div>
                    <p className="text-sm font-bold text-white">{w.currency} Wallet</p>
                    <p className="text-2xl font-black text-[#e8edf2] mt-1">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: w.currency }).format(w.available_balance)}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => { setAdjustForm(prev => ({ ...prev, currency: w.currency })); setShowAdjust(true); setAdjustError(null); }}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Adjust Balance
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Adjust Balance Form Panel */}
        {showAdjust && (
          <div className="lg:col-span-1">
            <form onSubmit={submitAdjustment} className="rounded-3xl border border-amber-500/20 bg-[#0a0f16] shadow-2xl p-6 relative">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2 mb-4">
                <Banknote className="h-4 w-4" /> Manual Ledger Adjustment
              </h3>

              {adjustError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2 text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">{adjustError}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 block">Direction</label>
                  <select 
                    value={adjustForm.direction}
                    onChange={e => setAdjustForm(prev => ({...prev, direction: e.target.value}))}
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500/50"
                  >
                    <option value="CREDIT" className="bg-[#0a0f16]">CREDIT (Add Funds)</option>
                    <option value="DEBIT" className="bg-[#0a0f16]">DEBIT (Remove Funds)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 block">Amount ({adjustForm.currency})</label>
                  <input 
                    type="number" step="0.01" min="0.01" max="99999999" required
                    value={adjustForm.amount}
                    onChange={e => setAdjustForm(prev => ({...prev, amount: e.target.value}))}
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500/50"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 block">Audit Description</label>
                  <textarea 
                    required maxLength={255} rows={3}
                    value={adjustForm.description}
                    onChange={e => setAdjustForm(prev => ({...prev, description: e.target.value}))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-amber-500/50 resize-none"
                    placeholder="Reason for adjustment..."
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAdjust(false)} className="flex-1 py-2 text-sm font-bold text-[#8995a3] hover:text-white transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isProcessing} className="flex-1 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-50 cursor-pointer">
                    {isProcessing ? "Processing..." : "Commit Entry"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}