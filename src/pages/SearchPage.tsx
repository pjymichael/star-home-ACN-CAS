import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AREAS, searchAreas } from "../data/areas";
import { useAuth } from "../hooks/useAuth";

export default function SearchPage() {
  const navigate = useNavigate();
  const { phone, signOut } = useAuth();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => searchAreas(query).slice(0, 8), [query]);

  const go = (areaName: string) => navigate(`/results?area=${encodeURIComponent(areaName)}`);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = suggestions[0];
    if (match) go(match.name);
  };

  return (
    <div className="page page--search">
      <header className="page__header">
        <div>
          <h1>Find your spot</h1>
          <p className="muted">Welcome back{phone ? `, ${phone}` : ""}.</p>
        </div>
        <button type="button" className="link link--quiet" onClick={signOut}>
          Sign out
        </button>
      </header>

      <form className="search-bar" onSubmit={onSubmit} role="search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search a London area, e.g. Camden"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          aria-label="Search a London area"
        />
      </form>

      <section className="suggest">
        <h2>{query ? "Matching areas" : "Popular areas"}</h2>
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

      {!query && (
        <section className="suggest">
          <h2>Browse all</h2>
          <div className="area-grid">
            {AREAS.map((a) => (
              <button key={a.name} type="button" className="area-chip" onClick={() => go(a.name)}>
                {a.name}
              </button>
            ))}
          </div>
        </section>
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
