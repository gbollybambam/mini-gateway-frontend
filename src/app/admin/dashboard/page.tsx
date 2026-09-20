"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import { 
  Users, Activity, TrendingUp, ArrowDownRight, 
  ShieldCheck, ListOrdered, ServerCrash, ChevronRight,
  Clock, CheckCircle2, XCircle, Wallet, ArrowUpRight, LogOut
} from "lucide-react";
import { Spinner, ErrorMessage } from "@/components/dashboard/ui";

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

const formatCurrency = (amount: number, currency: string = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export default function AdminDashboardPage() {
  const router = useRouter();
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

  const handleLogout = () => {
    // Clear admin authentication tokens (adjust key name if your app uses a different one)
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token"); 
    sessionStorage.clear();
    
    // Redirect to admin login
    router.push("/admin/login");
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-[#35d5a4] bg-[#2f9d78]/10 px-6 py-3 rounded-full border border-[#2f9d78]/20 font-medium text-sm shadow-[0_0_20px_rgba(47,157,120,0.15)]">
          <Spinner /> Compiling platform data...
        </div>
      </div>
    );
  }

  if (error && !data) {
    return <ErrorMessage message={error} retry={fetchDashboard} />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Platform Operations</p>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm mt-1">Admin Command Center</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#35d5a4]/10 px-4 py-2 text-sm text-[#35d5a4] backdrop-blur-md shadow-inner">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-bold tracking-wide">System Health: Optimal</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      {/* Top Level Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#35d5a4]/5 blur-2xl group-hover:bg-[#35d5a4]/10 transition-colors" />
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f9d78]/10 border border-[#2f9d78]/20 text-[#35d5a4]">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Gross Payment Vol.</p>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight truncate">
            {formatCurrency(data?.metrics.total_payment_volume || 0)}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Platform Revenue</p>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight truncate">
            {formatCurrency(data?.metrics.total_revenue_collected || 0)}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Total Payouts</p>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight truncate">
            {formatCurrency(data?.metrics.total_withdrawals_volume || 0)}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Active Merchants</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {data?.metrics.active_merchants || 0}
            </h2>
            <span className="text-xs font-medium text-[#68747e]">/ {data?.metrics.total_merchants || 0} total</span>
          </div>
        </div>

      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Actions & Quick Links */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Action Required: Withdrawals */}
          <div className="rounded-3xl border border-amber-500/20 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
            
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" /> Action Required
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-[#8995a3] mt-1">Pending Withdrawals</p>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                {data?.action_required.length || 0}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {data?.action_required.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-3">
                    <CheckCircle2 className="h-6 w-6 text-[#68747e]" />
                  </div>
                  <p className="text-sm font-medium text-[#8995a3]">Inbox Zero.</p>
                  <p className="text-xs text-[#68747e] mt-1">All payout requests processed.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {data?.action_required.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">{formatCurrency(withdrawal.amount, withdrawal.currency)}</p>
                          <p className="text-[10px] text-[#68747e] mt-0.5">ID: {withdrawal.id.substring(0,8)}...</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                          {withdrawal.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] text-[#8995a3]">{formatDate(withdrawal.created_at)}</span>
                        <Link 
                          href={`/admin/withdrawals/${withdrawal.id}`}
                          className="text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                        >
                          Review <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <Link href="/admin/withdrawals" className="block w-full text-center text-xs font-bold text-[#8995a3] hover:text-white transition-colors">
                View All Withdrawals
              </Link>
            </div>
          </div>

          {/* Quick Links Navigation Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/merchants" className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-xl bg-white/5 text-[#8995a3] group-hover:text-white transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <p className="font-bold text-xs text-[#e8edf2]">Merchants</p>
            </Link>
            <Link href="/admin/providers" className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-xl bg-white/5 text-[#8995a3] group-hover:text-white transition-colors">
                <ServerCrash className="h-5 w-5" />
              </div>
              <p className="font-bold text-xs text-[#e8edf2]">Providers</p>
            </Link>
            <Link href="/admin/audit-logs" className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-xl bg-white/5 text-[#8995a3] group-hover:text-white transition-colors">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="font-bold text-xs text-[#e8edf2]">Audit Logs</p>
            </Link>
            <Link href="/admin/transactions" className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-xl bg-white/5 text-[#8995a3] group-hover:text-white transition-colors">
                <ListOrdered className="h-5 w-5" />
              </div>
              <p className="font-bold text-xs text-[#e8edf2]">Global Ledger</p>
            </Link>
          </div>

        </div>

        {/* Right Col: Live Ledger */}
        <div className="xl:col-span-2 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#e8edf2] shadow-inner">
                <ListOrdered className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Live Ledger</h2>
                <p className="text-[10px] uppercase tracking-widest text-[#8995a3] mt-0.5">Recent Transactions</p>
              </div>
            </div>
            <Link href="/admin/transactions" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#68747e] hover:text-white transition-colors">
              View Database <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.01] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Reference</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Provider</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8995a3] text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recent_transactions.map((tx) => {
                  const isSuccess = tx.status === "SUCCESS";
                  const isPending = tx.status === "PENDING" || tx.status === "PROCESSING" || tx.status === "INITIALIZED";
                  
                  return (
                    <tr key={tx.id} className="transition-colors hover:bg-white/[0.04] group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#e8edf2] group-hover:text-white transition-colors">{tx.reference}</p>
                        <p className="text-[10px] text-[#68747e] mt-0.5 font-mono">{tx.id.substring(0,8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-bold tracking-tight ${isSuccess ? "text-[#35d5a4]" : "text-[#e8edf2]"}`}>
                          {formatCurrency(tx.amount, tx.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold capitalize text-[#8995a3]">
                          {tx.provider || 'Gateway'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                          ${isSuccess ? "bg-[#2f9d78]/10 text-[#35d5a4] border border-[#2f9d78]/20" : 
                            isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                            "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-[#8995a3] text-xs">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  )
                })}
                {data?.recent_transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#68747e]">
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