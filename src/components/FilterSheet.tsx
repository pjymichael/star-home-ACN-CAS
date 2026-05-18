import { useEffect, useMemo, useState } from "react";
import type { Filters, Listing, Property, PropertyType } from "../types";
import { EMPTY_FILTERS } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  listing: Listing;
  filters: Filters;
  onApply: (next: Filters) => void;
  properties: Property[];
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "maisonette", label: "Maisonette" },
  { value: "condo", label: "Condo" },
];

const BEDROOMS = [0, 1, 2, 3, 4, 5];

const RENT_POPULAR = [
  { label: "£1,000 – £2,500", min: 1000, max: 2500 },
  { label: "£2,500 – £5,000", min: 2500, max: 5000 },
  { label: "£5,000+", min: 5000, max: null },
];
const BUY_POPULAR = [
  { label: "Under £1m", min: null, max: 1000000 },
  { label: "£1m – £3m", min: 1000000, max: 3000000 },
  { label: "£3m+", min: 3000000, max: null },
];

const RENT_PRICE = { min: 0, max: 8000, step: 100 };
const BUY_PRICE  = { min: 0, max: 16000000, step: 50000 };
const SIZE_RANGE = { min: 0, max: 600, step: 5 };
const BUCKETS    = 20;

function histogram(values: number[], rangeMin: number, rangeMax: number): number[] {
  const buckets = new Array(BUCKETS).fill(0);
  const span = rangeMax - rangeMin || 1;
  for (const v of values) {
    const idx = Math.min(BUCKETS - 1, Math.floor(((v - rangeMin) / span) * BUCKETS));
    if (idx >= 0) buckets[idx]++;
  }
  return buckets;
}

// ─── Dual-thumb range slider ─────────────────────────────────────────────────
interface SliderProps {
  sliderMin: number;
  sliderMax: number;
  step: number;
  low: number;
  high: number;
  onLow: (v: number) => void;
  onHigh: (v: number) => void;
  buckets: number[];
}

function RangeSlider({ sliderMin, sliderMax, step, low, high, onLow, onHigh, buckets }: SliderProps) {
  const span    = sliderMax - sliderMin || 1;
  const lowPct  = ((low  - sliderMin) / span) * 100;
  const highPct = ((high - sliderMin) / span) * 100;
  const maxBucket = Math.max(...buckets, 1);
  const bucketW   = 100 / BUCKETS;

  return (
    <div className="rs-wrap">
      {/* Histogram */}
      <div className="rs-histo" aria-hidden="true">
        {buckets.map((count, i) => {
          const barLeft = (i / BUCKETS) * 100;
          const inRange = barLeft + bucketW > lowPct && barLeft < highPct;
          return (
            <div
              key={i}
              className={`rs-histo__bar${inRange ? " is-active" : ""}`}
              style={{ height: `${Math.max(8, (count / maxBucket) * 100)}%` }}
            />
          );
        })}
      </div>

      {/* Slider track */}
      <div className="rs-slider">
        <div className="rs-slider__track" />
        <div
          className="rs-slider__fill"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        <input
          type="range"
          className="rs-slider__input"
          min={sliderMin} max={sliderMax} step={step}
          value={low}
          style={{ zIndex: low > sliderMin + (sliderMax - sliderMin) * 0.9 ? 5 : 3 }}
          onChange={(e) => onLow(Math.min(Number(e.target.value), high - step))}
          aria-label="Minimum"
        />
        <input
          type="range"
          className="rs-slider__input"
          min={sliderMin} max={sliderMax} step={step}
          value={high}
          style={{ zIndex: 4 }}
          onChange={(e) => onHigh(Math.max(Number(e.target.value), low + step))}
          aria-label="Maximum"
        />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function FilterSheet({ open, onClose, listing, filters, onApply, properties }: Props) {
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const priceRange   = listing === "rent" ? RENT_PRICE : BUY_PRICE;
  const popularRanges = listing === "rent" ? RENT_POPULAR : BUY_POPULAR;

  const priceLow  = draft.priceMin ?? priceRange.min;
  const priceHigh = draft.priceMax ?? priceRange.max;
  const sizeLow   = draft.sizeMin  ?? SIZE_RANGE.min;
  const sizeHigh  = draft.sizeMax  ?? SIZE_RANGE.max;

  const inListing = useMemo(
    () => properties.filter((p) => p.listing === listing),
    [properties, listing],
  );

  const priceBuckets = useMemo(
    () => histogram(inListing.map((p) => p.price), priceRange.min, priceRange.max),
    [inListing, priceRange],
  );

  const sizeBuckets = useMemo(
    () => histogram(inListing.map((p) => p.size), SIZE_RANGE.min, SIZE_RANGE.max),
    [inListing],
  );

  const draftCount = useMemo(() => {
    return inListing.filter((p) => {
      if (draft.priceMin != null && p.price < draft.priceMin) return false;
      if (draft.priceMax != null && p.price > draft.priceMax) return false;
      if (draft.sizeMin  != null && p.size  < draft.sizeMin)  return false;
      if (draft.sizeMax  != null && p.size  > draft.sizeMax)  return false;
      if (draft.types.length > 0 && !draft.types.includes(p.type)) return false;
      if (draft.bedrooms.length > 0) {
        const wantsFivePlus = draft.bedrooms.includes(5);
        if (!draft.bedrooms.includes(p.bedrooms) && !(wantsFivePlus && p.bedrooms >= 5)) return false;
      }
      return true;
    }).length;
  }, [inListing, draft]);

  if (!open) return null;

  const toggleType = (t: PropertyType) =>
    setDraft((d) => ({
      ...d,
      types: d.types.includes(t) ? d.types.filter((x) => x !== t) : [...d.types, t],
    }));

  const toggleBeds = (b: number) =>
    setDraft((d) => ({
      ...d,
      bedrooms: d.bedrooms.includes(b) ? d.bedrooms.filter((x) => x !== b) : [...d.bedrooms, b],
    }));

  const setNumField = (key: keyof Filters, raw: string) => {
    const v = raw.trim() === "" ? null : Number(raw);
    setDraft((d) => ({ ...d, [key]: v === null || Number.isNaN(v) ? null : v }));
  };

  const isPopularActive = (min: number | null, max: number | null) =>
    draft.priceMin === min && draft.priceMax === max;

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Filters">
      <div className="sheet__backdrop" onClick={onClose} />
      <div className="sheet__panel">
        <header className="sheet__header">
          <h2>Filters</h2>
          <button type="button" className="link" onClick={() => setDraft(EMPTY_FILTERS)}>
            Reset
          </button>
        </header>

        {/* ── Price range ─────────────────────────────────────────────── */}
        <section className="sheet__section">
          <h3>Price range{listing === "rent" ? " (/ month)" : ""}</h3>
          <RangeSlider
            sliderMin={priceRange.min} sliderMax={priceRange.max} step={priceRange.step}
            low={priceLow} high={priceHigh}
            onLow={(v) => setDraft((d) => ({ ...d, priceMin: v <= priceRange.min ? null : v }))}
            onHigh={(v) => setDraft((d) => ({ ...d, priceMax: v >= priceRange.max ? null : v }))}
            buckets={priceBuckets}
          />
          <div className="range-inputs">
            <div className="range-input">
              <span className="range-input__label">Min Price</span>
              <div className="range-input__field">
                <span className="range-input__affix">£</span>
                <input
                  type="number" inputMode="numeric" placeholder="0"
                  value={draft.priceMin ?? ""}
                  onChange={(e) => setNumField("priceMin", e.target.value)}
                />
              </div>
            </div>
            <div className="range-input">
              <span className="range-input__label">Max Price</span>
              <div className="range-input__field">
                <span className="range-input__affix">£</span>
                <input
                  type="number" inputMode="numeric" placeholder="Any"
                  value={draft.priceMax ?? ""}
                  onChange={(e) => setNumField("priceMax", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="popular-ranges">
            <span className="popular-ranges__label">Popular ranges</span>
            {popularRanges.map((r) => (
              <button
                key={r.label}
                type="button"
                className={`popular-chip${isPopularActive(r.min, r.max) ? " is-active" : ""}`}
                onClick={() => setDraft((d) => ({ ...d, priceMin: r.min, priceMax: r.max }))}
              >
                {r.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Size (sqm) ──────────────────────────────────────────────── */}
        <section className="sheet__section">
          <h3>Size (sqm)</h3>
          <RangeSlider
            sliderMin={SIZE_RANGE.min} sliderMax={SIZE_RANGE.max} step={SIZE_RANGE.step}
            low={sizeLow} high={sizeHigh}
            onLow={(v) => setDraft((d) => ({ ...d, sizeMin: v <= SIZE_RANGE.min ? null : v }))}
            onHigh={(v) => setDraft((d) => ({ ...d, sizeMax: v >= SIZE_RANGE.max ? null : v }))}
            buckets={sizeBuckets}
          />
          <div className="range-inputs">
            <div className="range-input">
              <span className="range-input__label">Min Size</span>
              <div className="range-input__field">
                <input
                  type="number" inputMode="numeric" placeholder="0"
                  value={draft.sizeMin ?? ""}
                  onChange={(e) => setNumField("sizeMin", e.target.value)}
                />
                <span className="range-input__affix range-input__affix--right">m²</span>
              </div>
            </div>
            <div className="range-input">
              <span className="range-input__label">Max Size</span>
              <div className="range-input__field">
                <input
                  type="number" inputMode="numeric" placeholder="Any"
                  value={draft.sizeMax ?? ""}
                  onChange={(e) => setNumField("sizeMax", e.target.value)}
                />
                <span className="range-input__affix range-input__affix--right">m²</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Property type ───────────────────────────────────────────── */}
        <section className="sheet__section">
          <h3>Property type</h3>
          <div className="chips">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`chip${draft.types.includes(t.value) ? " is-active" : ""}`}
                onClick={() => toggleType(t.value)}
                aria-pressed={draft.types.includes(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Bedrooms ────────────────────────────────────────────────── */}
        <section className="sheet__section">
          <h3>Bedrooms</h3>
          <div className="chips">
            {BEDROOMS.map((b) => (
              <button
                key={b}
                type="button"
                className={`chip${draft.bedrooms.includes(b) ? " is-active" : ""}`}
                onClick={() => toggleBeds(b)}
                aria-pressed={draft.bedrooms.includes(b)}
              >
                {b === 0 ? "Studio" : `${b}${b === 5 ? "+" : ""}`}
              </button>
            ))}
          </div>
        </section>

        <footer className="sheet__footer--single">
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => { onApply(draft); onClose(); }}
          >
            Apply Filters&nbsp;
            <span style={{ opacity: 0.75, fontWeight: 400, fontSize: "0.9em" }}>
              ({draftCount} {draftCount === 1 ? "result" : "results"})
            </span>
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => { setDraft(EMPTY_FILTERS); onApply(EMPTY_FILTERS); onClose(); }}
          >
            Clear all filters
          </button>
        </footer>
      </div>
    </div>
  );
}
