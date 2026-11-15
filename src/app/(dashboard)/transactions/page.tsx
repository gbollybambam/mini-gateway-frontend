"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Wallet, Receipt, ChevronLeft, ChevronRight, FilterX, ChevronDown,
} from "@/components/icons";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { TransactionResource } from "@/types/api";
import VerifyPaymentButton from "@/components/VerifyPaymentButton";
import { ErrorMessage } from "@/components/dashboard/ui";

/* ---------- helpers ---------- */
const SUCCESS = ["success", "successful", "complete", "completed", "paid", "settled"];
const FAILED = ["failed", "declined", "error", "reversed"];
const PENDING = ["pending", "processing", "initiated", "initialized"];
const norm = (s?: string | null) => (s || "pending").toLowerCase();

const formatAmount = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 2 }).format(value || 0);

const formatDate = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";

const formatFullDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value))
    : "—";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Success", value: "SUCCESS" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
];

const statusConfig = (status?: string | null) => {
  const s = norm(status);
  if (FAILED.includes(s)) return { cls: "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]", dot: "bg-[#EF4444]", ring: "bg-[#EF4444]", label: "failed" as const };
  if (SUCCESS.includes(s)) return { cls: "bg-[#ECFDF5] border-[#BBF7D0] text-[#059669]", dot: "bg-[#10B981]", ring: "bg-[#10B981]", label: "success" as const };
  if (PENDING.includes(s)) return { cls: "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]", dot: "bg-[#F59E0B]", ring: "bg-[#F59E0B]", label: "pending" as const };
  return { cls: "bg-[var(--pm-band)] border-[#E4E4E7] text-[#52525B]", dot: "bg-[#A1A1AA]", ring: "bg-[#A1A1AA]", label: "other" as const };
};

function StatusBadge({ status }: { status?: string | null }) {
  const c = statusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium capitalize ${c.cls}`}>
      <span className={`size-1.5 rounded-full ${c.dot}`} />
      {status ? status.toLowerCase() : "pending"}
    </span>
  );
}

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function CopyField({ label, value }: { label: string; value?: string | null }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <div>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#A1A1AA]">{label}</span>
      <div className="flex items-center justify-between gap-2 rounded-[8px] border border-[var(--pm-line)] bg-white px-3 py-2">
        <span className="min-w-0 break-all font-mono text-[12px] text-[#09090B]">{value || "N/A"}</span>
        {value && (
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${label}`}
            className={`inline-flex size-6 shrink-0 items-center justify-center rounded-[6px] transition-colors ${
              copied ? "bg-[#ECFDF5] text-[#059669]" : "text-[#71717A] hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]"
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        )}
      </div>
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

function LedgerSkeleton() {
  return (
    <div className="flex w-full flex-col">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-[var(--pm-line)] px-7 py-5">
          <div className="pm-skeleton h-4 w-28 rounded-full" />
          <div className="pm-skeleton hidden h-4 w-36 rounded-full md:block" />
          <div className="pm-skeleton h-4 w-20 rounded-full" />
          <div className="pm-skeleton hidden h-6 w-20 rounded-full sm:block" />
          <div className="pm-skeleton hidden h-4 w-24 rounded-full lg:block" />
          <div className="pm-skeleton h-6 w-12 rounded-[6px]" />
        </div>
      ))}
    </div>
  );
}

/* ---------- expanded panel ---------- */
function TransactionDetails({ item, onVerified }: { item: TransactionResource; onVerified: () => void }) {
  const cfg = statusConfig(item.status);
  const gross = Number(item.amount) || 0;
  const fee = Number(item.fee) || 0;
  const net = Number(item.net_amount ?? gross - fee);
  const feePct = gross > 0 ? Math.min(100, (fee / gross) * 100) : 0;
  const isPending = cfg.label === "pending";
  const providerRef = (item as TransactionResource & { provider_reference?: string }).provider_reference;

  return (
    <div className="animate-in fade-in slide-in-from-top-1 px-4 py-5 duration-200 sm:px-7 sm:py-6" onClick={(e) => e.stopPropagation()}>
      {/* Summary strip */}
      <div className="mb-5 flex flex-col gap-4 rounded-[12px] border border-[var(--pm-line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-4">
          <div className="relative grid size-11 shrink-0 place-items-center rounded-full bg-[var(--pm-band)]">
            <span className={`size-3 rounded-full ${cfg.ring}`} />
            {isPending && <span className={`pm-dot-pulse absolute size-3 rounded-full opacity-60 ${cfg.ring}`} />}
          </div>
          <div>
            <p className="text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums">{formatAmount(gross, item.currency)}</p>
            <p className="mt-1.5 text-[12px] text-[#71717A]">{formatFullDate(item.created_at)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={item.status} />
          {isPending && <VerifyPaymentButton transactionId={item.id} onVerified={onVerified} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Settlement */}
        <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
          <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Settlement</h4>
          <div className="divide-y divide-[var(--pm-line)]">
            <DetailRow label="Gross amount"><span className="tabular-nums">{formatAmount(gross, item.currency)}</span></DetailRow>
            <DetailRow label="Processing fee"><span className="tabular-nums text-[#DC2626]">−{formatAmount(fee, item.currency)}</span></DetailRow>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-[var(--pm-line)] pt-3">
            <span className="text-[13px] font-semibold">Net expected</span>
            <span className="text-[16px] font-bold tabular-nums">{formatAmount(net, item.currency)}</span>
          </div>
          <div className="mt-4">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--pm-band)]">
              <div className="h-full rounded-full bg-[#09090B]" style={{ width: `${100 - feePct}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-[#A1A1AA]">
              <span>You keep {(100 - feePct).toFixed(1)}%</span>
              <span>Fee {feePct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Customer & payment */}
        <div className="rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
          <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Customer & Payment</h4>
          <div className="divide-y divide-[var(--pm-line)]">
            <DetailRow label="Customer"><span className="break-all">{item.customer_email || "Anonymous"}</span></DetailRow>
            <DetailRow label="Method"><span className="capitalize">{(item.payment_method || "N/A").replace(/_/g, " ")}</span></DetailRow>
            <DetailRow label="Currency">{item.currency || "NGN"}</DetailRow>
            <DetailRow label="Created">{formatDate(item.created_at)}</DetailRow>
          </div>
        </div>

        {/* Identifiers */}
        <div className="space-y-3 rounded-[12px] border border-[var(--pm-line)] bg-white p-5">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A1A1AA]">Identifiers</h4>
          <CopyField label="Reference" value={item.reference} />
          <CopyField label="Provider reference" value={providerRef} />
          <CopyField label="Transaction ID" value={String(item.id)} />
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function TransactionsPage() {
  const [items, setItems] = useState<TransactionResource[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("created_at:desc");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const isPollingRef = useRef(false);

  // Debounce search typing
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch((prev) => {
        if (prev !== searchInput) setPage(1);
        return searchInput;
      });
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); setError(""); }
    try {
      const [sortBy, sortDir] = sort.split(":");
      const response = await api.get("/transactions", {
        params: {
          search: search || null,
          status: status || null,
          start_date: dateFrom || null,
          end_date: dateTo || null,
          sort_by: sortBy,
          sort_dir: sortDir,
          per_page: 15,
          page,
        },
      });
      setItems(response.data.data);
      setMeta(response.data.meta);
    } catch (err: unknown) {
      if (!silent) setError(isAxiosError(err) ? err.response?.data?.message || "Unable to load transactions." : "System Error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search, status, dateFrom, dateTo, sort, page]);

  const load = useCallback(() => fetchData(false), [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchData(false); }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const hasPending = useMemo(
    () => items.some((i) => ["PENDING", "PROCESSING", "INITIALIZED"].includes(String(i.status).toUpperCase())),
    [items]
  );

  // Silent polling while something is pending
  useEffect(() => {
    if (!hasPending) return;
    const id = setInterval(() => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      fetchData(true).finally(() => { isPollingRef.current = false; });
    }, 5000);
    return () => clearInterval(id);
  }, [hasPending, fetchData]);

  const resetFilters = () => {
    setSearchInput(""); setSearch(""); setStatus(""); setDateFrom(""); setDateTo("");
    setSort("created_at:desc"); setPage(1); setExpandedTxId(null);
  };

  const onFilter = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value); setPage(1); setExpandedTxId(null);
    };

  const toggleRow = (id: string) => setExpandedTxId((prev) => (prev === id ? null : id));
  const filtersActive = !!(searchInput || status || dateFrom || dateTo || sort !== "created_at:desc");

  const selectChevron = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundPosition: "right 12px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px",
  } as const;
  const inputCls =
    "h-10 w-full rounded-[8px] border border-[var(--pm-line)] bg-white px-3 text-[13px] font-medium text-[#52525B] shadow-sm outline-none transition-all focus:border-[#D4D4D8] focus:ring-2 focus:ring-[#09090B]/10";

  return (
    <div className="space-y-6 bg-white pb-10 font-sans text-[#09090B]">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.025em]">Transactions</h1>
          <p className="mt-1 text-[13px] text-[#71717A]">View and manage your payment ledger.</p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-[8px] border border-[var(--pm-line)] bg-white px-3.5 py-2 text-[13px] text-[#52525B] shadow-sm">
          <Wallet className="h-4 w-4 text-[#71717A]" />
          <span className="font-medium text-[#09090B] tabular-nums">{meta?.total ?? 0} records</span>
          {hasPending && (
            <span className="ml-1 inline-flex items-center gap-1.5 border-l border-[var(--pm-line)] pl-3 text-[12px] text-[#B45309]">
              <span className="pm-dot-pulse size-2 rounded-full bg-[#F59E0B]" />
              Live
            </span>
          )}
        </div>
      </header>

      {/* Filters */}
      <section className="space-y-3">
        <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          {/* Status tabs */}
          <div className="inline-flex w-fit items-center gap-0.5 rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)] p-0.5" role="tablist" aria-label="Filter by status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                onClick={() => { setStatus(tab.value); setPage(1); setExpandedTxId(null); }}
                className={`rounded-[8px] px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                  status === tab.value ? "border border-[var(--pm-line)] bg-[var(--pm-raised)] text-[var(--pm-ink)] shadow-sm" : "border border-transparent text-[#71717A] hover:text-[var(--pm-ink)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[140px] flex-1 lg:w-[150px] lg:flex-none">
              <input type="date" aria-label="From date" className={`${inputCls} cursor-pointer`} value={dateFrom} onChange={onFilter(setDateFrom)} />
            </div>
            <span className="hidden text-[12px] text-[#A1A1AA] sm:block">to</span>
            <div className="relative min-w-[140px] flex-1 lg:w-[150px] lg:flex-none">
              <input type="date" aria-label="To date" className={`${inputCls} cursor-pointer`} value={dateTo} min={dateFrom || undefined} onChange={onFilter(setDateTo)} />
            </div>
            <div className="relative min-w-[160px] flex-1 lg:flex-none">
              <select className={`${inputCls} cursor-pointer appearance-none pr-8`} value={sort} onChange={onFilter(setSort)} style={selectChevron} aria-label="Sort">
                <option value="created_at:desc">Newest First</option>
                <option value="created_at:asc">Oldest First</option>
                <option value="amount:desc">Highest Amount</option>
                <option value="amount:asc">Lowest Amount</option>
              </select>
            </div>
            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                title="Clear filters"
                aria-label="Clear filters"
                className="flex h-10 items-center justify-center gap-1.5 rounded-[8px] border border-[var(--pm-line)] bg-[var(--pm-band)] px-3 text-[13px] text-[#71717A] shadow-sm transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]"
              >
                <FilterX className="h-4 w-4" /> <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        <label className="group flex h-11 w-full items-center gap-2.5 rounded-[10px] border border-[var(--pm-line)] bg-white px-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-all focus-within:border-[#D4D4D8] focus-within:shadow-[0_0_0_3px_rgba(9,9,11,0.06)] hover:border-[#D4D4D8]">
          <Search className="h-4 w-4 shrink-0 text-[#71717A]" />
          <input
            className="h-full w-full bg-transparent text-[13px] text-[#09090B] outline-none placeholder:text-[#A1A1AA]"
            placeholder="Search by amount, reference or email..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setExpandedTxId(null); }}
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setExpandedTxId(null); }}
              aria-label="Clear search"
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--pm-band)] text-[#71717A] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          ) : (
            <kbd className="hidden h-5 shrink-0 items-center rounded-[4px] border border-[var(--pm-line)] bg-[var(--pm-band)] px-1.5 text-[11px] font-medium text-[#71717A] sm:inline-flex">Search</kbd>
          )}
        </label>
      </section>

      {/* Ledger */}
      {error ? (
        <ErrorMessage message={error} retry={load} />
      ) : (
        <section className="relative flex flex-col overflow-hidden rounded-[12px] border border-[var(--pm-line)] bg-white shadow-sm">
          <div className="custom-scrollbar flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-[var(--pm-line)] bg-[var(--pm-band)]">
                <tr>
                  {[
                    { h: "Reference", c: "" },
                    { h: "Customer", c: "hidden md:table-cell" },
                    { h: "Amount", c: "" },
                    { h: "Status", c: "hidden sm:table-cell" },
                    { h: "Date", c: "hidden lg:table-cell" },
                    { h: "", c: "text-right" },
                  ].map((col, i) => (
                    <th key={i} className={`px-4 py-3.5 text-[12px] font-medium uppercase tracking-wide text-[#71717A] sm:px-7 ${col.c}`}>
                      {col.h || <span className="sr-only">Details</span>}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white">
                {loading && !items.length ? (
                  <tr><td colSpan={6}><LedgerSkeleton /></td></tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center bg-white px-4 py-16 text-center">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[12px] border border-[var(--pm-line)] bg-[var(--pm-band)]">
                          <Receipt className="h-6 w-6 text-[#A1A1AA]" />
                        </div>
                        <h3 className="text-[15px] font-bold">No transactions found</h3>
                        <p className="mt-2 max-w-xs text-[13px] leading-[1.6] text-[#71717A] sm:max-w-sm">
                          {filtersActive ? "Nothing matches your current filters. Try adjusting or clearing them." : "Payments will appear here as soon as you receive them."}
                        </p>
                        {filtersActive && (
                          <button type="button" onClick={resetFilters} className="mt-5 rounded-[8px] border border-[var(--pm-line)] bg-white px-4 py-2 text-[13px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)]">
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isExpanded = expandedTxId === item.id;
                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          onClick={() => toggleRow(item.id)}
                          aria-expanded={isExpanded}
                          className={`group cursor-pointer border-b border-[var(--pm-line)] transition-colors hover:bg-[var(--pm-band-hover)] ${isExpanded ? "bg-[var(--pm-band)]" : ""}`}
                        >
                          <td className={`whitespace-nowrap px-4 py-4 sm:px-7 sm:py-5 ${isExpanded ? "shadow-[inset_3px_0_0_#09090B]" : ""}`}>
                            <div className="font-mono text-[13px] font-medium" title={item.reference}>
                              {item.reference.length > 18 ? `${item.reference.substring(0, 16)}…` : item.reference}
                            </div>
                            {/* status under reference on small screens */}
                            <div className="mt-1.5 sm:hidden"><StatusBadge status={item.status} /></div>
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-4 text-[14px] text-[#52525B] sm:px-7 sm:py-5 md:table-cell">
                            {item.customer_email || "Anonymous"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-[14px] font-semibold tabular-nums sm:px-7 sm:py-5">
                            {formatAmount(item.amount, item.currency)}
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-4 sm:table-cell sm:px-7 sm:py-5">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-4 text-[14px] text-[#52525B] sm:px-7 sm:py-5 lg:table-cell">
                            {formatDate(item.created_at)}
                          </td>
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
                            <td colSpan={6} className="p-0">
                              <TransactionDetails item={item} onVerified={load} />
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

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--pm-line)] bg-white p-4 sm:flex-row sm:px-6">
              <p className="text-[12px] font-medium text-[#71717A]">
                Page <span className="font-bold text-[#09090B]">{meta.current_page}</span> of <span className="font-bold text-[#09090B]">{meta.last_page}</span>
              </p>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={meta.current_page === 1}
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); setExpandedTxId(null); }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-[8px] border border-[var(--pm-line)] bg-white px-3.5 py-1.5 text-[12px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  type="button"
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => { setPage((p) => p + 1); setExpandedTxId(null); }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-[8px] border border-[var(--pm-line)] bg-white px-3.5 py-1.5 text-[12px] font-medium shadow-sm transition-colors hover:bg-[var(--pm-band-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}