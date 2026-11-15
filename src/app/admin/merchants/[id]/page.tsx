"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { Spinner, ErrorMessage, useToast } from "@/components/dashboard/ui";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  Banknote,
  CheckCircle,
  ShieldAlert,
  Wallet,
} from "@/components/icons";
import { btnPrimary, btnSecondary, Field, inputCls } from "@/components/dashboard/kit";
import { StatusPill } from "@/components/admin/AdminUI";

interface MerchantDetails {
  merchant: {
    id: string;
    business_name: string;
    email: string;
    phone: string;
    country: string;
    status: string;
    wallets: Array<{ id: string; currency: string; available_balance: number }>;
  };
  financial_summary: {
    total_transactions: number;
    successful_payment_volume: number;
    total_withdrawn: number;
  };
}

const LINE = "border-[#E5E7EB]";
const BAND = "bg-[#F8F8F6]";

export default function MerchantDetailOperations() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToast();

  const [data, setData] = useState<MerchantDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ amount: "", direction: "CREDIT", description: "", currency: "" });
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const fetchMerchant = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/merchants/${id}`);
      setData(res.data.data);
      if (res.data.data.merchant.wallets.length > 0) {
        setAdjustForm((prev) => ({ ...prev, currency: res.data.data.merchant.wallets[0].currency }));
      }
    } catch {
      setError("Failed to load merchant details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        fetchMerchant();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [id, fetchMerchant]);

  const toggleStatus = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const res = await api.patch(`/admin/merchants/${id}/toggle-status`);
      const updatedStatus = res.data?.data?.status;

      setData((prev) =>
        prev
          ? {
              ...prev,
              merchant: { ...prev.merchant, status: updatedStatus ? updatedStatus.toUpperCase() : "ACTIVE" },
            }
          : null
      );

      toast.success(res.data.message || "Merchant status updated.");
      await fetchMerchant();
    } catch (err: unknown) {
      const message = isAxiosError(err) ? err.response?.data?.message : "Failed to change status.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAdjustError(null);

    try {
      await api.post(`/admin/merchants/${id}/adjust-balance`, adjustForm);
      toast.success("Ledger adjusted successfully.");
      setShowAdjust(false);
      setAdjustForm((prev) => ({ ...prev, amount: "", description: "" }));
      await fetchMerchant();
    } catch (err: unknown) {
      const errorMessage = isAxiosError(err)
        ? err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || "Adjustment failed."
        : "An unexpected error occurred.";

      setAdjustError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && !data)
    return (
      <div className="flex h-64 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white">
        <Spinner />
      </div>
    );
  if (error || !data) return <ErrorMessage message={error} retry={fetchMerchant} />;

  const { merchant, financial_summary: fin } = data;
  const isSuspended = merchant.status?.toUpperCase() === "SUSPENDED";
  const currency = merchant.wallets[0]?.currency || "NGN";

  const money = (value: number, code: string = currency) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(value || 0);

  return (
    <div className="space-y-6 pb-10">
      <Link
        href="/admin/merchants"
        className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#71717A] transition-colors hover:text-[#09090B]"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to merchant directory
      </Link>

      {/* Header */}
      <header className={`flex flex-col justify-between gap-4 rounded-[12px] border ${LINE} bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6`}>
        <div className="flex items-center gap-3.5">
          <span className={`grid size-11 shrink-0 place-items-center rounded-[10px] border ${LINE} ${BAND} text-[15px] font-bold text-[#52525B]`}>
            {merchant.business_name?.charAt(0)?.toUpperCase() || "M"}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-bold tracking-[-0.02em] text-[#09090B]">
              {merchant.business_name}
            </h1>
            <p className="mt-0.5 truncate text-[12px] text-[#71717A]">
              {merchant.email} · {merchant.country}
              {merchant.phone ? ` · ${merchant.phone}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusPill status={merchant.status} />
          <button
            type="button"
            onClick={toggleStatus}
            disabled={isProcessing}
            className={`inline-flex h-9 items-center gap-2 rounded-[8px] border px-3 text-[12px] font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isSuspended
                ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]"
                : "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
            }`}
          >
            {isSuspended ? (
              <>
                <CheckCircle size={15} aria-hidden="true" /> Restore access
              </>
            ) : (
              <>
                <ShieldAlert size={15} aria-hidden="true" /> Suspend merchant
              </>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Financial activity */}
        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={`rounded-[12px] border ${LINE} bg-white p-5 shadow-sm`}>
              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-flex size-9 items-center justify-center rounded-[8px] border ${LINE} ${BAND} text-[#52525B]`}>
                  <Activity size={17} aria-hidden="true" />
                </span>
                <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-medium text-[#059669]">
                  Successful
                </span>
              </div>
              <p className="text-[13px] font-medium text-[#71717A]">Success volume</p>
              <h2 className="mt-1 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#09090B] tabular-nums">
                {money(fin.successful_payment_volume)}
              </h2>
              <p className="mt-3 text-[12px] text-[#A1A1AA]">{fin.total_transactions} total transactions</p>
            </div>

            <div className={`rounded-[12px] border ${LINE} bg-white p-5 shadow-sm`}>
              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-flex size-9 items-center justify-center rounded-[8px] border ${LINE} ${BAND} text-[#52525B]`}>
                  <ArrowDownRight size={17} aria-hidden="true" />
                </span>
                <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
                  Settled
                </span>
              </div>
              <p className="text-[13px] font-medium text-[#71717A]">Total withdrawn</p>
              <h2 className="mt-1 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#09090B] tabular-nums">
                {money(fin.total_withdrawn)}
              </h2>
              <p className="mt-3 text-[12px] text-[#A1A1AA]">Lifetime payouts to the merchant</p>
            </div>
          </div>

          <section className={`overflow-hidden rounded-[12px] border ${LINE} bg-white shadow-sm`}>
            <div className={`flex items-center justify-between border-b ${LINE} ${BAND} px-5 py-4`}>
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight text-[#09090B]">Wallet balances</h2>
                <p className="mt-0.5 text-[12px] text-[#71717A]">Available funds held for this merchant.</p>
              </div>
              <Wallet size={16} className="text-[#A1A1AA]" aria-hidden="true" />
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {merchant.wallets.length === 0 && (
                <p className="px-5 py-10 text-center text-[13px] text-[#71717A]">No wallets provisioned yet.</p>
              )}
              {merchant.wallets.map((w) => (
                <div key={w.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className={`grid size-10 place-items-center rounded-[9px] border ${LINE} ${BAND} text-[#52525B]`}>
                      <Wallet size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[12px] font-medium text-[#71717A]">{w.currency} wallet</p>
                      <p className="mt-0.5 text-[19px] font-bold tracking-[-0.02em] text-[#09090B] tabular-nums">
                        {money(w.available_balance, w.currency)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustForm((prev) => ({ ...prev, currency: w.currency }));
                      setShowAdjust(true);
                      setAdjustError(null);
                    }}
                    className={`${btnSecondary} h-9 px-3 text-[12px]`}
                  >
                    Adjust balance
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Adjustment panel */}
        <div className="lg:col-span-1">
          {showAdjust ? (
            <form
              onSubmit={submitAdjustment}
              className={`overflow-hidden rounded-[12px] border ${LINE} bg-white shadow-sm`}
            >
              <div className={`flex items-center gap-2 border-b ${LINE} ${BAND} px-5 py-4`}>
                <span className={`grid size-8 place-items-center rounded-[8px] border ${LINE} bg-white text-[#B45309]`}>
                  <Banknote size={16} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[14px] font-semibold tracking-tight text-[#09090B]">Manual adjustment</h3>
                  <p className="text-[11px] text-[#71717A]">This action is written to the audit log.</p>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {adjustError && (
                  <div className="flex items-start gap-2 rounded-[9px] border border-[#FECACA] bg-[#FEF2F2] p-3 text-[#DC2626]">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-[12px] font-medium leading-relaxed">{adjustError}</p>
                  </div>
                )}

                <Field label="Direction">
                  <select
                    value={adjustForm.direction}
                    onChange={(e) => setAdjustForm((prev) => ({ ...prev, direction: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="CREDIT">Credit (add funds)</option>
                    <option value="DEBIT">Debit (remove funds)</option>
                  </select>
                </Field>

                <Field label={`Amount (${adjustForm.currency || currency})`}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="99999999"
                    required
                    value={adjustForm.amount}
                    onChange={(e) => setAdjustForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className={inputCls}
                    placeholder="0.00"
                  />
                </Field>

                <Field label="Audit description">
                  <textarea
                    required
                    maxLength={255}
                    rows={3}
                    value={adjustForm.description}
                    onChange={(e) => setAdjustForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full resize-none rounded-[10px] border border-[#E5E7EB] bg-white p-3 text-[13px] text-[#09090B] shadow-[0_1px_2px_rgba(9,9,11,0.04)] outline-none transition-all placeholder:text-[#A1A1AA] hover:border-[#D4D4D8] focus:border-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(9,9,11,0.06)]"
                    placeholder="Reason for adjustment…"
                  />
                </Field>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdjust(false)}
                    className={`${btnSecondary} flex-1`}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isProcessing} className={`${btnPrimary} flex-1`}>
                    {isProcessing ? <Spinner /> : "Commit entry"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className={`rounded-[12px] border ${LINE} bg-white p-5 shadow-sm`}>
              <div className={`mb-3 inline-flex size-9 items-center justify-center rounded-[8px] border ${LINE} ${BAND} text-[#52525B]`}>
                <Banknote size={17} aria-hidden="true" />
              </div>
              <h3 className="text-[14px] font-semibold tracking-tight text-[#09090B]">Ledger adjustments</h3>
              <p className="mt-1 text-[12px] leading-[1.6] text-[#71717A]">
                Credit or debit a merchant wallet manually. Every entry is recorded in the system audit
                trail with your admin ID.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowAdjust(true);
                  setAdjustError(null);
                }}
                className={`${btnSecondary} mt-4 w-full`}
              >
                <Banknote size={14} aria-hidden="true" /> New adjustment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
