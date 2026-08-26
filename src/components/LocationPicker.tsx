import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Globe2,
  Sparkles,
  Building2,
} from 'lucide-react';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';
import { GeoLocationResult } from '../utils/geoUtils';

interface LocationPickerProps {
  state: string;
  district: string;
  village: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  onLocationChange: (loc: {
    state: string;
    district: string;
    village: string;
    landmark?: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const REGION_PRESETS: Record<
  string,
  {
    districts: string[];
    villages: string[];
    centerLat: number;
    centerLng: number;
  }
> = {
  'Uttar Pradesh': {
    districts: ['Varanasi', 'Gorakhpur', 'Prayagraj', 'Lucknow', 'Mirzapur', 'Ayodhya', 'Azamgarh', 'Jaunpur', 'Chandauli'],
    villages: ['Rampur Gram Panchayat', 'Shivpur Village', 'Belwa Panchayat', 'Chiraigaon Village', 'Phulpur', 'Harhua Block', 'Cholapur'],
    centerLat: 25.3176,
    centerLng: 82.9739,
  },
  Bihar: {
    districts: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Nalanda', 'Rohtas'],
    villages: ['Danapur Gram Panchayat', 'Maner Panchayat', 'Fatwah Rural', 'Bikram Village', 'Khagaul Gram Sabha'],
    centerLat: 25.5941,
    centerLng: 85.1376,
  },
  'Madhya Pradesh': {
    districts: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Rewa', 'Satna'],
    villages: ['Berasia Gram Panchayat', 'Phanda Rural', 'Kolar Gram Sabha', 'Huzur Village'],
    centerLat: 23.2599,
    centerLng: 77.4126,
  },
  Rajasthan: {
    districts: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Alwar'],
    villages: ['Sanganer Gram Panchayat', 'Amer Rural', 'Chaksu Village', 'Bassi Panchayat'],
    centerLat: 26.9124,
    centerLng: 75.7873,
  },
  Maharashtra: {
    districts: ['Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati'],
    villages: ['Haveli Gram Panchayat', 'Mulshi Rural', 'Maval Panchayat', 'Baramati Village'],
    centerLat: 18.5204,
    centerLng: 73.8567,
  },
  'West Bengal': {
    districts: ['Kolkata', 'Howrah', 'Hooghly', 'North 24 Parganas', 'Murshidabad', 'Burdwan'],
    villages: ['Barasat Gram Panchayat', 'Bhangar Rural', 'Singur Panchayat', 'Arambagh Village'],
    centerLat: 22.5726,
    centerLng: 88.3639,
  },
};

const INDIAN_STATES = Object.keys(REGION_PRESETS);

export const LocationPicker: React.FC<LocationPickerProps> = ({
  state,
  district,
  village,
  landmark = '',
  latitude,
  longitude,
  onLocationChange,
}) => {
  const [autoPopulatedBadge, setAutoPopulatedBadge] = useState<string | null>(null);

  const activePreset = REGION_PRESETS[state] || REGION_PRESETS['Uttar Pradesh'];
  const availableDistricts = activePreset.districts || ['Varanasi', 'Gorakhpur', 'Prayagraj'];

  // Handle location selection from interactive Leaflet map pin/click/search/GPS
  const handleMapLocationSelect = (geo: GeoLocationResult) => {
    onLocationChange({
      state: geo.state,
      district: geo.district,
      village: geo.village,
      landmark: geo.landmark || landmark,
      latitude: geo.latitude,
      longitude: geo.longitude,
    });

    setAutoPopulatedBadge(`Auto-populated from map: ${geo.village}, ${geo.district}, ${geo.state}`);
    setTimeout(() => setAutoPopulatedBadge(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* GPS Action Bar & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Interactive Incident Map & Auto-Location</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900">
                Panchayat Level
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-mono">
              {latitude && longitude
                ? `Coordinates: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`
                : 'Click map or GPS button to pin incident coordinates'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onLocationChange({
                state: state || 'Uttar Pradesh',
                district: district || 'Varanasi',
                village: village || 'Rampur Gram Panchayat',
                landmark,
                latitude: activePreset.centerLat,
                longitude: activePreset.centerLng,
              });
              setAutoPopulatedBadge(`Reset to default ${district || 'District'} center`);
              setTimeout(() => setAutoPopulatedBadge(null), 3000);
            }}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Use standard district location without GPS"
          >
            District Center
          </button>
        </div>
      </div>

      {autoPopulatedBadge && (
        <div className="p-2.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{autoPopulatedBadge}</span>
        </div>
      )}

      {/* Embedded Real Interactive Leaflet Map */}
      <InteractiveLeafletMap
        latitude={latitude || activePreset.centerLat}
        longitude={longitude || activePreset.centerLng}
        state={state}
        district={district}
        village={village}
        landmark={landmark}
        onLocationSelect={handleMapLocationSelect}
        heightClass="h-64 sm:h-72"
        markerLabel={village || 'Incident Location'}
        showSearch={true}
        showPresets={true}
      />

      {/* Location Input Form Fields (Auto-populated with two-way manual override) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>State (राज्य) *</span>
            <span className="text-[10px] text-emerald-600 font-semibold">(Auto-populated)</span>
          </label>
          <input
            type="text"
            id="location-state-select"
            value={state}
            onChange={(e) =>
              onLocationChange({
                state: e.target.value,
                district,
                village,
                landmark,
                latitude,
                longitude,
              })
            }
            className="w-full text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
            placeholder="e.g. Uttar Pradesh"
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>District (ज़िला) *</span>
            <span className="text-[10px] text-emerald-600 font-semibold">(Auto-populated)</span>
          </label>
          <input
            type="text"
            id="location-district-select"
            value={district}
            onChange={(e) =>
              onLocationChange({
                state,
                district: e.target.value,
                village,
                landmark,
                latitude,
                longitude,
              })
            }
            className="w-full text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
            placeholder="e.g. Varanasi"
          />
        </div>

        {/* Village / Gram Panchayat */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Village / Gram Panchayat *</span>
            <span className="text-[10px] text-emerald-600 font-semibold">(Auto-populated)</span>
          </label>
          <input
            type="text"
            required
            id="location-village-input"
            value={village}
            onChange={(e) =>
              onLocationChange({
                state,
                district,
                village: e.target.value,
                landmark,
                latitude,
                longitude,
              })
            }
            placeholder="e.g. Rampur Gram Panchayat"
            className="w-full text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Specific Landmark / Exact Spot Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
          <span>Exact Landmark / Location Details (स्थान का मुख्य लैंडमार्क)</span>
          <span className="text-[10px] text-slate-400">Optional</span>
        </label>
        <input
          type="text"
          id="location-landmark-input"
          value={landmark}
          onChange={(e) =>
            onLocationChange({
              state,
              district,
              village,
              landmark: e.target.value,
              latitude,
              longitude,
            })
          }
          placeholder="e.g. Near Government Primary School Handpump / Main Road Culvert / Ward 3"
          className="w-full text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
        />
      </div>

      {/* Quick Village Presets Chips */}
      {activePreset && activePreset.villages && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-500 font-semibold">Common Panchayats in {district || state}:</span>
          {activePreset.villages.slice(0, 5).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() =>
                onLocationChange({
                  state,
                  district,
                  village: v,
                  landmark,
                  latitude,
                  longitude,
                })
              }
              className={`text-[10px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                village === v
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Administrative Routing Summary Card */}
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-amber-300">
              Government Administrative Jurisdiction:
            </div>
            <div className="text-[11px] text-slate-300">
              Assigned to District Collectorate ({district || 'Varanasi'}) & Local Block Development Office ({village || 'Panchayat'})
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono font-bold px-2.5 py-1 bg-slate-800 rounded-lg text-emerald-400 shrink-0 border border-slate-700">
          Auto-Routed
        </div>
      </div>
    </div>
  );
};
