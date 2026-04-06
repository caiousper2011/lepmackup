"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  referralCode: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
    deliveryMode?: "resend" | "resend-fallback" | "simulated";
    devCode?: string;
  }>;
  verifyCode: (
    email: string,
    code: string,
    referralCode?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string) => {
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      return {
        success: true,
        message: data.message,
        deliveryMode: data.deliveryMode,
        devCode: data.devCode,
      };
    } catch {
      return { success: false, error: "Erro de conexão. Tente novamente." };
    }
  };

  const verifyCode = async (
    email: string,
    code: string,
    referralCode?: string,
  ) => {
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, referralCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Erro de conexão. Tente novamente." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, verifyCode, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
