import React, { useState } from 'react';
import {
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Compass,
} from 'lucide-react';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';
import { GeoLocationResult } from '../utils/geoUtils';

export interface LocationData {
  state: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
}

interface RegisterMapLocationPickerProps {
  location: LocationData;
  onChange: (loc: LocationData) => void;
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
    villages: ['Rampur Gram Panchayat', 'Shivpur Village', 'Kashi Rural Ward 4', 'Chiraigaon Panchayat', 'Arajiline Village', 'Harahua Block'],
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

export const RegisterMapLocationPicker: React.FC<RegisterMapLocationPickerProps> = ({
  location,
  onChange,
}) => {
  const [autoPopulatedBadge, setAutoPopulatedBadge] = useState<string | null>(null);

  const currentPreset = REGION_PRESETS[location.state] || REGION_PRESETS['Uttar Pradesh'];

  // Handle auto-population from Interactive Leaflet Map pin / click / search / GPS
  const handleMapLocationSelect = (geo: GeoLocationResult) => {
    onChange({
      state: geo.state,
      district: geo.district,
      village: geo.village,
      latitude: geo.latitude,
      longitude: geo.longitude,
    });

    setAutoPopulatedBadge(`Auto-populated from map: ${geo.village}, ${geo.district}, ${geo.state}`);
    setTimeout(() => setAutoPopulatedBadge(null), 4000);
  };

  const handleStateChange = (newState: string) => {
    const preset = REGION_PRESETS[newState] || REGION_PRESETS['Uttar Pradesh'];
    onChange({
      state: newState,
      district: preset.districts[0],
      village: preset.villages[0],
      latitude: preset.centerLat,
      longitude: preset.centerLng,
    });
  };

  return (
    <div className="space-y-3.5 bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Interactive Village Map & Auto-Location (इंटरैक्टिव मानचित्र)</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Click anywhere on the interactive map or search your village to auto-fill state, district, and coordinates.
          </p>
        </div>
      </div>

      {autoPopulatedBadge && (
        <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-300 animate-in fade-in duration-200 shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{autoPopulatedBadge}</span>
        </div>
      )}

      {/* Embedded Real Interactive Leaflet Map */}
      <InteractiveLeafletMap
        latitude={location.latitude}
        longitude={location.longitude}
        state={location.state}
        district={location.district}
        village={location.village}
        onLocationSelect={handleMapLocationSelect}
        heightClass="h-56 sm:h-64"
        markerLabel={location.village || 'Your Panchayat'}
        showSearch={true}
        showPresets={true}
      />

      {/* Auto-populated & Editable State, District & Village Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
            <span>State (राज्य) *</span>
            <span className="text-[9px] text-emerald-600 font-semibold">(Auto-filled)</span>
          </label>
          <input
            type="text"
            id="reg-map-state"
            value={location.state}
            onChange={(e) =>
              onChange({
                ...location,
                state: e.target.value,
              })
            }
            className="w-full text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
            placeholder="e.g. Uttar Pradesh"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
            <span>District (ज़िला) *</span>
            <span className="text-[9px] text-emerald-600 font-semibold">(Auto-filled)</span>
          </label>
          <input
            type="text"
            id="reg-map-district"
            value={location.district}
            onChange={(e) =>
              onChange({
                ...location,
                district: e.target.value,
              })
            }
            className="w-full text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
            placeholder="e.g. Varanasi"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
            <span>Village / Panchayat (ग्राम) *</span>
            <span className="text-[9px] text-emerald-600 font-semibold">(Auto-filled)</span>
          </label>
          <input
            type="text"
            id="reg-map-village"
            required
            value={location.village}
            onChange={(e) =>
              onChange({
                ...location,
                village: e.target.value,
              })
            }
            placeholder="e.g. Rampur Gram Panchayat"
            className="w-full text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Suggested Village Quick Chips */}
      {currentPreset && currentPreset.villages && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-500 font-semibold">Common Panchayats in {location.district || location.state}:</span>
          {currentPreset.villages.slice(0, 4).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() =>
                onChange({
                  ...location,
                  village: v,
                })
              }
              className={`text-[10px] px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                location.village === v
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
