"use client";

import { useState, Suspense } from "react";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, getCsrfCookie } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { AuthShell, AuthHeading, PasswordField, SubmitButton, FormAlert, authLink, authFormCls } from "@/components/auth/ui";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
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
      await getCsrfCookie();
      await api.post("/auth/reset-password", { email, token, password, password_confirmation: passwordConfirmation });
      toast.success("Password updated. Please sign in.");
      router.push("/login");
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : "Failed to reset password.";
      setError(msg || "We could not reset your password. Request a new link and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token || !email) {
    return (
      <div className={authFormCls}>
        <AuthHeading title="This link is not valid" sub="It may have expired or been copied wrongly. Request a new one to continue." />
        <Link href="/forgot-password" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#09090B] px-6 text-[14px] font-semibold text-white transition-[background-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#5BE6AE] hover:text-[#09090B] hover:shadow-[0_8px_18px_-12px_rgba(9,9,11,.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09090B] active:translate-y-0 active:scale-[.99]">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <AuthHeading title="Set a new password" sub={<>Choose a strong password for <span className="font-semibold text-[#09090B]">{email}</span>.</>} />
      <form onSubmit={handleSubmit} className={authFormCls}>
        <PasswordField label="New password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <PasswordField label="Confirm new password" required autoComplete="new-password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
        {error && <FormAlert>{error}</FormAlert>}
        <SubmitButton loading={isSubmitting}>{isSubmitting ? "Saving" : "Save new password"}</SubmitButton>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      art={{
        variant: "yellow", hero: "shield", accent: "lock",
        title: "Choose a password only you know.",
        sub: "Make it long and different from your other passwords.",
        chips: [
          { icon: "device", tone: "mint", title: "Other devices signed out", sub: "Old sessions end" },
          { icon: "lock", tone: "orange", title: "Stored encrypted", sub: "We never see your password" },
        ],
      }}
      footer={<Link href="/login" className={authLink}>Back to sign in</Link>}
    >
      <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}