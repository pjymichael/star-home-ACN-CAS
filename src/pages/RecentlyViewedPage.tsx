import { useNavigate } from "react-router-dom";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { findProperty } from "../data/properties";
import PropertyCard from "../components/PropertyCard";
import { timeAgo } from "../utils/timeAgo";

export default function RecentlyViewedPage() {
  const navigate = useNavigate();
  const { entries, clear } = useRecentlyViewed();

  const items = entries
    .map((e) => {
      const p = findProperty(e.id);
      return p ? { property: p, viewedAt: e.viewedAt } : null;
    })
    .filter((x): x is { property: NonNullable<ReturnType<typeof findProperty>>; viewedAt: number } => Boolean(x));

  return (
    <div className="page page--recent">
      <header className="page__header">
        <h1>Recently viewed</h1>
        {items.length > 0 && (
          <button type="button" className="link link--quiet" onClick={clear}>
            Clear all
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="empty empty--big">
          <h3>Nothing here yet</h3>
          <p>Properties you open will appear here so you can find them again.</p>
          <button type="button" className="btn btn--primary" onClick={() => navigate("/search")}>
            Start exploring
          </button>
        </div>
      ) : (
        <div className="recent-list">
          {items.map(({ property, viewedAt }) => (
            <div key={property.id} className="recent-item">
              <div className="recent-item__stamp">Viewed {timeAgo(viewedAt)}</div>
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
