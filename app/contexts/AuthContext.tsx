"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const TOKEN_KEY = "pdf_analyzer_token";
const EMAIL_KEY = "pdf_analyzer_email";
const NAME_KEY = "pdf_analyzer_name";

type AuthContextValue = {
  token: string | null;
  email: string | null;
  name: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
    setEmail(localStorage.getItem(EMAIL_KEY));
    setName(localStorage.getItem(NAME_KEY));
    setHydrated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(NAME_KEY);
    setToken(null);
    setEmail(null);
    setName(null);
  }, []);

  const login = useCallback(async (emailIn: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailIn, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Login failed.");
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(EMAIL_KEY, data.user.email);
    const displayName =
      typeof data.user?.name === "string" && data.user.name ? data.user.name : "";
    if (displayName) localStorage.setItem(NAME_KEY, displayName);
    else localStorage.removeItem(NAME_KEY);
    setToken(data.token);
    setEmail(data.user.email);
    setName(displayName || null);
  }, []);

  const register = useCallback(async (nameIn: string, emailIn: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameIn, email: emailIn, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Registration failed.");
    }
  }, []);

  const value = useMemo(
    () => ({ token, email, name, hydrated, login, register, logout }),
    [token, email, name, hydrated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return ctx;
}
