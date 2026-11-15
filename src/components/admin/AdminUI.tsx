"use client";

import { ChevronLeft, ChevronRight } from "@/components/icons";

const SUCCESS = ["success", "successful", "active", "paid", "settled", "completed", "complete", "approved"];
const PENDING = ["pending", "processing", "initialized", "initiated", "requested", "review"];
const FAILED = ["failed", "suspended", "declined", "rejected", "error", "reversed"];

export function StatusPill({ status }: { status?: string | null }) {
  const value = (status || "unknown").toString();
  const key = value.toLowerCase();
  const cls = SUCCESS.includes(key)
    ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#047857]"
    : PENDING.includes(key)
      ? "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
      : FAILED.includes(key)
        ? "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]"
        : "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {value}
    </span>
  );
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export function Pagination({
  meta,
  onPage,
}: {
  meta: PaginationMeta | null;
  onPage: (page: number) => void;
}) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F8F8F6] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-[12px] text-[#71717A]">
        Page <span className="font-semibold text-[#09090B]">{meta.current_page}</span> of {meta.last_page}
        <span className="hidden sm:inline"> · {meta.total} total</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={meta.current_page <= 1}
          onClick={() => onPage(meta.current_page - 1)}
          className="inline-flex h-8 items-center gap-1 rounded-[7px] border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#52525B] shadow-sm transition-colors hover:bg-[#F1F1EE] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={14} aria-hidden="true" /> Prev
        </button>
        <button
          type="button"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPage(meta.current_page + 1)}
          className="inline-flex h-8 items-center gap-1 rounded-[7px] border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-medium text-[#52525B] shadow-sm transition-colors hover:bg-[#F1F1EE] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export const TABLE_SHELL =
  "overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm";
export const TABLE =
  "w-full whitespace-nowrap text-left text-[13px]";
export const THEAD = "border-b border-[#E5E7EB] bg-[#F8F8F6]";
export const TH =
  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#71717A] sm:px-5";
export const TBODY = "divide-y divide-[#E5E7EB]";
export const TR = "transition-colors hover:bg-[#FAFAF9]";
export const TD = "px-4 py-3.5 sm:px-5";
