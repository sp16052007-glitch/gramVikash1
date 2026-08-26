import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ThumbsUp,
  ArrowRight,
  Droplets,
  Zap,
  Hammer,
  HeartPulse,
  Crosshair,
  Building2,
  Navigation,
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '../types';
import { getCategoryIcon, getStatusBadgeStyle } from '../components/ComplaintCard';

interface CommunityMapPageProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateReport: () => void;
}

export const CommunityMapPage: React.FC<CommunityMapPageProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateReport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePin, setActivePin] = useState<Complaint | null>(complaints[0] || null);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'clean'>('streets');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(
      (c) => selectedCategory === 'all' || c.category === selectedCategory
    );
  }, [complaints, selectedCategory]);

  const tileUrls = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    clean: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.3176, 82.9739],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      const tiles = L.tileLayer(tileUrls[mapLayer], {
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tiles;

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = layerGroup;

      mapInstanceRef.current = map;

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

  // Update tile layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tiles = L.tileLayer(tileUrls[mapLayer], {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = tiles;
  }, [mapLayer]);

  // Update Markers when complaints or activePin change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    markersLayerGroupRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    filteredComplaints.forEach((item, idx) => {
      // Deterministic coordinates around Varanasi / regional centers if coordinates missing
      const baseLat = 25.3176 + (idx % 4 - 1.5) * 0.045 + (idx * 0.007);
      const baseLng = 82.9739 + (Math.floor(idx / 3) - 1) * 0.055 + (idx * 0.005);
      const lat = item.location?.latitude || baseLat;
      const lng = item.location?.longitude || baseLng;

      bounds.extend([lat, lng]);

      const isSelected = activePin?.id === item.id;
      const markerColor =
        item.status === 'Resolved'
          ? 'bg-emerald-600'
          : item.status === 'In Progress'
          ? 'bg-blue-600'
          : 'bg-amber-600';

      const customIcon = L.divIcon({
        className: 'community-custom-marker',
        html: `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer group">
            <div class="px-2 py-0.5 ${isSelected ? 'bg-emerald-600 ring-2 ring-white' : 'bg-slate-900/90'} text-white font-bold text-[10px] rounded-md shadow-lg whitespace-nowrap mb-1 flex items-center gap-1 border border-slate-700">
              <span>${item.village}</span>
            </div>
            <div class="relative">
              ${isSelected ? '<div class="w-9 h-9 rounded-full bg-emerald-400/40 animate-ping absolute inset-0"></div>' : ''}
              <div class="w-8 h-8 rounded-xl ${markerColor} text-white flex items-center justify-center shadow-xl border-2 ${isSelected ? 'border-white ring-2 ring-emerald-400 scale-110' : 'border-slate-900'} transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayerGroupRef.current!);

      marker.on('click', () => {
        setActivePin(item);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([lat, lng], { animate: true });
        }
      });
    });

    if (bounds.isValid() && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [filteredComplaints, activePin]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
            Interactive Geographic Incident Grid
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Community Grievance Map
          </h1>
          <p className="text-xs text-slate-500">
            Interactive OpenStreetMap view of active rural infrastructure issues, repair tenders, and resolved works.
          </p>
        </div>

        <button
          onClick={onNavigateReport}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <MapPin className="w-4 h-4" />
          <span>Pin a Problem on Map</span>
        </button>
      </div>

      {/* Category Filter Pills & Layer Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'Roads', 'Water', 'Electricity', 'Drainage', 'Healthcare'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Grievances' : cat}
            </button>
          ))}
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMapLayer('streets')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
              mapLayer === 'streets' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Street Map
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
              mapLayer === 'satellite' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('clean')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
              mapLayer === 'clean' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Clean
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas Container */}
      <div className="relative w-full h-[540px] rounded-3xl border border-slate-300 shadow-2xl overflow-hidden flex flex-col justify-between select-none">
        {/* Leaflet DOM container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Map Header Status Indicator */}
        <div className="relative z-10 flex items-center justify-between p-4 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-xs text-slate-200 flex items-center gap-2 shadow-lg pointer-events-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">Live Panchayats Spatial Grid</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">{filteredComplaints.length} Grievances Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300 shadow-lg pointer-events-auto">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Leaflet Map</span>
          </div>
        </div>

        {/* Selected Pin Details Overlay Card */}
        {activePin && (
          <div className="relative z-20 m-4 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-3">
              <img
                src={activePin.images?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300'}
                alt={activePin.title}
                className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    #{activePin.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeStyle(activePin.status)}`}>
                    {activePin.status}
                  </span>
                  <span className="text-[11px] text-slate-400">{activePin.category}</span>
                </div>
                <h4 className="font-bold text-sm text-white line-clamp-1">{activePin.title}</h4>
                <div className="text-xs text-slate-300 flex items-center gap-3">
                  <span><MapPin className="w-3 h-3 text-emerald-400 inline mr-0.5" />{activePin.village}, {activePin.district}</span>
                  <span><ThumbsUp className="w-3 h-3 text-emerald-400 inline mr-0.5" />{activePin.supportersCount} Supporters</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectComplaint(activePin)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Track Grievance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
