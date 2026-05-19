import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AREAS, searchAreas } from "../data/areas";
import { propertiesInArea } from "../data/properties";
import { useAuth } from "../hooks/useAuth";
import type { AreaInfo } from "../types";

// Hand-picked highlights for the "Featured" carousel
const FEATURED_AREA_NAMES = ["Notting Hill", "Camden", "Kensington", "Richmond", "Shoreditch"];

// Vibe collections — each maps to a set of areas users can browse together
const COLLECTIONS: { id: string; label: string; areas: string[] }[] = [
  { id: "prime", label: "Prime central", areas: ["Kensington", "Chelsea", "Notting Hill"] },
  { id: "buzzy", label: "Buzzy nightlife", areas: ["Shoreditch", "Camden", "Brixton"] },
  { id: "family", label: "Family-friendly", areas: ["Wimbledon", "Richmond", "Clapham"] },
  { id: "creative", label: "Creative east", areas: ["Hackney", "Shoreditch", "Islington"] },
  { id: "green", label: "Near green spaces", areas: ["Richmond", "Greenwich", "Wimbledon"] },
];

function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Use the first photo of the first property in an area as that area's hero image. */
function areaPhoto(name: string): string | null {
  const props = propertiesInArea(name);
  return props[0]?.pictures?.[0] ?? null;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { name, isVerified, signOut } = useAuth();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => searchAreas(query).slice(0, 8), [query]);

  const featuredAreas = useMemo(
    () =>
      FEATURED_AREA_NAMES.map((n) => AREAS.find((a) => a.name === n)).filter(
        (a): a is AreaInfo => Boolean(a),
      ),
    [],
  );

  const go = (areaName: string) => navigate(`/results?area=${encodeURIComponent(areaName)}`);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = suggestions[0];
    if (match) go(match.name);
  };

  return (
    <div className="page page--search">
      <header className="search-hero">
        <div className="search-hero__top">
          <div className="brand brand--inline brand--inline-sm">
            <span className="brand__star brand__star--sm">★</span>
            <span className="brand__name brand__name--sm">Star Homes</span>
          </div>
          {isVerified ? (
            <button
              type="button"
              className="link link--quiet"
              onClick={() => {
                signOut();
                navigate("/", { replace: true });
              }}
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              className="link link--quiet"
              onClick={() => navigate("/auth?mode=signin")}
            >
              Sign in
            </button>
          )}
        </div>

        <div className="search-hero__greeting">
          <p className="search-hero__hello">
            {timeOfDayGreeting()}{name ? `, ${name.split(" ")[0]}` : ""}
          </p>
          <h1 className="search-hero__title">Where do you want to live?</h1>
        </div>

        <form className="search-bar search-bar--hero" onSubmit={onSubmit} role="search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search a London area"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search a London area"
          />
          {query && (
            <button
              type="button"
              className="search-bar__clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </form>
      </header>

      {query ? (
        <section className="suggest">
          <h2>Matching areas</h2>
          {suggestions.length === 0 ? (
            <div className="empty">No areas match "{query}".</div>
          ) : (
            <ul className="suggest-list">
              {suggestions.map((a) => (
                <li key={a.name}>
                  <button type="button" className="suggest-item" onClick={() => go(a.name)}>
                    <span className="suggest-item__name">{a.name}</span>
                    <span className="suggest-item__blurb">{a.blurb}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <section>
            <div className="section-head">
              <h2>Featured neighbourhoods</h2>
              <span className="muted section-head__hint">Hand-picked for you</span>
            </div>
            <div className="featured-scroll">
              {featuredAreas.map((a) => {
                const photo = areaPhoto(a.name);
                const count = propertiesInArea(a.name).length;
                return (
                  <Link
                    key={a.name}
                    to={`/results?area=${encodeURIComponent(a.name)}`}
                    className="featured-card"
                  >
                    <div className="featured-card__media">
                      {photo && <img src={photo} alt="" loading="lazy" />}
                      <div className="featured-card__scrim" />
                      <span className="featured-card__count">{count} listings</span>
                      <div className="featured-card__overlay">
                        <div className="featured-card__name">{a.name}</div>
                        <div className="featured-card__blurb">{a.blurb}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2>Browse by vibe</h2>
            </div>
            <div className="collection-row">
              {COLLECTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="collection-chip"
                  onClick={() => go(c.areas[0])}
                  title={c.areas.join(", ")}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2>All areas</h2>
              <span className="muted section-head__hint">{AREAS.length} neighbourhoods</span>
            </div>
            <div className="area-tiles">
              {AREAS.map((a) => {
                const photo = areaPhoto(a.name);
                return (
                  <Link
                    key={a.name}
                    to={`/results?area=${encodeURIComponent(a.name)}`}
                    className="area-tile"
                  >
                    {photo && <img src={photo} alt="" loading="lazy" />}
                    <div className="area-tile__scrim" />
                    <span className="area-tile__name">{a.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
