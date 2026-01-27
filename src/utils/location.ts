import * as Location from 'expo-location';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  const feet = meters * 3.28084;
  if (feet < 1000) {
    return `${Math.round(feet)}ft`;
  }
  const miles = feet / 5280;
  return `${miles.toFixed(1)}mi`;
};

/**
 * Format time remaining for display
 */
export const formatTimeLeft = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d left`;
  }
  if (hours > 0) {
    return `${hours}h left`;
  }
  if (minutes > 0) {
    return `${minutes}m left`;
  }
  return '<1m left';
};

export interface LocationOption {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

/**
 * Get detailed location options from reverse geocoding
 */
export const getLocationOptions = async (
  latitude: number,
  longitude: number
): Promise<LocationOption[]> => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length === 0) {
      return [{
        id: 'current',
        name: 'Current Location',
        latitude,
        longitude,
      }];
    }

    const place = results[0];
    const options: LocationOption[] = [];

    // Option 1: Specific address (if available)
    if (place.name || place.street) {
      const addressParts = [place.name, place.street].filter(Boolean);
      if (addressParts.length > 0) {
        options.push({
          id: 'address',
          name: addressParts.join(', '),
          description: [place.subregion, place.city].filter(Boolean).join(', '),
          latitude,
          longitude,
        });
      }
    }

    // Option 2: Neighborhood/District level
    if (place.subregion && place.city) {
      options.push({
        id: 'neighborhood',
        name: `${place.subregion}, ${place.city}`,
        description: 'Neighborhood area',
        latitude,
        longitude,
      });
    } else if (place.city) {
      options.push({
        id: 'city',
        name: place.city,
        description: place.region || 'City area',
        latitude,
        longitude,
      });
    }

    // Option 3: General area
    options.push({
      id: 'general',
      name: 'General Area',
      description: [place.subregion, place.city, place.region]
        .filter(Boolean)
        .join(', '),
      latitude,
      longitude,
    });

    return options.length > 0 ? options : [{
      id: 'current',
      name: 'Current Location',
      latitude,
      longitude,
    }];
  } catch (error) {
    console.error('Failed to get location options:', error);
    return [{
      id: 'current',
      name: 'Current Location',
      latitude,
      longitude,
    }];
  }
};
