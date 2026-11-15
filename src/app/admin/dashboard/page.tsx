"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  ListOrdered,
  Server,
  ShieldCheck,
  TrendingUp,
  Users,
} from "@/components/icons";
import { ErrorMessage } from "@/components/dashboard/ui";
import { PageHeader, SectionHead } from "@/components/dashboard/kit";

interface DashboardData {
  metrics: {
    total_merchants: number;
    active_merchants: number;
    total_payment_volume: number;
    total_revenue_collected: number;
    total_withdrawals_volume: number;
  };
  action_required: Array<{
    id: string;
    merchant_id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
  recent_transactions: Array<{
    id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    created_at: string;
  }>;
}

const LINE = "border-[#E5E7EB]";
const DIVIDE = "divide-[#E5E7EB]";
const BAND = "bg-[#F8F8F6]";

const formatCurrency = (amount: number, currency: string = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

const isSuccess = (status: string) => status?.toUpperCase() === "SUCCESS";
const isPending = (status: string) =>
  ["PENDING", "PROCESSING", "INITIALIZED", "REQUESTED"].includes(status?.toUpperCase());

function StatusPill({ status }: { status: string }) {
  const cls = isSuccess(status)
    ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#047857]"
    : isPending(status)
      ? "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
      : "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  tag,
  tagClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tag: string;
  tagClass: string;
}) {
  return (
    <div className={`group flex flex-col justify-between rounded-[12px] border ${LINE} bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-[0_8px_24px_-12px_rgba(9,9,11,0.12)]`}>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className={`inline-flex size-9 items-center justify-center rounded-[8px] border ${LINE} ${BAND} text-[#52525B] transition-colors group-hover:border-[#09090B] group-hover:bg-[#09090B] group-hover:text-white`}>
            {icon}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tagClass}`}>{tag}</span>
        </div>
        <p className="mb-1 text-[13px] font-medium text-[#71717A]">{label}</p>
        <h2 className="text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#09090B] tabular-nums">{value}</h2>
      </div>
      {hint && <p className="mt-3 text-[12px] leading-[1.6] text-[#A1A1AA]">{hint}</p>}
    </div>
  );
}

const QUICK_LINKS = [
  { label: "Merchants", detail: "Accounts & access", href: "/admin/merchants", icon: Users },
  { label: "Global ledger", detail: "All transactions", href: "/admin/transactions", icon: ListOrdered },
  { label: "Providers", detail: "Routing & config", href: "/admin/providers", icon: Server },
  { label: "Audit logs", detail: "Security trail", href: "/admin/audit-logs", icon: ShieldCheck },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/dashboard");
      setData(response.data.data);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load admin metrics.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[#F1F1EE]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-40 animate-pulse rounded-[12px] border ${LINE} ${BAND}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className={`h-80 animate-pulse rounded-[12px] border ${LINE} ${BAND}`} />
          <div className={`h-80 animate-pulse rounded-[12px] border ${LINE} ${BAND} xl:col-span-2`} />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return <ErrorMessage message={error} retry={fetchDashboard} />;
  }

  const metrics = data?.metrics;
  const pending = data?.action_required ?? [];
  const recent = data?.recent_transactions ?? [];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        eyebrow="Platform operations"
        title="Admin dashboard"
        description="Monitor merchants, payment volume and the health of the platform."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-[8px] border border-[#BBF7D0] bg-[#ECFDF5] px-3 py-2 text-[12px] font-medium text-[#047857]">
              <span className="size-1.5 rounded-full bg-[#10B981]" />
              System health: optimal
            </span>
            <Link
              href="/admin/transactions"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-semibold text-[#09090B] shadow-sm transition-colors hover:bg-[#F8F8F6]"
            >
              <ListOrdered size={14} aria-hidden="true" />
              Open ledger
            </Link>
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Activity size={18} />}
          label="Gross payment volume"
          value={formatCurrency(metrics?.total_payment_volume || 0)}
          hint="Total successful value processed across all merchants."
          tag="All time"
          tagClass="bg-[#ECFDF5] text-[#059669]"
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Platform revenue"
          value={formatCurrency(metrics?.total_revenue_collected || 0)}
          hint="Fees collected by the gateway on processed payments."
          tag="Collected"
          tagClass="bg-[#EFF6FF] text-[#2563EB]"
        />
        <MetricCard
          icon={<ArrowDownRight size={18} />}
          label="Total payouts"
          value={formatCurrency(metrics?.total_withdrawals_volume || 0)}
          hint="Withdrawals settled to merchant bank accounts."
          tag="Settled"
          tagClass="bg-[#F5F3FF] text-[#6D28D9]"
        />
        <MetricCard
          icon={<Users size={18} />}
          label="Active merchants"
          value={new Intl.NumberFormat("en-NG").format(metrics?.active_merchants || 0)}
          hint={`${metrics?.total_merchants || 0} merchant accounts registered in total.`}
          tag="Accounts"
          tagClass="bg-[#FFFBEB] text-[#B45309]"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 xl:col-span-1">
          {/* Action required */}
          <div className={`flex flex-col overflow-hidden rounded-[12px] border ${LINE} bg-white shadow-sm`}>
            <SectionHead
              icon={<Clock size={16} />}
              title="Action required"
              subtitle="Pending payout requests"
              right={
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2 text-[11px] font-bold text-[#B45309]">
                  {pending.length}
                </span>
              }
            />

            <div className="flex-1">
              {pending.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className={`mx-auto mb-3 flex size-11 items-center justify-center rounded-full border ${LINE} ${BAND}`}>
                    <CheckCircle2 size={20} className="text-[#A1A1AA]" aria-hidden="true" />
                  </div>
                  <p className="text-[13px] font-medium text-[#09090B]">All caught up</p>
                  <p className="mt-1 text-[12px] text-[#71717A]">Every payout request has been processed.</p>
                </div>
              ) : (
                <ul className={`divide-y ${DIVIDE}`}>
                  {pending.slice(0, 4).map((withdrawal) => (
                    <li key={withdrawal.id} className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#FAFAF9]">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#09090B]">
                          {formatCurrency(withdrawal.amount, withdrawal.currency)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#A1A1AA]">
                          {formatDate(withdrawal.created_at)} · {withdrawal.id.substring(0, 8)}
                        </p>
                      </div>
                      <StatusPill status={withdrawal.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`border-t ${LINE} px-5 py-3`}>
              <Link
                href="/admin/withdrawals"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#52525B] transition-colors hover:text-[#09090B]"
              >
                View all withdrawals
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex flex-col gap-3 rounded-[12px] border ${LINE} bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-[0_8px_24px_-12px_rgba(9,9,11,0.12)]`}
              >
                <span className={`inline-flex size-8 items-center justify-center rounded-[8px] border ${LINE} ${BAND} text-[#52525B] transition-colors group-hover:border-[#09090B] group-hover:bg-[#09090B] group-hover:text-white`}>
                  <link.icon size={16} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[12px] font-semibold text-[#09090B]">{link.label}</span>
                  <span className="mt-0.5 block text-[11px] text-[#A1A1AA]">{link.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Live ledger */}
        <div className={`flex flex-col overflow-hidden rounded-[12px] border ${LINE} bg-white shadow-sm xl:col-span-2`}>
          <SectionHead
            icon={<ListOrdered size={16} />}
            title="Live ledger"
            subtitle="Recent platform transactions"
            right={
              <Link
                href="/admin/transactions"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#52525B] transition-colors hover:text-[#09090B]"
              >
                View database
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            }
          />

          <div className="flex-1 overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-[13px]">
              <thead className={`border-b ${LINE} ${BAND}`}>
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Reference</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Amount</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Provider</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Time</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${DIVIDE}`}>
                {recent.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-[#FAFAF9]">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#09090B]">{tx.reference}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#A1A1AA]">{tx.id.substring(0, 8)}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums text-[#09090B]">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-[6px] border border-[#E5E7EB] bg-[#F8F8F6] px-2 py-1 text-[11px] font-medium capitalize text-[#52525B]">
                        {tx.provider || "Gateway"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={tx.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-[12px] text-[#71717A]">
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-[13px] text-[#71717A]">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
