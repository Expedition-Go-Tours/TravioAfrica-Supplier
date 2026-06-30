import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Search, MapPin, Loader2, AlertTriangle, RefreshCw, CheckCircle2, X } from "lucide-react";
import config from "@/config";

const defaultCenter = { lng: -0.187, lat: 5.6037 };
const TILE_STYLE = "https://tiles.openfreemap.org/styles/liberty";

function normalizeResult(raw) {
  return {
    formatted: raw.formatted || "",
    city: raw.city || "",
    country: raw.country || "",
    region: raw.region || "",
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
  };
}

function SelectedLocationCard({ result, onClear }) {
  if (!result) return null;
  const parts = result.formatted.split(",");
  const name = parts[0]?.trim() || result.formatted;
  const rest = parts.slice(1).join(",").trim();

  return (
    <div className="flex items-start gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
        <CheckCircle2 size={18} className="text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-emerald-900 truncate">{name}</p>
        {rest && (
          <p className="text-xs text-emerald-700/70 truncate mt-0.5">{rest}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] font-mono text-emerald-600/60">
            {result.latitude?.toFixed(5)}, {result.longitude?.toFixed(5)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="p-1.5 text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
        title="Clear selection"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function LocationMapPicker({ onSelect, initialLat, initialLng, label, placeholder }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [lat, setLat] = useState(initialLat ?? null);
  const [lng, setLng] = useState(initialLng ?? null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const apiBaseRef = useRef(config.api.baseURL);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const { lng: initLng, lat: initLat } = defaultCenter;

    const center = initialLat && initialLng ? [initialLng, initialLat] : [initLng, initLat];
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: TILE_STYLE,
      center,
      zoom: initialLat && initialLng ? 15 : 6,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => setMapReady(true));
    map.on("error", () => setMapError(true));

    map.on("click", async (e) => {
      const clickLng = e.lngLat.lng;
      const clickLat = e.lngLat.lat;
      setLat(clickLat);
      setLng(clickLng);
      updateMarker(map, clickLng, clickLat);

      try {
        const res = await fetch(`${apiBaseRef.current}/locations/reverse?lat=${clickLat}&lng=${clickLng}`);
        const body = await res.json();
        const data = body?.data?.results?.[0];
        if (data) {
          const normalized = normalizeResult(data);
          setQuery(normalized.formatted);
          setSelectedResult(normalized);
          onSelectRef.current?.(normalized);
        }
      } catch {
        const fallback = { formatted: `${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`, city: "", country: "", region: "", latitude: clickLat, longitude: clickLng };
        setSelectedResult(fallback);
        onSelectRef.current?.(fallback);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateMarker(map, markerLng, markerLat) {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (markerLat != null && markerLng != null) {
      const el = document.createElement("div");
      el.className = "maplibregl-marker";
      el.innerHTML = `
        <div class="relative">
          <div class="absolute -inset-3 bg-emerald-400/20 rounded-full animate-ping" style="animation-duration: 2s;"></div>
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#047857"/>
            <circle cx="16" cy="16" r="6" fill="white" stroke="#047857" stroke-width="2"/>
          </svg>
        </div>
      `;
      el.style.cursor = "pointer";
      markerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([markerLng, markerLat])
        .addTo(map);
    }
  }

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    if (lat != null && lng != null) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
    }
    updateMarker(mapRef.current, lng, lat);
  }, [lat, lng, mapReady]);

  const doSearch = useRef((value) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const url = `${apiBaseRef.current}/locations/search?q=${encodeURIComponent(value)}&limit=5`;
    return fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Search failed (HTTP ${res.status})`);
        return res.json();
      })
      .then(body => {
        setResults((body?.data?.results || []).map(normalizeResult));
        setSearchError(null);
      });
  }).current;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSearchError(null);
    setSelectedResult(null);
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) { setResults([]); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        await doSearch(value);
      } catch (err) {
        if (err.name !== "AbortError") {
          setSearchError(err.message);
          setResults([]);
        }
      }
      setLoading(false);
    }, 400);
  };

  const handleRetry = () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearchError(null);
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await doSearch(query);
      } catch (err) {
        if (err.name !== "AbortError") {
          setSearchError(err.message);
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
    setSelectedResult(result);
    onSelect?.(result);
  };

  const handleClear = () => {
    setQuery("");
    setLat(null);
    setLng(null);
    setResults([]);
    setSelectedResult(null);
    onSelect?.(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <span className="flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600" />
            {label || "Search Location"}
          </span>
        </label>
        <div className={`relative transition-all duration-200 ${isFocused ? 'ring-2 ring-emerald-500/20 rounded-xl' : ''}`}>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder || "Search for a location..."}
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
            </div>
          )}
          {!loading && query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setSelectedResult(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {searchError && (
          <div className="mt-2 flex items-center gap-2.5 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <span className="text-xs text-red-600 flex-1">Could not search locations. Backend may be offline.</span>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}
        {results.length > 0 && (
          <ul className="mt-2 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 max-h-52 overflow-y-auto z-10 relative divide-y divide-slate-50">
            {results.map((r, i) => (
              <li
                key={i}
                onClick={() => handleSelect(r)}
                className="px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-slate-400 group-hover:text-emerald-500 shrink-0 mt-0.5 transition-colors" />
                  <span className="leading-snug">{r.formatted}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm relative">
        <div ref={mapContainerRef} className="w-full h-[300px]" />
        {!mapReady && !mapError && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center gap-2.5 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-emerald-600" />
            Loading map...
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center gap-2.5 px-4 text-center">
            <AlertTriangle size={28} className="text-red-400" />
            <p className="text-sm font-medium text-red-600">Could not load map tiles</p>
            <p className="text-xs text-red-400">Check your internet connection and try again.</p>
          </div>
        )}
        <div className="px-4 py-2.5 text-xs text-slate-500 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
          <MapPin size={12} className="text-emerald-500" />
          Click on the map to set a location
        </div>
      </div>

      <SelectedLocationCard result={selectedResult} onClear={handleClear} />

      {lat && lng && !selectedResult && (
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span>Lat: {lat.toFixed(6)}</span>
          <span>Lng: {lng.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
