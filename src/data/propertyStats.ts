import type { Property } from "../types";

/**
 * Deterministic "social proof" counters per property. The prototype has no
 * backend, so we synthesise plausible base numbers from the property id and
 * a few of its attributes. The PropertyDetailPage then adds the current
 * user's own view (+1) and favourite (+1 if saved) on top of the base.
 */
export interface PropertyStats {
  /** Baseline views from other users — does not include the current viewer. */
  views: number;
  /** Baseline favourites from other users — does not include this device. */
  favourites: number;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function statsFor(property: Property): PropertyStats {
  const seed = hash(property.id);

  // Pricier listings tend to attract fewer total viewers. The price scales
  // are different for rent vs buy, so we normalise each separately.
  const priceMax = property.listing === "rent" ? 8000 : 8_000_000;
  const priceFactor = Math.max(0.25, 1 - Math.min(1, property.price / priceMax));

  // Base views: 90–2,990, weighted by price factor so cheaper homes look
  // more popular and ultra-prime homes look more exclusive.
  const rawViews = 90 + (seed % 2900);
  const views = Math.round(rawViews * (0.55 + priceFactor * 0.6));

  // Favourite rate: 5–13 % of views, deterministic per property
  const favRate = 0.05 + ((seed >> 7) % 80) / 1000;
  const favourites = Math.max(1, Math.round(views * favRate));

  return { views, favourites };
}
