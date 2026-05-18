import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AREAS, findArea, searchAreas } from "../data/areas";
import { PROPERTIES, propertiesInArea } from "../data/properties";
import type { Filters, Listing, SortKey } from "../types";
import { EMPTY_FILTERS } from "../types";
import PropertyCard from "../components/PropertyCard";
import FilterSheet from "../components/FilterSheet";
import MapView from "../components/MapView";
import CompareBar from "../components/CompareBar";
import { useCompare } from "../hooks/useCompare";

type ViewMode = "list" | "map";

export default function ResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { count: compareCount } = useCompare();
  const areaName = params.get("area") ?? "";
  const area = findArea(areaName) ?? AREAS[0];

  const [listing, setListing] = useState<Listing>("rent");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [view, setView] = useState<ViewMode>("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const all = useMemo(() => propertiesInArea(area.name), [area.name]);

  const visible = useMemo(() => {
    const filtered = all.filter((p) => {
      if (p.listing !== listing) return false;
      if (filters.priceMin != null && p.price < filters.priceMin) return false;
      if (filters.priceMax != null && p.price > filters.priceMax) return false;
      if (filters.sizeMin != null && p.size < filters.sizeMin) return false;
      if (filters.sizeMax != null && p.size > filters.sizeMax) return false;
      if (filters.types.length > 0 && !filters.types.includes(p.type)) return false;
      if (filters.bedrooms.length > 0) {
        const wantsFivePlus = filters.bedrooms.includes(5);
        const directMatch = filters.bedrooms.includes(p.bedrooms);
        const fivePlusMatch = wantsFivePlus && p.bedrooms >= 5;
        if (!directMatch && !fivePlusMatch) return false;
      }
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "size-asc":
          return a.size - b.size;
        case "size-desc":
          return b.size - a.size;
      }
    });
    return sorted;
  }, [all, filters, listing, sort]);

  const similar = useMemo(() => {
    return area.similar
      .map((name) => {
        const a = findArea(name);
        if (a) return a;
        // Allow similar names that aren't in our seeded list — fall back to fuzzy lookup
        return searchAreas(name)[0];
      })
      .filter(Boolean)
      .slice(0, 3);
  }, [area]);

  const activeFilterCount =
    (filters.priceMin != null ? 1 : 0) +
    (filters.priceMax != null ? 1 : 0) +
    (filters.sizeMin != null ? 1 : 0) +
    (filters.sizeMax != null ? 1 : 0) +
    filters.types.length +
    filters.bedrooms.length;

  return (
    <div className={`page page--results${compareCount > 0 ? " has-compare-bar" : ""}`}>
      <header className="results-header">
        <button type="button" className="back" onClick={() => navigate("/search")} aria-label="Back to search">
          ‹
        </button>
        <div>
          <h1>{area.name}</h1>
          <p className="muted">{area.blurb}</p>
        </div>
      </header>

      <div className="toggle-row">
        <div className="toggle" role="tablist" aria-label="Rent or buy">
          <button
            type="button"
            role="tab"
            aria-selected={listing === "rent"}
            className={`toggle__btn${listing === "rent" ? " is-active" : ""}`}
            onClick={() => setListing("rent")}
          >
            Rent
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={listing === "buy"}
            className={`toggle__btn${listing === "buy" ? " is-active" : ""}`}
            onClick={() => setListing("buy")}
          >
            Buy
          </button>
        </div>
      </div>

      <div className="controls-row">
        <label className="select">
          <span className="visually-hidden">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="size-asc">Size: small to large</option>
            <option value="size-desc">Size: large to small</option>
          </select>
        </label>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setFiltersOpen(true)}>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
        <div className="view-toggle" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            className={`view-toggle__btn${view === "list" ? " is-active" : ""}`}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "map"}
            className={`view-toggle__btn${view === "map" ? " is-active" : ""}`}
            onClick={() => setView("map")}
          >
            Map
          </button>
        </div>
      </div>

      <div className="results-count">
        {visible.length} {visible.length === 1 ? "property" : "properties"}
      </div>

      {view === "list" ? (
        visible.length === 0 ? (
          <div className="empty empty--big">
            <h3>No properties match your filters</h3>
            <p>Try adjusting the price, size, or property type — or explore a similar area below.</p>
          </div>
        ) : (
          <div className="card-list">
            {visible.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )
      ) : (
        <MapView properties={visible.length > 0 ? visible : all.filter((p) => p.listing === listing)} center={{ lat: area.lat, lng: area.lng }} />
      )}

      {similar.length > 0 && (
        <section className="similar">
          <h2>Similar areas</h2>
          <p className="muted">Other neighbourhoods you might like.</p>
          <div className="similar-list">
            {similar.map((a) => {
              const count = PROPERTIES.filter((p) => p.area === a.name && p.listing === listing).length;
              return (
                <Link key={a.name} to={`/results?area=${encodeURIComponent(a.name)}`} className="similar-card">
                  <div className="similar-card__name">{a.name}</div>
                  <div className="similar-card__blurb">{a.blurb}</div>
                  <div className="similar-card__count">
                    {count} {count === 1 ? "listing" : "listings"} to {listing}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        listing={listing}
        filters={filters}
        onApply={setFilters}
      />
      <CompareBar />
    </div>
  );
}
