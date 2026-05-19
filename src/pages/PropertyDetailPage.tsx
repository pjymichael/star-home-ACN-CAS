import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findProperty, propertiesInArea } from "../data/properties";
import { agentForArea } from "../data/agents";
import { statsFor } from "../data/propertyStats";
import { useBookmarks } from "../hooks/useBookmarks";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useAuthGate } from "../components/AuthGateProvider";
import PhotoCarousel from "../components/PhotoCarousel";
import MiniPropertyCard from "../components/MiniPropertyCard";
import AgentCard from "../components/AgentCard";
import MessengerSheet from "../components/MessengerSheet";
import FinancingSection from "../components/FinancingSection";
import { formatPrice } from "../utils/format";

export default function PropertyDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { has, toggle } = useBookmarks();
  const { record } = useRecentlyViewed();
  const { requireAuth } = useAuthGate();
  const [chatOpen, setChatOpen] = useState(false);
  const property = findProperty(id);
  const agent = property ? agentForArea(property.area) : null;

  const handleFavourite = () => {
    if (!property) return;
    requireAuth({
      feature: "Sign in to save this to your favourites",
      onSuccess: () => toggle(property.id),
    });
  };

  const openMessenger = () => {
    requireAuth({
      feature: "Sign in to message the agent — we verify everyone so they know they're talking to a real person.",
      onSuccess: () => setChatOpen(true),
    });
  };

  useEffect(() => {
    if (property) record(property.id);
  }, [property, record]);

  const similar = useMemo(() => {
    if (!property) return [];
    const others = propertiesInArea(property.area).filter((p) => p.id !== property.id);
    // Same listing type first, then sorted by closeness in price
    return [...others].sort((a, b) => {
      const aSame = a.listing === property.listing ? 0 : 1;
      const bSame = b.listing === property.listing ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return Math.abs(a.price - property.price) - Math.abs(b.price - property.price);
    }).slice(0, 6);
  }, [property]);

  if (!property) {
    return (
      <div className="page">
        <div className="empty empty--big">
          <h3>Property not found</h3>
          <button type="button" className="btn btn--primary" onClick={() => navigate("/search")}>
            Back to search
          </button>
        </div>
      </div>
    );
  }

  const saved = has(property.id);

  return (
    <div className="page page--detail">
      <button type="button" className="back back--floating" onClick={() => navigate(-1)} aria-label="Back">
        ‹
      </button>
      <button
        type="button"
        className={`save-fab${saved ? " is-active" : ""}`}
        onClick={handleFavourite}
        aria-label={saved ? "Remove from favourites" : "Add to favourites"}
        aria-pressed={saved}
      >
        <HeartIcon filled={saved} />
      </button>

      <PhotoCarousel photos={property.pictures} alt={property.name} />

      <div className="detail-body">
        <div className="detail-head">
          <span className={`pill pill--${property.listing}`}>
            {property.listing === "rent" ? "Rent" : "For sale"}
          </span>
          <h1>{property.name}</h1>
          <div className="detail-address">{property.address} · {property.area}</div>
          <div className="detail-price">{formatPrice(property.price, property.listing)}</div>
          <PropertyStats property={property} isFavourited={saved} />
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="stat__value">{property.bedrooms === 0 ? "Studio" : property.bedrooms}</div>
            <div className="stat__label">{property.bedrooms === 0 ? "" : property.bedrooms === 1 ? "bedroom" : "bedrooms"}</div>
          </div>
          <div className="stat">
            <div className="stat__value">{property.size}</div>
            <div className="stat__label">sqm</div>
          </div>
          <div className="stat">
            <div className="stat__value capitalize">{property.type}</div>
            <div className="stat__label">type</div>
          </div>
        </div>

        <section className="detail-section">
          <h2>About this property</h2>
          <p>{property.description}</p>
        </section>

        <section className="detail-section">
          <h2>Floorplan</h2>
          <div className="floorplan">
            <img src={property.floorplan} alt={`Floorplan for ${property.name}`} />
          </div>
        </section>

        <section className="detail-section">
          <h2>Location</h2>
          <p className="muted">{property.address}</p>
          <a
            className="link"
            href={`https://www.openstreetmap.org/?mlat=${property.lat}&mlon=${property.lng}#map=16/${property.lat}/${property.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in OpenStreetMap →
          </a>
        </section>

        <FinancingSection property={property} />

        {agent && (
          <AgentCard
            agent={agent}
            property={property}
            onMessage={openMessenger}
          />
        )}

        {similar.length > 0 && (
          <section className="similar-properties">
            <div className="similar-properties__head">
              <h2>More in {property.area}</h2>
              <button
                type="button"
                className="link link--quiet"
                onClick={() => navigate(`/results?area=${encodeURIComponent(property.area)}`)}
              >
                See all
              </button>
            </div>
            <div className="similar-properties__list">
              {similar.map((p) => (
                <MiniPropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="detail-foot">
        <button
          type="button"
          className={`btn btn--ghost detail-foot__fav${saved ? " is-active" : ""}`}
          onClick={handleFavourite}
          aria-pressed={saved}
        >
          <FavIcon filled={saved} />
          <span>{saved ? "Favourited" : "Favourite"}</span>
        </button>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={openMessenger}
        >
          Message agent
        </button>
      </div>

      {agent && (
        <MessengerSheet
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          agent={agent}
          property={property}
        />
      )}
    </div>
  );
}

function PropertyStats({
  property,
  isFavourited,
}: {
  property: Parameters<typeof statsFor>[0];
  isFavourited: boolean;
}) {
  const { views, favourites } = statsFor(property);
  // The current visitor always adds +1 to views (they're looking at it).
  // Favourites only gets +1 if they've actually saved it.
  const displayViews = views + 1;
  const displayFavs = favourites + (isFavourited ? 1 : 0);
  return (
    <div className="property-stats" aria-label="Property popularity">
      <span className="property-stat">
        <EyeIcon />
        <strong>{displayViews.toLocaleString("en-GB")}</strong>
        <span className="property-stat__label">views</span>
      </span>
      <span className="property-stats__sep" aria-hidden="true">·</span>
      <span className="property-stat">
        <HeartIconSm />
        <strong>{displayFavs.toLocaleString("en-GB")}</strong>
        <span className="property-stat__label">saved</span>
      </span>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HeartIconSm() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function FavIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
