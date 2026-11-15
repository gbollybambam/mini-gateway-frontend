"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api, getCsrfCookie } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { AuthShell, AuthHeading, Field, PasswordField, SubmitButton, FormAlert, authFormCls } from "@/components/auth/ui";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (!token || !email) {
      setError("This invite link is incomplete. Ask your team admin to send a new one.");
      return;
    }
    setLoading(true);
    try {
      await getCsrfCookie();
      await api.post("/auth/team/accept-invite", { token, email, password, password_confirmation: passwordConfirmation });
      toast.success("Account activated. Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      setLoading(false);
      setError(isAxiosError(err) ? err.response?.data?.message || "We could not activate your account. The link may have expired." : "Network error. Check your connection and try again.");
    }
  }

  return (
    <>
      <AuthHeading title="Join your team" sub="You have been invited to PayMesh. Create a password to activate your account." />
      <form onSubmit={handleSubmit} className={authFormCls}>
        <Field label="Email address" value={email} readOnly />
        <PasswordField label="Password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <PasswordField label="Confirm password" required autoComplete="new-password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
        {error && <FormAlert>{error}</FormAlert>}
        <SubmitButton loading={loading} disabled={!password || !passwordConfirmation}>Activate account</SubmitButton>
      </form>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <AuthShell
      art={{
        variant: "yellow", hero: "card", accent: "check",
        title: "Your team is waiting.",
        sub: "Set a password and you are in.",
        chips: [
          { icon: "user", tone: "mint", title: "You were invited", sub: "Join the team workspace" },
          { icon: "lock", tone: "orange", title: "Role-based access", sub: "You see what your role allows" },
        ],
      }}
    >
      <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
        <AcceptInviteForm />
      </Suspense>
    </AuthShell>
  );
}