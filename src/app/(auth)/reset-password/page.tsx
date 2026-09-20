"use client";

import { useState, Suspense } from "react";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  
  // Directly pull params safely within the Suspense boundary
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.get("/sanctum/csrf-cookie", { baseURL: "http://localhost:8000" });
      await api.post("/auth/reset-password", {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      toast.success("Identity verified. Password updated successfully.");
      router.push("/login");
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : "Failed to reset password.";
      setError(msg || "Cryptographic verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Graceful fallback UI if tokens are missing from the URL
  if (!token || !email) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <ShieldAlert className="mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-bold text-red-600">Missing Security Token</h3>
        <p className="mb-6 text-sm font-medium text-red-500/80">
          We could not verify your recovery session. The link may have expired or is missing parameters.
        </p>
        <Link 
          href="/forgot-password" 
          className="flex h-12 items-center justify-center rounded-xl bg-red-500 px-6 text-sm font-bold text-white transition-colors hover:bg-red-600"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="grid gap-2 text-sm font-bold text-slate-900">
        New Password
        <input 
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" 
          type="password" 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </label>
      
      <label className="grid gap-2 text-sm font-bold text-slate-900">
        Confirm New Password
        <input 
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" 
          type="password" 
          required 
          value={passwordConfirmation} 
          onChange={(e) => setPasswordConfirmation(e.target.value)} 
        />
      </label>
      
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}
      
      <button 
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#090d14] px-5 text-sm font-bold text-white transition hover:bg-[#2f9d78] disabled:opacity-60" 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting && <Spinner />} {isSubmitting ? "Encrypting..." : "Update security credentials"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen w-full bg-[#f7f8fa]">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-[#090d14] p-12 text-white lg:flex xl:p-20">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="absolute h-[500px] w-[500px] animate-[spin_40s_linear_infinite] rounded-full border border-[#3f82b2]/40 border-dashed" />
        </div>
        <div className="absolute -bottom-[10%] -right-[10%] h-96 w-96 rounded-full bg-[#3f82b2]/20 blur-[130px]" />

        <div className="relative z-10 mt-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] shadow-[0_0_30px_rgba(47,157,120,0.3)] text-2xl font-black text-[#090d14]">
            P
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#e8edf2]">
            Establish new <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b9f3e5] to-[#2f9d78]">cryptographic keys.</span>
          </h1>
          <p className="max-w-md text-lg text-[#8995a3] leading-relaxed">
            Finalize your identity verification to rotate your authentication parameters.
          </p>
        </div>

        <div className="relative z-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3f82b2]/20 text-[#79b8e8]">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#8995a3]">Security Check</p>
                <p className="text-lg font-bold text-[#e8edf2]">Token Validated</p>
              </div>
            </div>
            <div className="h-[1px] w-full bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2f9d78]/20 text-[#35d5a4]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#8995a3]">Session Action</p>
                <p className="text-lg font-bold text-[#e8edf2]">Revoke old tokens</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col justify-center overflow-y-auto px-6 py-12 lg:w-[55%] xl:px-24">
        <div className="mx-auto w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="mb-10 text-center lg:text-left">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#2f9d78]">Payflow Identity</p>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#151b21]">Secure your account</h2>
            <p className="text-[#68747e]">Define a new authentication password for your merchant profile.</p>
          </div>
          
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
            <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
              <ResetPasswordFormContent />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}