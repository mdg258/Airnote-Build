import { Note, CreateNoteInput, Duration } from '../types/note';
import { calculateDistance } from '../utils/location';

// In-memory storage for notes
let notes: Note[] = [];

// Current user ID (in MVP, we use a constant - would come from auth in production)
const CURRENT_USER_ID = 'current-user';

// Helper to convert duration to milliseconds
const durationToMs = (duration: Duration): number => {
  const map: Record<Duration, number> = {
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
  };
  return map[duration];
};

// Generate a simple unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const notesService = {
  /**
   * Create a new note
   */
  createNote: (input: CreateNoteInput): Note => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationToMs(input.duration));

    const note: Note = {
      id: generateId(),
      text: input.text,
      location: input.location,
      placeName: input.placeName,
      placeAddress: input.placeAddress,
      placeId: input.placeId,
      radius: input.radius,
      createdAt: now,
      expiresAt,
      duration: input.duration,
      userId: CURRENT_USER_ID,
    };

    notes.push(note);
    return note;
  },

  /**
   * Get all notes near a location
   * Filters by:
   * - Distance from user location must be <= note's radius
   * - Note must not be expired
   */
  getNearbyNotes: (
    userLatitude: number,
    userLongitude: number
  ): Array<Note & { distance: number; timeLeft: number }> => {
    const now = new Date();

    return notes
      .filter((note) => {
        // Remove expired notes
        if (now > note.expiresAt) return false;

        // Calculate distance from user to note
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          note.location.latitude,
          note.location.longitude
        );

        // Only show notes within their defined radius
        return distance <= note.radius;
      })
      .map((note) => {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          note.location.latitude,
          note.location.longitude
        );

        const timeLeft = note.expiresAt.getTime() - now.getTime();

        return {
          ...note,
          distance,
          timeLeft,
        };
      })
      .sort((a, b) => a.distance - b.distance); // Sort by closest first
  },

  /**
   * Get all notes within a certain distance from a location (for map view)
   * Filters by:
   * - Distance from user location must be <= maxDistance
   * - Note must not be expired
   * Does NOT filter by note's individual radius (unlike getNearbyNotes)
   */
  getAllNotesWithinDistance: (
    userLatitude: number,
    userLongitude: number,
    maxDistance: number = 1609 // Default 1 mile in meters
  ): Array<Note & { distance: number; timeLeft: number }> => {
    const now = new Date();

    return notes
      .filter((note) => {
        // Remove expired notes
        if (now > note.expiresAt) return false;

        // Calculate distance from user to note
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          note.location.latitude,
          note.location.longitude
        );

        // Show all notes within maxDistance, regardless of note's radius
        return distance <= maxDistance;
      })
      .map((note) => {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          note.location.latitude,
          note.location.longitude
        );

        const timeLeft = note.expiresAt.getTime() - now.getTime();

        return {
          ...note,
          distance,
          timeLeft,
        };
      })
      .sort((a, b) => a.distance - b.distance); // Sort by closest first
  },

  /**
   * Get notes created by the current user
   * Filters out expired notes
   */
  getUserNotes: (): Array<Note & { timeLeft: number }> => {
    const now = new Date();

    return notes
      .filter((note) => {
        // Only show user's own notes that haven't expired
        return note.userId === CURRENT_USER_ID && now <= note.expiresAt;
      })
      .map((note) => {
        const timeLeft = note.expiresAt.getTime() - now.getTime();
        return {
          ...note,
          timeLeft,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  },

  /**
   * Clean up expired notes
   */
  purgeExpiredNotes: (): void => {
    const now = new Date();
    notes = notes.filter((note) => note.expiresAt > now);
  },

  /**
   * Get all notes (for debugging)
   */
  getAllNotes: (): Note[] => {
    return notes;
  },

  /**
   * Clear all notes (for debugging/testing)
   */
  clearAllNotes: (): void => {
    notes = [];
  },
};
