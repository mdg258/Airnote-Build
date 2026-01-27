export interface Location {
  latitude: number;
  longitude: number;
}

export type Duration = '15m' | '30m' | '1h' | '4h' | '24h';
export type Radius = 10 | 25 | 50 | 100;

export interface Note {
  id: string;
  text: string;
  location: Location;
  radius: Radius; // in meters
  createdAt: Date;
  expiresAt: Date;
  duration: Duration;
  userId: string; // ID of the user who created this note
}

export interface CreateNoteInput {
  text: string;
  location: Location;
  radius: Radius;
  duration: Duration;
}
