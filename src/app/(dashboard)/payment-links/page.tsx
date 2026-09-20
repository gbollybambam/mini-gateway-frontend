"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { Plus, Link as LinkIcon, Copy, Check, ExternalLink, Power, PowerOff } from "lucide-react";
import { Spinner, useToast } from "@/components/dashboard/ui";

interface PaymentLink {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  description: string;
  checkout_url: string;
  status: string; // Will map to ACTIVE, COMPLETED, DEACTIVATED, or EXPIRED
  created_at: string;
}

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    async function fetchLinks() {
      try {
        const response = await api.get<{ data: PaymentLink[] }>("/payment-links");
        setLinks(response.data.data);
      } catch (err) {
        setError(isAxiosError(err) ? err.response?.data?.message || "Failed to load" : "Error loading links");
      } finally {
        setIsLoading(false);
      }
    }
    void fetchLinks();
  }, []);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Checkout link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // SECURE: Toggles exactly between the allowed Enum values
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    try {
      await api.patch(`/payment-links/${id}`, { status: newStatus });
      setLinks(links.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success(`Link has been successfully ${newStatus.toLowerCase()}.`);
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || "Status update failed" : "System Error");
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-[#35d5a4] bg-[#2f9d78]/10 px-6 py-3 rounded-full border border-[#2f9d78]/20 font-medium text-sm">
          <Spinner /> Synchronizing links...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">Payment Links</h1>
          <p className="text-sm text-[#8995a3] mt-1">Generate reusable checkout pages to collect payments globally.</p>
        </div>
        <Link 
          href="/payment-links/create" 
          className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 border border-white/10"
        >
          <Plus className="h-4 w-4" /> Create New Link
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm font-medium text-red-500">
          {error}
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl py-24 shadow-2xl text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-inner">
            <LinkIcon className="h-10 w-10 text-[#68747e]" />
          </div>
          <h3 className="text-xl font-bold text-white drop-shadow-sm">No Payment Links Active</h3>
          <p className="mt-2 text-sm text-[#8995a3] max-w-md leading-relaxed">
            Create your first hosted checkout link to start accepting payments securely without writing any code.
          </p>
          <Link href="/payment-links/create" className="mt-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-[#e8edf2] transition-all hover:bg-white/10 hover:text-white">
            <Plus className="h-4 w-4" /> Initialize Link
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#e8edf2]">
              <thead className="border-b border-white/5 bg-white/[0.01] text-xs uppercase tracking-widest text-[#68747e]">
                <tr>
                  <th className="px-6 py-5 font-bold">Details</th>
                  <th className="px-6 py-5 font-bold">Amount</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold">Created</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {links.map((link) => {
                  // SECURE: Strict Enum matching
                  const isActive = link.status === 'ACTIVE';
                  const isCompleted = link.status === 'COMPLETED';
                  const isDeactivated = link.status === 'DEACTIVATED';
                  const isExpired = link.status === 'EXPIRED';
                  
                  return (
                    <tr key={link.id} className={`transition-colors group ${isDeactivated || isExpired ? 'opacity-60 hover:bg-white/[0.01]' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-6 py-4">
                        <p className={`font-bold transition-colors ${isActive || isCompleted ? 'text-white group-hover:text-[#35d5a4]' : 'text-[#8995a3]'}`}>{link.description}</p>
                        <p className="text-xs text-[#8995a3] mt-0.5">{link.reference}</p>
                      </td>
                      <td className={`px-6 py-4 font-bold ${isActive || isCompleted ? 'text-[#e8edf2]' : 'text-[#8995a3]'}`}>
                        {formatAmount(link.amount, link.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          isActive ? 'bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20' : 
                          isExpired ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {link.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#8995a3]">
                        {new Date(link.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleCopy(link.id, link.checkout_url)}
                            disabled={!isActive}
                            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-[#8995a3] hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-[#35d5a4]" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedId === link.id ? "Copied" : "Copy URL"}
                          </button>
                          
                          <a 
                            href={link.checkout_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#8995a3] transition-all ${isActive ? 'hover:bg-white/10 hover:text-[#35d5a4]' : 'opacity-50 pointer-events-none'}`}
                            title="Open Checkout"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          {/* Only allow toggling if it's not completed/expired */}
                          {!isCompleted && !isExpired && (
                            <button 
                              onClick={() => toggleStatus(link.id, link.status)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#8995a3] hover:bg-white/10 hover:text-red-400 transition-all"
                              title={isActive ? "Deactivate Link" : "Activate Link"}
                            >
                              {isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5 text-amber-400" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}