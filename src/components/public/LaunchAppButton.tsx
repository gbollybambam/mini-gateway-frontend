"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import Spinner from "@/components/Spinner"

type Variant = "primary" | "secondary" | "inverse"

export default function LaunchAppButton({
  label = "Launch app",
  variant = "primary",
  className = "",
}: {
  label?: string
  variant?: Variant
  className?: string
}) {
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  const openApp = async () => {
    if (checking) return
    setChecking(true)
    try {
      const res = await api.get<{ data?: { role?: string } }>("/auth/me")
      const role = res.data?.data?.role
      router.push(role === "system_admin" ? "/admin/dashboard" : "/overview")
    } catch {
      router.push("/login")
    } finally {
      setChecking(false)
    }
  }

  const base =
    "inline-flex items-center justify-center gap-2 rounded-[8px] text-[13px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
  const styles =
    variant === "primary"
      ? "h-10 bg-gradient-to-b from-[#27272A] to-[#09090B] px-4 text-white shadow-sm ring-1 ring-black/10 hover:brightness-125"
      : variant === "inverse"
        ? "h-10 bg-white px-4 text-[#09090B] shadow-sm hover:bg-[#F4F4F5]"
        : "h-10 border border-[var(--pm-line)] bg-[var(--pm-band)] px-4 text-[var(--pm-ink)] shadow-sm hover:bg-[var(--pm-band-hover)]"

  return (
    <button type="button" onClick={openApp} disabled={checking} className={`${base} ${styles} ${className}`}>
      {checking && <Spinner size={15} />}
      {checking ? "Opening…" : label}
    </button>
  )
}
