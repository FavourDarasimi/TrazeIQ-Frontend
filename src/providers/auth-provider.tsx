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

import { fetchMe, login as loginService, logout as logoutService } from "@/services/auth";
import type { AuthSession, AuthUser } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (identifier: string, password: string) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  applySession: (session: AuthSession) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/docs"];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      const hasAuthHint =
        typeof window !== "undefined" &&
        window.localStorage.getItem("trazeiq_logged_in") === "true";

      // If on a public landing or auth page and there is no login hint, skip
      // making auth calls to avoid noisy 401 failures in browser devtools.
      if (!hasAuthHint && isPublicRoute(pathname)) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }

      try {
        const session = await fetchMe();
        if (!cancelled) {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("trazeiq_logged_in", "true");
          }
          setUser(session.user);
          setStatus("authenticated");
          return;
        }
      } catch {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("trazeiq_logged_in");
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
    if (typeof window !== "undefined") {
      window.localStorage.setItem("trazeiq_logged_in", "true");
    }
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      const session = await loginService(identifier, password);
      applySession(session);
      return session;
    },
    [applySession]
  );

  const signOut = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      // Still clear local state even if the server already dropped the session.
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("trazeiq_logged_in");
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