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
      category: input.category,
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

  /**
   * Seed sample notes at specific locations
   * Call this function to populate test data
   */
  seedNotes: (): void => {
    const now = new Date();

    // Clear existing notes first
    notes = [];

    const seedData = [
      // DQ Grill & Chill notes
      {
        text: 'Half-price blizzards today 2-4pm!',
        placeName: 'DQ Grill & Chill',
        placeId: 'dq-grill-chill',
        latitude: 37.43307246741869,
        longitude: -77.61065958748061,
        radius: 100,
        duration: '30m' as Duration,
      },
      {
        text: 'Order the chicken strip basket - best value on the menu',
        placeName: 'DQ Grill & Chill',
        placeId: 'dq-grill-chill',
        latitude: 37.43307246741869,
        longitude: -77.61065958748061,
        radius: 75,
        duration: '1h' as Duration,
      },
      {
        text: 'Soft serve machine is working today! 🎉',
        placeName: 'DQ Grill & Chill',
        placeId: 'dq-grill-chill',
        latitude: 37.43307246741869,
        longitude: -77.61065958748061,
        radius: 100,
        duration: '15m' as Duration,
      },

      // Goodwill notes
      {
        text: 'Saw vintage Nintendo games here - shelf near back',
        placeName: 'Goodwill',
        placeId: 'goodwill',
        latitude: 37.432908540766825,
        longitude: -77.61145697314196,
        radius: 60,
        duration: '1h' as Duration,
      },
      {
        text: '50% off all clothing today only!',
        placeName: 'Goodwill',
        placeId: 'goodwill',
        latitude: 37.432908540766825,
        longitude: -77.61145697314196,
        radius: 100,
        duration: '4h' as Duration,
      },

      // Ample Storage notes
      {
        text: 'Moving boxes available - free to take!',
        placeName: 'Ample Storage',
        placeId: 'ample-storage',
        latitude: 37.43048068582967,
        longitude: -77.61127496661474,
        radius: 75,
        duration: '4h' as Duration,
      },
      {
        text: 'Unit 42 door sticks - push hard on bottom left',
        placeName: 'Ample Storage',
        placeId: 'ample-storage',
        latitude: 37.43048068582967,
        longitude: -77.61127496661474,
        radius: 50,
        duration: '24h' as Duration,
      },

      // Greg's Garage notes
      {
        text: "Ask for Mike - he'll give you the best price on oil changes",
        placeName: "Greg's Garage",
        placeId: 'gregs-garage',
        latitude: 37.433646399865566,
        longitude: -77.60932126312186,
        radius: 75,
        duration: '24h' as Duration,
      },
      {
        text: 'Appointment running 30 min late - grab coffee next door',
        placeName: "Greg's Garage",
        placeId: 'gregs-garage',
        latitude: 37.433646399865566,
        longitude: -77.60932126312186,
        radius: 50,
        duration: '15m' as Duration,
      },
      {
        text: 'They accept walk-ins for tire rotation - no appointment needed',
        placeName: "Greg's Garage",
        placeId: 'gregs-garage',
        latitude: 37.433646399865566,
        longitude: -77.60932126312186,
        radius: 100,
        duration: '4h' as Duration,
      },
    ];

    // Create all seed notes
    seedData.forEach((data) => {
      const expiresAt = new Date(now.getTime() + durationToMs(data.duration));

      const note: Note = {
        id: generateId(),
        text: data.text,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
        placeName: data.placeName,
        placeAddress: undefined, // Can be added if needed
        placeId: data.placeId,
        radius: data.radius,
        createdAt: now,
        expiresAt,
        duration: data.duration,
        userId: 'seed-user', // Use different userId so seed notes don't appear in "My Notes"
      };

      notes.push(note);
    });

    console.log(`Seeded ${seedData.length} notes at various locations`);
  },
};
