"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Landmark, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, AlertCircle, Building2, User,
  ChevronDown, Plus,
} from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { WithdrawalListResponse, WithdrawalResource, WalletResponse, WalletResource } from "@/types/api";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";
import VerifyWithdrawalButton from "@/components/VerifyWithdrawalButton";
import { Banner, EmptyBlock, PageHeader, Pill, SectionHead, btnPrimary, cardCls, type Tone } from "@/components/dashboard/kit";
import { AnimatedNumber } from "@/components/dashboard/motion";

const formatAmount = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 2 }).format(value || 0);

const formatCount = (value: number) => new Intl.NumberFormat("en-NG").format(Math.round(value));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

interface ExtendedWithdrawal extends WithdrawalResource {
  bank_account?: { bank_code: string; account_number: string; account_name: string };
  failure_reason?: string;
}

type Meta = { current_page: number; last_page: number; total: number };

const PENDING = ["PENDING", "PROCESSING", "REQUESTED"];
const SUCCESS = ["SUCCESS", "SUCCESSFUL"];
const FAILED = ["FAILED", "REVERSED", "CANCELLED"];

function statusInfo(status: string): { tone: Tone; kind: "success" | "pending" | "failed"; icon: React.ReactNode } {
  const s = status.toUpperCase();
  if (SUCCESS.includes(s)) return { tone: "success", kind: "success", icon: <CheckCircle2 className="h-3 w-3" /> };
  if (PENDING.includes(s)) return { tone: "warning", kind: "pending", icon: <Clock className="h-3 w-3" /> };
  return { tone: "danger", kind: "failed", icon: <XCircle className="h-3 w-3" /> };
}

function WithdrawalSkeleton() {
  return (
    <div className="flex flex-col">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-[var(--pm-line)] px-7 py-5">
          <div className="pm-skeleton h-4 w-32 rounded-full" />
          <div className="pm-skeleton hidden h-4 w-24 rounded-full sm:block" />
          <div className="pm-skeleton hidden h-4 w-16 rounded-full md:block" />
          <div className="pm-skeleton h-6 w-24 rounded-full" />
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

export default function WithdrawalsPage() {
  const [wallet, setWallet] = useState<WalletResource | null>(null);
  const [items, setItems] = useState<ExtendedWithdrawal[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isPollingRef = useRef(false);

  const loadData = useCallback(async (currentPage: number, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [walletRes, withdrawalsRes] = await Promise.all([
        api.get<WalletResponse>("/wallet"),
        api.get<WithdrawalListResponse>("/withdrawals", { params: { page: currentPage, per_page: 15 } }),
      ]);
      setWallet(walletRes.data.data);
      setItems(withdrawalsRes.data.data as ExtendedWithdrawal[]);
      setMeta((withdrawalsRes.data as unknown as { meta: Meta }).meta);
      if (!silent) setError("");
    } catch (err: unknown) {
      if (!silent) setError(isAxiosError(err) ? err.response?.data?.message || "Unable to load payouts." : "Unable to load payouts.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { void loadData(page); }, 0);
    return () => clearTimeout(t);
  }, [loadData, page]);

  const hasPending = useMemo(() => items.some((i) => PENDING.includes(i.status.toUpperCase())), [items]);

  useEffect(() => {
    if (!hasPending) return;
    const id = window.setInterval(() => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      loadData(page, true).finally(() => { isPollingRef.current = false; });
    }, 5000);
    return () => window.clearInterval(id);
  }, [hasPending, loadData, page]);

  const counts = useMemo(() => {
    const c = { pending: 0, success: 0, failed: 0 };
    items.forEach((i) => { c[statusInfo(i.status).kind]++; });
    return c;
  }, [items]);

  const goTo = (p: number) => { setExpandedId(null); setPage(p); };

  if (error) return <ErrorMessage message={error} retry={() => { void loadData(page); }} />;

  const initialLoad = loading && !wallet;

  return (
    <div className="space-y-6 bg-white pb-10 font-sans text-[#09090B]">
      <PageHeader
        eyebrow="Payouts"
        title="Withdrawals"
        description="Move settled funds to your bank account and track every transfer."
        action={
          <Link href="/withdrawals/create" aria-disabled={initialLoad} className={`${btnPrimary} w-fit ${initialLoad ? "pointer-events-none opacity-50" : ""}`}>
            <Plus className="h-4 w-4" /> Request Payout
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="col-span-2 rounded-[12px] border border-[var(--pm-line)] bg-white p-5 transition-all hover:border-[#D4D4D8] hover:shadow-[0_8px_24px_-12px_rgba(9,9,11,0.12)] lg:col-span-1">
          <p className="text-[13px] font-medium text-[#71717A]">Available to withdraw</p>
          {initialLoad ? <div className="pm-skeleton mt-2 h-7 w-32 rounded" /> : (
            <p className="mt-1.5 truncate text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums">
              <AnimatedNumber value={wallet?.available_balance ?? 0} format={(value) => formatAmount(value, wallet?.currency ?? "NGN")} />
            </p>
          )}
          <p className="mt-3 text-[12px] text-[#A1A1AA]">Ready for payout</p>
        </div>
        {[
          { label: "Processing", value: counts.pending, hint: "On this page" },
          { label: "Completed", value: counts.success, hint: "On this page" },
          { label: "Failed", value: counts.failed, hint: "Reversed to wallet" },
        ].map((s) => (
          <div key={s.label} className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5 transition-all hover:border-[#D4D4D8] hover:shadow-[0_8px_24px_-12px_rgba(9,9,11,0.12)]">
            <p className="text-[13px] font-medium text-[#71717A]">{s.label}</p>
            <p className="mt-1.5 text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums">
              <AnimatedNumber value={s.value} format={formatCount} />
            </p>
            <p className="mt-3 text-[12px] text-[#A1A1AA]">{s.hint}</p>
          </div>
        ))}
      </div>

      <section className={`${cardCls} relative overflow-hidden`}>
        {loading && items.length > 0 && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[1px]"><Spinner /></div>
        )}
        <SectionHead
          icon={<Landmark className="h-4 w-4" />}
          title="Transfer History"
          subtitle="Track bank payouts and settlements"
          right={
            <div className="flex items-center gap-3">
              {hasPending && (
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#B45309]">
                  <span className="pm-dot-pulse size-2 rounded-full bg-[#F59E0B]" aria-hidden="true" />
                  Live
                </span>
              )}
              {meta && <span className="text-[12px] text-[#71717A] tabular-nums">{meta.total} transfers</span>}
            </div>
          }
        />

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
              <tr>
                {[
                  { h: "Reference", c: "" },
                  { h: "Amount", c: "hidden sm:table-cell" },
                  { h: "Fee", c: "hidden md:table-cell" },
                  { h: "Status", c: "" },
                  { h: "Date", c: "hidden lg:table-cell" },
                  { h: "", c: "text-right" },
                ].map((col, i) => (
                  <th key={i} className={`px-4 py-3.5 text-[12px] font-medium uppercase tracking-wide text-[#71717A] sm:px-7 ${col.c}`}>
                    {col.h || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading && !items.length ? (
                <tr><td colSpan={6}><WithdrawalSkeleton /></td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyBlock
                      icon={<Landmark className="h-6 w-6" />}
                      title="No withdrawals yet"
                      description="When you request a transfer to your bank account, it will appear here."
                      action={<Link href="/withdrawals/create" className={btnPrimary}><Plus className="h-4 w-4" /> Request your first payout</Link>}
                    />
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const info = statusInfo(item.status);
                  const isPending = info.kind === "pending";
                  const isFailed = info.kind === "failed";
                  const isExpanded = expandedId === item.id;
                  const net = (item.amount || 0) - (item.fee || 0);

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        aria-expanded={isExpanded}
                        className={`group cursor-pointer border-b border-[var(--pm-line)] transition-colors hover:bg-[var(--pm-band-hover)] ${isExpanded ? "bg-[var(--pm-band)]" : ""}`}
                      >
                        <td className={`px-4 py-4 sm:px-7 sm:py-5 ${isExpanded ? "shadow-[inset_3px_0_0_#09090B]" : ""}`}>
                          <p className="max-w-[180px] truncate font-mono text-[13px] font-medium sm:max-w-xs" title={item.reference}>{item.reference}</p>
                          <p className="mt-1 text-[12px] font-semibold tabular-nums text-[#52525B] sm:hidden">{formatAmount(item.amount, item.currency)}</p>
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-4 text-[14px] font-semibold tabular-nums sm:table-cell sm:px-7 sm:py-5">{formatAmount(item.amount, item.currency)}</td>
                        <td className="hidden whitespace-nowrap px-4 py-4 text-[14px] tabular-nums text-[#DC2626] sm:px-7 sm:py-5 md:table-cell">−{formatAmount(item.fee, item.currency)}</td>
                        <td className="whitespace-nowrap px-4 py-4 sm:px-7 sm:py-5">
                          <Pill tone={info.tone} dot={false}>{info.icon}<span className="capitalize">{item.status.toLowerCase()}</span></Pill>
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-4 text-[14px] text-[#52525B] sm:px-7 sm:py-5 lg:table-cell">{formatDate(item.created_at)}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-right sm:px-7 sm:py-5">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <VerifyWithdrawalButton id={item.id} onVerified={() => loadData(page, true)} />
                              </div>
                            )}
                            <span className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[13px] font-medium transition-colors ${isExpanded ? "bg-[#09090B] text-white" : "text-[#52525B] group-hover:bg-[var(--pm-active)] group-hover:text-[#09090B]"}`}>
                              {isExpanded ? "Close" : "View"}
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </span>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
                          <td colSpan={6} className="p-0">
                            <div className="animate-in fade-in slide-in-from-top-1 px-4 py-5 duration-200 sm:px-7 sm:py-6" onClick={(e) => e.stopPropagation()}>
                              <div className="mb-5 flex flex-col gap-3 rounded-[12px] border border-[var(--pm-line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                <div>
                                  <p className="text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums">{formatAmount(item.amount, item.currency)}</p>
                                  <p className="mt-1.5 text-[12px] text-[#71717A]">Requested {formatDate(item.created_at)}</p>
                                </div>
                                <Pill tone={info.tone}><span className="capitalize">{item.status.toLowerCase()}</span></Pill>
                              </div>

                              {isFailed && (
                                <div className="mb-5">
                                  <Banner tone="danger" title="Transfer failed">
                                    {item.failure_reason || "Bank network rejected the transfer."} Funds have been automatically reversed to your wallet.
                                  </Banner>
                                </div>
                              )}

                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
                                  <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Destination</h4>
                                  <div className="mb-3 flex items-center gap-3 rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)] p-3.5">
                                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#52525B] ring-1 ring-[var(--pm-line)]"><User className="h-4 w-4" /></div>
                                    <div className="min-w-0">
                                      <p className="text-[11px] text-[#71717A]">Account name</p>
                                      <p className="truncate text-[13px] font-semibold uppercase">{item.bank_account?.account_name || "N/A"}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)] p-3.5">
                                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#52525B] ring-1 ring-[var(--pm-line)]"><Building2 className="h-4 w-4" /></div>
                                    <div className="min-w-0">
                                      <p className="font-mono text-[13px] font-semibold">{item.bank_account?.account_number || "N/A"}</p>
                                      <p className="text-[11px] text-[#71717A]">Bank code: {item.bank_account?.bank_code || "N/A"}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
                                  <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Financial breakdown</h4>
                                  <div className="divide-y divide-[var(--pm-line)]">
                                    <DetailRow label="Gross withdrawal"><span className="tabular-nums">{formatAmount(item.amount, item.currency)}</span></DetailRow>
                                    <DetailRow label="Network fee"><span className="tabular-nums text-[#DC2626]">−{formatAmount(item.fee, item.currency)}</span></DetailRow>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between border-t border-[var(--pm-line)] pt-3">
                                    <span className="text-[13px] font-semibold">Expected credit</span>
                                    <span className="text-[16px] font-bold tabular-nums">{formatAmount(net, item.currency)}</span>
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
  );
}