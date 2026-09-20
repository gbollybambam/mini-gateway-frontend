"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Plus } from "lucide-react";
import { useToast } from "@/components/dashboard/ui";

const labels: Record<string, string> = {
  "/": "Command Center",
  "/transactions": "Payment Ledger",
  "/payment-links": "Checkout Links",
  "/wallets": "Wallet Management",
  "/withdrawals": "Payouts & Withdrawals",
  "/settings": "Merchant Settings",
  "/api-keys": "Cryptographic Keys",
  "/webhooks": "Webhook Endpoints",
};

export default function AppHeader() {
  const pathname = usePathname();
  const toast = useToast();
  
  const title = labels[pathname] ?? Object.entries(labels).find(([path]) => path !== "/" && pathname.startsWith(path))?.[1] ?? "Workspace";

  // Simulate notification click
  const handleNotifications = () => {
    toast.success("System: Infrastructure operating normally. No new alerts.");
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/5 bg-[#090d14]/70 px-6 backdrop-blur-xl lg:px-10">
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-bold text-[#e8edf2] tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">

        {/* INTERACTIVE NOTIFICATION BELL */}
        <button 
          onClick={handleNotifications}
          aria-label="Notifications" 
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-[#8995a3] transition-all hover:bg-white/10 hover:text-white" 
          type="button"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#35d5a4] ring-2 ring-[#090d14]" />
        </button>

        <div className="h-8 w-px bg-white/10 hidden md:block mx-1" />

        <Link 
          href="/payment-links"
          className="hidden md:flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f9d78] to-[#1a6b50] px-5 text-sm font-bold text-white transition-all hover:shadow-[0_0_15px_rgba(47,157,120,0.4)] hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Initialize Link
        </Link>

        <button className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-1.5 pr-4 transition-all hover:bg-white/10" type="button">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] text-xs font-black text-[#090d14]">
            M
          </div>
          <ChevronDown className="h-4 w-4 text-[#8995a3]" />
        </button>
      </div>
    </header>
  );
}