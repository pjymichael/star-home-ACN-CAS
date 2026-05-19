import { useCallback, useSyncExternalStore } from "react";

const KEY = "starhome.recent";
const MAX = 20;

export interface RecentEntry {
  id: string;
  viewedAt: number;
}

function read(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RecentEntry =>
        e && typeof e.id === "string" && typeof e.viewedAt === "number",
    );
  } catch {
    return [];
  }
}

function write(entries: RecentEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // ignore quota errors
  }
}

let state: RecentEntry[] = read();
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function setState(next: RecentEntry[]): void {
  state = next;
  write(next);
  notify();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): RecentEntry[] {
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

/** Used by signOut to wipe history when a user logs out. */
export function clearRecent(): void {
  setState([]);
}

export function useRecentlyViewed() {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const record = useCallback((id: string) => {
    const filtered = state.filter((e) => e.id !== id);
    setState([{ id, viewedAt: Date.now() }, ...filtered].slice(0, MAX));
  }, []);

  const clear = useCallback(() => setState([]), []);

  return { entries, record, clear };
}
