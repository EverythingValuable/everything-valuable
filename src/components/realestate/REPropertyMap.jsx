import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue with Vite/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const priceIcon = (color = "#c8102e") => L.divIcon({
  className: "",
  html: `<div style="background:${color};color:white;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid white;">
    <span>●</span>
  </div>`,
  iconAnchor: [16, 12],
});

export default function REPropertyMap({ listings = [], center, zoom = 8 }) {
  const mapped = listings.filter(l => l.latitude && l.longitude);

  // Auto-center: average lat/lng or fallback to NY
  const defaultCenter = mapped.length > 0
    ? [
        mapped.reduce((s, l) => s + l.latitude, 0) / mapped.length,
        mapped.reduce((s, l) => s + l.longitude, 0) / mapped.length,
      ]
    : [41.5, -74.0];

  return (
    <MapContainer
      center={center || defaultCenter}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mapped.map(listing => (
        <Marker
          key={listing.id}
          position={[listing.latitude, listing.longitude]}
          icon={priceIcon(listing.status === "prisometer" ? "#c8102e" : "#1a1a1a")}
        >
          <Popup maxWidth={240}>
            <div className="p-1">
              {listing.images?.[0] && (
                <img src={listing.images[0]} alt={listing.title} className="w-full h-28 object-cover rounded-lg mb-2" />
              )}
              <p className="font-semibold text-sm leading-tight mb-1">{listing.title}</p>
              <p className="text-xs text-gray-500 mb-1">{listing.display_location}</p>
              <p className="font-bold text-sm text-red-600 mb-2">
                ${listing.prisometer_start_price?.toLocaleString("en-US")}
              </p>
              <Link
                to={`/real-property/listing/${listing.id}`}
                className="block text-center bg-black text-white text-xs py-1.5 px-3 rounded-lg hover:bg-black/80 transition-colors"
              >
                View Property
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}