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

// Overpass API configuration
const OVERPASS_BASE_URL = 'https://overpass-api.de/api/interpreter';

// Cache for search results
const searchCache = new Map<string, { timestamp: number; results: PlaceWithDistance[] }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const NEARBY_CACHE_DURATION = 60 * 1000; // 60 seconds for nearby

// In-flight requests tracking
const inFlightRequests = new Map<string, Promise<PlaceWithDistance[]>>();

// Debounce timers
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

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
 * Derive category from OSM tags with priority order
 */
const getCategoryFromTags = (tags: any): string | undefined => {
  const categoryMap: Record<string, string> = {
    // Amenity
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
    'fuel': 'Gas Station',
    'parking': 'Parking',
    // Shop
    'supermarket': 'Supermarket',
    'convenience': 'Convenience Store',
    'bakery': 'Bakery',
    // Leisure
    'fitness_centre': 'Gym',
    'sports_centre': 'Gym',
  };

  // Priority order: amenity > shop > leisure > tourism > craft > office > building
  const priorityKeys = ['amenity', 'shop', 'leisure', 'tourism', 'craft', 'office', 'building'];

  for (const key of priorityKeys) {
    if (tags[key]) {
      const mapped = categoryMap[tags[key]];
      if (mapped) return mapped;
    }
  }

  return undefined;
};

/**
 * Fetch places from Overpass API
 */
const fetchFromOverpass = async (
  lat: number,
  lon: number,
  radiusMeters: number
): Promise<PlaceWithDistance[]> => {
  // Build Overpass QL query
  const query = `
    [out:json][timeout:25];
    (
      node(around:${radiusMeters},${lat},${lon})["name"]["amenity"];
      way(around:${radiusMeters},${lat},${lon})["name"]["amenity"];
      relation(around:${radiusMeters},${lat},${lon})["name"]["amenity"];

      node(around:${radiusMeters},${lat},${lon})["name"]["shop"];
      way(around:${radiusMeters},${lat},${lon})["name"]["shop"];
      relation(around:${radiusMeters},${lat},${lon})["name"]["shop"];

      node(around:${radiusMeters},${lat},${lon})["name"]["tourism"];
      way(around:${radiusMeters},${lat},${lon})["name"]["tourism"];
      relation(around:${radiusMeters},${lat},${lon})["name"]["tourism"];

      node(around:${radiusMeters},${lat},${lon})["name"]["leisure"];
      way(around:${radiusMeters},${lat},${lon})["name"]["leisure"];
      relation(around:${radiusMeters},${lat},${lon})["name"]["leisure"];

      node(around:${radiusMeters},${lat},${lon})["name"]["craft"];
      way(around:${radiusMeters},${lat},${lon})["name"]["craft"];
      relation(around:${radiusMeters},${lat},${lon})["name"]["craft"];

      node(around:${radiusMeters},${lat},${lon})["name"]["office"];
      way(around:${radiusMeters},${lat},${lon})["name"]["office"];
      relation(around:${radiusMeters},${lat},${lon})["name"]["office"];
    );
    out center;
  `;

  try {
    const response = await fetch(OVERPASS_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      console.error('Overpass API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data.elements || !Array.isArray(data.elements)) {
      return [];
    }

    // Normalize results
    const places: PlaceWithDistance[] = [];
    const seenNames = new Set<string>();

    for (const element of data.elements) {
      const tags = element.tags || {};
      const name = tags.name;

      // Skip if no name
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        continue;
      }

      // Skip pure addresses (has addr:housenumber but nothing else meaningful)
      if (tags['addr:housenumber'] && !tags.amenity && !tags.shop && !tags.tourism && !tags.leisure && !tags.craft && !tags.office) {
        continue;
      }

      // Get coordinates
      let placeLat: number;
      let placeLon: number;

      if (element.type === 'node') {
        placeLat = element.lat;
        placeLon = element.lon;
      } else if (element.center) {
        placeLat = element.center.lat;
        placeLon = element.center.lon;
      } else {
        continue; // Skip if no coordinates
      }

      // Calculate distance
      const distance = calculateDistance(lat, lon, placeLat, placeLon);

      // Skip duplicates by name (case-insensitive)
      const nameLower = name.toLowerCase();
      if (seenNames.has(nameLower)) {
        continue;
      }
      seenNames.add(nameLower);

      // Build address from tags
      const addressParts: string[] = [];
      if (tags['addr:street']) addressParts.push(tags['addr:street']);
      if (tags['addr:city']) addressParts.push(tags['addr:city']);
      const address = addressParts.length > 0 ? addressParts.join(', ') : undefined;

      places.push({
        id: element.id?.toString() || Math.random().toString(),
        name,
        address,
        neighborhood: tags['addr:suburb'] || tags['addr:neighbourhood'],
        latitude: placeLat,
        longitude: placeLon,
        category: getCategoryFromTags(tags),
        distance,
      });
    }

    // Sort by distance and limit to 200
    const sortedPlaces = places
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 200);

    // Debug logging
    console.log(`[Overpass] Found ${sortedPlaces.length} POIs within ${radiusMeters}m`);
    console.log('[Overpass] First 10:', sortedPlaces.slice(0, 10).map(p => ({
      name: p.name,
      distance: `${Math.round(p.distance)}m`,
      category: p.category
    })));

    return sortedPlaces;
  } catch (error) {
    console.error('Failed to fetch from Overpass:', error);
    return [];
  }
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
   * Uses Overpass API to fetch ALL named POIs within 1 mile (~1609m)
   */
  nearbyPlaces: async (
    userLatitude: number,
    userLongitude: number,
    radiusMeters: number = 1609 // 1 mile default
  ): Promise<PlaceWithDistance[]> => {
    // Round coordinates to 2 decimal places for cache key (~1km precision)
    const roundedLat = userLatitude.toFixed(2);
    const roundedLon = userLongitude.toFixed(2);
    const cacheKey = `nearby:${roundedLat},${roundedLon}:${radiusMeters}`;

    // Check cache (60 second duration for nearby)
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < NEARBY_CACHE_DURATION) {
      console.log('[Overpass] Using cached results');
      return cached.results;
    }

    // Check if request is already in flight
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    const request = (async () => {
      const results = await fetchFromOverpass(userLatitude, userLongitude, radiusMeters);

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
