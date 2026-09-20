"use client";

import { useEffect } from "react";
import { RefreshCw } from "@/components/dashboard/icons";
import { primaryButton } from "@/components/dashboard/ui";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the boundary useful without leaking API responses or auth data.
    void error.digest;
  }, [error]);

  return <main className="grid min-h-[70vh] place-items-center"><section className="panel max-w-lg p-8 text-center sm:p-12"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-yellow/30 text-brown"><span className="text-2xl font-bold">!</span></div><p className="eyebrow mt-6">Temporary interruption</p><h1 className="mt-2 text-preset-1 text-grey-900">We hit a small snag</h1><p className="mt-3 text-preset-4 text-grey-500">This workspace could not render that view. Your account is safe. Try loading it again.</p><button className={`${primaryButton} mt-7`} onClick={reset} type="button"><RefreshCw className="h-4 w-4" />Reload workspace</button></section></main>;
}