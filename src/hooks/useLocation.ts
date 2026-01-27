import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export const useLocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    placeName: null,
    isLoading: true,
    error: null,
    hasPermission: false,
  });

  useEffect(() => {
    let isMounted = true;

    const setupLocation = async () => {
      try {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (!isMounted) return;

        if (status !== 'granted') {
          setLocationState({
            latitude: null,
            longitude: null,
            placeName: null,
            isLoading: false,
            error: 'Location permission not granted',
            hasPermission: false,
          });
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        const { latitude, longitude } = location.coords;

        // Try to reverse geocode
        let placeName: string | null = null;
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (reverseGeocode.length > 0 && isMounted) {
            const place = reverseGeocode[0];
            // Format: "Neighborhood, City" or "City, Region" or just "City"
            if (place.subregion && place.city) {
              placeName = `${place.subregion}, ${place.city}`;
            } else if (place.city) {
              placeName = place.city;
            } else if (place.region) {
              placeName = place.region;
            }
          }
        } catch (geocodeError) {
          console.log('Reverse geocoding failed:', geocodeError);
          // Not critical, continue without place name
        }

        if (isMounted) {
          setLocationState({
            latitude,
            longitude,
            placeName,
            isLoading: false,
            error: null,
            hasPermission: true,
          });
        }
      } catch (error) {
        if (isMounted) {
          setLocationState({
            latitude: null,
            longitude: null,
            placeName: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to get location',
            hasPermission: false,
          });
        }
      }
    };

    setupLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return locationState;
};
