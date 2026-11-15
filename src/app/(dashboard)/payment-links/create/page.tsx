"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { ArrowLeft, Plus, Eye, ShieldCheck, CreditCard } from "@/components/icons";
import Link from "next/link";
import { Spinner, useToast } from "@/components/dashboard/ui";

const CURRENCY_SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£" };

const fieldCls =
  "h-11 w-full rounded-[10px] border border-[var(--pm-line)] bg-white px-3.5 text-[14px] text-[#09090B] shadow-[0_1px_2px_rgba(9,9,11,0.04)] outline-none transition-all placeholder:text-[#A1A1AA] hover:border-[#D4D4D8] focus:border-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(9,9,11,0.06)]";

const selectChevron = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundPosition: "right 12px center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "16px",
} as const;

function Field({ label, optional, hint, children }: { label: string; optional?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center justify-between text-[13px] font-medium text-[#09090B]">
        <span>{label}</span>
        {optional && <span className="text-[12px] font-normal text-[#A1A1AA]">Optional</span>}
      </label>
      {children}
      {hint && <p className="text-[12px] text-[#71717A]">{hint}</p>}
    </div>
  );
}

function SectionTitle({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--pm-line)] pb-4">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#09090B] text-[12px] font-semibold text-white">{step}</span>
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-[#09090B]">{title}</h2>
        <p className="mt-0.5 text-[12px] text-[#71717A]">{subtitle}</p>
      </div>
    </div>
  );
}

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
      setForm((prev) => ({ ...prev, reference: generateRef }));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    const intPart = parts[0];
    if (intPart) {
      const formattedInt = new Intl.NumberFormat("en-US").format(parseInt(intPart, 10));
      val = parts.length > 1 ? `${formattedInt}.${parts[1].slice(0, 2)}` : formattedInt;
    }
    setDisplayAmount(val);
    setForm((prev) => ({ ...prev, amount: val.replace(/,/g, "") }));
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
  const formattedPreview = new Intl.NumberFormat("en-NG", { style: "currency", currency: form.currency }).format(previewAmount || 0);

  return (
    <div className="w-full space-y-6 bg-white pb-10 font-sans text-[#09090B]">
      <div>
        <Link href="/payment-links" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#71717A] transition-colors hover:text-[#09090B]">
          <ArrowLeft className="h-4 w-4" /> Back to Payment Links
        </Link>
        <h1 className="mt-4 text-[28px] font-bold tracking-[-0.025em]">Create Payment Link</h1>
        <p className="mt-1 text-[13px] text-[#71717A]">Configure the details for your hosted checkout page.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* FORM */}
        <div className="lg:col-span-7 xl:col-span-8">
          <form onSubmit={handleSubmit} className="rounded-[12px] border border-[var(--pm-line)] bg-white shadow-sm">
            {error && (
              <div className="mx-6 mt-6 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#DC2626] sm:mx-8" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-8 p-6 sm:p-8">
              {/* Section 1 */}
              <section className="space-y-5">
                <SectionTitle step={1} title="Payment details" subtitle="What the customer is paying for, and how much." />
                <Field label="Description">
                  <input required name="description" value={form.description} onChange={handleChange} placeholder="e.g. Software consultation" className={fieldCls} />
                </Field>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Amount">
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[14px] font-medium text-[#71717A]">
                        {CURRENCY_SYMBOLS[form.currency] || ""}
                      </span>
                      <input
                        required
                        inputMode="decimal"
                        type="text"
                        name="amountDisplay"
                        value={displayAmount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className={`${fieldCls} pl-8 tabular-nums`}
                      />
                    </div>
                  </Field>
                  <Field label="Currency">
                    <select name="currency" value={form.currency} onChange={handleChange} style={selectChevron} className={`${fieldCls} cursor-pointer appearance-none pr-9`}>
                      <option value="NGN">NGN (₦)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </Field>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-5">
                <SectionTitle step={2} title="Security & triggers" subtitle="Reference, customer restriction and expiry." />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Transaction reference">
                    <input required type="text" name="reference" value={form.reference} onChange={handleChange} className={`${fieldCls} font-mono text-[13px]`} />
                  </Field>
                  <Field label="Customer email" optional>
                    <input type="email" name="customer_email" value={form.customer_email} onChange={handleChange} placeholder="client@example.com" className={fieldCls} />
                  </Field>
                </div>
                <Field label="Link expiry" optional hint="If set, the checkout page becomes inaccessible after this time.">
                  <input type="datetime-local" name="expiry" min={minDateTime} value={form.expiry} onChange={handleChange} className={`${fieldCls} cursor-pointer`} />
                </Field>
              </section>
            </div>

            <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-[var(--pm-line)] bg-[var(--pm-band)] px-6 py-4 sm:flex-row sm:items-center sm:px-8">
              <Link href="/payment-links" className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[var(--pm-line)] bg-white px-4 text-[13px] font-medium text-[#52525B] shadow-sm transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-gradient-to-b from-[#27272A] to-[#09090B] px-5 text-[13px] font-semibold text-white shadow-sm ring-1 ring-black/10 transition-all hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <Spinner /> : <Plus className="h-4 w-4" />}
                {isSubmitting ? "Generating link..." : "Create payment link"}
              </button>
            </div>
          </form>
        </div>

        {/* PREVIEW */}
        <aside className="hidden lg:col-span-5 lg:block xl:col-span-4">
          <div className="sticky top-24">
            <div className="mb-3 flex items-center gap-2 text-[#71717A]">
              <Eye className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">Customer preview</span>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-[var(--pm-line)] bg-white shadow-[0_16px_40px_-16px_rgba(9,9,11,0.18)]">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#09090B] via-[#3F3F46] to-[#09090B]" />
              <div className="p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-8 place-items-center rounded-[8px] bg-gradient-to-b from-[#27272A] to-[#09090B] text-[13px] font-bold text-white">P</div>
                    <span className="text-[14px] font-semibold tracking-tight">PayMesh</span>
                  </div>
                  <span className="rounded-full border border-[var(--pm-line)] bg-[var(--pm-band)] px-2.5 py-0.5 text-[11px] font-medium text-[#71717A]">{form.currency}</span>
                </div>

                <div className="space-y-1 text-center">
                  <p className="truncate text-[13px] text-[#71717A]">{form.customer_email || "guest@example.com"}</p>
                  <h3 className="break-words text-[17px] font-semibold leading-tight">{form.description || "Payment description"}</h3>
                  <p className="break-words py-5 text-[38px] font-bold leading-none tracking-[-0.03em] tabular-nums">{formattedPreview}</p>
                  <p className="font-mono text-[11px] text-[#A1A1AA]">Ref: {form.reference ? `${form.reference.substring(0, 15)}…` : "—"}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex h-11 w-full items-center rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)] px-3.5">
                    <CreditCard className="mr-3 h-4 w-4 shrink-0 text-[#A1A1AA]" />
                    <div className="pm-skeleton h-2.5 w-32 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-11 rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)]" />
                    <div className="h-11 rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)]" />
                  </div>
                  <div className="flex h-12 w-full items-center justify-center rounded-[10px] bg-gradient-to-b from-[#27272A] to-[#09090B] shadow-sm">
                    <span className="truncate px-3 text-[14px] font-semibold text-white">Pay {formattedPreview}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center gap-1.5 text-[#A1A1AA]">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span className="text-[12px] font-medium">Secured by PayMesh</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}