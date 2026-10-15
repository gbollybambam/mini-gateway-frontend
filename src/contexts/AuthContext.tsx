"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export type UserRole = "owner" | "admin" | "developer" | "finance" | "system_admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  account_type: "merchant" | "team_member" | "admin";
  merchant_id: string;
  business_name: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    api.get("/auth/me")
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
      });

    return () => {
      active = false;
    };
  }, [router]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
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
};

export const useAuth = () => useContext(AuthContext);