"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { ArrowDownRight, X } from "@/components/icons";
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

interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  currency: string;
  status: string;
  bank_details?: Record<string, string>;
  created_at: string;
  merchant?: {
    id: string;
    business_name: string;
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

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Withdrawal | null>(null);

  const loadWithdrawals = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/withdrawals", {
        params: { page, status: statusFilter || null },
      });
      const data = res.data.data;
      setWithdrawals(data.data || data);
      setMeta({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      });
    } catch {
      setError("Failed to load withdrawals queue.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWithdrawals();
  }, [loadWithdrawals]);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        eyebrow="Operations"
        title="Withdrawals & payouts"
        description="Review and settle merchant payout requests."
        action={
          <span className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#52525B] shadow-sm">
            <ArrowDownRight size={14} className="text-[#71717A]" aria-hidden="true" />
            {meta?.total || 0} requests
          </span>
        }
      />

      <div className="flex flex-col gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-[240px]">
          <label
            htmlFor="withdrawal-status"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]"
          >
            Filter by status
          </label>
          <select
            id="withdrawal-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full cursor-pointer appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 pr-9 text-[13px] font-medium text-[#09090B] shadow-[0_1px_2px_rgba(9,9,11,0.04)] outline-none transition-all hover:border-[#D4D4D8] focus:border-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(9,9,11,0.06)]"
            style={selectChevron}
          >
            <option value="">All statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUCCESS">Success (paid)</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {isLoading && !withdrawals.length ? (
        <div className="flex h-64 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} retry={loadWithdrawals} />
      ) : (
        <div className={TABLE_SHELL}>
          <div className="overflow-x-auto">
            <table className={TABLE}>
              <thead className={THEAD}>
                <tr>
                  <th className={TH}>Merchant</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Fee</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} text-right`}>Requested on</th>
                </tr>
              </thead>
              <tbody className={TBODY}>
                {withdrawals.map((w) => (
                  <tr key={w.id} onClick={() => setSelected(w)} className={`${TR} group cursor-pointer`}>
                    <td className={TD}>
                      <p className="font-semibold text-[#09090B] transition-colors group-hover:text-[#2563EB]">
                        {w.merchant?.business_name || "Unknown merchant"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#A1A1AA]">{w.id.substring(0, 8)}…</p>
                    </td>
                    <td className={`${TD} font-semibold tabular-nums text-[#09090B]`}>
                      {formatCurrency(w.amount, w.currency)}
                    </td>
                    <td className={`${TD} text-[#71717A]`}>{formatCurrency(w.fee, w.currency)}</td>
                    <td className={TD}>
                      <StatusPill status={w.status} />
                    </td>
                    <td className={`${TD} text-right text-[12px] text-[#71717A]`}>
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-[13px] text-[#71717A]">
                      No withdrawal requests match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}

      {/* Payout inspection modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_-12px_rgba(9,9,11,0.3)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] bg-[#F8F8F6] px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                  Payout request
                </p>
                <h2 className="mt-0.5 text-[16px] font-semibold tracking-tight text-[#09090B]">
                  {selected.merchant?.business_name || "Unknown merchant"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#71717A] transition-colors hover:bg-[#ECECE9] hover:text-[#09090B]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2.5 p-5">
              <div className="rounded-[10px] border border-[#E5E7EB] bg-[#FAFAF9] px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#71717A]">Net payout</p>
                <p className="mt-1 text-[22px] font-bold tracking-[-0.02em] tabular-nums text-[#09090B]">
                  {formatCurrency(selected.amount - selected.fee, selected.currency)}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-[9px] border border-[#E5E7EB] bg-white px-3.5 py-2.5">
                <span className="text-[12px] text-[#71717A]">Status</span>
                <StatusPill status={selected.status} />
              </div>

              <div className="rounded-[9px] border border-[#E5E7EB] bg-white px-3.5 py-2.5">
                <span className="text-[12px] text-[#71717A]">Bank details</span>
                <div className="mt-2 space-y-1">
                  {Object.entries(selected.bank_details || {}).length === 0 ? (
                    <p className="text-[12px] text-[#A1A1AA]">Not provided.</p>
                  ) : (
                    Object.entries(selected.bank_details || {}).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-3 text-[12px]">
                        <span className="capitalize text-[#71717A]">{key.replace(/_/g, " ")}</span>
                        <span className="break-all text-right font-medium text-[#09090B]">{String(value)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {selected.status === "REQUESTED" && (
              <div className="flex gap-2.5 border-t border-[#E5E7EB] px-5 py-4">
                <button
                  type="button"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] text-[12px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-[8px] bg-[#09090B] text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#27272A]"
                >
                  Approve payout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
