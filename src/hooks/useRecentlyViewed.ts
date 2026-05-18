import { useCallback, useEffect, useState } from "react";

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
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function useRecentlyViewed() {
  const [entries, setEntries] = useState<RecentEntry[]>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setEntries(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const record = useCallback((id: string) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      const next: RecentEntry[] = [{ id, viewedAt: Date.now() }, ...filtered].slice(0, MAX);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setEntries([]);
  }, []);

  return { entries, record, clear };
}
