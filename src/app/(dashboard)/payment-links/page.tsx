"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { Plus, Link as LinkIcon, Copy, Check, ExternalLink, Power, PowerOff, ChevronDown, Search } from "@/components/icons";
import { useToast } from "@/components/dashboard/ui";
import { AnimatedNumber } from "@/components/dashboard/motion";

interface PaymentLink {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  description: string;
  checkout_url: string;
  status: string;
  created_at: string;
  customer_information?: { email: string } | null;
  expiry?: string | null;
  payment?: { customer_email: string; amount: number; created_at: string } | null;
}

const TABS = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Deactivated", value: "DEACTIVATED" },
];

const STATUS_STYLES: Record<string, { cls: string; dot: string }> = {
  ACTIVE: { cls: "bg-[#ECFDF5] border-[#BBF7D0] text-[#059669]", dot: "bg-[#10B981]" },
  COMPLETED: { cls: "bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]", dot: "bg-[#3B82F6]" },
  EXPIRED: { cls: "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]", dot: "bg-[#F59E0B]" },
  DEACTIVATED: { cls: "bg-[var(--pm-band)] border-[#E4E4E7] text-[#52525B]", dot: "bg-[#A1A1AA]" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status.toUpperCase()] ?? STATUS_STYLES.DEACTIVATED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium capitalize ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {status.toLowerCase()}
    </span>
  );
}

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN" }).format(amount || 0);

const formatCount = (value: number) => new Intl.NumberFormat("en-NG").format(Math.round(value));

const formatDate = (v: string | null | undefined) =>
  v ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(v)) : "—";

function LinksSkeleton() {
  return (
    <div className="flex flex-col">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-[var(--pm-line)] px-7 py-5">
          <div className="space-y-2">
            <div className="pm-skeleton h-4 w-40 rounded-full" />
            <div className="pm-skeleton h-3 w-24 rounded-full" />
          </div>
          <div className="pm-skeleton hidden h-4 w-24 rounded-full sm:block" />
          <div className="pm-skeleton hidden h-6 w-20 rounded-full md:block" />
          <div className="pm-skeleton h-6 w-12 rounded-[6px]" />
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5 transition-all hover:border-[#D4D4D8] hover:shadow-[0_8px_24px_-12px_rgba(9,9,11,0.12)]">
      <p className="text-[13px] font-medium text-[#71717A]">{label}</p>
      <p className="mt-1.5 text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums">
        <AnimatedNumber value={value} format={formatCount} />
      </p>
      <p className="mt-3 text-[12px] text-[#A1A1AA]">{hint}</p>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-[13px]">
      <span className="shrink-0 text-[#71717A]">{label}</span>
      <span className="break-all text-right font-medium text-[#09090B]">{children}</span>
    </div>
  );
}

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState("");
  const [query, setQuery] = useState("");
  const isPollingRef = useRef(false);

  const toast = useToast();

  const fetchLinks = useCallback(async (silent = false) => {
    try {
      const response = await api.get<{ data: PaymentLink[] }>("/payment-links");
      setLinks(response.data.data);
      if (!silent) setError("");
    } catch (err) {
      if (!silent) setError(isAxiosError(err) ? err.response?.data?.message || "Failed to load" : "Error loading links");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => { void fetchLinks(false); }, 0);
    return () => window.clearTimeout(t);
  }, [fetchLinks]);

  const hasActive = useMemo(() => links.some((l) => l.status.toUpperCase() === "ACTIVE"), [links]);

  useEffect(() => {
    if (!hasActive) return;
    const id = window.setInterval(() => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      fetchLinks(true).finally(() => { isPollingRef.current = false; });
    }, 5000);
    return () => window.clearInterval(id);
  }, [hasActive, fetchLinks]);

  const handleCopy = async (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("Checkout link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Couldn't copy. Please copy the link manually.");
    }
  };

  const toggleStatus = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    try {
      await api.patch(`/payment-links/${id}`, { status: newStatus });
      setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      toast.success(`Link has been successfully ${newStatus.toLowerCase()}.`);
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || "Status update failed" : "System Error");
    }
  };

  const counts = useMemo(() => {
    const c = { total: links.length, ACTIVE: 0, COMPLETED: 0, other: 0 };
    links.forEach((l) => {
      const s = l.status.toUpperCase();
      if (s === "ACTIVE") c.ACTIVE++;
      else if (s === "COMPLETED") c.COMPLETED++;
      else c.other++;
    });
    return c;
  }, [links]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return links.filter((l) => {
      if (tab && l.status.toUpperCase() !== tab) return false;
      if (!q) return true;
      return l.description?.toLowerCase().includes(q) || l.reference?.toLowerCase().includes(q);
    });
  }, [links, tab, query]);

  return (
    <div className="space-y-6 bg-white pb-10 font-sans text-[#09090B]">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.025em]">Payment Links</h1>
          <p className="mt-1 text-[13px] text-[#71717A]">Generate reusable checkout pages to collect payments.</p>
        </div>
        <Link
          href="/payment-links/create"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-[8px] bg-gradient-to-b from-[#27272A] to-[#09090B] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm ring-1 ring-black/10 transition-all hover:brightness-125"
        >
          <Plus className="h-4 w-4" /> Create Link
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Links" value={counts.total} hint="All links created" />
        <StatCard label="Active" value={counts.ACTIVE} hint="Ready to accept payment" />
        <StatCard label="Completed" value={counts.COMPLETED} hint="Successfully paid" />
        <StatCard label="Inactive" value={counts.other} hint="Expired or deactivated" />
      </div>

      {/* Filters */}
      <section className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)] p-0.5" role="tablist" aria-label="Filter by status">
          {TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => { setTab(t.value); setExpandedId(null); }}
              className={`whitespace-nowrap rounded-[8px] px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                tab === t.value ? "border border-[var(--pm-line)] bg-[var(--pm-raised)] text-[var(--pm-ink)] shadow-sm" : "border border-transparent text-[#71717A] hover:text-[var(--pm-ink)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="flex h-10 w-full items-center gap-2.5 rounded-[10px] border border-[var(--pm-line)] bg-white px-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-all focus-within:border-[#D4D4D8] focus-within:shadow-[0_0_0_3px_rgba(9,9,11,0.06)] hover:border-[#D4D4D8] lg:max-w-sm">
          <Search className="h-4 w-4 shrink-0 text-[#71717A]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by description or reference..."
            className="h-full w-full bg-transparent text-[13px] outline-none placeholder:text-[#A1A1AA]"
          />
        </label>
      </section>

      {error ? (
        <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] p-6 text-center text-[13px] font-medium text-[#DC2626]">{error}</div>
      ) : (
        <section className="overflow-hidden rounded-[12px] border border-[var(--pm-line)] bg-white shadow-sm">
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
                <tr>
                  {[
                    { h: "Details", c: "" },
                    { h: "Amount", c: "hidden sm:table-cell" },
                    { h: "Status", c: "hidden md:table-cell" },
                    { h: "Created", c: "hidden lg:table-cell" },
                    { h: "", c: "text-right" },
                  ].map((col, i) => (
                    <th key={i} className={`px-4 py-3.5 text-[12px] font-medium uppercase tracking-wide text-[#71717A] sm:px-7 ${col.c}`}>
                      {col.h || <span className="sr-only">Actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr><td colSpan={5}><LinksSkeleton /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[12px] border border-[var(--pm-line)] bg-[var(--pm-band)]">
                          <LinkIcon className="h-6 w-6 text-[#A1A1AA]" />
                        </div>
                        <h3 className="text-[15px] font-bold">{links.length ? "No links match your filters" : "No payment links yet"}</h3>
                        <p className="mt-2 max-w-sm text-[13px] leading-[1.6] text-[#71717A]">
                          {links.length
                            ? "Try a different status or search term."
                            : "Create your first hosted checkout link to start accepting payments without writing any code."}
                        </p>
                        {!links.length && (
                          <Link href="/payment-links/create" className="mt-5 inline-flex items-center gap-2 rounded-[8px] border border-[var(--pm-line)] bg-white px-4 py-2 text-[13px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)]">
                            <Plus className="h-4 w-4" /> Create your first link
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((link) => {
                    const status = link.status.toUpperCase();
                    const isActive = status === "ACTIVE";
                    const isCompleted = status === "COMPLETED";
                    const isExpired = status === "EXPIRED";
                    const dim = status === "DEACTIVATED" || isExpired;
                    const isExpanded = expandedId === link.id;
                    const payer = link.payment?.customer_email || link.customer_information?.email;

                    return (
                      <React.Fragment key={link.id}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : link.id)}
                          aria-expanded={isExpanded}
                          className={`group cursor-pointer border-b border-[var(--pm-line)] transition-colors hover:bg-[var(--pm-band-hover)] ${isExpanded ? "bg-[var(--pm-band)]" : ""}`}
                        >
                          <td className={`px-4 py-4 sm:px-7 sm:py-5 ${isExpanded ? "shadow-[inset_3px_0_0_#09090B]" : ""}`}>
                            <p className={`max-w-[220px] truncate text-[14px] font-semibold sm:max-w-[320px] ${dim ? "text-[#71717A]" : ""}`}>{link.description}</p>
                            <p className="mt-0.5 font-mono text-[12px] text-[#A1A1AA]">{link.reference}</p>
                            <div className="mt-2 flex items-center gap-2 sm:hidden">
                              <span className="text-[12px] font-semibold tabular-nums">{formatAmount(link.amount, link.currency)}</span>
                              <StatusBadge status={link.status} />
                            </div>
                          </td>
                          <td className={`hidden whitespace-nowrap px-4 py-4 text-[14px] font-semibold tabular-nums sm:table-cell sm:px-7 sm:py-5 ${dim ? "text-[#71717A]" : ""}`}>
                            {formatAmount(link.amount, link.currency)}
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-4 sm:px-7 sm:py-5 md:table-cell"><StatusBadge status={link.status} /></td>
                          <td className="hidden whitespace-nowrap px-4 py-4 text-[14px] text-[#52525B] sm:px-7 sm:py-5 lg:table-cell">{formatDate(link.created_at)}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-right sm:px-7 sm:py-5">
                            <span className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                              isExpanded ? "bg-[#09090B] text-white" : "text-[#52525B] group-hover:bg-[var(--pm-band-hover)] group-hover:text-[#09090B]"
                            }`}>
                              {isExpanded ? "Close" : "View"}
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
                            <td colSpan={5} className="p-0">
                              <div className="animate-in fade-in slide-in-from-top-1 px-4 py-5 duration-200 sm:px-7 sm:py-6" onClick={(e) => e.stopPropagation()}>
                                {/* Summary strip */}
                                <div className="mb-5 flex flex-col gap-4 rounded-[12px] border border-[var(--pm-line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                  <div>
                                    <p className="text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums">{formatAmount(link.amount, link.currency)}</p>
                                    <p className="mt-1.5 text-[12px] text-[#71717A]">{link.description}</p>
                                  </div>
                                  <StatusBadge status={link.status} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                  {/* Link */}
                                  <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
                                    <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Hosted URL</h4>
                                    <a
                                      href={link.checkout_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block break-all rounded-[8px] border border-[var(--pm-line)] bg-[var(--pm-band)] px-3 py-2.5 font-mono text-[12px] text-[#09090B] transition-colors hover:border-[#D4D4D8]"
                                    >
                                      {link.checkout_url}
                                    </a>
                                    <div className="mt-3 divide-y divide-[var(--pm-line)]">
                                      <DetailRow label="Reference"><span className="font-mono text-[12px]">{link.reference}</span></DetailRow>
                                      <DetailRow label="Currency">{link.currency}</DetailRow>
                                    </div>
                                  </div>

                                  {/* Customer & timeline */}
                                  <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
                                    <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">{isCompleted ? "Payer & Timeline" : "Customer & Timeline"}</h4>
                                    <div className="divide-y divide-[var(--pm-line)]">
                                      <DetailRow label={isCompleted ? "Paid by" : "Designated"}>
                                        {isCompleted ? payer || "Anonymous payer" : link.customer_information?.email || "Open to anyone"}
                                      </DetailRow>
                                      <DetailRow label="Created">{formatDate(link.created_at)}</DetailRow>
                                      <DetailRow label="Expires">{formatDate(link.expiry)}</DetailRow>
                                      {isCompleted && <DetailRow label="Paid on">{formatDate(link.payment?.created_at)}</DetailRow>}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col gap-2.5 rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
                                    <h4 className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Actions</h4>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(e, link.id, link.checkout_url)}
                                      disabled={!isActive}
                                      className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-[var(--pm-line)] bg-white px-4 text-[13px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {copiedId === link.id ? <Check className="h-4 w-4 text-[#059669]" /> : <Copy className="h-4 w-4" />}
                                      {copiedId === link.id ? "Copied" : "Copy checkout link"}
                                    </button>
                                    <a
                                      href={link.checkout_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-disabled={!isActive}
                                      className={`flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-[var(--pm-line)] bg-white px-4 text-[13px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)] ${!isActive ? "pointer-events-none opacity-50" : ""}`}
                                    >
                                      <ExternalLink className="h-4 w-4" /> Open payment page
                                    </a>
                                    {!isCompleted && !isExpired && (
                                      <button
                                        type="button"
                                        onClick={(e) => toggleStatus(e, link.id, link.status)}
                                        className={`flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border px-4 text-[13px] font-medium transition-colors ${
                                          isActive
                                            ? "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
                                            : "border-[#BBF7D0] bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"
                                        }`}
                                      >
                                        {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                        {isActive ? "Deactivate link" : "Reactivate link"}
                                      </button>
                                    )}
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
        </section>
      )}
    </div>
  );
}