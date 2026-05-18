import { Link } from "react-router-dom";
import type { Property } from "../types";
import { formatPriceShort } from "../utils/format";

interface Props {
  property: Property;
}

export default function MiniPropertyCard({ property }: Props) {
  return (
    <Link to={`/property/${property.id}`} className="mini-card">
      <div className="mini-card__media">
        <img src={property.pictures[0]} alt={property.name} loading="lazy" />
        <span className={`pill pill--${property.listing}`}>
          {property.listing === "rent" ? "Rent" : "For sale"}
        </span>
      </div>
      <div className="mini-card__body">
        <div className="mini-card__price">
          {formatPriceShort(property.price, property.listing)}
        </div>
        <div className="mini-card__name">{property.name}</div>
        <div className="mini-card__meta">
          {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bed`} · {property.size} sqm
        </div>
      </div>
    </Link>
  );
}
