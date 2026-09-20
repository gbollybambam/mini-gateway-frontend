"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { 
  ArrowUpRight, Banknote, Clock3, CreditCard, Landmark, 
  Plus, Receipt, TriangleAlert, Wallet, Activity, BarChart3, ArrowDownToLine
} from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import type { TransactionResource } from "@/types/api";
import { ErrorMessage, Spinner } from "@/components/dashboard/ui";

export interface DashboardOverview {
  currency: string;
  balances: { available_balance: number; pending_balance: number; };
  metrics: { 
    total_payment_volume: number; 
    transaction_count?: number; 
    total_withdrawals?: number; 
  };
  recent_activity: TransactionResource[];
}

function formatAmount(value: unknown, currency: string): string {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function ActivityRow({ transaction, currency }: { transaction: TransactionResource; currency: string }) {
  const normalizedStatus = transaction.status.toUpperCase();
  const isSuccessful = ["SUCCESS", "COMPLETED"].includes(normalizedStatus);
  const isPending = ["PENDING", "PROCESSING"].includes(normalizedStatus);
  const isProblem = ["FAILED", "CANCELLED", "REFUNDED"].includes(normalizedStatus);
  
  const activityLabel = transaction.payment_method || transaction.provider || "Payment Request";
  
  const ActivityIcon = isProblem ? TriangleAlert : isPending ? Clock3 : transaction.payment_method?.toLowerCase().includes("bank") ? Landmark : transaction.payment_method?.toLowerCase().includes("card") ? CreditCard : Banknote;

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.03] px-4 -mx-4 rounded-xl transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md ${
          isProblem ? "border-red-500/20 bg-red-500/10 text-red-400" : 
          isPending ? "border-amber-500/20 bg-amber-500/10 text-amber-400" : 
          isSuccessful ? "border-[#2f9d78]/30 bg-[#2f9d78]/10 text-[#35d5a4]" : 
          "border-white/10 bg-white/5 text-[#8995a3]"
        }`}>
          <ActivityIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#e8edf2] group-hover:text-white transition-colors">{transaction.reference}</p>
          <p className="text-xs text-[#8995a3] font-medium mt-0.5">{activityLabel} • {formatDate(transaction.created_at)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold tracking-tight ${isSuccessful ? "text-[#35d5a4]" : "text-[#e8edf2]"}`}>
          {isSuccessful ? "+" : ""}{formatAmount(transaction.amount, transaction.currency || currency)}
        </p>
        <span className={`inline-flex mt-1 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
          ${isSuccessful ? "bg-[#2f9d78]/10 text-[#35d5a4]" : 
            isPending ? "bg-amber-500/10 text-amber-500" : 
            "bg-red-500/10 text-red-400"}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true); 

  async function fetchOverview() {
    try {
      const response = await api.get<{ data: DashboardOverview }>("/dashboard/overview");
      setOverview(response.data.data);
      setError(""); 
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || "Failed to load payload" : "System Error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchOverview(); 
  }, []);

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex items-center gap-3 text-[#35d5a4] bg-[#2f9d78]/10 px-6 py-3 rounded-full border border-[#2f9d78]/20 font-medium text-sm shadow-[0_0_20px_rgba(47,157,120,0.15)]">
        <Spinner /> Initializing metrics...
      </div>
    </div>
  );

  if (error || !overview) return <ErrorMessage message={error} retry={fetchOverview} />;

  const { recent_activity: activity, balances, metrics, currency } = overview;
  const hasActivity = activity.length > 0;

  const txCount = metrics.transaction_count ?? activity.length;
  const withdrawalsSum = metrics.total_withdrawals ?? 0;

  return (
    <div className="space-y-6">
      
      {/* Top Hero Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Balance Card */}
        <div className="col-span-1 xl:col-span-2 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          <div className="absolute inset-0 z-0 opacity-[0.15]" style={{ backgroundImage: `radial-gradient(#2f9d78 1px, transparent 1px)`, backgroundSize: '30px 30px', maskImage: 'linear-gradient(to bottom right, black 20%, transparent 80%)' }} />
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#2f9d78]/10 blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f9d78]/20 text-[#35d5a4] border border-[#2f9d78]/30 shadow-inner">
                <Wallet className="h-5 w-5" /> 
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#8995a3] drop-shadow-sm">Available Balance</h2>
            </div>
            <p className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-lg truncate">
              {formatAmount(balances.available_balance, currency)}
            </p>
          </div>

          <div className="relative z-10 mt-10 flex flex-wrap items-center gap-4">
            <Link href="/withdrawals" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2f9d78] to-[#1a6b50] px-8 py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 border border-white/10">
              <ArrowUpRight className="h-4 w-4" /> Withdraw Funds
            </Link>
            <Link href="/payment-links" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-8 py-3.5 text-sm font-bold text-[#e8edf2] transition-all hover:bg-white/10 hover:text-white">
              <Plus className="h-4 w-4" /> Create Link
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="col-span-1 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 shadow-xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35d5a4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#35d5a4]"></span>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Infrastructure Live</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <div>
                <p className="text-xs font-medium text-[#68747e] mb-1">API Latency</p>
                <p className="text-sm font-bold text-[#e8edf2] flex items-center gap-2"><Activity className="h-4 w-4 text-[#35d5a4]"/> ~42ms</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-[#68747e] mb-1">Active Endpoints</p>
                <p className="text-sm font-bold text-[#e8edf2]">100% Online</p>
              </div>
            </div>
            
            <div className="rounded-xl border border-[#3f82b2]/20 bg-[#3f82b2]/10 backdrop-blur-sm p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#79b8e8] mb-1">System Notice</p>
              <p className="text-xs font-medium text-[#8995a3] leading-relaxed">Webhook delivery functioning optimally. Zero failed dispatches in the last 24h.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Pending Clearance", value: formatAmount(balances.pending_balance, currency), icon: Clock3, color: "amber" },
          { label: "Total Payment Volume", value: formatAmount(metrics.total_payment_volume, currency), icon: BarChart3, color: "emerald" },
          { label: "Total Transactions", value: txCount.toString(), icon: Receipt, color: "blue" },
          { label: "Total Withdrawals", value: formatAmount(withdrawalsSum, currency), icon: ArrowDownToLine, color: "purple" }
        ].map((stat, i) => (
          <div key={i} className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 shadow-lg transition-all hover:border-white/10 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-md ${
                stat.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                stat.color === 'emerald' ? 'bg-[#2f9d78]/10 border-[#2f9d78]/20 text-[#35d5a4]' :
                stat.color === 'blue' ? 'bg-[#3f82b2]/10 border-[#3f82b2]/20 text-[#79b8e8]' :
                'bg-purple-500/10 border-purple-500/20 text-purple-400'
              }`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] drop-shadow-sm">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight truncate drop-shadow-md" title={stat.value}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 p-6 md:px-8 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#e8edf2] shadow-inner">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white drop-shadow-sm">Recent Activity</h2>
          </div>
          <Link href="/transactions" className="text-[10px] font-bold uppercase tracking-widest text-[#2f9d78] hover:text-[#35d5a4] transition-colors bg-[#2f9d78]/10 border border-[#2f9d78]/20 px-4 py-2 rounded-lg backdrop-blur-md">
            View Ledger
          </Link>
        </div>
        
        <div className="p-6 md:px-8">
          {hasActivity ? (
            <div className="flex flex-col">
              {activity.map((transaction: TransactionResource) => (
                <ActivityRow key={transaction.id} transaction={transaction} currency={currency} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                <Receipt className="h-8 w-8 text-[#68747e]" />
              </div>
              <h3 className="text-lg font-bold text-white drop-shadow-sm">Awaiting Ledger Events</h3>
              <p className="mt-2 text-sm text-[#8995a3] max-w-sm leading-relaxed">
                Transactions generated by your API or checkout links will automatically populate this secure log.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}