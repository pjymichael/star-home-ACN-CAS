import { useCallback, useSyncExternalStore } from "react";
import { clearBookmarks } from "./useBookmarks";
import { clearRecent } from "./useRecentlyViewed";
import { clearDiscover } from "./useDiscover";

const KEY = "starhome.auth";

interface AuthState {
  name: string;
  phone: string;
  verifiedAt: number;
}

function read(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (parsed && typeof parsed.phone === "string" && typeof parsed.verifiedAt === "number") {
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        phone: parsed.phone,
        verifiedAt: parsed.verifiedAt,
      };
    }
    return null;
  } catch {
    return null;
  }
}

let state: AuthState | null = read();
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function setState(next: AuthState | null): void {
  state = next;
  try {
    if (next === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
  notify();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): AuthState | null {
  return state;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = read();
      notify();
    }
  });
}

export function useAuth() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const signIn = useCallback((phone: string, name: string = "") => {
    setState({ name, phone, verifiedAt: Date.now() });
  }, []);

  const signOut = useCallback(() => {
    // Favourites, history, and the Discover taste profile all belong to the
    // account — wipe them so the next guest or returning user starts fresh.
    clearBookmarks();
    clearRecent();
    clearDiscover();
    setState(null);
  }, []);

  return {
    name: value?.name ?? null,
    phone: value?.phone ?? null,
    isVerified: value !== null,
    signIn,
    signOut,
  };
}
