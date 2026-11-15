"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "@/components/icons";
import { btnPrimary, btnSecondary } from "@/components/dashboard/kit";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the boundary useful without leaking API responses or auth data.
    void error.digest;
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center bg-white px-4 font-sans text-[#09090B]">
      <section className="w-full max-w-md rounded-[16px] border border-[var(--pm-line)] bg-white p-8 text-center shadow-[0_16px_40px_-16px_rgba(9,9,11,0.15)] sm:p-10">
        <div className="mx-auto grid size-14 place-items-center rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA]">Temporary interruption</p>
        <h1 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">We hit a small snag</h1>
        <p className="mt-3 text-[13px] leading-[1.7] text-[#71717A]">
          This workspace couldn&apos;t render that view. Your account and funds are safe. Try loading it again.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Link href="/overview" className={btnSecondary}>Go to overview</Link>
          <button type="button" onClick={reset} className={btnPrimary}>
            <RefreshCw className="h-4 w-4" /> Reload workspace
          </button>
        </div>

        {error.digest && <p className="mt-6 font-mono text-[11px] text-[#A1A1AA]">Ref: {error.digest}</p>}
      </section>
    </main>
  );
}