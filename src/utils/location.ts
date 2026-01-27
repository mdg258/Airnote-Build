import * as Location from 'expo-location';
import { Note, PlaceGroup } from '../types/note';
import { Region } from 'react-native-maps';

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

/**
 * Group notes by place for map display
 * Filters notes within maxDistance and groups by location
 */
export const groupNotesByPlace = (
  notes: Array<Note & { distance: number; timeLeft: number }>,
  maxDistance: number = 1609 // 1 mile in meters
): PlaceGroup[] => {
  // Filter notes within maxDistance
  const nearbyNotes = notes.filter((note) => note.distance <= maxDistance);

  // Group notes by place
  const placeMap = new Map<string, PlaceGroup>();

  nearbyNotes.forEach((note) => {
    // Generate a unique key for grouping
    // Priority: placeId > placeName > rounded coordinates
    let groupKey: string;
    let placeName: string;
    let placeAddress: string | undefined;

    if (note.placeId) {
      groupKey = note.placeId;
      placeName = note.placeName || 'Unknown Place';
      placeAddress = note.placeAddress;
    } else if (note.placeName) {
      // Use placeName as key, but also include approximate coordinates to avoid collisions
      const roundedLat = note.location.latitude.toFixed(4);
      const roundedLon = note.location.longitude.toFixed(4);
      groupKey = `${note.placeName}-${roundedLat},${roundedLon}`;
      placeName = note.placeName;
      placeAddress = note.placeAddress;
    } else {
      // No place info, group by rounded coordinates (4 decimal places ≈ 11m precision)
      const roundedLat = note.location.latitude.toFixed(4);
      const roundedLon = note.location.longitude.toFixed(4);
      groupKey = `${roundedLat},${roundedLon}`;
      placeName = `${roundedLat}, ${roundedLon}`;
      placeAddress = undefined;
    }

    const existing = placeMap.get(groupKey);
    if (existing) {
      existing.notes.push(note);
      existing.noteCount += 1;
      existing.closestDistance = Math.min(existing.closestDistance, note.distance);
    } else {
      placeMap.set(groupKey, {
        placeId: groupKey,
        placeName,
        placeAddress,
        latitude: note.location.latitude,
        longitude: note.location.longitude,
        notes: [note],
        noteCount: 1,
        closestDistance: note.distance,
      });
    }
  });

  // Convert map to array and sort by closest distance
  const placeGroups = Array.from(placeMap.values()).sort(
    (a, b) => a.closestDistance - b.closestDistance
  );

  return placeGroups;
};

/**
 * Get marker color based on note count
 */
export const getMarkerColor = (noteCount: number): string => {
  if (noteCount >= 10) return '#FF3B30'; // Red for many notes
  if (noteCount >= 5) return '#FF9500';  // Orange for several
  if (noteCount >= 2) return '#FFCC00';  // Yellow for a few
  return '#74B7B1';                      // Primary teal for single
};

/**
 * Create map region from user location
 */
export const getMapRegion = (
  latitude: number,
  longitude: number,
  radiusMiles: number = 1
): Region => {
  // Convert miles to degrees
  // 1 degree latitude ≈ 69 miles
  const latitudeDelta = (radiusMiles / 69) * 2; // *2 for radius to diameter

  // Longitude degrees vary with latitude
  // At equator: 1 degree ≈ 69 miles
  // Adjust for latitude using cosine
  const longitudeDelta = (radiusMiles / (69 * Math.cos(latitude * Math.PI / 180))) * 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};
