"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { api } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { KeyRound, ShieldAlert } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.get("/sanctum/csrf-cookie", { baseURL: "http://localhost:8000" });
      const response = await api.post("/auth/forgot-password", { email });
      
      setIsSent(true);
      toast.success(response.data.message);
    } catch (error) {
      const msg = isAxiosError(error) ? error.response?.data?.message : "An error occurred.";
      toast.error(msg || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-[#f7f8fa]">
      {/* Left Art Panel - Security Vibe */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-[#090d14] p-12 text-white lg:flex xl:p-20">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#2f9d78 1px, transparent 1px), radial-gradient(#2f9d78 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
          }}
        />
        
        <div className="absolute left-[-10%] -top-[10%] h-96 w-96 rounded-full bg-[#2f9d78]/20 blur-[120px]" />
        
        <div className="relative z-10 mt-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] shadow-[0_0_30px_rgba(47,157,120,0.3)] text-2xl font-black text-[#090d14]">
            P
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#e8edf2]">
            Restore your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b9f3e5] to-[#2f9d78]">infrastructure access.</span>
          </h1>
          <p className="max-w-md text-lg text-[#8995a3] leading-relaxed">
            Securely recover your merchant credentials and regain control of your payment gateway environment.
          </p>
        </div>

        <div className="relative z-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2f9d78]/20 text-[#35d5a4]">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#8995a3]">Protocol</p>
              <p className="text-lg font-bold text-[#e8edf2]">Zero-Knowledge Recovery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="relative flex w-full flex-col justify-center overflow-y-auto px-6 py-12 lg:w-[55%] xl:px-24">
        <div className="mx-auto w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="mb-10 text-center lg:text-left">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#2f9d78]">Payflow Identity</p>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#151b21]">Reset password</h2>
            <p className="text-[#68747e]">Enter your email to receive a secure recovery token.</p>
          </div>
          
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
            {isSent ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center text-emerald-600">
                <ShieldAlert className="mb-4 h-10 w-10 text-emerald-500" />
                <p className="text-sm font-medium leading-relaxed">
                  If an account exists for that email, we have dispatched a secure recovery link. Please verify your inbox and spam folder.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
                <label className="grid gap-2 text-sm font-bold text-slate-900">
                  Email address
                  <input 
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="you@business.com" 
                  />
                </label>
                
                <button 
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#090d14] px-5 text-sm font-bold text-white transition hover:bg-[#2f9d78] disabled:opacity-60" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Spinner />} {isSubmitting ? "Generating token..." : "Send recovery link"}
                </button>
              </form>
            )}
          </div>
          
          <p className="mt-8 text-center text-sm text-[#68747e]">
            Remember your credentials?{" "}
            <Link href="/login" className="font-bold text-[#2f9d78] transition-colors hover:text-[#1a6b50]">
              Return to authentication
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}