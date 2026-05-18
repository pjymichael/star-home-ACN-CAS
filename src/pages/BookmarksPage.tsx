import { useNavigate } from "react-router-dom";
import { useBookmarks } from "../hooks/useBookmarks";
import { findProperty } from "../data/properties";
import PropertyCard from "../components/PropertyCard";

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { ids, clear } = useBookmarks();
  const saved = ids.map(findProperty).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="page page--bookmarks">
      <header className="page__header">
        <h1>Favourites</h1>
        {saved.length > 0 && (
          <button type="button" className="link link--quiet" onClick={clear}>
            Clear all
          </button>
        )}
      </header>

      {saved.length === 0 ? (
        <div className="empty empty--big">
          <h3>No favourites yet</h3>
          <p>Tap the heart on any property to add it here.</p>
          <button type="button" className="btn btn--primary" onClick={() => navigate("/search")}>
            Start exploring
          </button>
        </div>
      ) : (
        <div className="card-list">
          {saved.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
