"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { api, getCsrfCookie } from "@/lib/api";
import { useToast } from "@/components/dashboard/ui";
import { AuthShell, AuthHeading, Field, SubmitButton, FormAlert, authLink, authFormCls } from "@/components/auth/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await getCsrfCookie();
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
    <AuthShell
      art={{
        variant: "cream", hero: "lock", accent: "shield",
        title: "Locked out? It happens.",
        sub: "We will email you a secure link to set a new password.",
        chips: [
          { icon: "mail", tone: "mint", title: "Reset link sent", sub: "Check your inbox" },
          { icon: "lock", tone: "yellow", title: "Your data is safe", sub: "Nothing is lost or changed" },
        ],
      }}
      footer={<>Remembered it? <Link href="/login" className={authLink}>Back to sign in</Link></>}
    >
      <AuthHeading title="Reset your password" sub="Enter your email and we will send you a reset link." />
      {isSent ? (
        <div className={`${authFormCls} gap-4`}>
          <FormAlert tone="success">
            If an account exists for {email}, a reset link is on its way. Check your inbox and spam folder.
          </FormAlert>
          <button type="button" onClick={() => setIsSent(false)} className={`w-fit text-[14px] ${authLink}`}>Use a different email</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={authFormCls}>
          <Field label="Email address" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
          <SubmitButton loading={isSubmitting}>{isSubmitting ? "Sending link" : "Send reset link"}</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}