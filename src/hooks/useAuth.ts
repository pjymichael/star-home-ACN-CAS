import { useCallback, useEffect, useState } from "react";

const KEY = "starhome.auth";

interface AuthState {
  phone: string;
  verifiedAt: number;
}

function read(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthState;
    if (parsed && typeof parsed.phone === "string" && typeof parsed.verifiedAt === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState | null>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback((phone: string) => {
    const next: AuthState = { phone, verifiedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(next));
    setState(next);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
    setState(null);
  }, []);

  return { phone: state?.phone ?? null, isVerified: state !== null, signIn, signOut };
}
