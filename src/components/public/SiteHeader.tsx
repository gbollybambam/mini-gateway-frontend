"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "@/components/icons"
import ThemeToggle from "@/components/ThemeToggle"
import LaunchAppButton from "./LaunchAppButton"

const links = [
  { label: "Product", href: "/#solutions" },
  { label: "How it works", href: "/#how" },
  { label: "Developers", href: "/#developers" },
  { label: "Docs", href: "/docs" },
]

export function PayMeshLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-[8px] bg-gradient-to-b from-[#27272A] to-[#09090B] text-[13px] font-bold text-white shadow-sm ring-1 ring-black/10">
        P
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-[var(--pm-ink)]">
        PayMesh{!compact && <span className="text-[#12B981]">.</span>}
      </span>
    </span>
  )
}

export default function SiteHeader({ active = "" }: { active?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--pm-line)] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="PayMesh home" className="shrink-0">
          <PayMeshLogo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Public navigation">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={active === link.label ? "page" : undefined}
              className={`text-[13px] font-medium transition-colors hover:text-[var(--pm-ink)] ${
                active === link.label ? "text-[var(--pm-ink)]" : "text-[#71717A]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-[8px] px-3 text-[13px] font-medium text-[#52525B] transition-colors hover:bg-[var(--pm-band)] hover:text-[var(--pm-ink)]"
          >
            Sign in
          </Link>
          <LaunchAppButton />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid size-9 place-items-center rounded-[8px] border border-[var(--pm-line)] bg-white text-[#52525B] md:hidden"
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--pm-line)] bg-white px-4 py-3 md:hidden">
          <nav className="grid gap-0.5" aria-label="Mobile public navigation">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-[8px] px-3 text-[13px] font-medium text-[#52525B] hover:bg-[var(--pm-band)] hover:text-[var(--pm-ink)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-[var(--pm-line)]" />
            <div className="flex items-center justify-between rounded-[8px] px-3 py-1.5">
              <span className="text-[13px] font-medium text-[#52525B]">Appearance</span>
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-[8px] px-3 text-[13px] font-medium text-[#52525B] hover:bg-[var(--pm-band)] hover:text-[var(--pm-ink)]"
            >
              Sign in
            </Link>
            <div className="px-3 pt-1">
              <LaunchAppButton className="w-full" />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
