"use client";

import Link from "next/link";
import { useId, useRef, useState, type ClipboardEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { Spinner } from "@/components/dashboard/ui";
import { AlertCircle, ShieldCheck } from "@/components/icons";
import AuthArt, { type ArtProps } from "./AuthArt";
import { display } from "./font";

export function AuthLogo() {
  return (
    <Link href="/" className="group inline-flex w-fit items-center gap-2.5 transition-transform duration-200 hover:-translate-y-0.5" aria-label="PayMesh home">
      <span className="grid size-10 place-items-center rounded-[12px] bg-[#09090B] transition-colors duration-200 group-hover:bg-[#27272A]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5BE6AE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="2.5" width="14" height="19" rx="3" />
          <rect x="8" y="5.5" width="8" height="4" rx="1" />
          <path d="M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17h.01M12 17h.01M15.5 17h.01" strokeWidth="2.2" />
        </svg>
      </span>
      <span className="grid gap-0.5 leading-none">
        <span className="font-[family-name:var(--font-display)] text-[17px] font-extrabold tracking-[-0.02em]">Pay<span className="text-[#12B981]">Mesh</span>.</span>
        <span className="text-[10.5px] text-[#A1A1AA]">Payments made simple</span>
      </span>
    </Link>
  );
}

export function AuthShell({ art, children, footer, wide, splitAt = "lg" }: { art: ArtProps; children: ReactNode; footer?: ReactNode; wide?: boolean; splitAt?: "sm" | "md" | "lg" }) {
  const split = splitAt === "sm" ? "sm" : splitAt === "md" ? "md" : "lg";
  const grid = split === "sm"
    ? "sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
    : split === "md"
      ? "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
      : "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]";
  const section = split === "sm"
    ? "sm:min-h-screen sm:px-8 sm:py-7"
    : split === "md"
      ? "md:min-h-screen md:px-10 md:py-8"
      : "lg:min-h-screen lg:px-14 lg:py-9";
  const artLayout = split === "sm"
    ? "sm:sticky sm:top-0 sm:h-screen sm:order-none"
    : split === "md"
      ? "md:sticky md:top-0 md:h-screen md:order-none"
      : "lg:sticky lg:top-0 lg:h-screen lg:order-none";

  return (
    <main className={`${display.variable} flex min-h-screen flex-col bg-white font-sans text-[#09090B] ${grid}`}>
      <section className={`flex flex-1 flex-col px-6 pb-8 pt-6 sm:px-12 xl:px-20 ${section}`}>
        <AuthLogo />
        <div className={`mx-auto flex w-full flex-1 flex-col justify-center py-10 lg:py-12 ${wide ? "max-w-[540px]" : "max-w-[420px]"}`}>
          {children}
          {footer && <p className="mt-8 text-center text-[14px] text-[#71717A]">{footer}</p>}
        </div>
        <p className="text-[12px] text-[#A1A1AA]">© {new Date().getFullYear()} PayMesh</p>
      </section>
      <div className={`order-first p-3 ${artLayout} ${split === "sm" ? "sm:p-4" : split === "md" ? "md:p-4" : "lg:p-4"}`}>
        <AuthArt {...art} />
      </div>
    </main>
  );
}

export function AuthHeading({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-[family-name:var(--font-display)] text-[36px] font-bold leading-[1.04] tracking-[-0.04em]">{title}</h1>
      <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-[#71717A]">{sub}</p>
    </div>
  );
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-3 text-[12px] font-medium" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3" aria-current={i === current ? "step" : undefined}>
          <span className={`grid size-5 place-items-center rounded-full text-[11px] font-bold ${i < current ? "bg-[#09090B] text-[#5BE6AE]" : i === current ? "bg-[#5BE6AE] text-[#09090B]" : "bg-[#F4F4F5] text-[#A1A1AA]"}`}>
            {i < current ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 10 17l9-10" /></svg>
            ) : i + 1}
          </span>
          <span className={`${i === current ? "text-[#09090B]" : "hidden text-[#A1A1AA] sm:inline"}`}>{s}</span>
          {i < steps.length - 1 && <span className="h-px w-5 bg-[#E4E4E7] sm:w-6" />}
        </li>
      ))}
    </ol>
  );
}

export const authLink = "relative inline-block font-semibold text-[#09090B] transition-colors duration-200 hover:text-[#12B981] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5BE6AE] after:absolute after:bottom-[-3px] after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[#5BE6AE] after:transition-transform after:duration-200 hover:after:scale-x-100";

export const authFormCls = "grid w-full min-w-0 gap-5 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] p-4 sm:p-5";

export const inputCls =
  "h-12 w-full rounded-xl border border-[#E4E4E7] bg-white px-4 text-[14px] font-normal text-[#09090B] outline-none transition placeholder:text-[#A1A1AA] hover:border-[#D4D4D8] focus:border-[#09090B] focus:ring-4 focus:ring-[#5BE6AE]/35 read-only:bg-[#FAFAFA] read-only:text-[#52525B]";

export function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-[13px] font-semibold">
      {label}
      <input className={inputCls} {...props} />
    </label>
  );
}

export function PasswordField({ label, action, ...props }: { label: string; action?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <div className="grid gap-2 text-[13px]">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-semibold">{label}</label>
        {action}
      </div>
      <span className="relative block">
        <input id={id} className={`${inputCls} pr-12`} type={show ? "text" : "password"} {...props} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
            {show && <path d="M3 3l18 18" />}
          </svg>
        </button>
      </span>
    </div>
  );
}

export function SubmitButton({ loading, disabled, children }: { loading?: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="inline-flex min-w-0 h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#09090B] px-6 text-[14px] font-semibold text-white transition-[background-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#5BE6AE] hover:text-[#09090B] hover:shadow-[0_8px_18px_-12px_rgba(9,9,11,.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09090B] active:translate-y-0 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#09090B] disabled:hover:text-white disabled:hover:shadow-none"
    >
      {children}
      {loading && <Spinner />}
    </button>
  );
}

export function FormAlert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  const ok = tone === "success";
  const Icon = ok ? ShieldCheck : AlertCircle;
  return (
    <div role={ok ? "status" : "alert"} className={`flex items-start gap-3 rounded-xl border p-3.5 text-[13px] leading-relaxed ${ok ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#047857]" : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const onInput = (i: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (!clean) return;
    const next = (value.slice(0, i) + clean + value.slice(i + 1)).slice(0, length);
    onChange(next);
    focus(Math.min(i + clean.length, length - 1));
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) onChange(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) { onChange(value.slice(0, i - 1) + value.slice(i)); focus(i - 1); }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(text);
    focus(text.length);
  };

  return (
    <div className="flex w-full min-w-0 gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={value[i] ?? ""}
          onChange={(e) => onInput(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          className={`h-14 min-w-0 flex-1 rounded-xl border text-center font-[family-name:var(--font-display)] text-[24px] font-bold tabular-nums outline-none transition focus:border-[#09090B] focus:ring-4 focus:ring-[#5BE6AE]/35 ${value[i] ? "border-[#09090B] bg-[#F7FEFB]" : "border-[#E4E4E7] bg-white"}`}
        />
      ))}
    </div>
  );
}

export function ResendRow({ prompt, countdown, loading, onResend }: { prompt: string; countdown: number; loading: boolean; onResend: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[14px] leading-6 text-[#71717A]">
      <span>{prompt}</span>
      <button
        type="button"
        onClick={onResend}
        disabled={countdown > 0 || loading}
        className={`relative inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold transition-colors duration-200 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[#5BE6AE] after:transition-transform after:duration-200 ${countdown > 0 ? "cursor-not-allowed text-[#A1A1AA]" : "text-[#09090B] hover:bg-[#F4F4F5] hover:text-[#12B981] hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5BE6AE]"}`}
      >
        {loading ? <Spinner /> : countdown > 0 ? `Resend in ${countdown}s` : "Send a new code"}
      </button>
    </div>
  );
}