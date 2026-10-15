"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { ArrowLeft, Link as LinkIcon, Plus, Eye, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";
import { Spinner, useToast } from "@/components/dashboard/ui";

export default function CreatePaymentLinkPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [displayAmount, setDisplayAmount] = useState("");
  const [minDateTime, setMinDateTime] = useState("");

  const [form, setForm] = useState({
    reference: "",
    amount: "", 
    currency: "NGN",
    description: "",
    customer_email: "",
    expiry: "", 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const generateRef = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setMinDateTime(now.toISOString().slice(0, 16));
      setForm(prev => ({ ...prev, reference: generateRef }));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    const intPart = parts[0];
    if (intPart) {
      const formattedInt = new Intl.NumberFormat('en-US').format(parseInt(intPart, 10));
      val = parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
    }
    setDisplayAmount(val);
    setForm(prev => ({ ...prev, amount: val.replace(/,/g, '') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (form.expiry && new Date(form.expiry) < new Date()) {
      setError("Expiry date cannot be set in the past.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/payment-links", {
        reference: form.reference,
        amount: parseFloat(form.amount),
        currency: form.currency,
        description: form.description,
        customer_email: form.customer_email || undefined,
        expiry: form.expiry ? new Date(form.expiry).toISOString() : undefined,
      });

      toast.success("Secure payment link initialized successfully.");
      router.push("/payment-links");
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Failed to create link" : "System Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewAmount = form.amount ? parseFloat(form.amount) : 0;
  const formattedPreview = new Intl.NumberFormat("en-US", { style: "currency", currency: form.currency }).format(previewAmount);

  return (
    <div className="w-full space-y-8">
      <Link href="/payment-links" className="inline-flex items-center gap-2 text-sm font-bold text-[#8995a3] hover:text-white transition-colors">
        <ArrowLeft className="h-5 w-5" /> Back to Ledger
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-16">
        
        <div className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-175">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#2f9d78]/5 blur-[100px] pointer-events-none" />

          <div className="flex items-center gap-5 mb-10 sm:mb-12">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20 shadow-inner shrink-0">
              <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">Initialize Link</h1>
              <p className="text-sm sm:text-base text-[#8995a3] mt-1">Configure parameters for your hosted checkout.</p>
            </div>
          </div>

          {error && (
            <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm font-bold text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-sm sm:text-base font-bold text-white border-b border-white/10 pb-3">1. Payment Details</h2>
              
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Payment Description</label>
                <input 
                  required
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Software Consultation"
                  className="h-14 w-full rounded-xl border border-white/10 bg-[#090d14]/50 px-5 text-base font-medium text-[#e8edf2] placeholder:text-[#68747e] outline-none transition-all focus:border-[#2f9d78] focus:bg-white/5 focus:ring-1 focus:ring-[#2f9d78] shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Amount</label>
                  <input 
                    required
                    type="text"
                    name="amountDisplay"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="h-14 w-full rounded-xl border border-white/10 bg-[#090d14]/50 px-5 text-base font-medium text-[#e8edf2] placeholder:text-[#68747e] outline-none transition-all focus:border-[#2f9d78] focus:bg-white/5 focus:ring-1 focus:ring-[#2f9d78] shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Currency</label>
                  <select 
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="h-14 w-full rounded-xl border border-white/10 bg-[#090d14]/90 px-5 text-base font-medium text-[#e8edf2] outline-none transition-all focus:border-[#2f9d78] focus:ring-1 focus:ring-[#2f9d78] shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-sm sm:text-base font-bold text-white border-b border-white/10 pb-3">2. Security & Triggers</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Transaction Reference</label>
                  <input 
                    required
                    type="text"
                    name="reference"
                    value={form.reference}
                    onChange={handleChange}
                    className="h-14 w-full rounded-xl border border-white/10 bg-[#090d14]/50 px-5 text-base font-medium text-[#e8edf2] outline-none transition-all focus:border-[#2f9d78] focus:bg-white/5 focus:ring-1 focus:ring-[#2f9d78] shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Customer Email (Optional)</label>
                  <input 
                    type="email"
                    name="customer_email"
                    value={form.customer_email}
                    onChange={handleChange}
                    placeholder="client@example.com"
                    className="h-14 w-full rounded-xl border border-white/10 bg-[#090d14]/50 px-5 text-base font-medium text-[#e8edf2] placeholder:text-[#68747e] outline-none transition-all focus:border-[#2f9d78] focus:bg-white/5 focus:ring-1 focus:ring-[#2f9d78] shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Link Expiry (Optional)</label>
                <input 
                  type="datetime-local"
                  name="expiry"
                  min={minDateTime}
                  value={form.expiry}
                  onChange={handleChange}
                  className="h-14 w-full rounded-xl border border-white/10 bg-[#090d14]/50 px-5 text-base font-medium text-[#e8edf2] placeholder:text-[#68747e] outline-none transition-all focus:border-[#2f9d78] focus:bg-white/5 focus:ring-1 focus:ring-[#2f9d78] shadow-inner scheme-dark cursor-pointer"
                />
                <p className="text-xs text-[#68747e] mt-2">If set, checkout page will become inaccessible after this time.</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex h-14 sm:h-16 w-full items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-8 text-sm sm:text-base font-bold text-white transition-all hover:shadow-[0_0_30px_rgba(47,157,120,0.4)] hover:brightness-110 disabled:opacity-50 border border-white/10"
              >
                {isSubmitting ? <Spinner /> : <Plus className="h-5 w-5 sm:h-6 sm:w-6" />}
                {isSubmitting ? "Generating Link..." : "Deploy Payment Link"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
          <div className="sticky top-32 space-y-6">
            <div className="flex items-center gap-3 text-[#8995a3] mb-6">
              <Eye className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Customer Preview</span>
            </div>

            <div className="rounded-[2.5rem] bg-[#ffffff] p-10 shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#2f9d78] to-[#1a6b50]" />
              
              <div className="flex justify-center mb-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#090d14] text-white font-black text-2xl shadow-xl">
                  P
                </div>
              </div>
              
              <div className="text-center space-y-3 mb-10">
                <p className="text-base font-semibold text-gray-500 wrap-break-word">
                  {form.customer_email || "guest@example.com"}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 wrap-break-word leading-tight">
                  {form.description || "Payment Description"}
                </h3>
                <p className="text-4xl xl:text-5xl font-black text-[#090d14] tracking-tighter py-6 wrap-break-word">
                  {formattedPreview}
                </p>
                <p className="text-sm font-medium text-gray-400">
                  Ref: {form.reference.substring(0, 15)}...
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-14 w-full rounded-2xl bg-gray-50 flex items-center px-5 border border-gray-200">
                  <CreditCard className="h-6 w-6 text-gray-400 mr-4 shrink-0" />
                  <div className="h-4 w-full max-w-37.5 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-14 rounded-2xl bg-gray-50 border border-gray-200" />
                  <div className="h-14 rounded-2xl bg-gray-50 border border-gray-200" />
                </div>
                <div className="h-16 w-full rounded-2xl bg-[#090d14] flex items-center justify-center mt-8 shadow-lg">
                  <span className="text-white font-bold text-sm xl:text-base">Pay {formattedPreview}</span>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-2 text-gray-400">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span className="text-xs xl:text-sm font-medium">Secured by Payflow Infrastructure</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}