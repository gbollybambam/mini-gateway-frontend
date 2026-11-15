"use client";

import { useState, useRef, useEffect } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getCsrfCookie } from "@/lib/api";
import { useToast } from "@/components/dashboard/ui";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { Field, PasswordField, SubmitButton, FormAlert, inputCls, authLink, authFormCls } from "./ui";

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

const DIAL_CODES: Record<string, string> = { US: "+1", NG: "+234", GB: "+44" };

function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
    const response = error.response?.data;
    const validationMessage = response?.errors ? Object.values(response.errors)[0]?.[0] : undefined;
    return validationMessage ?? response?.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

const chevron = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundPosition: "right 12px center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "16px",
} as const;

type OnChange = (name: keyof FormState, value: string) => void;

function SelectField({ label, name, value, onChange, options }: { label: string; name: keyof FormState; value: string; onChange: OnChange; options: { label: string; value: string }[] }) {
  return (
    <label className="grid gap-2 text-[13px] font-semibold">
      {label}
      <select className={`${inputCls} cursor-pointer appearance-none pr-9`} style={chevron} name={name} value={value} onChange={(e) => onChange(name, e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function PhoneField({ label, name, value, country, onChange }: { label: string; name: keyof FormState; value: string; country: string; onChange: OnChange }) {
  const dial = DIAL_CODES[country] || "";
  return (
    <label className="grid gap-2 text-[13px] font-semibold">
      {label}
      <span className="flex h-12 w-full overflow-hidden rounded-xl border border-[#E4E4E7] bg-white transition focus-within:border-[#09090B] focus-within:ring-4 focus-within:ring-[#09090B]/10 hover:border-[#D4D4D8]">
        <span className="grid place-items-center border-r border-[#E4E4E7] bg-[#FAFAFA] px-3 text-[13px] font-medium text-[#52525B]">{dial}</span>
        <input
          className="min-w-0 flex-1 bg-transparent px-3 text-[14px] font-normal outline-none placeholder:text-[#A1A1AA]"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="8012345678"
        />
      </span>
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

  // Load saved data if the user clicked "Wrong email" on the OTP screen
  useEffect(() => {
    if (isRegister) {
      const savedData = sessionStorage.getItem("registration_draft");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          sessionStorage.removeItem("registration_draft");
          setTimeout(() => {
            setForm((prev) => ({ ...prev, ...parsed, email: "", password: "", password_confirmation: "" }));
          }, 0);
        } catch {
          /* ignore bad draft */
        }
      }
    }
  }, [isRegister]);

  const updateField: OnChange = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const bind = (name: keyof FormState) => ({ value: form[name], onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField(name, e.target.value) });

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

        const response = await api.post(
          "/auth/register",
          {
            business_name: form.business_name,
            email: form.email,
            phone: formattedPhone,
            country: form.country,
            currency: form.currency,
            business_type: form.business_type,
            password: form.password,
            password_confirmation: form.password_confirmation,
            "cf-turnstile-response": turnstileToken,
          },
          { headers: { "Idempotency-Key": idempotencyKey.current } }
        );

        idempotencyKey.current = crypto.randomUUID();

        sessionStorage.setItem(
          "registration_draft",
          JSON.stringify({
            business_name: form.business_name,
            phone: form.phone,
            country: form.country,
            currency: form.currency,
            business_type: form.business_type,
          })
        );

        toast.success("Account created. Please enter the code sent to your email.");
        router.push(`/verify-otp?merchant_id=${response.data.data.merchant_id}`);
      } else {
        const response = await api.post("/auth/login", { email: form.email, password: form.password });

        if (response.status === 202 && response.data.code === "device_unknown") {
          toast.success("Please verify this new device.");
          router.push(`/verify-device?challenge=${encodeURIComponent(response.data.data.challenge)}`);
          return;
        }

        toast.success("Welcome back.");
        router.push("/overview");
      }
    } catch (requestError) {
      if (isAxiosError(requestError) && requestError.response) {
        const { status, data } = requestError.response;

        if (status === 403) {
          if (data.code === "email_unverified") {
            toast.error(data.message || "Please verify your email address.");
            router.push(`/verify-otp?merchant_id=${data.data.merchant_id}`);
            setIsSubmitting(false);
            return;
          }
          if (data.code === "account_suspended") {
            setError(data.message || "This account has been suspended. Please contact support.");
            setIsSubmitting(false);
            return;
          }
        }
      }

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
    <form className={authFormCls} onSubmit={handleSubmit}>
      {isRegister && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business name" name="business_name" required autoComplete="organization" placeholder="Acme Payments" {...bind("business_name")} />
          <SelectField
            label="Business type"
            name="business_type"
            value={form.business_type}
            onChange={updateField}
            options={[
              { label: "Individual / Sole Trader", value: "Individual" },
              { label: "LLC / Corporation", value: "LLC" },
              { label: "Non-Profit", value: "Non-Profit" },
            ]}
          />
        </div>
      )}

      <Field label="Email address" name="email" type="email" required autoComplete="email" placeholder="you@business.com" {...bind("email")} />

      {isRegister && (
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            label="Country"
            name="country"
            value={form.country}
            onChange={updateField}
            options={[
              { label: "Nigeria", value: "NG" },
              { label: "United States", value: "US" },
              { label: "United Kingdom", value: "GB" },
            ]}
          />
          <SelectField
            label="Currency"
            name="currency"
            value={form.currency}
            onChange={updateField}
            options={[
              { label: "NGN (₦)", value: "NGN" },
              { label: "USD ($)", value: "USD" },
              { label: "GBP (£)", value: "GBP" },
            ]}
          />
          <PhoneField label="Phone" name="phone" value={form.phone} country={form.country} onChange={updateField} />
        </div>
      )}

      {isRegister ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField label="Password" name="password" required autoComplete="new-password" {...bind("password")} />
          <PasswordField label="Confirm password" name="password_confirmation" required autoComplete="new-password" {...bind("password_confirmation")} />
        </div>
      ) : (
        <PasswordField
          label="Password"
          name="password"
          required
          autoComplete="current-password"
          action={<Link href="/forgot-password" className={`text-[13px] ${authLink}`}>Forgot password?</Link>}
          {...bind("password")}
        />
      )}

      {error && <FormAlert>{error}</FormAlert>}

      {isRegister && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            options={{ theme: "light" }}
          />
        </div>
      )}

      <SubmitButton
        loading={isSubmitting}
        disabled={isRegister && !turnstileToken && process.env.NODE_ENV !== "development"}
      >
        {isSubmitting ? "Please wait" : isRegister ? "Create account" : "Sign in"}
      </SubmitButton>
    </form>
  );
}