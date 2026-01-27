import { calculateDistance } from '../utils/location';

export interface Place {
  id: string;
  name: string;
  address?: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  category?: string;
}

export interface PlaceWithDistance extends Place {
  distance: number;
}

// Nominatim API configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'AirnoteMVP/0.1 (contact: support@airnote.app)';

// Cache for search results
const searchCache = new Map<string, { timestamp: number; results: PlaceWithDistance[] }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// In-flight requests tracking
const inFlightRequests = new Map<string, Promise<PlaceWithDistance[]>>();

// Debounce timers
const debounceTimers = new Map<string, NodeJS.Timeout>();

/**
 * Calculate bounding box around a point with given radius in meters
 */
const calculateBoundingBox = (lat: number, lon: number, radiusMeters: number) => {
  // Rough conversion: 1 degree latitude ≈ 111km
  const latDelta = (radiusMeters / 111000);
  // Longitude degrees vary with latitude
  const lonDelta = (radiusMeters / (111000 * Math.cos(lat * Math.PI / 180)));

  return {
    left: lon - lonDelta,
    bottom: lat - latDelta,
    right: lon + lonDelta,
    top: lat + latDelta,
  };
};

/**
 * Format address from Nominatim result
 */
const formatAddress = (result: any): string | undefined => {
  const address = result.address;
  if (!address) return result.display_name;

  const parts: string[] = [];

  if (address.house_number && address.road) {
    parts.push(`${address.house_number} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }

  if (address.neighbourhood || address.suburb) {
    parts.push(address.neighbourhood || address.suburb);
  }

  return parts.length > 0 ? parts.join(', ') : result.display_name;
};

/**
 * Get category from Nominatim type/class
 */
const getCategory = (type: string, placeClass: string): string | undefined => {
  const categoryMap: Record<string, string> = {
    'cafe': 'Coffee Shop',
    'restaurant': 'Restaurant',
    'fast_food': 'Fast Food',
    'bar': 'Bar',
    'pub': 'Bar',
    'park': 'Park',
    'gym': 'Gym',
    'library': 'Library',
    'hospital': 'Hospital',
    'pharmacy': 'Pharmacy',
    'supermarket': 'Supermarket',
    'convenience': 'Convenience Store',
    'bakery': 'Bakery',
    'fuel': 'Gas Station',
    'parking': 'Parking',
  };

  return categoryMap[type] || categoryMap[placeClass];
};

/**
 * Normalize Nominatim result to our Place interface
 */
const normalizePlace = (result: any, userLat: number, userLon: number): PlaceWithDistance => {
  const lat = parseFloat(result.lat);
  const lon = parseFloat(result.lon);
  const distance = calculateDistance(userLat, userLon, lat, lon);

  return {
    id: result.place_id?.toString() || result.osm_id?.toString() || Math.random().toString(),
    name: result.name || result.display_name.split(',')[0],
    address: formatAddress(result),
    neighborhood: result.address?.neighbourhood || result.address?.suburb,
    latitude: lat,
    longitude: lon,
    category: getCategory(result.type, result.class),
    distance,
  };
};

/**
 * Fetch places from Nominatim
 */
const fetchFromNominatim = async (
  params: URLSearchParams,
  userLat: number,
  userLon: number
): Promise<PlaceWithDistance[]> => {
  const url = `${NOMINATIM_BASE_URL}/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return [];
    }

    const results = await response.json();

    if (!Array.isArray(results)) {
      return [];
    }

    return results
      .map((result: any) => normalizePlace(result, userLat, userLon))
      .filter((place: PlaceWithDistance) => place.name && place.name.length > 0)
      .slice(0, 20);
  } catch (error) {
    console.error('Failed to fetch from Nominatim:', error);
    return [];
  }
};

/**
 * Places Service Interface
 * Uses OpenStreetMap Nominatim (free, no API key required)
 */
export const placesService = {
  /**
   * Search for places by query, biased to user's location
   */
  searchPlaces: async (
    query: string,
    userLatitude: number,
    userLongitude: number
  ): Promise<PlaceWithDistance[]> => {
    const searchTerm = query.trim();
    if (searchTerm.length < 2) return [];

    const cacheKey = `search:${searchTerm}:${userLatitude.toFixed(3)},${userLongitude.toFixed(3)}`;

    // Check cache
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.results;
    }

    // Check if request is already in flight
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // Clear existing debounce timer
    const existingTimer = debounceTimers.get(cacheKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Create debounced request
    const request = new Promise<PlaceWithDistance[]>((resolve) => {
      const timer = setTimeout(async () => {
        debounceTimers.delete(cacheKey);

        const bbox = calculateBoundingBox(userLatitude, userLongitude, 5000); // 5km search radius

        const params = new URLSearchParams({
          q: searchTerm,
          format: 'json',
          addressdetails: '1',
          limit: '20',
          bounded: '1',
          viewbox: `${bbox.left},${bbox.top},${bbox.right},${bbox.bottom}`,
        });

        const results = await fetchFromNominatim(params, userLatitude, userLongitude);

        // Cache results
        searchCache.set(cacheKey, {
          timestamp: Date.now(),
          results,
        });

        inFlightRequests.delete(cacheKey);
        resolve(results);
      }, 400); // 400ms debounce

      debounceTimers.set(cacheKey, timer);
    });

    inFlightRequests.set(cacheKey, request);
    return request;
  },

  /**
   * Get nearby places within a certain radius
   */
  nearbyPlaces: async (
    userLatitude: number,
    userLongitude: number,
    radiusMeters: number = 2000
  ): Promise<PlaceWithDistance[]> => {
    const cacheKey = `nearby:${userLatitude.toFixed(3)},${userLongitude.toFixed(3)}:${radiusMeters}`;

    // Check cache
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.results;
    }

    // Check if request is already in flight
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    const request = (async () => {
      const bbox = calculateBoundingBox(userLatitude, userLongitude, radiusMeters);

      // High-signal, situational amenity types for MVP
      const amenityTypes = [
        'restaurant', 'cafe', 'bar', 'park',
        'gym', 'pharmacy', 'supermarket', 'bakery'
      ];

      const allPlaces = new Map<string, PlaceWithDistance>();

      // Fetch amenity types in batches to respect rate limits (max 1 req/sec)
      const batchSize = 2;
      for (let i = 0; i < amenityTypes.length; i += batchSize) {
        const batch = amenityTypes.slice(i, i + batchSize);

        // Fetch batch in parallel
        const batchPromises = batch.map(async (amenity) => {
          const params = new URLSearchParams({
            q: amenity,
            format: 'json',
            addressdetails: '1',
            limit: '10',
            bounded: '1',
            viewbox: `${bbox.left},${bbox.top},${bbox.right},${bbox.bottom}`,
          });

          return fetchFromNominatim(params, userLatitude, userLongitude);
        });

        const batchResults = await Promise.all(batchPromises);

        // Add batch results to map
        batchResults.flat().forEach(place => {
          if (!allPlaces.has(place.id) && place.distance <= radiusMeters) {
            allPlaces.set(place.id, place);
          }
        });

        // Wait 1 second between batches to respect rate limits
        if (i + batchSize < amenityTypes.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Convert map to array, sort by distance, and limit results
      const results = Array.from(allPlaces.values())
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20);

      // Cache results
      searchCache.set(cacheKey, {
        timestamp: Date.now(),
        results,
      });

      inFlightRequests.delete(cacheKey);
      return results;
    })();

    inFlightRequests.set(cacheKey, request);
    return request;
  },
};
