"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Receipt, LinkIcon, Wallet, 
  Landmark, Settings, KeyRound, LogOut, Menu, X, 
  Webhook 
} from "lucide-react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/dashboard/ui";
import DashboardProviders from "@/components/dashboard/DashboardProviders";
import AppHeader from "@/components/dashboard/AppHeader";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Payment Links", href: "/payment-links", icon: LinkIcon },
  { name: "Wallet", href: "/wallets", icon: Wallet },
  { name: "Withdrawals", href: "/withdrawals", icon: Landmark },
];

const settingsNav = [
  { name: "API Keys", href: "/api-keys", icon: KeyRound },
  { name: "Webhooks", href: "/webhooks", icon: Webhook },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    api.get("/auth/me")
      .then(() => setIsAuthorized(true))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } 
    catch { /* ignore */ } 
    finally { router.push("/login"); }
  };

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    return (
      <Link 
        href={item.href} 
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative group overflow-hidden ${
          isActive 
            ? "text-[#35d5a4] bg-white/[0.03]" 
            : "text-[#8995a3] hover:text-[#e8edf2] hover:bg-white/[0.02]"
        }`}
      >
        {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-[#35d5a4] shadow-[0_0_10px_#35d5a4]" />}
        <item.icon className={`h-4 w-4 relative z-10 ${isActive ? "text-[#35d5a4]" : "text-[#68747e] group-hover:text-[#8995a3]"}`} />
        <span className="relative z-10">{item.name}</span>
      </Link>
    );
  };

  if (!isAuthorized) return <div className="flex min-h-screen items-center justify-center bg-[#090d14]"><Spinner /></div>;

  return (
    <DashboardProviders>
      <div className="flex h-screen bg-[#090d14] font-sans text-[#e8edf2] selection:bg-[#2f9d78]/30 relative overflow-hidden">
        
        {/* === NEW: DEEP AMBIENT BACKGROUND LAYER === */}
        <div className="fixed inset-0 z-0 pointer-events-none flex justify-center">
          {/* Base Dark */}
          <div className="absolute inset-0 bg-[#090d14]" />
          {/* Tech Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
          {/* Top Center Emerald Glow */}
          <div className="absolute top-[-10%] w-[60vw] h-[50vh] bg-gradient-to-b from-[#2f9d78]/10 to-transparent blur-[120px] rounded-full" />
          {/* Bottom Right Blue Glow */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vh] bg-[#3f82b2]/5 blur-[150px] rounded-full" />
        </div>
        
        {/* Desktop Sidebar */}
        <aside className="hidden w-[280px] flex-col border-r border-white/5 bg-[#090d14]/60 backdrop-blur-3xl md:flex z-20 shadow-[4px_0_24px_rgba(0,0,0,0.4)] shrink-0 relative">
          <div className="flex h-20 items-center px-8 border-b border-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] shadow-[0_0_20px_rgba(47,157,120,0.2)] text-lg font-black text-[#090d14]">
              P
            </div>
            <span className="ml-3 text-xl font-bold tracking-tight text-white drop-shadow-md">Payflow</span>
          </div>
          
          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-6 pt-8 custom-scrollbar">
            <div className="space-y-1 mb-10">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#2f9d78] mb-4 drop-shadow-sm">Operations</p>
              {navigation.map((item) => <NavItem key={item.name} item={item} />)}
            </div>
            
            <div className="space-y-1 mt-auto">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#2f9d78] mb-4 drop-shadow-sm">Developers</p>
              {settingsNav.map((item) => <NavItem key={item.name} item={item} />)}
              
              <div className="pt-4 mt-4 border-t border-white/5">
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#8995a3] transition-colors hover:bg-red-500/10 hover:text-red-400">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header & Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative z-10">
          <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#090d14]/80 backdrop-blur-xl px-6 md:hidden z-30">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] text-sm font-black text-[#090d14]">P</div>
              <span className="font-bold text-white">Payflow</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#8995a3] hover:text-white transition-colors">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </header>

          <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
            <AppHeader />
            <div className="p-6 lg:p-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProviders>
  );
}