"use client";

import { useState, useRef, useEffect } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getCsrfCookie } from "@/lib/api";
import { Spinner, useToast } from "@/components/dashboard/ui";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

type AuthMode = "login" | "register";

type FormState = {
  business_name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  business_type: string;
  password: string;
  password_confirmation: string;
};

const initialForm: FormState = {
  business_name: "",
  email: "",
  phone: "",
  country: "NG", 
  currency: "NGN",
  business_type: "Individual",
  password: "",
  password_confirmation: "",
};

const DIAL_CODES: Record<string, string> = {
  US: "+1",
  NG: "+234",
  GB: "+44",
};

function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
    const response = error.response?.data;
    const validationMessage = response?.errors ? Object.values(response.errors)[0]?.[0] : undefined;
    return validationMessage ?? response?.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function Field({ label, name, value, onChange, type = "text", required = true, autoComplete, placeholder, rightLabel }: { label: string; name: keyof FormState; value: string; onChange: (name: keyof FormState, value: string) => void; type?: string; required?: boolean; autoComplete?: string; placeholder?: string; rightLabel?: React.ReactNode; }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-preset-4-bold text-grey-900" htmlFor={name}>
          {label}
        </label>
        {rightLabel}
      </div>
      <input className="h-12 w-full rounded-xl border border-grey-300/80 bg-beige-100/40 px-4 font-normal outline-none transition duration-200 placeholder:text-grey-500/60 focus:border-green focus:bg-white focus:ring-4 focus:ring-green/10" id={name} name={name} type={type} value={value} onChange={(e) => onChange(name, e.target.value)} autoComplete={autoComplete} placeholder={placeholder} required={required} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }: { label: string; name: keyof FormState; value: string; onChange: (name: keyof FormState, value: string) => void; options: { label: string; value: string }[] }) {
  return (
    <label className="grid gap-2 text-preset-4-bold text-grey-900" htmlFor={name}>
      {label}
      <select className="h-12 w-full rounded-xl border border-grey-300/80 bg-beige-100/40 px-4 font-normal outline-none transition duration-200 focus:border-green focus:bg-white focus:ring-4 focus:ring-green/10" id={name} name={name} value={value} onChange={(e) => onChange(name, e.target.value)}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </label>
  );
}

function PhoneField({ label, name, value, country, onChange }: { label: string; name: keyof FormState; value: string; country: string; onChange: (name: keyof FormState, value: string) => void; }) {
  const dialCode = DIAL_CODES[country] || "";
  return (
    <label className="grid gap-2 text-preset-4-bold text-grey-900" htmlFor={name}>
      {label}
      <div className="flex h-12 w-full overflow-hidden rounded-xl border border-grey-300/80 bg-beige-100/40 focus-within:border-green focus-within:bg-white focus-within:ring-4 focus-within:ring-green/10 transition duration-200">
        <div className="flex items-center justify-center border-r border-grey-300/80 bg-grey-100/50 px-3 font-medium text-grey-500">
          {dialCode}
        </div>
        <input className="w-full bg-transparent px-4 font-normal outline-none placeholder:text-grey-500/60" type="tel" name={name} value={value} onChange={(e) => onChange(name, e.target.value.replace(/[^0-9]/g, ""))} placeholder="8012345678" />
      </div>
    </label>
  );
}

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const isRegister = mode === "register";

  const idempotencyKey = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : ""
  );

  // Load saved data if the user clicked "Wrong Email" on the OTP screen
  useEffect(() => {
    if (isRegister) {
      const savedData = sessionStorage.getItem("registration_draft");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // 1. Remove it from storage immediately
          sessionStorage.removeItem("registration_draft");
          
          // 2. Delay the state update to escape the synchronous render cycle
          setTimeout(() => {
            setForm((prev) => ({ 
              ...prev, 
              ...parsed, 
              email: "", 
              password: "", 
              password_confirmation: "" 
            }));
          }, 0);
        } catch {

        }
      }
    }
  }, [isRegister]);

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isRegister && form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (isRegister && !turnstileToken && process.env.NODE_ENV !== "development") {
      setError("Please complete the security check.");
      return;
    }

    setIsSubmitting(true);

    try {
      await getCsrfCookie();

      if (isRegister) {
        const dialCode = DIAL_CODES[form.country] || "";
        const cleanPhone = form.phone.replace(/^0+/, ""); 
        const formattedPhone = cleanPhone ? `${dialCode}${cleanPhone}` : null;

        const response = await api.post("/auth/register", {
          business_name: form.business_name,
          email: form.email,
          phone: formattedPhone,
          country: form.country,
          currency: form.currency,
          business_type: form.business_type,
          password: form.password,
          password_confirmation: form.password_confirmation,
          "cf-turnstile-response": turnstileToken,
        }, { 
          headers: { "Idempotency-Key": idempotencyKey.current } 
        });

        idempotencyKey.current = crypto.randomUUID();
        
        // Save safe data to session storage in case they need to correct their email
        sessionStorage.setItem("registration_draft", JSON.stringify({
          business_name: form.business_name,
          phone: form.phone,
          country: form.country,
          currency: form.currency,
          business_type: form.business_type,
        }));

        toast.success("Account created. Please enter the code sent to your email.");
        router.push(`/verify-otp?merchant_id=${response.data.data.merchant_id}`);
      } else {
        // NEW: Login Architecture Checkpoints
        const response = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        
        // INTERCEPT: Device is unknown, challenge required
        if (response.status === 202 && response.data.code === 'device_unknown') {
          toast.success("Please verify this new device.");
          router.push(`/verify-device?challenge=${encodeURIComponent(response.data.data.challenge)}`);
          return;
        }

        toast.success("Welcome back.");
        router.push("/");
      }
    } catch (requestError) {
      // NEW: Catch specific 403 Forbidden intercept codes from the backend
      if (isAxiosError(requestError) && requestError.response) {
        const { status, data } = requestError.response;

        if (status === 403) {
          if (data.code === 'email_unverified') {
            toast.error(data.message || "Please verify your email address.");
            router.push(`/verify-otp?merchant_id=${data.data.merchant_id}`);
            setIsSubmitting(false);
            return;
          }
          if (data.code === 'account_suspended') {
            setError(data.message || "This account has been suspended. Please contact support.");
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Default error fallback
      setError(getErrorMessage(requestError));
      if (turnstileRef.current) {
        turnstileRef.current.reset();
        setTurnstileToken("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {isRegister && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business name" name="business_name" value={form.business_name} onChange={updateField} autoComplete="organization" placeholder="Acme Payments" />
          <SelectField label="Business type" name="business_type" value={form.business_type} onChange={updateField} options={[
            { label: "Individual / Sole Trader", value: "Individual" },
            { label: "LLC / Corporation", value: "LLC" },
            { label: "Non-Profit", value: "Non-Profit" }
          ]} />
        </div>
      )}

      <Field label="Email address" name="email" value={form.email} onChange={updateField} type="email" autoComplete="email" placeholder="you@business.com" />

      {isRegister && (
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField label="Country" name="country" value={form.country} onChange={updateField} options={[
            { label: "Nigeria (NG)", value: "NG" },
            { label: "United States (US)", value: "US" },
            { label: "United Kingdom (GB)", value: "GB" }
          ]} />
          <SelectField label="Currency" name="currency" value={form.currency} onChange={updateField} options={[
            { label: "NGN (₦)", value: "NGN" },
            { label: "USD ($)", value: "USD" },
            { label: "GBP (£)", value: "GBP" }
          ]} />
          <PhoneField label="Phone" name="phone" value={form.phone} country={form.country} onChange={updateField} />
        </div>
      )}

      {isRegister ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" name="password" value={form.password} onChange={updateField} type="password" autoComplete="new-password" />
          <Field label="Confirm password" name="password_confirmation" value={form.password_confirmation} onChange={updateField} type="password" autoComplete="new-password" />
        </div>
      ) : (
        <Field
          label="Password"
          name="password"
          value={form.password}
          onChange={updateField}
          type="password"
          autoComplete="current-password"
          rightLabel={
            <Link href="/forgot-password" className="text-preset-5 font-bold text-green transition hover:text-turquoise">
              Forgot password?
            </Link>
          }
        />
      )}

      {error && <p className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-preset-4 text-red">{error}</p>}

      {isRegister && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="flex justify-center my-2">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            options={{ theme: 'light' }}
          />
        </div>
      )}

      <button
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-grey-900 px-5 text-preset-4-bold text-white transition hover:bg-green disabled:opacity-60"
        type="submit"
        disabled={isSubmitting || (isRegister && !turnstileToken && process.env.NODE_ENV !== "development")}
      >
        {isSubmitting && <Spinner />} {isSubmitting ? "Working..." : isRegister ? "Create merchant account" : "Sign in"}
      </button>
    </form>
  );
}