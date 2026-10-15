"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";
import { api, getCsrfCookie } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

function VerifyOtpLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  
  const merchantId = searchParams.get("merchant_id");
  
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  
  const [resendStatus, setResendStatus] = useState<"idle" | "loading">("idle");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!merchantId) return;
    
    const storageKey = `otp_timer_${merchantId}`;
    const savedTime = sessionStorage.getItem(storageKey);
    
    if (savedTime) {
      const expirationTime = parseInt(savedTime, 10);
      const timeRemaining = Math.floor((expirationTime - Date.now()) / 1000);
      
      if (timeRemaining > 0) {
        setTimeout(() => setCountdown(timeRemaining), 0); 
      } else {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [merchantId]);

  useEffect(() => {
    if (countdown <= 0) return;
    
    const storageKey = `otp_timer_${merchantId}`;
    const timerId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem(storageKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [countdown, merchantId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!merchantId) {
      setError("Missing merchant identification. Please register again.");
      return;
    }

    if (code.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setStatus("loading");

    try {
      await getCsrfCookie();
      
      await api.post("/auth/email/verify-otp", {
        merchant_id: merchantId,
        code: code,
      });

      sessionStorage.removeItem("registration_draft");
      sessionStorage.removeItem(`otp_timer_${merchantId}`);
      toast.success("Email verified successfully. Welcome!");
      router.push("/login");
      
    } catch (err: unknown) {
      setStatus("idle");
      if (isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError("Too many attempts. Please wait 60 seconds before trying again.");
        } else {
          setError(err.response?.data?.message || "Invalid or expired verification code.");
        }
      } else {
        setError("An unexpected network error occurred.");
      }
    }
  }

  async function handleResend() {
    if (countdown > 0 || !merchantId) return;
    
    setResendStatus("loading");
    setError("");

    try {
      await getCsrfCookie();
      await api.post("/auth/email/resend-otp", { merchant_id: merchantId });
      
      toast.success("New secure code dispatched!");
      
      setCountdown(60);
      const expirationTime = Date.now() + 60 * 1000;
      sessionStorage.setItem(`otp_timer_${merchantId}`, expirationTime.toString());
      
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError("Too many resend attempts. Please wait 60 seconds.");
        } else {
          setError(err.response?.data?.message || "Failed to resend code.");
        }
      } else {
        setError("Network error.");
      }
    } finally {
      setResendStatus("idle");
    }
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
      <div className="rounded-[2.5rem] border border-white/10 bg-[#0d131a]/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center">
        
        {/* Subtle inner glow */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#2f9d78]/5 blur-[80px] pointer-events-none" />

        <div className="mb-8 flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-[#2f9d78]/10 border border-[#2f9d78]/20 text-[#35d5a4] shadow-inner relative z-10">
          <ShieldCheck className="h-10 w-10" />
        </div>

        <h2 className="mb-3 text-2xl sm:text-3xl font-black tracking-tight text-white relative z-10">
          Security Verification
        </h2>
        
        <p className="mb-10 text-[#8995a3] text-sm leading-relaxed relative z-10">
          We dispatched a 6-digit authorization code to your inbox. The token will expire in <span className="font-bold text-[#e8edf2]">5 minutes</span>.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
          
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              required
              className="h-20 w-full rounded-2xl border border-white/10 bg-[#05080c]/80 px-4 text-center text-4xl font-black tracking-[0.5em] text-white placeholder:text-[#68747e] outline-none transition-all focus:border-[#2f9d78] focus:bg-[#05080c] focus:ring-1 focus:ring-[#2f9d78] shadow-inner"
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium text-left animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={status === "loading" || code.length !== 6}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-linear-to-r from-[#2f9d78] to-[#1a6b50] px-6 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(47,157,120,0.4)] hover:brightness-110 disabled:opacity-50 border border-white/10"
          >
            {status === "loading" ? <Spinner /> : "Authenticate Device"}
            {status !== "loading" && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-10 flex flex-col gap-4 text-sm relative z-10 pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-2 text-[#68747e]">
            <span className="opacity-80">Missing the code?</span>
            <button 
              onClick={handleResend}
              type="button"
              disabled={countdown > 0 || resendStatus === "loading"}
              className={`font-bold transition-all flex items-center gap-1.5 ${countdown > 0 ? "text-[#68747e] cursor-not-allowed" : "text-[#79b8e8] hover:text-white"}`}
            >
              {resendStatus === "loading" ? (
                <Spinner />
              ) : countdown > 0 ? (
                `Resend available in ${countdown}s`
              ) : (
                <><RefreshCw className="h-3.5 w-3.5" /> Dispatch New Code</>
              )}
            </button>
          </div>

          <p className="text-[#68747e] flex items-center justify-center gap-2">
            Incorrect email address?{" "}
            <Link href="/register" className="font-bold text-[#e8edf2] hover:text-white transition-colors">
              Restart setup
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#05080c] relative overflow-hidden p-4 sm:p-6">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] h-125 w-125 rounded-full bg-[#3f82b2]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-125 w-125 rounded-full bg-[#2f9d78]/10 blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-[#35d5a4]">
          <Spinner />
          <p className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Initializing Security Module...</p>
        </div>
      }>
        <VerifyOtpLogic />
      </Suspense>
    </main>
  );
}