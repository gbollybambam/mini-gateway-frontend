"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";
import { api, getCsrfCookie } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { AuthShell, AuthHeading, Steps, OtpInput, ResendRow, SubmitButton, FormAlert, authLink, authFormCls } from "@/components/auth/ui";

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const merchantId = searchParams.get("merchant_id");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!merchantId) return;
    const key = `otp_timer_${merchantId}`;
    const saved = sessionStorage.getItem(key);
    if (!saved) return;
    const remaining = Math.floor((parseInt(saved, 10) - Date.now()) / 1000);
    if (remaining > 0) setTimeout(() => setCountdown(remaining), 0);
    else sessionStorage.removeItem(key);
  }, [merchantId]);

  useEffect(() => {
    if (countdown <= 0) return;
    const key = `otp_timer_${merchantId}`;
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { sessionStorage.removeItem(key); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [countdown, merchantId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!merchantId) { setError("We could not find your account. Please register again."); return; }
    if (code.length !== 6) { setError("Enter all 6 digits."); return; }
    setLoading(true);
    try {
      await getCsrfCookie();
      await api.post("/auth/email/verify-otp", { merchant_id: merchantId, code });
      sessionStorage.removeItem("registration_draft");
      sessionStorage.removeItem(`otp_timer_${merchantId}`);
      toast.success("Email verified. Welcome to PayMesh!");
      router.push("/login");
    } catch (err: unknown) {
      setLoading(false);
      if (isAxiosError(err)) {
        setError(err.response?.status === 429 ? "Too many attempts. Wait 60 seconds and try again." : err.response?.data?.message || "That code is wrong or has expired.");
      } else setError("Network error. Check your connection and try again.");
    }
  }

  async function handleResend() {
    if (countdown > 0 || !merchantId) return;
    setResendLoading(true);
    setError("");
    try {
      await getCsrfCookie();
      await api.post("/auth/email/resend-otp", { merchant_id: merchantId });
      toast.success("A new code is on its way.");
      setCountdown(60);
      sessionStorage.setItem(`otp_timer_${merchantId}`, String(Date.now() + 60 * 1000));
    } catch (err: unknown) {
      if (isAxiosError(err)) setError(err.response?.status === 429 ? "Too many requests. Wait 60 seconds." : err.response?.data?.message || "Could not send a new code.");
      else setError("Network error.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <>
      <Steps steps={["Your details", "Verify email", "Start selling"]} current={1} />
      <AuthHeading title="Check your email" sub="We sent a 6-digit code to your inbox. It expires in 5 minutes." />
      <form onSubmit={handleSubmit} className={authFormCls}>
        <OtpInput value={code} onChange={setCode} />
        {error && <FormAlert>{error}</FormAlert>}
        <SubmitButton loading={loading} disabled={code.length !== 6}>Verify email</SubmitButton>
      </form>
      <div className="mt-8 grid gap-3 border-t border-[#F4F4F5] pt-6">
        <ResendRow prompt="No code yet?" countdown={countdown} loading={resendLoading} onResend={handleResend} />
        <p className="text-center text-[14px] text-[#71717A]">Wrong email? <Link href="/register" className={authLink}>Start again</Link></p>
      </div>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthShell
      art={{
        variant: "mint", hero: "check", accent: "lock",
        title: "Almost there.",
        sub: "Confirm your email to open your dashboard.",
        chips: [
          { icon: "mail", tone: "yellow", title: "Code sent", sub: "Check inbox and spam" },
          { icon: "check", tone: "orange", title: "Expires in 5 minutes", sub: "Ask for a new one anytime" },
        ],
      }}
    >
      <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
        <VerifyOtpForm />
      </Suspense>
    </AuthShell>
  );
}