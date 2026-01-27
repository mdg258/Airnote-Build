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

// Mock places data - in production, this would come from Google Places, Mapbox, etc.
const MOCK_PLACES: Place[] = [
  // Coffee shops
  { id: 'p1', name: 'Blue Bottle Coffee', address: '66 Mint St', neighborhood: 'SoMa', latitude: 37.7858, longitude: -122.3964, category: 'Coffee Shop' },
  { id: 'p2', name: 'Philz Coffee', address: '201 Berry St', neighborhood: 'Mission Bay', latitude: 37.7764, longitude: -122.3926, category: 'Coffee Shop' },
  { id: 'p3', name: 'Sightglass Coffee', address: '270 7th St', neighborhood: 'SoMa', latitude: 37.7766, longitude: -122.4072, category: 'Coffee Shop' },

  // Restaurants
  { id: 'p4', name: 'The Slanted Door', address: 'Ferry Building', neighborhood: 'Embarcadero', latitude: 37.7955, longitude: -122.3937, category: 'Restaurant' },
  { id: 'p5', name: 'State Bird Provisions', address: '1529 Fillmore St', neighborhood: 'Western Addition', latitude: 37.7844, longitude: -122.4329, category: 'Restaurant' },
  { id: 'p6', name: 'Tartine Bakery', address: '600 Guerrero St', neighborhood: 'Mission', latitude: 37.7611, longitude: -122.4242, category: 'Bakery' },

  // Bars
  { id: 'p7', name: 'Bourbon & Branch', address: '501 Jones St', neighborhood: 'Tenderloin', latitude: 37.7849, longitude: -122.4125, category: 'Bar' },
  { id: 'p8', name: 'Trick Dog', address: '3010 20th St', neighborhood: 'Mission', latitude: 37.7589, longitude: -122.4122, category: 'Bar' },
  { id: 'p9', name: 'The Interval', address: '2 Marina Blvd', neighborhood: 'Fort Mason', latitude: 37.8065, longitude: -122.4319, category: 'Bar' },

  // Parks
  { id: 'p10', name: 'Dolores Park', address: 'Dolores St & 19th St', neighborhood: 'Mission', latitude: 37.7596, longitude: -122.4269, category: 'Park' },
  { id: 'p11', name: 'Golden Gate Park', address: 'Golden Gate Park', neighborhood: 'Richmond', latitude: 37.7694, longitude: -122.4862, category: 'Park' },
  { id: 'p12', name: 'Alamo Square', address: 'Hayes St & Steiner St', neighborhood: 'Western Addition', latitude: 37.7766, longitude: -122.4343, category: 'Park' },

  // Gyms
  { id: 'p13', name: 'Equinox', address: '2 Embarcadero Center', neighborhood: 'Financial District', latitude: 37.7946, longitude: -122.3975, category: 'Gym' },
  { id: 'p14', name: 'Barry\'s Bootcamp', address: '2125 Fillmore St', neighborhood: 'Pacific Heights', latitude: 37.7914, longitude: -122.4336, category: 'Gym' },

  // Museums
  { id: 'p15', name: 'SFMOMA', address: '151 3rd St', neighborhood: 'SoMa', latitude: 37.7857, longitude: -122.4011, category: 'Museum' },
  { id: 'p16', name: 'de Young Museum', address: 'Golden Gate Park', neighborhood: 'Golden Gate Park', latitude: 37.7715, longitude: -122.4686, category: 'Museum' },

  // Shopping
  { id: 'p17', name: 'Westfield San Francisco Centre', address: '865 Market St', neighborhood: 'Downtown', latitude: 37.7844, longitude: -122.4068, category: 'Shopping' },
  { id: 'p18', name: 'Union Square', address: 'Geary St & Stockton St', neighborhood: 'Union Square', latitude: 37.7879, longitude: -122.4074, category: 'Shopping' },

  // Hotels
  { id: 'p19', name: 'The Fairmont', address: '950 Mason St', neighborhood: 'Nob Hill', latitude: 37.7926, longitude: -122.4107, category: 'Hotel' },
  { id: 'p20', name: 'Palace Hotel', address: '2 New Montgomery St', neighborhood: 'SoMa', latitude: 37.7882, longitude: -122.4013, category: 'Hotel' },
];

/**
 * Places Service Interface
 * This abstraction allows swapping providers (Google Places, Mapbox, etc.) easily
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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter places by query (case-insensitive search in name, address, neighborhood)
    const searchTerm = query.toLowerCase().trim();
    const filtered = MOCK_PLACES.filter(place => {
      return (
        place.name.toLowerCase().includes(searchTerm) ||
        place.address?.toLowerCase().includes(searchTerm) ||
        place.neighborhood?.toLowerCase().includes(searchTerm) ||
        place.category?.toLowerCase().includes(searchTerm)
      );
    });

    // Calculate distances and sort by distance
    const withDistance = filtered.map(place => {
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        place.latitude,
        place.longitude
      );
      return { ...place, distance };
    });

    // Sort by relevance (exact matches first) then by distance
    return withDistance.sort((a, b) => {
      const aExactMatch = a.name.toLowerCase().startsWith(searchTerm);
      const bExactMatch = b.name.toLowerCase().startsWith(searchTerm);

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      return a.distance - b.distance;
    });
  },

  /**
   * Get nearby places within a certain radius
   */
  nearbyPlaces: async (
    userLatitude: number,
    userLongitude: number,
    radiusMeters: number = 2000 // Default 2km radius
  ): Promise<PlaceWithDistance[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Calculate distances for all places
    const withDistance = MOCK_PLACES.map(place => {
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        place.latitude,
        place.longitude
      );
      return { ...place, distance };
    });

    // Filter by radius and sort by distance
    return withDistance
      .filter(place => place.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  },
};
