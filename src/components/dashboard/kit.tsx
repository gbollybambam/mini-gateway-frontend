"use client";

import React, { useEffect, useState } from "react";
import { X, Check, Copy, AlertTriangle, CheckCircle2, ShieldCheck } from "@/components/icons";

/* ---------- shared class strings ---------- */
export const inputCls =
  "h-10 w-full rounded-[10px] border border-[var(--pm-line)] bg-white px-3.5 text-[13px] text-[#09090B] shadow-[0_1px_2px_rgba(9,9,11,0.04)] outline-none transition-all placeholder:text-[#A1A1AA] hover:border-[#D4D4D8] focus:border-[#D4D4D8] focus:shadow-[0_0_0_3px_rgba(9,9,11,0.06)] disabled:cursor-not-allowed disabled:bg-[var(--pm-band)] disabled:text-[#71717A]";

export const selectChevron = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundPosition: "right 12px center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "16px",
} as const;

const btnBase =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[8px] px-4 text-[13px] font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";
export const btnPrimary = `${btnBase} bg-gradient-to-b from-[#27272A] to-[#09090B] text-[#FFFFFF] shadow-sm ring-1 ring-black/10 hover:brightness-125`;
export const btnSecondary = `${btnBase} border border-[var(--pm-line)] bg-[var(--pm-band)] font-medium text-[var(--pm-ink)] shadow-sm hover:bg-[var(--pm-band-hover)]`;
export const btnDanger = `${btnBase} bg-[#DC2626] text-white shadow-sm hover:bg-[#B91C1C]`;
export const btnDangerSoft = `${btnBase} border border-[#FECACA] bg-[#FEF2F2] font-medium text-[#DC2626] hover:bg-[#FEE2E2]`;

export const cardCls = "rounded-[12px] border border-[var(--pm-line)] bg-white shadow-sm";
export const thCls = "px-4 py-3.5 text-[12px] font-medium uppercase tracking-wide text-[#71717A] sm:px-6";
export const tdCls = "px-4 py-4 sm:px-6";

/* ---------- page header ---------- */
export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA]">{eyebrow}</p>}
        <h1 className="text-[28px] font-bold tracking-[-0.025em] text-[#09090B]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-[#71717A]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

/* ---------- card section heading ---------- */
export function SectionHead({ icon, title, subtitle, right }: { icon?: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-[var(--pm-line)] bg-[var(--pm-band)] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
      <div className="flex items-center gap-3">
        {icon && <div className="grid size-9 shrink-0 place-items-center rounded-[8px] border border-[var(--pm-line)] bg-[var(--pm-band)] text-[#52525B]">{icon}</div>}
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight text-[#09090B]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12px] text-[#71717A]">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ---------- form field ---------- */
export function Field({ label, hint, optional, right, children }: { label: string; hint?: React.ReactNode; optional?: boolean; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[13px] font-medium text-[#09090B]">
        <label>{label}</label>
        {right ?? (optional && <span className="text-[12px] font-normal text-[#A1A1AA]">Optional</span>)}
      </div>
      {children}
      {hint && <p className="text-[12px] leading-[1.5] text-[#71717A]">{hint}</p>}
    </div>
  );
}

/* ---------- status pill ---------- */
const PILL: Record<string, { cls: string; dot: string }> = {
  success: { cls: "bg-[#ECFDF5] border-[#BBF7D0] text-[#059669]", dot: "bg-[#10B981]" },
  warning: { cls: "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]", dot: "bg-[#F59E0B]" },
  danger: { cls: "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]", dot: "bg-[#EF4444]" },
  info: { cls: "bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]", dot: "bg-[#3B82F6]" },
  neutral: { cls: "bg-[var(--pm-band)] border-[var(--pm-line)] text-[#52525B]", dot: "bg-[#A1A1AA]" },
};
export type Tone = keyof typeof PILL;

export function Pill({ tone = "neutral", dot = true, children }: { tone?: Tone; dot?: boolean; children: React.ReactNode }) {
  const t = PILL[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${t.cls}`}>
      {dot && <span className={`size-1.5 rounded-full ${t.dot}`} />}
      {children}
    </span>
  );
}

/* ---------- banner ---------- */
const BANNER: Record<string, string> = {
  success: "border-[#BBF7D0] bg-[#ECFDF5] text-[#047857]",
  warning: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
  danger: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
  info: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
};
export function Banner({ tone = "info", title, children }: { tone?: "success" | "warning" | "danger" | "info"; title?: string; children: React.ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex items-start gap-3 rounded-[10px] border px-4 py-3 text-[13px] leading-[1.6] animate-in fade-in slide-in-from-top-1 duration-200 ${BANNER[tone]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "opacity-90" : ""}>{children}</div>
      </div>
    </div>
  );
}

/* ---------- empty state ---------- */
export function EmptyBlock({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="pm-rise flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-[12px] border border-[var(--pm-line)] bg-[var(--pm-band)] text-[#A1A1AA]">{icon}</div>
      <h3 className="text-[15px] font-bold text-[#09090B]">{title}</h3>
      <p className="mt-2 max-w-sm text-[13px] leading-[1.6] text-[#71717A]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- segmented tabs ---------- */
export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { label: string; value: T }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-[10px] border border-[var(--pm-line)] bg-[var(--pm-band)] p-0.5" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`whitespace-nowrap rounded-[8px] px-3.5 py-1.5 text-[13px] font-medium transition-all ${
            value === t.value ? "border border-[var(--pm-line)] bg-[var(--pm-raised)] text-[var(--pm-ink)] shadow-sm" : "border border-transparent text-[#71717A] hover:text-[var(--pm-ink)]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- modal ---------- */
export function Modal({
  open, onClose, title, subtitle, icon, children, footer, size = "md", tone = "neutral",
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; icon?: React.ReactNode;
  children: React.ReactNode; footer?: React.ReactNode; size?: "md" | "lg" | "xl"; tone?: "neutral" | "danger" | "warning" | "success";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const width = size === "xl" ? "max-w-2xl" : size === "lg" ? "max-w-lg" : "max-w-md";
  const iconTone =
    tone === "danger" ? "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]"
    : tone === "warning" ? "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
    : tone === "success" ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#059669]"
    : "border-[var(--pm-line)] bg-[var(--pm-band)] text-[#52525B]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-[#09090B]/40 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div className={`relative flex max-h-[88vh] w-full ${width} flex-col overflow-hidden rounded-[16px] border border-[var(--pm-line)] bg-white shadow-[0_24px_60px_-12px_rgba(9,9,11,0.3)] animate-in fade-in slide-in-from-bottom-1 zoom-in-95 duration-200`}>
        <div className="flex items-start justify-between gap-4 border-b border-[var(--pm-line)] px-6 py-5">
          <div className="flex items-center gap-3">
            {icon && <div className={`grid size-10 shrink-0 place-items-center rounded-[10px] border ${iconTone}`}>{icon}</div>}
            <div>
              <h3 className="text-[16px] font-semibold tracking-tight text-[#09090B]">{title}</h3>
              {subtitle && <p className="mt-0.5 text-[12px] text-[#71717A]">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-[8px] text-[#71717A] transition-colors hover:bg-[var(--pm-band-hover)] hover:text-[#09090B]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-3 border-t border-[var(--pm-line)] bg-[var(--pm-band)] px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- one-time secret reveal ---------- */
export function SecretModal({
  open, onClose, title, subtitle, label, value, warning, confirmLabel,
}: { open: boolean; onClose: () => void; title: string; subtitle?: string; label: string; value: string; warning: string; confirmLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={<ShieldCheck className="h-5 w-5" />}
      tone="success"
      size="lg"
      footer={<button type="button" onClick={onClose} className={btnPrimary}>{confirmLabel}</button>}
    >
      <div className="space-y-5">
        <Banner tone="warning" title="Copy it now">{warning}</Banner>
        <Field label={label}>
          <div className="flex items-center gap-2">
            <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} className={`${inputCls} h-11 font-mono text-[12px]`} />
            <button type="button" onClick={copy} className={`${copied ? "border border-[#BBF7D0] bg-[#ECFDF5] text-[#059669]" : btnSecondary} inline-flex h-11 shrink-0 items-center gap-2 rounded-[8px] px-4 text-[13px] font-medium transition-all`}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </Field>
      </div>
    </Modal>
  );
}