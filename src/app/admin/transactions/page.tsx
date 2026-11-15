"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { Activity, FilterX, X } from "@/components/icons";
import { Spinner, ErrorMessage } from "@/components/dashboard/ui";
import { PageHeader, selectChevron } from "@/components/dashboard/kit";
import {
  Pagination,
  StatusPill,
  TABLE,
  TABLE_SHELL,
  TBODY,
  TD,
  TH,
  THEAD,
  TR,
} from "@/components/admin/AdminUI";

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  created_at: string;
  merchant?: {
    id: string;
    business_name: string;
    email?: string;
  };
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

const formatCurrency = (amount: number, currency: string = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString));

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadTransactions = useCallback(async (currentPage: number, currentStatus: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/transactions", {
        params: {
          page: currentPage,
          status: currentStatus || null,
        },
        signal: abortControllerRef.current.signal,
      });

      const paginatedData = res.data.data;
      setTransactions(paginatedData.data || paginatedData);
      setMeta({
        current_page: paginatedData.current_page || 1,
        last_page: paginatedData.last_page || 1,
        total: paginatedData.total || 0,
      });
    } catch {
      setError("Failed to load global transaction ledger.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await loadTransactions(page, statusFilter);
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadTransactions, page, statusFilter]);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        eyebrow="Operations"
        title="Global transaction ledger"
        description="Platform-wide immutable record of every processed payment."
        action={
          <span className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#52525B] shadow-sm">
            <Activity size={14} className="text-[#71717A]" aria-hidden="true" />
            {meta?.total || 0} records
          </span>
        }
      />

      <div className="flex flex-col gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-[240px]">
          <label
            htmlFor="tx-status"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]"
          >
            Filter by status
          </label>
          <select
            id="tx-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full cursor-pointer appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 pr-9 text-[13px] font-medium text-[#09090B] shadow-[0_1px_2px_rgba(9,9,11,0.04)] outline-none transition-all hover:border-[#D4D4D8] focus:border-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(9,9,11,0.06)]"
            style={selectChevron}
          >
            <option value="">All statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="INITIALIZED">Initialized</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        {statusFilter && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-3 text-[12px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
          >
            <FilterX size={14} aria-hidden="true" /> Reset filter
          </button>
        )}
      </div>

      {isLoading && !transactions.length ? (
        <div className="flex h-64 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} retry={() => void loadTransactions(page, statusFilter)} />
      ) : (
        <div className={TABLE_SHELL}>
          <div className="overflow-x-auto">
            <table className={TABLE}>
              <thead className={THEAD}>
                <tr>
                  <th className={TH}>Reference / ID</th>
                  <th className={TH}>Merchant</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Provider</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} text-right`}>Timestamp</th>
                </tr>
              </thead>
              <tbody className={TBODY}>
                {transactions.map((tx) => (
                  <tr key={tx.id} onClick={() => setSelectedTx(tx)} className={`${TR} group cursor-pointer`}>
                    <td className={TD}>
                      <p className="font-semibold text-[#09090B] transition-colors group-hover:text-[#047857]">
                        {tx.reference}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#A1A1AA]">{tx.id}</p>
                    </td>
                    <td className={TD}>
                      <p className="font-medium text-[#09090B]">{tx.merchant?.business_name || "Direct / Unknown"}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#A1A1AA]">{tx.merchant?.id?.substring(0, 8)}…</p>
                    </td>
                    <td className={`${TD} font-semibold tabular-nums text-[#09090B]`}>
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className={TD}>
                      <span className="inline-flex items-center rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-2 py-1 text-[11px] font-medium uppercase text-[#52525B]">
                        {tx.provider || "Cray"}
                      </span>
                    </td>
                    <td className={TD}>
                      <StatusPill status={tx.status} />
                    </td>
                    <td className={`${TD} text-right text-[12px] text-[#71717A]`}>
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-[13px] text-[#71717A]">
                      No transactions recorded on the platform yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}

      {/* Transaction detail modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/40 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_-12px_rgba(9,9,11,0.3)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] bg-[#F8F8F6] px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                  Transaction audit
                </p>
                <h2 className="mt-0.5 truncate text-[16px] font-semibold tracking-tight text-[#09090B]">
                  {selectedTx.reference}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                aria-label="Close"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#71717A] transition-colors hover:bg-[#ECECE9] hover:text-[#09090B]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2.5 p-5">
              {[
                { label: "Internal ID", value: selectedTx.id, mono: true },
                { label: "Merchant", value: selectedTx.merchant?.business_name || "N/A" },
                { label: "Amount", value: formatCurrency(selectedTx.amount, selectedTx.currency), strong: true },
                { label: "Status", value: selectedTx.status },
                { label: "Provider", value: selectedTx.provider || "Cray" },
                { label: "Timestamp", value: formatDate(selectedTx.created_at) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 rounded-[9px] border border-[#E5E7EB] bg-[#FAFAF9] px-3.5 py-2.5"
                >
                  <span className="text-[12px] text-[#71717A]">{row.label}</span>
                  <span
                    className={`truncate text-right text-[12px] ${
                      row.mono ? "font-mono" : ""
                    } ${row.strong ? "font-semibold text-[#047857]" : "font-medium text-[#09090B]"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E7EB] px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="inline-flex h-10 w-full items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#09090B] shadow-sm transition-colors hover:bg-[#F1F1EE]"
              >
                Close inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
