import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { ShieldCheck, Activity } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-[#f7f8fa]">
      {/* Left Art Panel - Architect Vibe */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#090d14] p-12 text-white lg:flex xl:p-20">
        {/* Animated Tech Grid Background */}
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#2f9d78 1px, transparent 1px), radial-gradient(#2f9d78 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
          }}
        />
        
        {/* Ambient Glowing Glassmorphism Blobs */}
        <div className="absolute left-[-10%] -top-[10%] h-96 w-96 rounded-full bg-[#2f9d78]/30 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-96 w-96 rounded-full bg-[#3f82b2]/20 blur-[130px]" />

        {/* Hero Content */}
        <div className="relative z-10 mt-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] shadow-[0_0_30px_rgba(47,157,120,0.3)] text-2xl font-black text-[#090d14]">
            P
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#e8edf2]">
            Move money with <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b9f3e5] to-[#2f9d78]">absolute clarity.</span>
          </h1>
          <p className="max-w-md text-lg text-[#8995a3] leading-relaxed">
            A secure command center for payments, API keys, webhook logs, and the architecture behind them.
          </p>
        </div>

        {/* Glassmorphism Status Cards */}
        <div className="relative z-10 flex gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <div className="max-w-[240px] rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2f9d78]/20 text-[#35d5a4]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#8995a3] uppercase tracking-wider">Gateway Status</p>
                <p className="text-sm font-bold text-[#e8edf2] flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35d5a4] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35d5a4]"></span>
                  </span>
                  Operational
                </p>
              </div>
            </div>
          </div>
          
          <div className="max-w-[240px] rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3f82b2]/20 text-[#79b8e8]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#8995a3] uppercase tracking-wider">API Latency</p>
                <p className="text-sm font-bold text-[#e8edf2]">~42ms response</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="relative flex w-full flex-col justify-center px-6 lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="mb-10 text-center lg:text-left">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#2f9d78]">
              Payflow Merchant Console
            </p>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#151b21]">Welcome back</h2>
            <p className="text-[#68747e]">Authenticate to access your payment infrastructure.</p>
          </div>
          
          <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
            <AuthForm mode="login" />
          </div>
          
          <p className="mt-8 text-center text-sm text-[#68747e]">
            New to Payflow?{" "}
            <Link href="/register" className="font-bold text-[#2f9d78] transition-colors hover:text-[#1a6b50]">
              Provision an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}