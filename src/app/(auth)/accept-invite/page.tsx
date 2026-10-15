"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api, getCsrfCookie } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

function AcceptInviteLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (!token || !email) {
      setError("Missing invitation credentials. Please request a new invite.");
      return;
    }

    setStatus("loading");

    try {
      await getCsrfCookie();
      
      await api.post("/auth/team/accept-invite", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Account activated successfully! Please log in.");
      router.push("/login");
      
    } catch (err: unknown) {
      setStatus("idle");
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to activate account. The link may have expired.");
      } else {
        setError("An unexpected network error occurred.");
      }
    }
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
      <div className="rounded-[2.5rem] border border-white/10 bg-[#0d131a]/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center">
        
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#2f9d78]/5 blur-[80px] pointer-events-none" />

        <div className="mb-8 flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-[#2f9d78]/10 border border-[#2f9d78]/20 text-[#35d5a4] shadow-inner relative z-10">
          <ShieldCheck className="h-10 w-10" />
        </div>

        <h2 className="mb-3 text-2xl sm:text-3xl font-black tracking-tight text-white relative z-10">
          Set Your Password
        </h2>
        
        <p className="mb-8 text-[#8995a3] text-sm leading-relaxed relative z-10">
          You have been invited to collaborate on <span className="font-bold text-[#e8edf2]">{email}</span>. Create a secure password to activate your account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10 text-left">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#05080c]/80 px-4 text-sm text-white outline-none focus:border-[#2f9d78] shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#68747e]">Confirm Password</label>
            <input
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#05080c]/80 px-4 text-sm text-white outline-none focus:border-[#2f9d78] shadow-inner"
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium text-left">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={status === "loading" || !password || !passwordConfirmation}
            className="mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2f9d78] to-[#1a6b50] px-6 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 disabled:opacity-50 border border-white/10"
          >
            {status === "loading" ? <Spinner /> : "Activate Account & Continue"}
            {status !== "loading" && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#05080c] relative overflow-hidden p-4 sm:p-6">
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#3f82b2]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#2f9d78]/10 blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-[#35d5a4]">
          <Spinner />
          <p className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Loading Invitation...</p>
        </div>
      }>
        <AcceptInviteLogic />
      </Suspense>
    </main>
  );
}