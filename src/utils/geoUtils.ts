/**
 * Geographic Utility for Indian Administrative Regions and Reverse Geocoding
 */

export interface GeoLocationResult {
  state: string;
  district: string;
  village: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  displayName?: string;
}

// Known Indian State Centroids and District coordinates for offline/instant fallback
export const INDIAN_REGIONS_DATABASE = [
  { state: 'Uttar Pradesh', district: 'Varanasi', village: 'Rampur Gram Panchayat', lat: 25.3176, lng: 82.9739 },
  { state: 'Uttar Pradesh', district: 'Gorakhpur', village: 'Sahjanwa Panchayat', lat: 26.7606, lng: 83.3732 },
  { state: 'Uttar Pradesh', district: 'Prayagraj', village: 'Phulpur Rural', lat: 25.4358, lng: 81.8463 },
  { state: 'Uttar Pradesh', district: 'Lucknow', village: 'Bakshi Ka Talab', lat: 26.8467, lng: 80.9462 },
  { state: 'Uttar Pradesh', district: 'Ayodhya', village: 'Sohawal Village', lat: 26.7922, lng: 82.1998 },
  { state: 'Uttar Pradesh', district: 'Mirzapur', village: 'Chunar Panchayat', lat: 25.1337, lng: 82.5644 },
  { state: 'Uttar Pradesh', district: 'Azamgarh', village: 'Mehnagar Gram Sabha', lat: 26.0683, lng: 83.1839 },
  { state: 'Uttar Pradesh', district: 'Jaunpur', village: 'Mariahu Panchayat', lat: 25.7464, lng: 82.6837 },

  { state: 'Bihar', district: 'Patna', village: 'Danapur Gram Panchayat', lat: 25.5941, lng: 85.1376 },
  { state: 'Bihar', district: 'Gaya', village: 'Bodhgaya Rural Ward 3', lat: 24.7914, lng: 85.0002 },
  { state: 'Bihar', district: 'Muzaffarpur', village: 'Kanti Panchayat', lat: 26.1209, lng: 85.3647 },
  { state: 'Bihar', district: 'Bhagalpur', village: 'Naugachia Village', lat: 25.2425, lng: 86.9842 },
  { state: 'Bihar', district: 'Nalanda', village: 'Rajgir Rural Panchayat', lat: 25.1982, lng: 85.5149 },
  { state: 'Bihar', district: 'Rohtas', village: 'Sasaram Gram Sabha', lat: 24.9515, lng: 84.0163 },

  { state: 'Madhya Pradesh', district: 'Bhopal', village: 'Berasia Gram Panchayat', lat: 23.2599, lng: 77.4126 },
  { state: 'Madhya Pradesh', district: 'Indore', village: 'Sanwer Rural Panchayat', lat: 22.7196, lng: 75.8577 },
  { state: 'Madhya Pradesh', district: 'Jabalpur', village: 'Sihora Village', lat: 23.1815, lng: 79.9864 },
  { state: 'Madhya Pradesh', district: 'Gwalior', village: 'Dabra Gram Sabha', lat: 26.2183, lng: 78.1828 },
  { state: 'Madhya Pradesh', district: 'Ujjain', village: 'Nagda Rural Panchayat', lat: 23.1765, lng: 75.7885 },
  { state: 'Madhya Pradesh', district: 'Rewa', village: 'Mauganj Panchayat', lat: 24.5362, lng: 81.3037 },

  { state: 'Rajasthan', district: 'Jaipur', village: 'Sanganer Gram Panchayat', lat: 26.9124, lng: 75.7873 },
  { state: 'Rajasthan', district: 'Jodhpur', village: 'Mandore Rural', lat: 26.2389, lng: 73.0243 },
  { state: 'Rajasthan', district: 'Udaipur', village: 'Mavli Gram Sabha', lat: 24.5854, lng: 73.7125 },
  { state: 'Rajasthan', district: 'Kota', village: 'Ramganj Mandi', lat: 25.2138, lng: 75.8648 },
  { state: 'Rajasthan', district: 'Ajmer', village: 'Pushkar Rural Panchayat', lat: 26.4499, lng: 74.6399 },

  { state: 'Maharashtra', district: 'Pune', village: 'Haveli Gram Panchayat', lat: 18.5204, lng: 73.8567 },
  { state: 'Maharashtra', district: 'Nagpur', village: 'Kamptee Rural', lat: 21.1458, lng: 79.0882 },
  { state: 'Maharashtra', district: 'Nashik', village: 'Dindori Panchayat', lat: 19.9975, lng: 73.7898 },
  { state: 'Maharashtra', district: 'Aurangabad', village: 'Paithan Gram Sabha', lat: 19.8762, lng: 75.3433 },
  { state: 'Maharashtra', district: 'Kolhapur', village: 'Panhala Village', lat: 16.7050, lng: 74.2433 },

  { state: 'West Bengal', district: 'Kolkata', village: 'Barasat Gram Panchayat', lat: 22.5726, lng: 88.3639 },
  { state: 'West Bengal', district: 'Howrah', village: 'Bagnan Rural', lat: 22.5958, lng: 88.2636 },
  { state: 'West Bengal', district: 'Hooghly', village: 'Singur Panchayat', lat: 22.8833, lng: 88.3667 },
  { state: 'West Bengal', district: 'Burdwan', village: 'Katwa Gram Sabha', lat: 23.2324, lng: 87.8615 },
];

/**
 * Find closest regional fallback in India
 */
export function getClosestIndianRegion(lat: number, lng: number): GeoLocationResult {
  let closest = INDIAN_REGIONS_DATABASE[0];
  let minDistance = Number.MAX_VALUE;

  for (const item of INDIAN_REGIONS_DATABASE) {
    const dLat = item.lat - lat;
    const dLng = item.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      closest = item;
    }
  }

  return {
    state: closest.state,
    district: closest.district,
    village: closest.village,
    latitude: lat,
    longitude: lng,
    displayName: `${closest.village}, ${closest.district}, ${closest.state}`,
  };
}

// In-memory geocode cache to prevent redundant requests
const reverseGeocodeCache = new Map<string, GeoLocationResult>();

/**
 * Reverse Geocode coordinates to State, District, and Village/Panchayat
 * Uses OpenStreetMap Nominatim with graceful fallback to closest Indian region.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<GeoLocationResult> {
  const roundedLat = parseFloat(lat.toFixed(4));
  const roundedLng = parseFloat(lng.toFixed(4));
  const cacheKey = `${roundedLat},${roundedLng}`;

  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      // Determine State
      const state =
        addr.state ||
        addr.state_district ||
        addr.region ||
        getClosestIndianRegion(roundedLat, roundedLng).state;

      // Determine District
      const district =
        addr.state_district ||
        addr.district ||
        addr.county ||
        addr.city ||
        addr.town ||
        getClosestIndianRegion(roundedLat, roundedLng).district;

      // Determine Village / Panchayat / Local area
      const village =
        addr.village ||
        addr.hamlet ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.town ||
        addr.residential ||
        getClosestIndianRegion(roundedLat, roundedLng).village;

      // Determine Landmark / Road
      const landmark =
        addr.amenity ||
        addr.building ||
        addr.road ||
        addr.historic ||
        addr.leisure ||
        addr.place ||
        '';

      const result: GeoLocationResult = {
        state,
        district: district.replace(/ District/i, ''),
        village: village.includes('Panchayat') || village.includes('Village') ? village : `${village} Panchayat`,
        landmark: landmark ? landmark : undefined,
        latitude: roundedLat,
        longitude: roundedLng,
        displayName: data.display_name,
      };

      reverseGeocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode fallback to regional database:', err);
  }

  const fallback = getClosestIndianRegion(roundedLat, roundedLng);
  reverseGeocodeCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Forward Geocoding Search: Searches Indian locations via Nominatim
 */
export async function searchIndianLocations(query: string): Promise<
  Array<{
    displayName: string;
    lat: number;
    lng: number;
    state?: string;
    district?: string;
    village?: string;
  }>
> {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const searchQuery = encodeURIComponent(`${query.trim()}, India`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&countrycodes=in&addressdetails=1&limit=5`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const items = await res.json();
      return items.map((item: any) => {
        const addr = item.address || {};
        return {
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          state: addr.state,
          district: (addr.state_district || addr.district || addr.county || addr.city || '').replace(/ District/i, ''),
          village: addr.village || addr.suburb || addr.town || addr.hamlet || '',
        };
      });
    }
  } catch (err) {
    console.warn('Geocoding search query error:', err);
  }

  // Filter internal database as fallback
  const q = query.toLowerCase();
  return INDIAN_REGIONS_DATABASE.filter(
    (item) =>
      item.village.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q)
  ).map((item) => ({
    displayName: `${item.village}, ${item.district}, ${item.state}`,
    lat: item.lat,
    lng: item.lng,
    state: item.state,
    district: item.district,
    village: item.village,
  }));
}
