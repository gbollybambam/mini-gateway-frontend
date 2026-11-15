"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowUpRight, FilterX, Users } from "@/components/icons";
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

interface Merchant {
  id: string;
  business_name: string;
  email: string;
  country: string;
  status: string;
  created_at: string;
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMerchants = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/merchants", {
          params: {
            page,
            status: statusFilter || null,
          },
        });

        if (isMounted) {
          setMerchants(res.data.data);
          setMeta(res.data.meta);
        }
      } catch {
        if (isMounted) setError("Failed to load merchants.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMerchants();

    return () => {
      isMounted = false;
    };
  }, [page, statusFilter]);

  const retryLoad = () => {
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        eyebrow="Operations"
        title="Merchant directory"
        description="Manage merchant accounts and financial access across the platform."
        action={
          <span className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#52525B] shadow-sm">
            <Users size={14} className="text-[#71717A]" aria-hidden="true" />
            {meta?.total || 0} merchants
          </span>
        }
      />

      <div className="flex flex-col gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-[260px]">
          <label
            htmlFor="merchant-status"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]"
          >
            Filter by status
          </label>
          <select
            id="merchant-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full cursor-pointer appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 pr-9 text-[13px] font-medium text-[#09090B] shadow-[0_1px_2px_rgba(9,9,11,0.04)] outline-none transition-all hover:border-[#D4D4D8] focus:border-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(9,9,11,0.06)]"
            style={selectChevron}
          >
            <option value="">All merchants</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
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

      {isLoading && !merchants.length ? (
        <div className="flex h-64 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} retry={retryLoad} />
      ) : (
        <div className={TABLE_SHELL}>
          <div className="overflow-x-auto">
            <table className={TABLE}>
              <thead className={THEAD}>
                <tr>
                  <th className={TH}>Business</th>
                  <th className={TH}>Contact</th>
                  <th className={TH}>Country</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className={TBODY}>
                {merchants.map((m) => (
                  <tr key={m.id} className={TR}>
                    <td className={TD}>
                      <p className="font-semibold text-[#09090B]">{m.business_name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#A1A1AA]">{m.id.substring(0, 8)}</p>
                    </td>
                    <td className={`${TD} text-[#52525B]`}>{m.email}</td>
                    <td className={`${TD} text-[#52525B]`}>{m.country || "—"}</td>
                    <td className={TD}>
                      <StatusPill status={m.status} />
                    </td>
                    <td className={`${TD} text-right`}>
                      <Link
                        href={`/admin/merchants/${m.id}`}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-[7px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#09090B] shadow-sm transition-colors hover:bg-[#F1F1EE]"
                      >
                        Inspect
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {merchants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-[13px] text-[#71717A]">
                      No merchants match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
