"use client";

import { createContext, useCallback, useContext, useState } from "react";

const STORAGE_KEY = "trazeiq-docs-code-lang";

const CodeLangContext = createContext<{
  lang: string;
  setLang: (l: string) => void;
}>({ lang: "curl", setLang: () => {} });

export function CodeLangProvider({ children }: { children: React.ReactNode }) {
  // Lazy init from localStorage (client-only read, no effect setState).
  const [lang, setLangState] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? "curl";
    } catch {
      return "curl";
    }
  });

  const setLang = useCallback((l: string) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  return <CodeLangContext.Provider value={{ lang, setLang }}>{children}</CodeLangContext.Provider>;
}

export function useCodeLang() {
  return useContext(CodeLangContext);
}
