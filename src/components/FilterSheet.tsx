import { useEffect, useState } from "react";
import type { Filters, Listing, PropertyType } from "../types";
import { EMPTY_FILTERS } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  listing: Listing;
  filters: Filters;
  onApply: (next: Filters) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "studio", label: "Studio" },
  { value: "maisonette", label: "Maisonette" },
];

const BEDROOMS = [0, 1, 2, 3, 4, 5];

export default function FilterSheet({ open, onClose, listing, filters, onApply }: Props) {
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

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

  const setNum = (key: keyof Filters, raw: string) => {
    const v = raw.trim() === "" ? null : Number(raw);
    setDraft((d) => ({ ...d, [key]: v === null || Number.isNaN(v) ? null : v }));
  };

  const priceUnit = listing === "rent" ? "/ month" : "total";
  const pricePlaceholder = listing === "rent" ? "1500" : "750000";

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

        <section className="sheet__section">
          <h3>Price ({priceUnit})</h3>
          <div className="row-2">
            <label>
              <span>Min</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder={pricePlaceholder}
                value={draft.priceMin ?? ""}
                onChange={(e) => setNum("priceMin", e.target.value)}
              />
            </label>
            <label>
              <span>Max</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="No max"
                value={draft.priceMax ?? ""}
                onChange={(e) => setNum("priceMax", e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="sheet__section">
          <h3>Size (sqm)</h3>
          <div className="row-2">
            <label>
              <span>Min</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="30"
                value={draft.sizeMin ?? ""}
                onChange={(e) => setNum("sizeMin", e.target.value)}
              />
            </label>
            <label>
              <span>Max</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="No max"
                value={draft.sizeMax ?? ""}
                onChange={(e) => setNum("sizeMax", e.target.value)}
              />
            </label>
          </div>
        </section>

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

        <footer className="sheet__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Show results
          </button>
        </footer>
      </div>
    </div>
  );
}
