"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api, getCsrfCookie } from "@/lib/api";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "@/components/icons";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { btnPrimary, Field, inputCls } from "@/components/dashboard/kit";
import ThemeToggle from "@/components/ThemeToggle";

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
      await getCsrfCookie();

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
    <div className="flex min-h-screen flex-col bg-[#F8F8F6]">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="PayMesh home">
          <span className="grid size-8 place-items-center rounded-[8px] bg-gradient-to-b from-[#27272A] to-[#09090B] text-[13px] font-bold text-white shadow-sm ring-1 ring-black/10">
            P
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[#09090B]">PayMesh</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[12px] font-medium text-[#71717A] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to site
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
        <div className="w-full max-w-[420px]">
          <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_18px_40px_-24px_rgba(9,9,11,0.25)]">
            <div className="border-b border-[#E5E7EB] bg-[#F8F8F6] px-6 py-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white text-[#09090B] shadow-sm">
                <ShieldCheck size={24} aria-hidden="true" />
              </div>
              <h1 className="mt-4 text-[22px] font-bold tracking-[-0.025em] text-[#09090B]">
                Admin console
              </h1>
              <p className="mt-1 text-[13px] text-[#71717A]">
                Restricted access. Authorized personnel only.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 p-6">
              <Field label="Admin email">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
                    <Mail size={16} aria-hidden="true" />
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputCls} h-11 pl-10`}
                    placeholder="admin@gateway.com"
                  />
                </div>
              </Field>

              <Field label="Password">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
                    <Lock size={16} aria-hidden="true" />
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} h-11 pl-10`}
                    placeholder="••••••••"
                  />
                </div>
              </Field>

              <button type="submit" disabled={loading} className={`${btnPrimary} h-11 w-full`}>
                {loading ? <Spinner /> : "Sign in to admin"}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-center text-[12px] leading-[1.5] text-[#71717A]">
                <Lock size={12} aria-hidden="true" />
                Secured with session-based authentication.
              </p>
            </form>
          </div>

          <p className="mt-5 text-center text-[12px] text-[#A1A1AA]">
            Merchant account?{" "}
            <Link href="/login" className="font-medium text-[#52525B] underline-offset-2 hover:text-[#09090B] hover:underline">
              Go to merchant login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
