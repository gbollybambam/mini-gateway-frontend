"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Receipt, LinkIcon, Wallet, 
  Landmark, Settings, KeyRound, LogOut, Menu, X, 
  Webhook, Users 
} from "lucide-react";
import DashboardProviders, { useAuth } from "@/components/dashboard/DashboardProviders";
import AppHeader from "@/components/dashboard/AppHeader";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Payment Links", href: "/payment-links", icon: LinkIcon },
  { name: "Wallet", href: "/wallets", icon: Wallet },
  { name: "Withdrawals", href: "/withdrawals", icon: Landmark },
];

const settingsNav = [
  { name: "Team Management", href: "/team", icon: Users },
  { name: "API Keys", href: "/api-keys", icon: KeyRound },
  { name: "Webhooks", href: "/webhooks", icon: Webhook },
  { name: "Settings", href: "/settings", icon: Settings },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { user, loading, logout } = useAuth();

  // 1. Define exactly what each role can access (URL based)
  useEffect(() => {
    if (loading || !user) return;

    const role = user.role;
    
    // Admin & Owner can access everything.
    if (role === "owner" || role === "admin") return;

    // Restricted Routes Map
    const restrictedForDeveloper = ["/wallets", "/withdrawals", "/team"];
    const restrictedForFinance = ["/api-keys", "/webhooks", "/team"];

    const isRestricted = (restrictedPaths: string[]) => 
      restrictedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

    // 2. The Bouncer: Kick them out if they type a URL they shouldn't be at
    if (role === "developer" && isRestricted(restrictedForDeveloper)) {
      router.replace("/");
    }

    if (role === "finance" && isRestricted(restrictedForFinance)) {
      router.replace("/");
    }

  }, [pathname, user, loading, router]);

  const getAllowedNav = (navItems: typeof navigation) => {
    return navItems.filter(item => {
      if (!user) return false; 
      const role = user.role;
      
      if (role === "owner" || role === "admin") return true;

      if (role === "developer") {
        return !["Wallet", "Withdrawals", "Team Management"].includes(item.name);
      }

      if (role === "finance") {
        return !["API Keys", "Webhooks", "Team Management"].includes(item.name);
      }

      return true;
    });
  };

  const allowedNavigation = getAllowedNav(navigation);
  const allowedSettingsNav = getAllowedNav(settingsNav);

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    return (
      <Link 
        href={item.href} 
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative group overflow-hidden ${
          isActive ? "text-[#35d5a4] bg-white/3" : "text-[#8995a3] hover:text-[#e8edf2] hover:bg-white/2"
        }`}
      >
        {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-[#35d5a4] shadow-[0_0_10px_#35d5a4]" />}
        <item.icon className={`h-4 w-4 relative z-10 ${isActive ? "text-[#35d5a4]" : "text-[#68747e] group-hover:text-[#8995a3]"}`} />
        <span className="relative z-10">{item.name}</span>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090d14]">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] shadow-[0_0_30px_rgba(47,157,120,0.3)] text-2xl font-black text-[#090d14]">
          P
        </div>
      </div>
    );
  }

  // Prevent rendering the restricted page layout while redirecting
  const role = user?.role;
  if (role === "developer" && ["/wallets", "/withdrawals", "/team"].some(p => pathname.startsWith(p))) return null;
  if (role === "finance" && ["/api-keys", "/webhooks", "/team"].some(p => pathname.startsWith(p))) return null;

  return (
    <div className="flex h-screen bg-[#090d14] font-sans text-[#e8edf2] selection:bg-[#2f9d78]/30 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center">
        <div className="absolute inset-0 bg-[#090d14]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-10%] w-[60vw] h-[50vh] bg-gradient-to-b from-[#2f9d78]/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vh] bg-[#3f82b2]/5 blur-[150px] rounded-full" />
      </div>
      
      <aside className="hidden w-70 flex-col border-r border-white/5 bg-[#090d14]/60 backdrop-blur-3xl md:flex z-20 shadow-[4px_0_24px_rgba(0,0,0,0.4)] shrink-0 relative">
        <div className="flex h-20 items-center px-8 border-b border-white/5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] shadow-[0_0_20px_rgba(47,157,120,0.2)] text-lg font-black text-[#090d14]">P</div>
          <span className="ml-3 text-xl font-bold tracking-tight text-white drop-shadow-md">Payflow</span>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-6 pt-8 custom-scrollbar">
          <div className="space-y-1 mb-10">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#2f9d78] mb-4 drop-shadow-sm">Operations</p>
            {allowedNavigation.map((item) => <NavItem key={item.name} item={item} />)}
          </div>
          
          <div className="space-y-1 mt-auto">
            {allowedSettingsNav.length > 0 && <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#2f9d78] mb-4 drop-shadow-sm">Developers</p>}
            {allowedSettingsNav.map((item) => <NavItem key={item.name} item={item} />)}
            
            <div className="pt-4 mt-4 border-t border-white/5">
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#8995a3] transition-colors hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

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

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          <AppHeader />
          <div className="p-4 sm:p-6 lg:p-10 w-full flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProviders>
  );
}