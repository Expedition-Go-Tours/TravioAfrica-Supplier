import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search, MapPin, Loader2 } from "lucide-react";

const defaultCenter = { lng: -0.187, lat: 5.6037 };

async function fetchNominatim(query, signal) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
  const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((r) => ({
    formatted: r.display_name || "",
    city: r.address?.city || r.address?.town || r.address?.village || r.address?.county || "",
    country: r.address?.country || "",
    region: r.address?.state || r.address?.region || r.address?.district || "",
    latitude: r.lat ? Number(r.lat) : null,
    longitude: r.lon ? Number(r.lon) : null,
  }));
}

async function reverseNominatim(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) throw new Error("Nominatim reverse HTTP " + res.status);
  return res.json();
}

export default function LocationMapPicker({ onSelect, initialLat, initialLng, label, placeholder, accessToken }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [lat, setLat] = useState(initialLat ?? null);
  const [lng, setLng] = useState(initialLng ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Mapbox map
  useEffect(() => {
    if (!accessToken || !mapContainerRef.current) return;

    mapboxgl.accessToken = accessToken;

    const center = lat && lng ? [lng, lat] : [defaultCenter.lng, defaultCenter.lat];
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: lat && lng ? 15 : 6,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => setMapReady(true));

    map.on("click", async (e) => {
      const clickLng = e.lngLat.lng;
      const clickLat = e.lngLat.lat;
      setLat(clickLat);
      setLng(clickLng);
      updateMarker(map, clickLng, clickLat);

      try {
        const data = await reverseNominatim(clickLat, clickLng);
        if (data) {
          const addr = data.address || {};
          const formatted = data.display_name || "";
          setQuery(formatted);
          onSelect?.({
            formatted,
            city: addr.city || addr.town || addr.village || "",
            country: addr.country || "",
            region: addr.state || "",
            latitude: clickLat,
            longitude: clickLng,
          });
        }
      } catch {
        onSelect?.({ formatted: `${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`, city: "", country: "", region: "", latitude: clickLat, longitude: clickLng });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  function updateMarker(map, markerLng, markerLat) {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (markerLat != null && markerLng != null) {
      const el = document.createElement("div");
      el.className = "mapbox-marker";
      el.innerHTML = `<svg width="28" height="36" viewBox="0 0 28 36" fill="none"><path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0zm0 19a5 5 0 110-10 5 5 0 010 10z" fill="#044b3b"/><circle cx="14" cy="14" r="3" fill="#fff"/></svg>`;
      el.style.cursor = "pointer";
      markerRef.current = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([markerLng, markerLat])
        .addTo(map);
    }
  }

  // Sync marker when lat/lng change programmatically
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    if (lat != null && lng != null) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
    }
    updateMarker(mapRef.current, lng, lat);
  }, [lat, lng, mapReady]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) { setResults([]); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const data = await fetchNominatim(value, controller.signal);
        setResults(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setResults([]);
        }
      }
      setLoading(false);
    }, 400);
  };

  const handleSelect = (result) => {
    const outLat = result.latitude;
    const outLng = result.longitude;
    setLat(outLat);
    setLng(outLng);
    setQuery(result.formatted);
    setResults([]);
    onSelect?.({ formatted: result.formatted, city: result.city, country: result.country, region: result.region, latitude: outLat, longitude: outLng });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-[#1e293b] mb-2">
          <span className="flex items-center gap-2">
            <MapPin size={16} className="text-[#64748b]" />
            {label || "Search Location"}
          </span>
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder={placeholder || "Search for a location..."}
            className="w-full pl-9 pr-10 py-2.5 border border-[#eaeaea] rounded-lg text-sm text-[#1e293b] placeholder:text-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-[#044b3b]/20 focus:border-[#044b3b]"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 size={16} className="animate-spin text-[#044b3b]" />
            </div>
          )}
        </div>
        {results.length > 0 && (
          <ul className="mt-1 bg-white border border-[#eaeaea] rounded-lg shadow-lg max-h-48 overflow-y-auto z-10 relative">
            {results.map((r, i) => (
              <li
                key={i}
                onClick={() => handleSelect(r)}
                className="px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#f8fafc] cursor-pointer border-b border-[#eaeaea] last:border-0"
              >
                {r.formatted}
              </li>
            ))}
          </ul>
        )}
      </div>

      {accessToken ? (
        <div className="rounded-lg overflow-hidden border border-[#eaeaea] relative">
          <div ref={mapContainerRef} className="w-full h-[280px]" />
          {!mapReady && (
            <div className="absolute inset-0 bg-[#f8fafc] flex items-center justify-center gap-2 text-sm text-[#64748b]">
              <Loader2 size={16} className="animate-spin text-[#044b3b]" />
              Loading map...
            </div>
          )}
          <div className="px-3 py-2 text-xs text-[#64748b] bg-[#f8fafc] border-t border-[#eaeaea]">
            Click on the map to set a location
          </div>
        </div>
      ) : (
        <div className="h-48 bg-[#f8fafc] rounded-lg border border-[#eaeaea] flex items-center justify-center text-sm text-[#64748b]">
          Map unavailable — using text search
        </div>
      )}

      {lat && lng && (
        <div className="flex items-center gap-4 text-xs text-[#64748b]">
          <span>Lat: {lat.toFixed(6)}</span>
          <span>Lng: {lng.toFixed(6)}</span>
        </div>
      )}
      {error && <p className="text-xs text-[#dc3545]">{error}</p>}
    </div>
  );
}