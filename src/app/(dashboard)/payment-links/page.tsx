"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { Plus, Link as LinkIcon, Copy, Check, ExternalLink, Power, PowerOff, ChevronDown, ChevronUp, Clock, UserCheck, Activity } from "lucide-react";
import { useToast } from "@/components/dashboard/ui";

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

function LinksSkeleton() {
  return (
    <div className="animate-pulse flex flex-col mt-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-6 px-4 sm:px-8 border-b border-white/5">
          <div className="space-y-2">
            <div className="h-4 w-32 sm:w-40 bg-white/10 rounded-full"></div>
            <div className="h-3 w-20 sm:w-24 bg-white/5 rounded-full"></div>
          </div>
          <div className="h-4 w-24 bg-white/10 rounded-full hidden sm:block"></div>
          <div className="h-6 w-20 bg-white/5 rounded-full hidden md:block"></div>
          <div className="h-8 w-8 bg-white/5 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const toast = useToast();

  const fetchLinks = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);

    try {
      const response = await api.get<{ data: PaymentLink[] }>("/payment-links");
      setLinks(response.data.data);
      setError("");
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Failed to load" : "Error loading links");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. Initial Load
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchLinks(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLinks]);

  // 2. THE MAGIC: Silent Background Polling
  const isPollingRef = React.useRef(false);
  
  useEffect(() => {
    // Only poll if there is at least one active link that could theoretically be paid
    if (!links.some((link) => link.status.toUpperCase() === "ACTIVE")) return;

    const interval = window.setInterval(() => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      
      api.get<{ data: PaymentLink[] }>("/payment-links")
        .then(response => {
          setLinks(response.data.data);
        })
        .catch(() => {
          // Silent fail for polling
        })
        .finally(() => {
          isPollingRef.current = false;
        });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [links]);

  const handleCopy = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Checkout link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStatus = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-4 sm:p-6 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm">Payment Links</h1>
          <p className="text-xs sm:text-sm text-[#8995a3] mt-1">Generate reusable checkout pages to collect payments globally.</p>
        </div>
        <Link 
          href="/payment-links/create" 
          className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 border border-white/10"
        >
          <Plus className="h-4 w-4" /> Create Link
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm font-medium text-red-500">
          {error}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-[#e8edf2] whitespace-nowrap">
              <thead className="border-b border-white/5 bg-white/1 text-[10px] font-bold uppercase tracking-widest text-[#68747e]">
                <tr>
                  <th className="px-4 sm:px-8 py-5">Details</th>
                  <th className="hidden sm:table-cell px-8 py-5">Amount</th>
                  <th className="hidden md:table-cell px-8 py-5">Status</th>
                  <th className="hidden lg:table-cell px-8 py-5">Created</th>
                  <th className="px-4 sm:px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={5}><LinksSkeleton /></td></tr>
                ) : links.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                          <LinkIcon className="h-8 w-8 text-[#68747e]" />
                        </div>
                        <h3 className="text-lg font-bold text-white drop-shadow-sm">No Payment Links Active</h3>
                        <p className="mt-2 text-sm text-[#8995a3] max-w-sm leading-relaxed whitespace-normal">
                          Create your first hosted checkout link to start accepting payments securely without writing any code.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  links.map((link) => {
                    const isActive = link.status === 'ACTIVE';
                    const isCompleted = link.status === 'COMPLETED';
                    const isDeactivated = link.status === 'DEACTIVATED';
                    const isExpired = link.status === 'EXPIRED';
                    const isExpanded = expandedId === link.id;
                    
                    return (
                      <React.Fragment key={link.id}>
                        {/* MAIN ROW (RESPONSIVE) */}
                        <tr 
                          onClick={() => setExpandedId(isExpanded ? null : link.id)}
                          className={`transition-colors cursor-pointer group ${isDeactivated || isExpired ? 'opacity-60' : ''} ${isExpanded ? 'bg-white/4' : 'hover:bg-white/2'}`}
                        >
                          <td className="px-4 sm:px-8 py-5">
                            <p className={`font-bold transition-colors truncate max-w-37.5 sm:max-w-62.5 ${isActive || isCompleted ? 'text-white group-hover:text-[#35d5a4]' : 'text-[#8995a3]'}`}>
                              {link.description}
                            </p>
                            <p className="text-xs text-[#8995a3] mt-0.5">{link.reference}</p>
                            {/* Show Amount & Status on mobile only */}
                            <div className="sm:hidden flex items-center gap-2 mt-2">
                              <span className="font-bold text-[#e8edf2] text-xs">{formatAmount(link.amount, link.currency)}</span>
                              <span className="text-[10px] uppercase text-[#68747e]">• {link.status}</span>
                            </div>
                          </td>
                          <td className={`hidden sm:table-cell px-8 py-5 font-bold ${isActive || isCompleted ? 'text-[#e8edf2]' : 'text-[#8995a3]'}`}>
                            {formatAmount(link.amount, link.currency)}
                          </td>
                          <td className="hidden md:table-cell px-8 py-5">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              isActive ? 'bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20' : 
                              isExpired ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {link.status}
                            </span>
                          </td>
                          <td className="hidden lg:table-cell px-8 py-5 text-[#8995a3] font-medium">
                            {formatDate(link.created_at)}
                          </td>
                          <td className="px-4 sm:px-8 py-5 text-right">
                             <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-[#8995a3] group-hover:text-white">
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                             </button>
                          </td>
                        </tr>

                        {/* EXPANDED DROPDOWN (RESPONSIVE) */}
                        {isExpanded && (
                          <tr className="bg-[#05080c]/40 shadow-inner border-b-2 border-[#2f9d78]/20">
                            <td colSpan={5} className="p-0">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-8 animate-in slide-in-from-top-2 fade-in duration-200 whitespace-normal">
                                  
                                  {/* Left Col: Metadata & Usage Details */}
                                  <div className="space-y-5">
                                     <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 flex items-center gap-2"><LinkIcon className="h-3 w-3"/> Hosted URL</h4>
                                        <a href={link.checkout_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#35d5a4] hover:underline break-all">
                                          {link.checkout_url}
                                        </a>
                                     </div>
                                     
                                     {isCompleted ? (
                                       <div className="rounded-xl border border-[#3f82b2]/20 bg-[#3f82b2]/10 p-4">
                                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#79b8e8] mb-1 flex items-center gap-2">
                                            <UserCheck className="h-3 w-3"/> Payer Details
                                          </h4>
                                          <p className="text-sm font-medium text-white break-all">
                                            {link.payment?.customer_email || link.customer_information?.email || "Anonymous Payer"}
                                          </p>
                                          <p className="text-xs text-[#79b8e8] mt-1 font-bold">Successfully Collected</p>
                                       </div>
                                     ) : (
                                       <div>
                                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 flex items-center gap-2"><UserCheck className="h-3 w-3"/> Designated Customer</h4>
                                          <p className="text-sm font-medium text-white break-all">{link.customer_information?.email || "General (Open to anyone)"}</p>
                                       </div>
                                     )}

                                     <div className="grid grid-cols-2 gap-4">
                                       <div className="md:hidden">
                                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 flex items-center gap-2"><Activity className="h-3 w-3"/> Status</h4>
                                          <p className="text-sm font-medium text-white">{link.status}</p>
                                       </div>
                                       <div>
                                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-1 flex items-center gap-2"><Clock className="h-3 w-3"/> Expiry Date</h4>
                                          <p className="text-sm font-medium text-white">{formatDate(link.expiry)}</p>
                                       </div>
                                     </div>
                                  </div>

                                  {/* Right Col: Actions */}
                                  <div className="flex flex-col gap-3 justify-center md:border-l border-white/5 md:pl-8">
                                     <button 
                                      onClick={(e) => handleCopy(e, link.id, link.checkout_url)}
                                      disabled={!isActive}
                                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                      {copiedId === link.id ? <Check className="h-4 w-4 text-[#35d5a4]" /> : <Copy className="h-4 w-4" />}
                                      {copiedId === link.id ? "Copied" : "Copy Checkout Link"}
                                     </button>

                                     <a 
                                      href={link.checkout_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#3f82b2]/20 bg-[#3f82b2]/10 px-4 text-sm font-bold text-[#79b8e8] hover:bg-[#3f82b2]/20 transition-all ${!isActive && 'opacity-50 pointer-events-none'}`}
                                     >
                                      <ExternalLink className="h-4 w-4" /> Open Payment Page
                                     </a>

                                     {!isCompleted && !isExpired && (
                                      <button 
                                        onClick={(e) => toggleStatus(e, link.id, link.status)}
                                        className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all ${
                                          isActive 
                                            ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                            : 'border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                        }`}
                                      >
                                        {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                        {isActive ? "Deactivate Link" : "Reactivate Link"}
                                      </button>
                                     )}
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
        </div>
      )}
    </div>
  );
}