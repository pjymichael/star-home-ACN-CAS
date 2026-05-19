import { useCallback, useSyncExternalStore } from "react";
import type { Property } from "../types";

const KEY = "starhome.discover";

interface DiscoverState {
  /** Property IDs the user swiped right (liked). */
  likedIds: string[];
  /** Property IDs the user swiped left (passed). */
  passedIds: string[];
  /** Frequency counters per attribute, used to re-rank the remaining deck. */
  liked: Buckets;
  passed: Buckets;
}

interface Buckets {
  areas: Record<string, number>;
  types: Record<string, number>;
  bedrooms: Record<string, number>;
  listings: Record<string, number>;
}

function emptyBuckets(): Buckets {
  return { areas: {}, types: {}, bedrooms: {}, listings: {} };
}

function emptyState(): DiscoverState {
  return {
    likedIds: [],
    passedIds: [],
    liked: emptyBuckets(),
    passed: emptyBuckets(),
  };
}

function read(): DiscoverState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      likedIds: Array.isArray(parsed?.likedIds) ? parsed.likedIds.filter((x: unknown) => typeof x === "string") : [],
      passedIds: Array.isArray(parsed?.passedIds) ? parsed.passedIds.filter((x: unknown) => typeof x === "string") : [],
      liked: { ...emptyBuckets(), ...(parsed?.liked ?? {}) },
      passed: { ...emptyBuckets(), ...(parsed?.passed ?? {}) },
    };
  } catch {
    return emptyState();
  }
}

function write(state: DiscoverState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}

let state: DiscoverState = read();
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function setState(next: DiscoverState): void {
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

function getSnapshot(): DiscoverState {
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

function bumpBuckets(buckets: Buckets, p: Property): Buckets {
  return {
    areas: { ...buckets.areas, [p.area]: (buckets.areas[p.area] ?? 0) + 1 },
    types: { ...buckets.types, [p.type]: (buckets.types[p.type] ?? 0) + 1 },
    bedrooms: { ...buckets.bedrooms, [String(p.bedrooms)]: (buckets.bedrooms[String(p.bedrooms)] ?? 0) + 1 },
    listings: { ...buckets.listings, [p.listing]: (buckets.listings[p.listing] ?? 0) + 1 },
  };
}

/** Cleared by signOut alongside bookmarks/recent. */
export function clearDiscover(): void {
  setState(emptyState());
}

/**
 * Laplace-smoothed score in [0, 1] for how well an attribute value matches the user's
 * accumulated taste profile. Returns 0.5 when there's no data.
 */
function attrScore(liked: Record<string, number>, passed: Record<string, number>, value: string): number {
  const l = liked[value] ?? 0;
  const p = passed[value] ?? 0;
  return (l + 1) / (l + p + 2);
}

export function useDiscover() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const has = useCallback((id: string) => value.likedIds.includes(id) || value.passedIds.includes(id), [value]);

  const like = useCallback((p: Property) => {
    if (state.likedIds.includes(p.id)) return;
    setState({
      ...state,
      likedIds: [...state.likedIds, p.id],
      passedIds: state.passedIds.filter((x) => x !== p.id),
      liked: bumpBuckets(state.liked, p),
    });
  }, []);

  const pass = useCallback((p: Property) => {
    if (state.passedIds.includes(p.id) || state.likedIds.includes(p.id)) return;
    setState({
      ...state,
      passedIds: [...state.passedIds, p.id],
      passed: bumpBuckets(state.passed, p),
    });
  }, []);

  const undo = useCallback((id: string) => {
    setState({
      ...state,
      likedIds: state.likedIds.filter((x) => x !== id),
      passedIds: state.passedIds.filter((x) => x !== id),
      // We intentionally don't roll back the bucket counters — they're meant to
      // accumulate as taste signal even if a specific card is re-considered.
    });
  }, []);

  const reset = useCallback(() => setState(emptyState()), []);

  const score = useCallback(
    (p: Property): number => {
      const a = attrScore(value.liked.areas, value.passed.areas, p.area);
      const t = attrScore(value.liked.types, value.passed.types, p.type);
      const b = attrScore(value.liked.bedrooms, value.passed.bedrooms, String(p.bedrooms));
      const l = attrScore(value.liked.listings, value.passed.listings, p.listing);
      return (a + t + b + l) / 4;
    },
    [value],
  );

  return { state: value, has, like, pass, undo, reset, score };
}
