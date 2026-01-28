import { Note, CreateNoteInput, Duration } from '../types/note';
import { calculateDistance } from '../utils/location';

// In-memory storage for private notes (only visible to the user who created them)
let privateNotes: Note[] = [];

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
  return `private-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const privateNotesService = {
  /**
   * Create a new private note
   */
  createPrivateNote: (input: CreateNoteInput): Note => {
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
      category: input.category,
      isPrivate: true,
    };

    privateNotes.push(note);
    return note;
  },

  /**
   * Get all private notes for the current user
   * Filters out expired notes and sorts by newest first
   */
  getAllPrivateNotes: (): Array<Note & { timeLeft: number }> => {
    const now = new Date();

    return privateNotes
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
   * Get private notes grouped by location/place
   * Returns a map where key is placeName (or 'Unnamed location') and value is array of notes
   */
  getPrivateNotesGroupedByPlace: (): Map<
    string,
    Array<Note & { timeLeft: number }>
  > => {
    const allNotes = privateNotesService.getAllPrivateNotes();
    const grouped = new Map<string, Array<Note & { timeLeft: number }>>();

    allNotes.forEach((note) => {
      const key = note.placeName || 'Unnamed location';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(note);
    });

    return grouped;
  },

  /**
   * Get private notes near a specific location
   * Used to show an indicator when user returns to a place with private notes
   */
  getPrivateNotesNearLocation: (
    latitude: number,
    longitude: number,
    maxDistance: number = 100 // Default 100 meters
  ): Array<Note & { distance: number; timeLeft: number }> => {
    const now = new Date();

    return privateNotes
      .filter((note) => {
        // Remove expired notes
        if (now > note.expiresAt) return false;

        // Calculate distance from location to note
        const distance = calculateDistance(
          latitude,
          longitude,
          note.location.latitude,
          note.location.longitude
        );

        // Only show notes within maxDistance
        return distance <= maxDistance;
      })
      .map((note) => {
        const distance = calculateDistance(
          latitude,
          longitude,
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
   * Delete a private note by ID
   */
  deletePrivateNote: (noteId: string): boolean => {
    const initialLength = privateNotes.length;
    privateNotes = privateNotes.filter((note) => note.id !== noteId);
    return privateNotes.length < initialLength;
  },

  /**
   * Clean up expired private notes
   */
  purgeExpiredPrivateNotes: (): void => {
    const now = new Date();
    privateNotes = privateNotes.filter((note) => note.expiresAt > now);
  },

  /**
   * Clear all private notes (for debugging/testing)
   */
  clearAllPrivateNotes: (): void => {
    privateNotes = [];
  },

  /**
   * Get count of private notes (for badges/indicators)
   */
  getPrivateNoteCount: (): number => {
    const now = new Date();
    return privateNotes.filter(
      (note) => note.userId === CURRENT_USER_ID && now <= note.expiresAt
    ).length;
  },
};
