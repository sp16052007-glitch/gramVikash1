import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Crosshair,
  Navigation,
  Layers,
  Search,
  CheckCircle2,
  Sparkles,
  Loader2,
  Globe2,
  X,
} from 'lucide-react';
import {
  reverseGeocodeCoordinates,
  searchIndianLocations,
  GeoLocationResult,
  INDIAN_REGIONS_DATABASE,
} from '../utils/geoUtils';

interface InteractiveLeafletMapProps {
  latitude: number;
  longitude: number;
  state?: string;
  district?: string;
  village?: string;
  landmark?: string;
  onLocationSelect: (loc: GeoLocationResult) => void;
  heightClass?: string;
  markerLabel?: string;
  showSearch?: boolean;
  showPresets?: boolean;
}

const TILE_PROVIDERS = {
  streets: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri & Earthstar Geographics',
  },
  voyager: {
    name: 'Clean Grid',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO & OpenStreetMap',
  },
};

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  latitude,
  longitude,
  state,
  district,
  village,
  landmark,
  onLocationSelect,
  heightClass = 'h-72 sm:h-80',
  markerLabel,
  showSearch = true,
  showPresets = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'voyager'>('streets');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Create custom marker icon
  const createCustomIcon = useCallback((labelText?: string) => {
    const text = labelText || village || 'Selected Incident Location';
    return L.divIcon({
      className: 'custom-leaflet-marker-wrapper',
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing">
          <div class="px-2.5 py-1 bg-slate-950/90 text-white font-extrabold text-[11px] rounded-lg shadow-xl whitespace-nowrap mb-1 flex items-center gap-1.5 border border-emerald-400/80 backdrop-blur-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>${text}</span>
          </div>
          <div class="relative">
            <div class="w-8 h-8 rounded-full bg-rose-500/40 animate-ping absolute inset-0"></div>
            <div class="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl border-2 border-white relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
          <div class="w-2.5 h-1.5 bg-black/60 rounded-full blur-[1px] mt-0.5"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }, [village]);

  // Handle map click or marker repositioning
  const handlePositionChanged = useCallback(
    async (lat: number, lng: number, flyTo = false) => {
      const validLat = parseFloat(lat.toFixed(4));
      const validLng = parseFloat(lng.toFixed(4));

      if (mapInstanceRef.current && flyTo) {
        mapInstanceRef.current.flyTo([validLat, validLng], 14, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([validLat, validLng]);
        markerRef.current.setIcon(createCustomIcon(markerLabel || village));
      }

      setIsReverseGeocoding(true);
      setStatusMessage('Auto-detecting Panchayat, District & State from coordinates...');

      try {
        const geoResult = await reverseGeocodeCoordinates(validLat, validLng);
        onLocationSelect(geoResult);
        setStatusMessage(
          `Location Locked: ${geoResult.village}, ${geoResult.district}, ${geoResult.state}`
        );
        setTimeout(() => setStatusMessage(null), 3500);
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        setStatusMessage(`Pinned at ${validLat}° N, ${validLng}° E`);
        setTimeout(() => setStatusMessage(null), 2500);
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [createCustomIcon, markerLabel, village, onLocationSelect]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = latitude || 25.3176;
      const initialLng = longitude || 82.9739;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom control at top-right
      L.control
        .zoom({
          position: 'topright',
        })
        .addTo(map);

      // Add tile layer
      const tileConfig = TILE_PROVIDERS[activeLayer];
      const tiles = L.tileLayer(tileConfig.url, {
        maxZoom: 19,
        attribution: tileConfig.attribution,
      }).addTo(map);
      tileLayerRef.current = tiles;

      // Add Marker
      const marker = L.marker([initialLat, initialLng], {
        icon: createCustomIcon(markerLabel || village),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handlePositionChanged(pos.lat, pos.lng, false);
      });

      // Add Map Click Listener
      map.on('click', (e: L.LeafletMouseEvent) => {
        handlePositionChanged(e.latlng.lat, e.latlng.lng, true);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size after mount to prevent visual rendering glitches
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer when activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_PROVIDERS[activeLayer];
    const newTiles = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      attribution: tileConfig.attribution,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
  }, [activeLayer]);

  // Sync marker position if props change externally
  useEffect(() => {
    if (markerRef.current && latitude && longitude) {
      const cur = markerRef.current.getLatLng();
      const diffLat = Math.abs(cur.lat - latitude);
      const diffLng = Math.abs(cur.lng - longitude);
      if (diffLat > 0.001 || diffLng > 0.001) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.setIcon(createCustomIcon(markerLabel || village));
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([latitude, longitude], { animate: true });
        }
      }
    }
  }, [latitude, longitude, village, markerLabel, createCustomIcon]);

  // Use GPS location
  const handleUseGps = () => {
    setIsLocating(true);
    setStatusMessage('Acquiring GPS coordinates...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          handlePositionChanged(lat, lng, true);
        },
        (error) => {
          console.warn('GPS lookup error:', error);
          setIsLocating(false);
          // Fallback to district center
          const fallbackLat = latitude || 25.3176;
          const fallbackLng = longitude || 82.9739;
          handlePositionChanged(fallbackLat, fallbackLng, true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      handlePositionChanged(latitude || 25.3176, longitude || 82.9739, true);
    }
  };

  // Search places debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchIndianLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowDropdown(results.length > 0);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (item: any) => {
    setSearchQuery(item.displayName.split(',')[0]);
    setShowDropdown(false);
    handlePositionChanged(item.lat, item.lng, true);
  };

  return (
    <div className="space-y-3">
      {/* Top Map Controls Bar: Search & Layer Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        {showSearch && (
          <div className="relative flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Search any village, panchayat, town or district (e.g. Rampur Varanasi, Danapur Patna)..."
                className="w-full text-xs font-medium pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/80 transition flex items-start gap-2.5 cursor-pointer text-slate-800"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {item.displayName.split(',').slice(0, 2).join(',')}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">
                        {item.displayName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons: GPS & Layer Switch */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={isLocating}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Detect GPS from device"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'My GPS Location'}</span>
          </button>

          {/* Map Layer Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveLayer('streets')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer text-[11px] ${
                activeLayer === 'streets'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('satellite')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer text-[11px] ${
                activeLayer === 'satellite'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('voyager')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer text-[11px] ${
                activeLayer === 'voyager'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clean
            </button>
          </div>
        </div>
      </div>

      {/* Real Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner group">
        <div ref={mapContainerRef} className={`w-full ${heightClass} z-10`} />

        {/* Live Status Overlay Notification */}
        {statusMessage && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-20 bg-slate-950/90 text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/50 shadow-2xl flex items-center gap-2 backdrop-blur-xs animate-in fade-in slide-in-from-top-2 duration-150">
            {isReverseGeocoding ? (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{statusMessage}</span>
          </div>
        )}

        {/* Map Instructions Badge */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-xs text-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-300 shadow-md flex items-center gap-1.5 pointer-events-none">
          <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
          <span>Click anywhere on map or drag pin to auto-populate fields</span>
        </div>

        {/* Real-time Coordinates Tag */}
        <div className="absolute bottom-3 right-3 z-20 bg-slate-950/80 backdrop-blur-xs text-emerald-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 shadow-md pointer-events-none">
          {latitude ? latitude.toFixed(4) : '25.3176'}° N, {longitude ? longitude.toFixed(4) : '82.9739'}° E
        </div>
      </div>

      {/* Fast Region Jump Presets */}
      {showPresets && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-slate-400" />
            <span>Jump to Region:</span>
          </span>
          {INDIAN_REGIONS_DATABASE.slice(0, 6).map((reg) => (
            <button
              key={`${reg.state}-${reg.district}`}
              type="button"
              onClick={() => handlePositionChanged(reg.lat, reg.lng, true)}
              className="text-[10px] px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition cursor-pointer font-medium"
            >
              {reg.village.split(' ')[0]} ({reg.district})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
