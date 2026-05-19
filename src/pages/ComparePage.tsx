import { Link, useNavigate } from "react-router-dom";
import type { Property } from "../types";
import { useCompare } from "../hooks/useCompare";
import { useBookmarks } from "../hooks/useBookmarks";
import { useAuthGate } from "../components/AuthGateProvider";
import { findProperty } from "../data/properties";
import { formatPrice } from "../utils/format";

interface Row {
  label: string;
  render: (p: Property) => React.ReactNode;
  /** When provided, the property with this value highlighted. Used to mark
   *  the "best" cell in numeric rows (lowest price, largest size, etc.). */
  highlight?: (p: Property) => number;
  highlightDirection?: "min" | "max";
}

const ROWS: Row[] = [
  {
    label: "Listing",
    render: (p) => (p.listing === "rent" ? "To let" : "For sale"),
  },
  {
    label: "Price",
    render: (p) => formatPrice(p.price, p.listing),
    highlight: (p) => p.price,
    highlightDirection: "min",
  },
  {
    label: "Bedrooms",
    render: (p) => (p.bedrooms === 0 ? "Studio" : String(p.bedrooms)),
    highlight: (p) => p.bedrooms,
    highlightDirection: "max",
  },
  {
    label: "Size",
    render: (p) => `${p.size} sqm`,
    highlight: (p) => p.size,
    highlightDirection: "max",
  },
  {
    label: "Type",
    render: (p) => <span className="capitalize">{p.type}</span>,
  },
  {
    label: "Area",
    render: (p) => p.area,
  },
  {
    label: "Address",
    render: (p) => <span className="compare-address">{p.address}</span>,
  },
  {
    label: "£ per sqm",
    render: (p) => {
      const value = p.price / p.size;
      return `£${Math.round(value).toLocaleString("en-GB")}${p.listing === "rent" ? " /mo" : ""}`;
    },
    highlight: (p) => p.price / p.size,
    highlightDirection: "min",
  },
  {
    label: "Description",
    render: (p) => <span className="compare-desc">{p.description}</span>,
  },
];

export default function ComparePage() {
  const navigate = useNavigate();
  const { ids, toggle, clear } = useCompare();
  const { has: isFav, toggle: toggleFav } = useBookmarks();
  const { requireAuth } = useAuthGate();

  const properties = ids
    .map(findProperty)
    .filter((p): p is Property => Boolean(p));

  if (properties.length === 0) {
    return (
      <div className="page page--compare">
        <header className="page__header">
          <h1>Compare</h1>
        </header>
        <div className="empty empty--big">
          <h3>Nothing to compare</h3>
          <p>Tap "Compare" on any property to add it here, then come back.</p>
          <button type="button" className="btn btn--primary" onClick={() => navigate("/search")}>
            Find properties
          </button>
        </div>
      </div>
    );
  }

  // Pre-compute the highlight winner for each row so we can mark cells
  const rowWinners = ROWS.map((row) => {
    if (!row.highlight || properties.length < 2) return null;
    const values = properties.map((p) => row.highlight!(p));
    const pick = row.highlightDirection === "max" ? Math.max(...values) : Math.min(...values);
    return pick;
  });

  const colWidth = Math.max(160, Math.min(220, 320 / properties.length));

  return (
    <div className="page page--compare">
      <header className="page__header">
        <div>
          <h1>Compare</h1>
          <p className="muted">{properties.length} {properties.length === 1 ? "property" : "properties"}</p>
        </div>
        <button type="button" className="link link--quiet" onClick={clear}>
          Clear all
        </button>
      </header>

      <div
        className="compare-table"
        style={{ ["--col-w" as string]: `${colWidth}px` }}
      >
        <div className="compare-row compare-row--header">
          <div className="compare-cell compare-cell--label" />
          {properties.map((p) => (
            <div key={p.id} className="compare-cell compare-cell--head">
              <Link to={`/property/${p.id}`} className="compare-head__media">
                <img src={p.pictures[0]} alt={p.name} loading="lazy" />
              </Link>
              <Link to={`/property/${p.id}`} className="compare-head__name">
                {p.name}
              </Link>
              <div className="compare-head__actions">
                <button
                  type="button"
                  className={`compare-fav${isFav(p.id) ? " is-active" : ""}`}
                  aria-label={isFav(p.id) ? "Remove from favourites" : "Add to favourites"}
                  onClick={() =>
                    requireAuth({
                      feature: "Sign in to save this to your favourites",
                      onSuccess: () => toggleFav(p.id),
                    })
                  }
                >
                  ♥
                </button>
                <button
                  type="button"
                  className="compare-remove"
                  onClick={() => toggle(p.id)}
                  aria-label={`Remove ${p.name}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {ROWS.map((row, ri) => (
          <div key={row.label} className="compare-row">
            <div className="compare-cell compare-cell--label">{row.label}</div>
            {properties.map((p) => {
              const winner = rowWinners[ri];
              const isWinner =
                row.highlight && winner != null && row.highlight(p) === winner;
              return (
                <div
                  key={p.id}
                  className={`compare-cell${isWinner ? " is-winner" : ""}`}
                >
                  {row.render(p)}
                  {isWinner && <span className="compare-best">Best</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
