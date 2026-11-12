"use client";

import { useAuth, UserRole } from "@/components/dashboard/DashboardProviders";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 1. Calculate authorization instantly during render (fixes the ESLint error)
  const isAuthorized = user ? (user.role === "owner" || allowedRoles.includes(user.role)) : false;

  // 2. Only use useEffect for the actual side-effect (redirecting the browser)
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
    } else if (!isAuthorized) {
      router.replace("/"); // Send unauthorized users back to the dashboard home
    }
  }, [user, loading, isAuthorized, router]);

  // 3. Show loader while checking auth, or while the router is actively redirecting
  if (loading || !isAuthorized) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-brand-900 text-2xl font-black text-surface">
          P
        </div>
      </div>
    );
  }

  return <>{children}</>;
}