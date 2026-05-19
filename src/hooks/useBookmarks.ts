import { useCallback, useSyncExternalStore } from "react";

const KEY = "starhome.bookmarks";

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
    // ignore quota errors
  }
}

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

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = read();
      notify();
    }
  });
}

/** Used by signOut to wipe bookmarks when a user logs out. */
export function clearBookmarks(): void {
  setState([]);
}

export function useBookmarks() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    if (state.includes(id)) {
      setState(state.filter((x) => x !== id));
    } else {
      setState([...state, id]);
    }
  }, []);

  const clear = useCallback(() => setState([]), []);

  return { ids, toggle, has, clear };
}
