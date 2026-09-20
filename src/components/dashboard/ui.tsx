"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, RefreshCw } from "./icons";

// Refined, modernized button styles
export const primaryButton = "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
export const secondaryButton = "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-slate-800 text-slate-200 font-medium text-sm hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed";

export function useToast() {
  return {
    success: (msg: string) => toast.success(msg, { 
      style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(16, 185, 129, 0.2)' },
      iconTheme: { primary: '#10b981', secondary: '#fff' }
    }),
    error: (msg: string) => toast.error(msg, { 
      style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.2)' },
      iconTheme: { primary: '#ef4444', secondary: '#fff' }
    }),
  };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" toastOptions={{ className: 'text-sm font-medium' }} />
    </>
  );
}

export function Input({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <input 
        className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 text-slate-100 placeholder:text-slate-500 transition-colors focus:border-emerald-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
        {...rest} 
      />
    </label>
  );
}

export function Select({ label, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <select 
        className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 text-slate-100 transition-colors focus:border-emerald-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function SecretValue({ label, value }: { label: string; value: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid gap-1.5">
      {label && <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>}
      <div className="flex h-11 items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-4">
        <code className="text-sm text-emerald-400 font-mono tracking-tight">
          {visible ? value : "••••••••••••••••••••••••"}
        </code>
        <button 
          type="button" 
          onClick={() => setVisible(!visible)} 
          className="text-slate-500 hover:text-slate-200 transition-colors"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/20 py-16 text-center">
      <p className="text-sm text-slate-400 max-w-sm">{children}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorMessage({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center">
      <p className="text-sm font-medium text-red-400">{message}</p>
      <button onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors">
        <RefreshCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}

export function Spinner() {
  return <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />;
}

export function LoadingRows({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-slate-800 py-4 last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-4 w-1/4 rounded bg-slate-800/50 animate-pulse mr-4 last:mr-0" />
          ))}
        </div>
      ))}
    </div>
  );
}