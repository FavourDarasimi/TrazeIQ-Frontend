"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchMe, login as loginService, logout as logoutService, refreshSession } from "@/services/auth";
import type { AuthSession, AuthUser } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  applySession: (session: AuthSession) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const session = await fetchMe();
        if (!cancelled) {
          setUser(session.user);
          setStatus("authenticated");
          return;
        }
      } catch {
        // Access cookie missing or expired — try rotating from the refresh
        // cookie before giving up.
        try {
          const session = await refreshSession();
          if (!cancelled) {
            setUser(session.user);
            setStatus("authenticated");
            return;
          }
        } catch {
          // Fall through: no usable session.
        }
      }
      if (!cancelled) setStatus("unauthenticated");
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback((session: AuthSession) => {
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const session = await loginService(email, password);
      applySession(session);
    },
    [applySession]
  );

  const signOut = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      // Still clear local state even if the server already dropped the session.
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut, applySession }),
    [status, user, signIn, signOut, applySession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}