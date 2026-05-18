import { Link } from "react-router-dom";
import type { Property } from "../types";
import { formatPrice } from "../utils/format";
import { useBookmarks } from "../hooks/useBookmarks";
import { useCompare } from "../hooks/useCompare";
import CardCarousel from "./CardCarousel";

interface Props {
  property: Property;
}

export default function PropertyCard({ property }: Props) {
  const { has: hasFav, toggle: toggleFav } = useBookmarks();
  const { has: hasCompare, toggle: toggleCompare, count, max } = useCompare();
  const saved = hasFav(property.id);
  const selected = hasCompare(property.id);
  const to = `/property/${property.id}`;

  const onCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare(property.id);
    if (result === null) {
      // Hit the cap. Surface gently — alert is fine for a prototype.
      alert(`You can compare up to ${max} properties at a time.`);
    }
  };

  return (
    <article className="card">
      <div className="card__media">
        <CardCarousel photos={property.pictures} alt={property.name} to={to} />
        <button
          type="button"
          className={`card__compare${selected ? " is-active" : ""}${count > 0 && !selected && count >= max ? " is-disabled" : ""}`}
          aria-label={selected ? "Remove from compare" : "Add to compare"}
          aria-pressed={selected}
          onClick={onCompareClick}
        >
          {selected ? <CheckIcon /> : <PlusIcon />}
          <span>{selected ? "Comparing" : "Compare"}</span>
        </button>
        <button
          type="button"
          className={`card__bookmark${saved ? " is-active" : ""}`}
          aria-label={saved ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={saved}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFav(property.id);
          }}
        >
          <HeartIcon filled={saved} />
        </button>
        <span className={`pill pill--${property.listing}`}>
          {property.listing === "rent" ? "Rent" : "For sale"}
        </span>
      </div>
      <Link to={to} className="card__body">
        <div className="card__price">
          {formatPrice(property.price, property.listing)}
        </div>
        <div className="card__name">{property.name}</div>
        <div className="card__meta">
          <span>{property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bed`}</span>
          <span aria-hidden="true">·</span>
          <span>{property.size} sqm</span>
          <span aria-hidden="true">·</span>
          <span className="card__type">{property.type}</span>
        </div>
        <div className="card__area">{property.area} — {property.address}</div>
      </Link>
    </article>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
