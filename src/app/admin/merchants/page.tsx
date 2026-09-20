"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Users, FilterX, ChevronLeft, ChevronRight, Search, ArrowLeft } from "lucide-react";
import { Spinner, ErrorMessage } from "@/components/dashboard/ui";

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

  const loadMerchants = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/merchants", {
        params: {
          page,
          status: statusFilter || null,
        }
      });
      setMerchants(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError("Failed to load merchants.");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#8995a3] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Command Center
        </Link>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Merchant Directory</h1>
          <p className="text-sm text-[#8995a3] mt-1">Manage merchant accounts and financial access.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8edf2] backdrop-blur-md">
          <Users className="h-4 w-4 text-[#35d5a4]" />
          <span className="font-medium">{meta?.total || 0} Total</span>
        </div>
      </header>

      <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl p-5 flex items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Filter by Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-[#e8edf2] outline-none focus:border-[#35d5a4]/50 transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#0a0f16]">All Merchants</option>
            <option value="ACTIVE" className="bg-[#0a0f16]">Active</option>
            <option value="SUSPENDED" className="bg-[#0a0f16]">Suspended</option>
          </select>
        </div>
        {statusFilter && (
          <div className="flex items-end h-11">
            <button 
              onClick={() => { setStatusFilter(""); setPage(1); }}
              className="h-11 px-4 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <FilterX className="h-4 w-4" /> Reset
            </button>
          </div>
        )}
      </div>

      {isLoading && !merchants.length ? (
        <div className="flex h-64 items-center justify-center"><Spinner /></div>
      ) : error ? (
        <ErrorMessage message={error} retry={loadMerchants} />
      ) : (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.01] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Business</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Country</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {merchants.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-white/[0.04]">
                    <td className="px-6 py-4 font-bold text-white">{m.business_name}</td>
                    <td className="px-6 py-4 text-[#8995a3]">{m.email}</td>
                    <td className="px-6 py-4 font-medium text-[#e8edf2]">{m.country}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                        ${m.status === 'ACTIVE' ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/merchants/${m.id}`}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
              <p className="text-xs font-medium text-[#8995a3]">Page <span className="text-white font-bold">{meta.current_page}</span> of {meta.last_page}</p>
              <div className="flex items-center gap-2">
                <button disabled={meta.current_page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer">
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button disabled={meta.current_page === meta.last_page} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}