"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { ArrowLeft, Landmark, CheckCircle2, ShieldCheck, Wallet, ArrowUpRight, Search, Building2, ChevronDown, Check } from "@/components/icons";
import Link from "next/link";
import { Spinner, useToast } from "@/components/dashboard/ui";
import type { WalletResponse, WalletResource } from "@/types/api";
import { Banner, Field, btnPrimary, btnSecondary, inputCls } from "@/components/dashboard/kit";

interface Bank {
  name: string;
  code: string;
}

const SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£" };

function StepBadge({ n, done }: { n: number; done?: boolean }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#09090B] text-[12px] font-semibold text-white">
      {done ? <Check className="h-3.5 w-3.5" /> : n}
    </span>
  );
}

export default function CreateWithdrawalPage() {
  const router = useRouter();
  const toast = useToast();

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

  const [form, setForm] = useState({ amount: "", bank_code: "", account_number: "", account_name: "" });

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    api.get<WalletResponse>("/wallet").then((res) => {
      if (!mounted) return;
      const currentWallet = res.data.data;
      setWallet(currentWallet);
      api.get<{ data: Bank[] }>("/withdrawals/banks", { params: { currency: currentWallet.currency } })
        .then((bankRes) => {
          if (!mounted) return;
          const unique = Array.from(new Map(bankRes.data.data.map((b) => [b.code, b])).values());
          setBanks(unique);
          setLoadingBanks(false);
        })
        .catch(() => {
          if (!mounted) return;
          setError("Failed to load supported banks from provider.");
          setLoadingBanks(false);
        });
    }).catch(() => {
      if (!mounted) return;
      setError("Failed to load wallet balance.");
      setLoadingBanks(false);
    });
    return () => { mounted = false; };
  }, []);

  const filteredBanks = useMemo(
    () => banks.filter((b) => b.name.toLowerCase().includes(bankSearch.toLowerCase())),
    [banks, bankSearch]
  );

  const symbol = SYMBOLS[wallet?.currency || "NGN"] || "";
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: wallet?.currency || "NGN" }).format(val || 0);

  const amountNum = form.amount ? parseFloat(form.amount) : 0;
  const overBalance = !!wallet && amountNum > wallet.available_balance;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    const intPart = parts[0];
    if (intPart) {
      const formattedInt = new Intl.NumberFormat("en-US").format(parseInt(intPart, 10));
      val = parts.length > 1 ? `${formattedInt}.${parts[1].slice(0, 2)}` : formattedInt;
    }
    setDisplayAmount(val);
    setForm((prev) => ({ ...prev, amount: val.replace(/,/g, "") }));
  };

  const handleMaxClick = () => {
    if (!wallet) return;
    const val = wallet.available_balance.toString();
    const parts = val.split(".");
    const formattedInt = new Intl.NumberFormat("en-US").format(parseInt(parts[0], 10));
    setDisplayAmount(parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt);
    setForm((prev) => ({ ...prev, amount: val }));
  };

  const handleResolveAccount = async () => {
    if (form.account_number.length < 10 || !form.bank_code) {
      setError("Please select a bank and enter a valid 10-digit account number.");
      return;
    }
    setIsResolving(true);
    setError("");
    try {
      const response = await api.get("/withdrawals/resolve-account", { params: { account_number: form.account_number, bank_code: form.bank_code } });
      setForm((prev) => ({ ...prev, account_name: response.data.data.account_name }));
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

    const reference = `WTH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    try {
      await api.post("/withdrawals", {
        reference,
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

  if (!isMounted) return null;

  return (
    <div className="w-full space-y-6 bg-white pb-10 font-sans text-[#09090B]">
      <div>
        <Link href="/withdrawals" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#71717A] transition-colors hover:text-[#09090B]">
          <ArrowLeft className="h-4 w-4" /> Back to Withdrawals
        </Link>
        <h1 className="mt-4 text-[28px] font-bold tracking-[-0.025em]">Request Payout</h1>
        <p className="mt-1 text-[13px] text-[#71717A]">Withdraw funds to a verified bank account.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* FORM */}
        <div className="space-y-5 lg:col-span-7 xl:col-span-8">
          {error && <Banner tone="danger">{error}</Banner>}

          {/* Step 1 */}
          <section className="rounded-[12px] border border-[var(--pm-line)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--pm-line)] px-6 py-4 sm:px-8">
              <div className="flex items-start gap-3">
                <StepBadge n={1} done={step === 2} />
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight">Destination bank details</h2>
                  <p className="mt-0.5 text-[12px] text-[#71717A]">Choose a bank and verify the account owner.</p>
                </div>
              </div>
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="rounded-[8px] border border-[var(--pm-line)] bg-white px-3 py-1.5 text-[12px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)]">
                  Edit account
                </button>
              )}
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Bank">
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
                    <input
                      type="text"
                      role="combobox"
                      aria-expanded={isBankDropdownOpen}
                      disabled={step === 2 || loadingBanks}
                      placeholder={loadingBanks ? "Loading banks..." : "Search for a bank..."}
                      value={bankSearch}
                      onChange={(e) => { setBankSearch(e.target.value); setForm((p) => ({ ...p, bank_code: "" })); setIsBankDropdownOpen(true); }}
                      onFocus={() => setIsBankDropdownOpen(true)}
                      onBlur={() => setIsBankDropdownOpen(false)}
                      className={`${inputCls} pl-10 pr-9`}
                    />
                    <ChevronDown className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA] transition-transform ${isBankDropdownOpen ? "rotate-180" : ""}`} />

                    {isBankDropdownOpen && (
                      <div className="custom-scrollbar absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-[12px] border border-[var(--pm-line)] bg-white p-1 shadow-[0_16px_40px_-12px_rgba(9,9,11,0.2)] animate-in fade-in slide-in-from-top-1 duration-150">
                        {filteredBanks.length === 0 ? (
                          <p className="px-3 py-4 text-center text-[13px] text-[#71717A]">{loadingBanks ? "Loading..." : `No banks match "${bankSearch}"`}</p>
                        ) : (
                          filteredBanks.map((bank, i) => {
                            const selected = form.bank_code === bank.code;
                            return (
                              <button
                                key={`${bank.code}-${i}`}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { setForm((p) => ({ ...p, bank_code: bank.code })); setBankSearch(bank.name); setIsBankDropdownOpen(false); }}
                                className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-left text-[13px] transition-colors ${selected ? "bg-[var(--pm-active)] font-semibold" : "hover:bg-[var(--pm-band-hover)]"}`}
                              >
                                {bank.name}
                                {selected && <Check className="h-4 w-4" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Account number">
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={step === 2}
                    value={form.account_number}
                    onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="0123456789"
                    className={`${inputCls} font-mono tabular-nums`}
                  />
                </Field>
              </div>

              {step === 1 && (
                <button
                  type="button"
                  onClick={handleResolveAccount}
                  disabled={isResolving || form.account_number.length < 10 || !form.bank_code}
                  className={`${btnSecondary} h-11 w-full`}
                >
                  {isResolving ? <Spinner /> : <Search className="h-4 w-4" />}
                  {isResolving ? "Verifying account..." : "Verify account ownership"}
                </button>
              )}

              {step === 2 && (
                <div className="flex items-center gap-4 rounded-[12px] border border-[#BBF7D0] bg-[#ECFDF5] p-4 animate-in fade-in slide-in-from-bottom-1 duration-300 sm:p-5">
                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#059669] ring-1 ring-[#BBF7D0]"><CheckCircle2 className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#059669]">Verified account holder</p>
                    <p className="mt-0.5 truncate text-[16px] font-bold uppercase tracking-wide text-[#064E3B]">{form.account_name}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="rounded-[12px] border border-[var(--pm-line)] bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-3 border-b border-[var(--pm-line)] px-6 py-4 sm:px-8">
                <StepBadge n={2} />
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight">Withdrawal amount</h2>
                  <p className="mt-0.5 text-[12px] text-[#71717A]">How much would you like to send?</p>
                </div>
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                <Field
                  label="Amount to withdraw"
                  right={wallet && (
                    <button type="button" onClick={handleMaxClick} className="rounded-[6px] border border-[var(--pm-line)] bg-[var(--pm-band)] px-2.5 py-1 text-[12px] font-medium text-[#52525B] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]">
                      Use max · {formatCurrency(wallet.available_balance)}
                    </button>
                  )}
                  hint={overBalance ? undefined : "Network fees are determined by the transfer provider."}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[22px] font-semibold text-[#A1A1AA]">{symbol}</span>
                    <input
                      required
                      inputMode="decimal"
                      type="text"
                      value={displayAmount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className={`h-16 w-full rounded-[12px] border bg-white pl-11 pr-5 text-[28px] font-bold tracking-[-0.02em] tabular-nums text-[#09090B] shadow-[0_1px_2px_rgba(9,9,11,0.04)] outline-none transition-all placeholder:text-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(9,9,11,0.06)] ${overBalance ? "border-[#FCA5A5]" : "border-[var(--pm-line)] hover:border-[#D4D4D8] focus:border-[#D4D4D8]"}`}
                    />
                  </div>
                  {overBalance && <p className="text-[12px] font-medium text-[#DC2626]">This is more than your available balance of {formatCurrency(wallet!.available_balance)}.</p>}
                </Field>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--pm-line)] bg-[var(--pm-band)] px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                <Link href="/withdrawals" className={btnSecondary}>Cancel</Link>
                <button type="submit" disabled={isSubmitting || !form.amount || amountNum <= 0 || overBalance} className={btnPrimary}>
                  {isSubmitting ? <Spinner /> : <ArrowUpRight className="h-4 w-4" />}
                  {isSubmitting ? "Authorizing payout..." : "Initiate secure payout"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* SUMMARY */}
        <aside className="hidden lg:col-span-5 lg:block xl:col-span-4">
          <div className="sticky top-24">
            <div className="mb-3 flex items-center gap-2 text-[#71717A]">
              <Wallet className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">Payout summary</span>
            </div>

            <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#18181B] to-[#09090B] p-7 text-white shadow-[0_16px_40px_-16px_rgba(9,9,11,0.5)]">
              <div className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full bg-white/[0.06] blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px", maskImage: "linear-gradient(to bottom right, black 15%, transparent 70%)", WebkitMaskImage: "linear-gradient(to bottom right, black 15%, transparent 70%)" }} />

              <div className="relative">
                <p className="text-[13px] font-medium text-white/60">Available balance</p>
                {wallet ? (
                  <h3 className="mt-2 truncate text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums">{formatCurrency(wallet.available_balance)}</h3>
                ) : (
                  <div className="pm-skeleton !bg-white/10 mt-2 h-9 w-48 rounded-[8px]" />
                )}

                <div className="mt-8 space-y-3.5 text-[13px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                    <span className="text-white/60">Destination</span>
                    <span className="max-w-[180px] truncate text-right font-medium">{form.account_name || bankSearch || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                    <span className="text-white/60">Requested amount</span>
                    <span className="max-w-[180px] truncate font-semibold tabular-nums">{form.amount ? formatCurrency(amountNum) : formatCurrency(0)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                    <span className="text-white/60">Network fee</span>
                    <span className="text-white/80">Set by provider</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Balance after</span>
                    <span className={`font-semibold tabular-nums ${overBalance ? "text-[#FCA5A5]" : ""}`}>{wallet ? formatCurrency(wallet.available_balance - amountNum) : "—"}</span>
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-center gap-2 rounded-[10px] bg-white/[0.06] py-2.5 text-white/70 ring-1 ring-white/10">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span className="text-[12px] font-medium">Secured by immutable ledger</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}