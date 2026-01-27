export interface Location {
  latitude: number;
  longitude: number;
}

export type Duration = '15m' | '30m' | '1h' | '4h' | '24h';
export type Radius = 9.14 | 22.86 | 45.72 | 91.44; // 30ft, 75ft, 150ft, 300ft in meters

export interface Note {
  id: string;
  text: string;
  location: Location;
  placeName?: string; // Human-readable location name (e.g., "SoMa, San Francisco" or "Blue Bottle Coffee")
  placeAddress?: string; // Optional street address
  placeId?: string; // Optional place ID from provider (Google, Mapbox, etc.)
  radius: Radius; // in meters
  createdAt: Date;
  expiresAt: Date;
  duration: Duration;
  userId: string; // ID of the user who created this note
}

export interface CreateNoteInput {
  text: string;
  location: Location;
  placeName?: string;
  placeAddress?: string;
  placeId?: string;
  radius: Radius;
  duration: Duration;
}
