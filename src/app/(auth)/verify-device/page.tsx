"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";
import { api, getCsrfCookie } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { AuthShell, AuthHeading, OtpInput, ResendRow, SubmitButton, FormAlert, authLink, authFormCls } from "@/components/auth/ui";

function VerifyDeviceForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const challenge = searchParams.get("challenge");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!challenge) return;
    const key = `device_otp_timer_${challenge}`;
    const saved = sessionStorage.getItem(key);
    if (!saved) return;
    const remaining = Math.floor((parseInt(saved, 10) - Date.now()) / 1000);
    if (remaining > 0) setTimeout(() => setCountdown(remaining), 0);
    else sessionStorage.removeItem(key);
  }, [challenge]);

  useEffect(() => {
    if (countdown <= 0) return;
    const key = `device_otp_timer_${challenge}`;
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { sessionStorage.removeItem(key); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [countdown, challenge]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!challenge) { setError("Your session expired. Please sign in again."); return; }
    if (code.length !== 6) { setError("Enter all 6 digits."); return; }
    setLoading(true);
    try {
      await getCsrfCookie();
      await api.post("/auth/device/verify", { challenge, code });
      toast.success("Device verified. Welcome back!");
      router.push("/overview");
    } catch (err: unknown) {
      setLoading(false);
      if (isAxiosError(err)) {
        setError(err.response?.status === 429 ? "Too many attempts. Wait 60 seconds and try again." : err.response?.data?.message || "That code is wrong or has expired.");
      } else setError("Network error. Check your connection and try again.");
    }
  }

  async function handleResend() {
    if (countdown > 0 || !challenge) return;
    setResendLoading(true);
    setError("");
    try {
      await getCsrfCookie();
      await api.post("/auth/device/resend", { challenge });
      toast.success("A new code is on its way.");
      setCountdown(60);
      sessionStorage.setItem(`device_otp_timer_${challenge}`, String(Date.now() + 60 * 1000));
    } catch (err: unknown) {
      if (isAxiosError(err)) setError(err.response?.status === 429 ? "Too many requests. Wait 60 seconds." : err.response?.data?.message || "Could not send a new code.");
      else setError("Network error.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <>
      <div className="mx-auto w-full min-w-0 max-w-[390px]">
        <AuthHeading title="Confirm this device" sub="You are signing in from a device we do not know. Enter the 6-digit code we emailed you." />
        <form onSubmit={handleSubmit} className={authFormCls}>
          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-[#E4E4E7] bg-white p-3 sm:p-4">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A1A1AA]">Device verification code</p>
            <div className="mt-4">
              <OtpInput value={code} onChange={setCode} />
            </div>
          </div>
          {error && <FormAlert>{error}</FormAlert>}
          <SubmitButton loading={loading} disabled={code.length !== 6}>Trust this device</SubmitButton>
        </form>
        <div className="mt-6 grid gap-3 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-4">
          <ResendRow prompt="No code yet?" countdown={countdown} loading={resendLoading} onResend={handleResend} />
          <div className="h-px bg-[#E4E4E7]" />
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[14px] leading-6 text-[#71717A]">
            <span>Not you?</span>
            <Link href="/login" className={authLink}>Back to sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function VerifyDevicePage() {
  return (
    <AuthShell
      art={{
        variant: "orange", hero: "shield", accent: "lock",
        title: "New device, quick check.",
        sub: "A one-time code keeps your money safe.",
        chips: [
          { icon: "device", tone: "yellow", title: "New sign-in", sub: "Code sent to your email" },
          { icon: "check", tone: "mint", title: "Trust it once", sub: "No code next time" },
        ],
      }}
      splitAt="sm"
    >
      <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
        <VerifyDeviceForm />
      </Suspense>
    </AuthShell>
  );
}