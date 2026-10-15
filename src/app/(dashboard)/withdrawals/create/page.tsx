"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { ArrowLeft, Landmark, CheckCircle2, ShieldCheck, Wallet, ArrowUpRight, Search, Building2, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { Spinner, useToast } from "@/components/dashboard/ui";
import type { WalletResponse, WalletResource } from "@/types/api";

interface Bank {
  name: string;
  code: string;
}

export default function CreateWithdrawalPage() {
  const router = useRouter();
  const toast = useToast();
  
  // 1. Hydration Bypass State (Fixes the Next.js build error)
  const [isMounted, setIsMounted] = useState(false);
  
  const [wallet, setWallet] = useState<WalletResource | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [isResolving, setIsResolving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");

  const [bankSearch, setBankSearch] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    bank_code: "",
    account_number: "",
    account_name: "",
  });

 // Mount Effect - Fixes React cascading render warning
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // API Fetching Effect
  useEffect(() => {
    let mounted = true;

    api.get<WalletResponse>("/wallet").then(res => {
      if (!mounted) return;
      const currentWallet = res.data.data;
      setWallet(currentWallet);
      
      api.get<{ data: Bank[] }>("/withdrawals/banks", { params: { currency: currentWallet.currency } })
        .then(bankRes => {
          if (mounted) {
            // Deduplicate the array by bank code to prevent React key errors and clean up the UI
            const uniqueBanks = Array.from(new Map(bankRes.data.data.map(b => [b.code, b])).values());
            setBanks(uniqueBanks);
            setLoadingBanks(false);
          }
        })
        .catch(() => {
          if (mounted) {
            setError("Failed to load supported banks from provider.");
            setLoadingBanks(false);
          }
        });
    }).catch(() => {
      if (mounted) {
        setError("Failed to load wallet balance.");
        setLoadingBanks(false);
      }
    });

    return () => { mounted = false; };
  }, []);

  const filteredBanks = useMemo(() => {
    return banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));
  }, [banks, bankSearch]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    
    const intPart = parts[0];
    if (intPart) {
      const formattedInt = new Intl.NumberFormat('en-US').format(parseInt(intPart, 10));
      val = parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
    }
    setDisplayAmount(val);
    setForm(prev => ({ ...prev, amount: val.replace(/,/g, '') }));
  };

  const handleMaxClick = () => {
    if (!wallet) return;
    const val = wallet.available_balance.toString();
    const parts = val.split('.');
    const formattedInt = new Intl.NumberFormat('en-US').format(parseInt(parts[0], 10));
    const displayVal = parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
    
    setDisplayAmount(displayVal);
    setForm(prev => ({ ...prev, amount: val }));
  };

  const handleResolveAccount = async () => {
    if (form.account_number.length < 10 || !form.bank_code) {
      setError("Please select a bank and enter a valid 10-digit account number.");
      return;
    }

    setIsResolving(true);
    setError("");

    try {
      const response = await api.get("/withdrawals/resolve-account", {
        params: { account_number: form.account_number, bank_code: form.bank_code }
      });
      setForm(prev => ({ ...prev, account_name: response.data.data.account_name }));
      setStep(2);
      toast.success("Account verified securely.");
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Invalid account details." : "Verification failed.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const withdrawalAmount = parseFloat(form.amount);
    if (!wallet || withdrawalAmount > wallet.available_balance) {
      setError("Insufficient available balance.");
      setIsSubmitting(false);
      return;
    }

    const withdrawalReference = `WTH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      await api.post("/withdrawals", {
        reference: withdrawalReference,
        amount: withdrawalAmount,
        currency: wallet.currency,
        bank_code: form.bank_code,
        account_number: form.account_number,
        account_name: form.account_name,
      });

      toast.success("Payout initiated successfully.");
      router.push("/withdrawals");
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Failed to process withdrawal" : "System Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: wallet?.currency || 'NGN' }).format(val);

  // 2. Prevent server-side prerendering crashes
  if (!isMounted) {
    return null; 
  }

  return (
    <div className="w-full space-y-8 pb-10">
      <Link href="/withdrawals" className="inline-flex items-center gap-2 text-sm font-bold text-[#8995a3] hover:text-white transition-colors">
        <ArrowLeft className="h-5 w-5" /> Back to Ledger
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-16">
        
        <div className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-6 sm:p-8 md:p-12 shadow-2xl relative min-h-150">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#3f82b2]/5 blur-[120px] pointer-events-none" />

          <div className="flex items-center gap-5 mb-10 sm:mb-12 relative z-10">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#3f82b2]/10 text-[#79b8e8] border border-[#3f82b2]/20 shadow-inner shrink-0">
              <Landmark className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">Request Payout</h1>
              <p className="text-sm sm:text-base text-[#8995a3] mt-1">Withdraw funds to a verified destination.</p>
            </div>
          </div>

          {error && (
            <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm font-bold text-red-500 relative z-10">
              {error}
            </div>
          )}

          <div className="space-y-10 relative z-10">
            <div className={`space-y-6 sm:space-y-8 transition-opacity duration-300 ${step === 2 ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black shadow-inner ${step === 1 ? 'bg-[#3f82b2] text-white shadow-[#3f82b2]/50' : 'bg-[#2f9d78] text-white shadow-[#2f9d78]/50'}`}>
                    {step === 2 ? <Check className="h-4 w-4" /> : "1"}
                  </span>
                  Destination Bank Details
                </h2>
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-[#79b8e8] hover:text-white transition-colors bg-[#3f82b2]/10 px-3 py-1.5 rounded-lg border border-[#3f82b2]/20">
                    Edit Account
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Select Supported Bank</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#68747e]" />
                    <input 
                      type="text"
                      disabled={step === 2 || loadingBanks}
                      placeholder={loadingBanks ? "Loading network banks..." : "Search for a bank..."}
                      value={bankSearch}
                      onChange={(e) => {
                        setBankSearch(e.target.value);
                        setIsBankDropdownOpen(true);
                      }}
                      onFocus={() => setIsBankDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsBankDropdownOpen(false), 200)}
                      className="h-14 w-full rounded-xl border border-white/10 bg-[#090d14]/80 pl-12 pr-10 text-sm font-medium text-white placeholder:text-[#68747e] outline-none transition-all focus:border-[#3f82b2] focus:bg-white/5 focus:ring-1 focus:ring-[#3f82b2] shadow-inner disabled:opacity-50"
                    />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#68747e] pointer-events-none" />
                  </div>

                  {isBankDropdownOpen && filteredBanks.length > 0 && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0f16] shadow-2xl custom-scrollbar py-2">
                      {filteredBanks.map((bank, index) => (
                        <div 
                          key={`${bank.code}-${index}`}
                          onClick={() => {
                            setForm({ ...form, bank_code: bank.code });
                            setBankSearch(bank.name);
                            setIsBankDropdownOpen(false);
                          }}
                          className={`px-5 py-3 text-sm cursor-pointer transition-colors ${form.bank_code === bank.code ? 'bg-[#3f82b2]/20 text-[#79b8e8] font-bold' : 'text-[#e8edf2] hover:bg-white/5'}`}
                        >
                          {bank.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {isBankDropdownOpen && filteredBanks.length === 0 && !loadingBanks && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#0a0f16] shadow-2xl p-4 text-center text-sm text-[#68747e]">
                      No banks found matching &quot;{bankSearch}&quot;
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Account Number</label>
                  <input 
                    type="text"
                    disabled={step === 2}
                    value={form.account_number}
                    onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="0123456789"
                    className="h-14 w-full rounded-xl border border-white/10 bg-[#090d14]/80 px-5 text-base font-medium text-white placeholder:text-[#68747e] outline-none transition-all focus:border-[#3f82b2] focus:bg-white/5 focus:ring-1 focus:ring-[#3f82b2] shadow-inner disabled:opacity-50"
                  />
                </div>
              </div>

              {step === 1 && (
                <button 
                  type="button"
                  onClick={handleResolveAccount}
                  disabled={isResolving || form.account_number.length < 10 || !form.bank_code}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#3f82b2]/30 bg-[#3f82b2]/10 px-8 text-sm font-bold text-[#79b8e8] transition-all hover:bg-[#3f82b2]/20 disabled:opacity-50 shadow-inner"
                >
                  {isResolving ? <Spinner /> : <Search className="h-4 w-4" />}
                  {isResolving ? "Querying National Database..." : "Verify Account Ownership"}
                </button>
              )}

              {step === 2 && (
                <div className="flex items-center gap-4 rounded-2xl bg-linear-to-r from-[#2f9d78]/10 to-transparent border border-[#2f9d78]/20 p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f9d78]/20 text-[#35d5a4] shrink-0 shadow-inner">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-1">NIBSS Verified Identity</p>
                    <p className="text-lg font-black text-white uppercase tracking-wide">{form.account_name}</p>
                  </div>
                </div>
              )}
            </div>

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500 pt-8 border-t border-white/10">
                <h2 className="text-sm sm:text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3f82b2] text-xs font-black text-white shadow-inner shadow-[#3f82b2]/50">2</span>
                  Withdrawal Amount
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Amount to Withdraw</label>
                    {wallet && (
                      <button type="button" onClick={handleMaxClick} className="flex items-center gap-1.5 rounded-lg bg-[#3f82b2]/10 px-3 py-1.5 text-[10px] font-bold text-[#79b8e8] hover:bg-[#3f82b2]/20 transition-colors border border-[#3f82b2]/20">
                        Use Max: {formatCurrency(wallet.available_balance)}
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                      <span className="text-[#8995a3] font-bold text-xl">{wallet?.currency === 'NGN' ? '₦' : '$'}</span>
                    </div>
                    <input 
                      required
                      type="text"
                      value={displayAmount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="h-20 w-full rounded-2xl border border-white/10 bg-[#090d14]/80 pl-12 pr-6 text-3xl font-black text-white placeholder:text-[#68747e] outline-none transition-all focus:border-[#3f82b2] focus:bg-white/5 focus:ring-1 focus:ring-[#3f82b2] shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !form.amount}
                    className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-[#3f82b2] to-[#2c658f] px-8 text-base font-bold text-white transition-all hover:shadow-[0_0_30px_rgba(63,130,178,0.4)] hover:brightness-110 disabled:opacity-50 border border-white/10"
                  >
                    {isSubmitting ? <Spinner /> : <ArrowUpRight className="h-6 w-6" />}
                    {isSubmitting ? "Authorizing Payout..." : "Initiate Secure Payout"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
          <div className="sticky top-32 space-y-6">
            <div className="flex items-center gap-3 text-[#8995a3] mb-6">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Available Funds</span>
            </div>

            <div className="rounded-[2.5rem] bg-linear-to-br from-[#131d2a] to-[#090d14] p-10 shadow-2xl transition-all duration-300 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-[#35d5a4]/10 rounded-full blur-[60px]" />
              
              <div className="space-y-2 mb-10 relative z-10">
                <p className="text-sm font-medium text-[#8995a3]">Current Wallet Balance</p>
                {wallet ? (
                  <h3 className="text-4xl font-black text-white tracking-tight truncate">
                    {formatCurrency(wallet.available_balance)}
                  </h3>
                ) : (
                  <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse" />
                )}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm pb-4 border-b border-white/5">
                  <span className="text-[#8995a3]">Requested Amount</span>
                  <span className="font-bold text-white truncate max-w-37.5 text-right">{form.amount ? formatCurrency(parseFloat(form.amount)) : "0.00"}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-4 border-b border-white/5">
                  <span className="text-[#8995a3]">Network Fee</span>
                  <span className="font-bold text-red-400">Determined by Provider</span>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-2 text-[#68747e] bg-white/5 py-3 rounded-xl border border-white/5">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">Secured by Immutable Ledger</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}