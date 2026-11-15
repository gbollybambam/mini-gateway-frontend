"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, Clock, Activity, FileText,
  ChevronLeft, ChevronRight, Lock, ChevronDown,
} from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { LedgerEntryResource, LedgerListResponse, WalletResponse, WalletResource } from "@/types/api";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { EmptyBlock, PageHeader, Pill, SectionHead, cardCls } from "@/components/dashboard/kit";
import { AnimatedNumber } from "@/components/dashboard/motion";

const formatAmount = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 2 }).format(value || 0);

const formatDate = (value: string | undefined) =>
  value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "N/A";

interface ExtendedLedgerEntry extends LedgerEntryResource {
  balance_before: number;
  balance_after: number;
  transaction?: { amount: number; fee: number; net_amount: number };
}

type Meta = { current_page: number; last_page: number; total: number };

function LedgerSkeleton() {
  return (
    <div className="flex flex-col">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-[var(--pm-line)] px-7 py-5">
          <div className="pm-skeleton h-4 w-32 rounded-full" />
          <div className="pm-skeleton hidden h-6 w-24 rounded-full sm:block" />
          <div className="pm-skeleton h-4 w-24 rounded-full" />
          <div className="pm-skeleton hidden h-4 w-24 rounded-full lg:block" />
          <div className="pm-skeleton h-6 w-12 rounded-[6px]" />
        </div>
      ))}
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-[13px]">
      <span className="shrink-0 text-[#71717A]">{label}</span>
      <span className="text-right font-medium text-[#09090B]">{children}</span>
    </div>
  );
}

export default function WalletsPage() {
  const [wallet, setWallet] = useState<WalletResource | null>(null);
  const [ledger, setLedger] = useState<ExtendedLedgerEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWalletData = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const [walletRes, ledgerRes] = await Promise.all([
        api.get<WalletResponse>("/wallet"),
        api.get<LedgerListResponse>("/wallet/ledger", { params: { page: currentPage, per_page: 15 } }),
      ]);
      setWallet(walletRes.data.data);
      setLedger(ledgerRes.data.data as ExtendedLedgerEntry[]);
      setMeta((ledgerRes.data as unknown as { meta: Meta }).meta);
      setError("");
    } catch (err: unknown) {
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || err.response?.data?.error || "Unable to load wallet data."
          : "Unable to load wallet data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { void fetchWalletData(page); }, 0);
    return () => clearTimeout(t);
  }, [fetchWalletData, page]);

  const goTo = (p: number) => { setExpandedId(null); setPage(p); };

  if (error) return <ErrorMessage message={error} retry={() => fetchWalletData(page)} />;

  const initialLoad = loading && !wallet;

  return (
    <RoleGuard allowedRoles={["admin", "finance"]}>
      <div className="space-y-6 bg-white pb-10 font-sans text-[#09090B]">
        <PageHeader
          eyebrow="Settlement account"
          title="Wallet & Ledger"
          description="Your balances and an immutable record of every movement."
          action={
            <div className="flex w-fit items-center gap-2 rounded-[8px] border border-[var(--pm-line)] bg-white px-3.5 py-2 text-[13px] shadow-sm">
              <Lock className="h-4 w-4 text-[#71717A]" />
              {initialLoad ? <span className="pm-skeleton inline-block h-3 w-20 rounded" /> : <span className="font-medium">{wallet?.currency} base currency</span>}
            </div>
          }
        />

        {/* Balances */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Hero */}
          <div className="relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[16px] bg-gradient-to-br from-[#18181B] to-[#09090B] p-6 text-white shadow-[0_16px_40px_-16px_rgba(9,9,11,0.5)] sm:p-8 lg:col-span-2">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px", maskImage: "linear-gradient(to bottom right, black 20%, transparent 75%)", WebkitMaskImage: "linear-gradient(to bottom right, black 20%, transparent 75%)" }} />
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/[0.06] blur-3xl" />

            <div className="relative flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-[10px] bg-white/10 ring-1 ring-white/10"><WalletIcon className="h-5 w-5" /></div>
              <p className="text-[13px] font-medium text-white/70">Available balance</p>
            </div>

            <div className="relative mt-8">
              {initialLoad ? (
                <div className="pm-skeleton !bg-white/10 h-12 w-3/4 max-w-xs rounded-[10px]" />
              ) : (
                <p className="truncate text-[40px] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[52px]">
                  <AnimatedNumber value={wallet?.available_balance ?? 0} format={(value) => formatAmount(value, wallet?.currency ?? "NGN")} />
                </p>
              )}
              <p className="mt-3 flex items-center gap-2 text-[13px] text-white/60"><Activity className="h-4 w-4" /> Ready for withdrawal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5 transition-all hover:border-[#D4D4D8] hover:shadow-[0_8px_24px_-12px_rgba(9,9,11,0.12)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-[8px] bg-[#FFFBEB] text-[#B45309]"><Clock className="h-4 w-4" /></div>
                <Pill tone="warning">Processing</Pill>
              </div>
              <p className="text-[13px] font-medium text-[#71717A]">Pending clearance</p>
              {initialLoad ? <div className="pm-skeleton mt-2 h-8 w-1/2 rounded" /> : (
                <p className="mt-1.5 truncate text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums">
                  <AnimatedNumber value={wallet?.pending_balance ?? 0} format={(value) => formatAmount(value, wallet?.currency ?? "NGN")} />
                </p>
              )}
            </div>

            <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-medium text-[#71717A]">System status</p>
                <Pill tone="success">Synced</Pill>
              </div>
              {initialLoad ? (
                <div className="space-y-2"><div className="pm-skeleton h-4 w-full rounded" /><div className="pm-skeleton h-4 w-3/4 rounded" /></div>
              ) : (
                <p className="text-[13px] leading-[1.6] text-[#52525B]">
                  Ledger synchronized. Last activity recorded <span className="font-semibold text-[#09090B]">{formatDate(wallet?.updated_at)}</span>.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Ledger */}
        <section className={`${cardCls} relative overflow-hidden`}>
          {loading && ledger.length > 0 && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[1px]"><Spinner /></div>
          )}
          <SectionHead icon={<FileText className="h-4 w-4" />} title="Master Ledger" subtitle="Immutable record of all wallet movements" right={meta ? <span className="text-[12px] text-[#71717A] tabular-nums">{meta.total} entries</span> : undefined} />

          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
                <tr>
                  {[
                    { h: "Reference", c: "" },
                    { h: "Movement", c: "hidden sm:table-cell" },
                    { h: "Amount", c: "" },
                    { h: "Balance after", c: "hidden lg:table-cell" },
                    { h: "Date", c: "hidden md:table-cell" },
                    { h: "", c: "text-right" },
                  ].map((col, i) => (
                    <th key={i} className={`px-4 py-3.5 text-[12px] font-medium uppercase tracking-wide text-[#71717A] sm:px-7 ${col.c}`}>
                      {col.h || <span className="sr-only">Details</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading && !ledger.length ? (
                  <tr><td colSpan={6}><LedgerSkeleton /></td></tr>
                ) : ledger.length === 0 ? (
                  <tr><td colSpan={6}><EmptyBlock icon={<FileText className="h-6 w-6" />} title="No ledger entries yet" description="When payments are processed or funds are withdrawn, the immutable records will appear here." /></td></tr>
                ) : (
                  ledger.map((entry) => {
                    const isCredit = entry.direction.toLowerCase() === "credit";
                    const isExpanded = expandedId === entry.id;
                    const gross = entry.transaction ? entry.transaction.amount : entry.amount;
                    const fee = entry.transaction ? entry.transaction.fee : 0;
                    const sign = isCredit ? "+" : "−";

                    return (
                      <React.Fragment key={entry.id}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                          aria-expanded={isExpanded}
                          className={`group cursor-pointer border-b border-[var(--pm-line)] transition-colors hover:bg-[var(--pm-band-hover)] ${isExpanded ? "bg-[var(--pm-band)]" : ""}`}
                        >
                          <td className={`px-4 py-4 sm:px-7 sm:py-5 ${isExpanded ? "shadow-[inset_3px_0_0_#09090B]" : ""}`}>
                            <p className="max-w-[180px] truncate font-mono text-[13px] font-medium sm:max-w-xs" title={entry.reference}>{entry.reference}</p>
                            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#A1A1AA] sm:hidden">{entry.type}</p>
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-4 sm:table-cell sm:px-7 sm:py-5">
                            <Pill tone={isCredit ? "success" : "danger"} dot={false}>
                              {isCredit ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                              <span className="capitalize">{String(entry.type).toLowerCase().replace(/_/g, " ")}</span>
                            </Pill>
                          </td>
                          <td className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold tabular-nums sm:px-7 sm:py-5 ${isCredit ? "text-[#059669]" : "text-[#DC2626]"}`}>
                            {sign}{formatAmount(entry.amount, entry.currency)}
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-4 text-[14px] tabular-nums text-[#52525B] sm:px-7 sm:py-5 lg:table-cell">{formatAmount(entry.balance_after, entry.currency)}</td>
                          <td className="hidden whitespace-nowrap px-4 py-4 text-[14px] text-[#52525B] sm:px-7 sm:py-5 md:table-cell">{formatDate(entry.created_at)}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-right sm:px-7 sm:py-5">
                            <span className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[13px] font-medium transition-colors ${isExpanded ? "bg-[#09090B] text-white" : "text-[#52525B] group-hover:bg-[var(--pm-active)] group-hover:text-[#09090B]"}`}>
                              {isExpanded ? "Close" : "View"}
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
                            <td colSpan={6} className="p-0">
                              <div className="animate-in fade-in slide-in-from-top-1 px-4 py-5 duration-200 sm:px-7 sm:py-6">
                                <div className="mb-5 flex flex-col gap-3 rounded-[12px] border border-[var(--pm-line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                  <div>
                                    <p className={`text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums ${isCredit ? "text-[#059669]" : "text-[#DC2626]"}`}>{sign}{formatAmount(entry.amount, entry.currency)}</p>
                                    <p className="mt-1.5 text-[12px] text-[#71717A]">{entry.description || "System automatic entry"}</p>
                                  </div>
                                  <Pill tone={isCredit ? "success" : "danger"}>{isCredit ? "Credit" : "Debit"}</Pill>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                  <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
                                    <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Movement breakdown</h4>
                                    <div className="divide-y divide-[var(--pm-line)]">
                                      <DetailRow label="Gross amount"><span className="tabular-nums">{formatAmount(gross, entry.currency)}</span></DetailRow>
                                      <DetailRow label="Processing fee"><span className="tabular-nums text-[#DC2626]">−{formatAmount(fee, entry.currency)}</span></DetailRow>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between border-t border-[var(--pm-line)] pt-3">
                                      <span className="text-[13px] font-semibold">Net applied to balance</span>
                                      <span className={`text-[16px] font-bold tabular-nums ${isCredit ? "text-[#059669]" : "text-[#DC2626]"}`}>{sign}{formatAmount(entry.amount, entry.currency)}</span>
                                    </div>
                                  </div>

                                  <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
                                    <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Entry metadata</h4>
                                    <div className="divide-y divide-[var(--pm-line)]">
                                      <DetailRow label="Balance before"><span className="tabular-nums text-[#52525B]">{formatAmount(entry.balance_before, entry.currency)}</span></DetailRow>
                                      <DetailRow label="Balance after"><span className="tabular-nums">{formatAmount(entry.balance_after, entry.currency)}</span></DetailRow>
                                      <DetailRow label="Processed at">{formatDate(entry.created_at)}</DetailRow>
                                      <DetailRow label="Reference"><span className="break-all font-mono text-[12px]">{entry.reference}</span></DetailRow>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--pm-line)] bg-white p-4 sm:flex-row sm:px-6">
              <p className="text-[12px] font-medium text-[#71717A]">
                Page <span className="font-bold text-[#09090B]">{meta.current_page}</span> of <span className="font-bold text-[#09090B]">{meta.last_page}</span>
              </p>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button type="button" disabled={meta.current_page === 1} onClick={() => goTo(Math.max(1, page - 1))} className="flex flex-1 items-center justify-center gap-1 rounded-[8px] border border-[var(--pm-line)] bg-white px-3.5 py-1.5 text-[12px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button type="button" disabled={meta.current_page === meta.last_page} onClick={() => goTo(page + 1)} className="flex flex-1 items-center justify-center gap-1 rounded-[8px] border border-[var(--pm-line)] bg-white px-3.5 py-1.5 text-[12px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">
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