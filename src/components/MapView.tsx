import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { Property } from "../types";
import { formatPriceShort } from "../utils/format";

interface Props {
  properties: Property[];
  center: { lat: number; lng: number };
}

function priceIcon(label: string): L.DivIcon {
  return L.divIcon({
    className: "price-pin-wrap",
    html: `<div class="price-pin">${label}</div>`,
    iconSize: [70, 30],
    iconAnchor: [35, 30],
  });
}

export default function MapView({ properties, center }: Props) {
  const navigate = useNavigate();

  return (
    <div className="map-wrap">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={priceIcon(formatPriceShort(p.price, p.listing))}
            eventHandlers={{
              click: () => {
                // Popup still opens; navigation happens via the popup link.
              },
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{p.name}</strong>
                <div className="map-popup__meta">
                  {p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bed`} · {p.size} sqm
                </div>
                <div className="map-popup__price">{formatPriceShort(p.price, p.listing)}</div>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  View
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
