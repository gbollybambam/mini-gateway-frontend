"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

let authMeRequest: Promise<{ data: { data: UserProfile } }> | null = null;

export type UserRole = "owner" | "admin" | "developer" | "finance";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  account_type: "merchant" | "team_member";
  merchant_id: string;
  business_name: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const request = authMeRequest ??= api.get<{ data: UserProfile }>("/auth/me");

    request
      .then((res) => {
        if (active) {
          setUser(res.data.data);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          router.replace("/login");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
        if (authMeRequest === request) {
          authMeRequest = null;
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      authMeRequest = null;
      setUser(null);
      router.replace("/login");
    }
  };

  if (!loading && !user) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}