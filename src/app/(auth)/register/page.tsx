import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { Cpu, Network } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen w-full bg-[#f7f8fa]">
      {/* Left Art Panel */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-[#090d14] p-12 text-white lg:flex xl:p-20">
        {/* Animated Radial Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="absolute h-[600px] w-[600px] animate-[spin_60s_linear_infinite] rounded-full border border-[#2f9d78]/40 border-dashed" />
          <div className="absolute h-[400px] w-[400px] animate-[spin_40s_linear_infinite_reverse] rounded-full border border-[#3f82b2]/40 border-dotted" />
        </div>

        <div className="absolute -left-[10%] -top-[10%] h-96 w-96 rounded-full bg-[#2f9d78]/20 blur-[100px]" />
        
        {/* Hero Content */}
        <div className="relative z-10 mt-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] shadow-[0_0_30px_rgba(47,157,120,0.3)] text-2xl font-black text-[#090d14]">
            P
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#e8edf2]">
            Build on top of <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b9f3e5] to-[#2f9d78]">solid architecture.</span>
          </h1>
          <p className="max-w-md text-lg text-[#8995a3] leading-relaxed">
            Deploy your payment flows instantly. We handle the webhooks, retries, and ledger reconciliation.
          </p>
        </div>

        {/* Glassmorphism Metric Card */}
        <div className="relative z-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2f9d78]/20 text-[#35d5a4]">
                <Network className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#8995a3]">
                  High Availability
                </p>
                <p className="text-lg font-bold text-[#e8edf2]">99.99% Uptime SLA</p>
              </div>
            </div>
            <div className="h-[1px] w-full bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3f82b2]/20 text-[#79b8e8]">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#8995a3]">
                  Idempotent API
                </p>
                <p className="text-lg font-bold text-[#e8edf2]">Zero double-charges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="relative flex w-full flex-col justify-center overflow-y-auto px-6 py-12 lg:w-[55%] xl:px-24">
        <div className="mx-auto w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="mb-10 text-center lg:text-left">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#2f9d78]">
              Payflow Merchant Console
            </p>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#151b21]">Create your account</h2>
            <p className="text-[#68747e]">Set up your merchant profile and initialize your sandbox environment.</p>
          </div>
          
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
            <AuthForm mode="register" />
          </div>
          
          <p className="mt-8 text-center text-sm text-[#68747e]">
            Already deployed?{" "}
            <Link href="/login" className="font-bold text-[#2f9d78] transition-colors hover:text-[#1a6b50]">
              Sign in to your console
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}