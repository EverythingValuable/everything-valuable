import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons for Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const activeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Geocode a city/state/zip string using Nominatim
async function geocodeLocation(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  if (data && data[0]) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  }
  return null;
}

// Geocode an item's customer_location and cache results
const geocodeCache = {};
async function getCoords(locationStr) {
  if (!locationStr) return null;
  if (geocodeCache[locationStr]) return geocodeCache[locationStr];
  const result = await geocodeLocation(locationStr);
  if (result) geocodeCache[locationStr] = result;
  return result;
}

function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 9, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

export default function ItemsNearMe() {
  const [searchInput, setSearchInput] = useState("");
  const [searchCoords, setSearchCoords] = useState(null);
  const [searchLabel, setSearchLabel] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCoords, setItemCoords] = useState({}); // id -> {lat, lng}

  // Fetch active items with a location
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items-near-me"],
    queryFn: () => base44.entities.Item.filter(
      { status: ["prisometer", "first_bids"] },
      "-created_date",
      200
    ),
    staleTime: 60000,
  });

  const itemsWithLocation = items.filter(i => i.customer_location);

  // Geocode all item locations
  useEffect(() => {
    itemsWithLocation.forEach(async (item) => {
      if (!itemCoords[item.id]) {
        const coords = await getCoords(item.customer_location);
        if (coords) {
          setItemCoords(prev => ({ ...prev, [item.id]: coords }));
        }
      }
    });
  }, [itemsWithLocation.length]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearching(true);
    setSearchError("");
    const result = await geocodeLocation(searchInput);
    setSearching(false);
    if (result) {
      setSearchCoords(result);
      setSearchLabel(searchInput);
    } else {
      setSearchError("Location not found. Try a city, state, or zip code.");
    }
  };

  const handleStateClick = async (state) => {
    setSearchInput(state + ", USA");
    const result = await geocodeLocation(state + ", USA");
    if (result) {
      setSearchCoords(result);
      setSearchLabel(state);
    }
  };

  // Items sorted by proximity when a search is active
  const mappedItems = itemsWithLocation.filter(i => itemCoords[i.id]);

  const nearbyItems = searchCoords
    ? mappedItems
        .map(item => {
          const c = itemCoords[item.id];
          const dist = Math.sqrt(
            Math.pow(c.lat - searchCoords.lat, 2) + Math.pow(c.lng - searchCoords.lng, 2)
          );
          return { ...item, _dist: dist };
        })
        .sort((a, b) => a._dist - b._dist)
        .slice(0, 30)
    : mappedItems.slice(0, 30);

  const displayItems = nearbyItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border py-10 px-6 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-3">
          Find Items Near Me
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Discover valuable items available for sale close to you. Browse the interactive map or search by city, state, or zip code.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mt-6 flex items-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="City, state, or zip code…"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={searching} className="gap-2">
            <Search className="w-4 h-4" />
            {searching ? "Searching…" : "Search"}
          </Button>
          {searchCoords && (
            <Button type="button" variant="ghost" size="icon" onClick={() => { setSearchCoords(null); setSearchLabel(""); setSearchInput(""); }}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </form>
        {searchError && <p className="text-destructive text-xs mt-2">{searchError}</p>}
        {searchLabel && <p className="text-xs text-muted-foreground mt-1">Showing items near <strong>{searchLabel}</strong></p>}
      </div>

      {/* Map + List */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">

          {/* Map */}
          <div className="sticky top-4 rounded-lg overflow-hidden border border-border shadow-sm" style={{ height: 520 }}>
            <MapContainer
              center={[39.5, -98.35]}
              zoom={4}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {searchCoords && <FlyToLocation coords={searchCoords} />}

              {displayItems.map(item => {
                const c = itemCoords[item.id];
                if (!c) return null;
                return (
                  <Marker
                    key={item.id}
                    position={[c.lat, c.lng]}
                    icon={selectedItem?.id === item.id ? activeIcon : new L.Icon.Default()}
                    eventHandlers={{ click: () => setSelectedItem(item) }}
                  >
                    <Popup>
                      <div className="text-xs max-w-[180px]">
                        {item.images?.[0] && (
                          <img src={item.images[0]} alt={item.title} className="w-full h-24 object-cover rounded mb-1.5" />
                        )}
                        <p className="font-semibold leading-tight">{item.title}</p>
                        <p className="text-gray-500 mt-0.5">{item.customer_location}</p>
                        <Link to={`/item/${item.id}`} className="text-red-600 font-semibold mt-1 inline-block hover:underline">
                          View Item →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Item List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-foreground text-lg">
                {searchCoords ? `Items Near ${searchLabel}` : "Active Items"}
                <span className="ml-2 text-sm font-normal text-muted-foreground">({displayItems.length})</span>
              </h2>
            </div>

            {isLoading && (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && displayItems.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No items found with location data near this area.
              </div>
            )}

            {displayItems.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        </div>

        {/* States Directory */}
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">Browse by State</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {US_STATES.map(state => (
              <button
                key={state}
                onClick={() => handleStateClick(state)}
                className="text-left px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-colors"
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, isSelected, onClick }) {
  const statusLabel = item.status === "prisometer" ? "PRI$OMETER™ Active" : "1stBid$ Live";
  const statusColor = item.status === "prisometer" ? "text-primary" : "text-blue-600";

  return (
    <div
      onClick={onClick}
      className={`flex gap-3 p-3 border cursor-pointer transition-colors rounded-sm ${
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30 hover:bg-muted/40"
      }`}
    >
      <div className="w-20 h-20 flex-shrink-0 bg-muted overflow-hidden rounded-sm">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <MapPin className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-bold ${statusColor} mb-0.5`}>{statusLabel}</p>
        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground truncate">{item.customer_location}</p>
        </div>
        {item.current_price && (
          <p className="text-xs font-semibold text-foreground mt-1">
            ${item.current_price.toLocaleString()}
          </p>
        )}
      </div>
      <Link
        to={`/item/${item.id}`}
        onClick={e => e.stopPropagation()}
        className="self-center p-1.5 hover:bg-muted rounded transition-colors"
      >
        <ExternalLink className="w-4 h-4 text-muted-foreground" />
      </Link>
    </div>
  );
}