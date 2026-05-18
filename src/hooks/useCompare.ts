import { useCallback, useSyncExternalStore } from "react";

const KEY = "starhome.compare";
const MAX = 4;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // ignore quota errors — store stays in memory
  }
}

// Module-level shared state so every component using useCompare sees the
// same list and re-renders on change. Without this, each hook instance
// has its own state and toggles don't sync between PropertyCard and CompareBar.
let state: string[] = read();
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function setState(next: string[]): void {
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

function getSnapshot(): string[] {
  return state;
}

// Cross-tab sync: when another tab writes to localStorage, re-read.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = read();
      notify();
    }
  });
}

export function useCompare() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  /**
   * Toggle inclusion. Returns true if added, false if removed, or null if
   * the addition would exceed MAX.
   */
  const toggle = useCallback((id: string): boolean | null => {
    if (state.includes(id)) {
      setState(state.filter((x) => x !== id));
      return false;
    }
    if (state.length >= MAX) return null;
    setState([...state, id]);
    return true;
  }, []);

  const clear = useCallback(() => setState([]), []);

  return { ids, count: ids.length, has, toggle, clear, max: MAX };
}
