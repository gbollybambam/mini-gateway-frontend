"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { ShieldCheck, Lock } from "lucide-react";
import { Spinner, useToast } from "@/components/dashboard/ui";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Initialize CSRF protection
      await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
      
      // 2. Post to the specific Admin Auth Controller
      await api.post("/admin/login", { email, password });
      
      toast.success("Admin authenticated successfully.");
      router.push("/admin/dashboard");
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.message || "Invalid admin credentials" : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05080c] px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#35d5a4]/20 bg-[#2f9d78]/10 shadow-inner">
            <ShieldCheck className="h-8 w-8 text-[#35d5a4]" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">System Admin Portal</h2>
          <p className="mt-2 text-sm text-[#8995a3]">Restricted access. Authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#0a0f16] px-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                placeholder="admin@gateway.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e] mb-2 block">Secure Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0a0f16] pl-10 pr-4 text-sm font-medium text-white placeholder:text-[#68747e] outline-none focus:border-[#35d5a4]/50 focus:ring-1 focus:ring-[#35d5a4]/50 transition-all shadow-inner"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[#68747e]" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner /> : "Authenticate Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}