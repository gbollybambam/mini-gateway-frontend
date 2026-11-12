"use client"

import { useCallback, useMemo, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { Eye, EyeOff, RefreshCw } from "./icons"

export const primaryButton = "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill bg-ink text-surface font-semibold text-sm hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
export const secondaryButton = "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill bg-surface text-ink font-semibold text-sm hover:bg-surface-muted transition-colors border border-line disabled:opacity-50 disabled:cursor-not-allowed"

export function useToast() {
  const success = useCallback((msg: string) => toast.success(msg, {
    style: { background: "var(--ink)", color: "var(--surface)", border: "1px solid var(--success)" },
    iconTheme: { primary: "var(--success)", secondary: "var(--surface)" },
  }), [])
  const error = useCallback((msg: string) => toast.error(msg, {
    style: { background: "var(--ink)", color: "var(--surface)", border: "1px solid var(--danger)" },
    iconTheme: { primary: "var(--danger)", secondary: "var(--surface)" },
  }), [])
  return useMemo(() => ({ success, error }), [success, error])
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <><>{children}</><Toaster position="bottom-right" toastOptions={{ className: "text-sm font-medium" }} /></>
}

export function Input({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-1.5"><span className="text-xs font-semibold text-ink-muted">{label}</span><input className="h-11 w-full rounded-input border border-line bg-surface px-4 text-ink placeholder:text-ink-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" {...rest} /></label>
}

export function Select({ label, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return <label className="grid gap-1.5"><span className="text-xs font-semibold text-ink-muted">{label}</span><select className="h-11 w-full rounded-input border border-line bg-surface px-4 text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" {...rest}>{children}</select></label>
}

export function SecretValue({ label, value }: { label: string; value: string }) {
  const [visible, setVisible] = useState(false)
  return <div className="grid gap-1.5">
    {label ? <span className="text-xs font-semibold text-ink-muted">{label}</span> : null}
    <div className="flex h-11 items-center justify-between rounded-input border border-line bg-surface px-4">
      <code className="truncate text-sm text-brand-500">{visible ? value : "••••••••••••••••••••••••"}</code>
      <button type="button" aria-label={visible ? "Hide value" : "Show value"} onClick={() => setVisible((valueVisible) => !valueVisible)} className="text-ink-muted hover:text-ink">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
    </div>
  </div>
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg overflow-hidden rounded-card bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line px-6 py-4"><h2 className="text-base font-semibold text-ink">{title}</h2><button onClick={onClose} aria-label="Close dialog" className="rounded-full p-2 text-ink-muted hover:bg-surface-muted hover:text-ink"><span aria-hidden="true">&times;</span></button></div>
      <div className="p-6">{children}</div>
    </div>
  </div>
}

export function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center rounded-card bg-surface-muted py-16 text-center"><p className="max-w-sm text-sm text-ink-muted">{children}</p>{action ? <div className="mt-6">{action}</div> : null}</div>
}

export function ErrorMessage({ message, retry }: { message: string; retry: () => void }) {
  return <div className="flex flex-col items-center justify-center rounded-card bg-danger-tint p-8 text-center"><p className="text-sm font-medium text-danger">{message}</p><button onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-pill bg-surface px-4 py-2 text-sm font-semibold text-danger hover:bg-danger-tint"><RefreshCw size={17} /> Try again</button></div>
}

export function Spinner() {
  return <RefreshCw size={17} className="animate-spin text-ink-muted" />
}

export function LoadingRows({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return <div className="w-full overflow-hidden rounded-card bg-surface p-4 shadow-card">{Array.from({ length: rows }).map((_, i) => <div key={i} className="flex items-center justify-between border-b border-line py-4 last:border-0">{Array.from({ length: columns }).map((__, j) => <div key={j} className="mr-4 h-4 w-1/4 animate-pulse rounded-pill bg-track last:mr-0" />)}</div>)}</div>
}
