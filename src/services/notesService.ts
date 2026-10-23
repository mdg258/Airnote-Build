import { Note, CreateNoteInput, Duration, NoteCategory, Radius } from '../types/note';
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
   * Note: Use privateNotesService.createPrivateNote() for private notes instead
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
      isPrivate: input.isPrivate || false, // Default to public
    };

    notes.push(note);
    return note;
  },

  /**
   * Get all notes near a location
   * Filters by:
   * - Distance from user location must be <= note's radius
   * - Note must not be expired
   * - Note must not be private
   */
  getNearbyNotes: (
    userLatitude: number,
    userLongitude: number
  ): Array<Note & { distance: number; timeLeft: number }> => {
    const now = new Date();

    return notes
      .filter((note) => {
        // Never show private notes in public queries
        if (note.isPrivate) return false;

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
   * - Note must not be private
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
        // Never show private notes in public queries
        if (note.isPrivate) return false;

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
   * Filters out expired notes and private notes (use privateNotesService for those)
   */
  getUserNotes: (): Array<Note & { timeLeft: number }> => {
    const now = new Date();

    return notes
      .filter((note) => {
        // Only show user's own PUBLIC notes that haven't expired
        return (
          note.userId === CURRENT_USER_ID &&
          now <= note.expiresAt &&
          !note.isPrivate
        );
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
   * Seed sample notes around Reston Town Center
   * Call this function to populate test data
   */
  seedNotes: (): void => {
    const now = new Date();

    // Clear existing notes first
    notes = [];

    const seedData = [
      // Signature Apartments notes
      {
        text: 'Package room is backed up - check the overflow shelf by the mail lockers',
        placeName: 'Signature Apartments',
        placeId: 'signature-reston',
        latitude: 38.9597968,
        longitude: -77.3553872,
        radius: 45.72 as Radius, // 150ft
        duration: '4h' as Duration,
        category: 'info' as NoteCategory,
      },
      {
        text: 'Rooftop grills are open tonight, bring your own charcoal',
        placeName: 'Signature Apartments',
        placeId: 'signature-reston',
        latitude: 38.9597968,
        longitude: -77.3553872,
        radius: 91.44 as Radius, // 300ft
        duration: '4h' as Duration,
        category: 'invite' as NoteCategory,
      },

      // Reston Town Center Pavilion notes
      {
        text: 'Free live music at the Pavilion starting at 7pm!',
        placeName: 'Reston Town Center Pavilion',
        placeId: 'rtc-pavilion',
        latitude: 38.9583653,
        longitude: -77.3569087,
        radius: 91.44 as Radius, // 300ft
        duration: '4h' as Duration,
        category: 'invite' as NoteCategory,
      },
      {
        text: 'Found a set of car keys on a bench near the stage - turned in to security',
        placeName: 'Reston Town Center Pavilion',
        placeId: 'rtc-pavilion',
        latitude: 38.9583653,
        longitude: -77.3569087,
        radius: 91.44 as Radius, // 300ft
        duration: '24h' as Duration,
        category: 'lostfound' as NoteCategory,
      },

      // Mercury Fountain notes
      {
        text: 'Pigeons are bold today, guard your snacks 🐦',
        placeName: 'Mercury Fountain',
        placeId: 'mercury-fountain',
        latitude: 38.9589259,
        longitude: -77.3569034,
        radius: 45.72 as Radius, // 150ft
        duration: '1h' as Duration,
        category: 'warning' as NoteCategory,
      },

      // Tatte Bakery & Cafe notes
      {
        text: 'Line is out the door - mobile order is way faster',
        placeName: 'Tatte Bakery & Cafe',
        placeId: 'tatte-reston',
        latitude: 38.9588361,
        longitude: -77.3573351,
        radius: 45.72 as Radius, // 150ft
        duration: '30m' as Duration,
        category: 'info' as NoteCategory,
      },
      {
        text: 'Get the shakshuka, trust me',
        placeName: 'Tatte Bakery & Cafe',
        placeId: 'tatte-reston',
        latitude: 38.9588361,
        longitude: -77.3573351,
        radius: 45.72 as Radius, // 150ft
        duration: '4h' as Duration,
        category: 'other' as NoteCategory,
      },

      // LOOK Cinemas notes
      {
        text: 'Recliner seats in theater 5 are the comfiest',
        placeName: 'LOOK Cinemas',
        placeId: 'look-cinemas-reston',
        latitude: 38.9588376,
        longitude: -77.3581209,
        radius: 91.44 as Radius, // 300ft
        duration: '24h' as Duration,
        category: 'info' as NoteCategory,
      },

      // Ice Cream Jubilee notes
      {
        text: 'Banana bourbon caramel is back this week 🍦',
        placeName: 'Ice Cream Jubilee',
        placeId: 'ice-cream-jubilee-reston',
        latitude: 38.958871,
        longitude: -77.3606052,
        radius: 45.72 as Radius, // 150ft
        duration: '4h' as Duration,
        category: 'info' as NoteCategory,
      },

      // Reston Regional Library notes
      {
        text: 'Study rooms are all booked until 3pm',
        placeName: 'Reston Regional Library',
        placeId: 'reston-regional-library',
        latitude: 38.9614685,
        longitude: -77.3585049,
        radius: 91.44 as Radius, // 300ft
        duration: '1h' as Duration,
        category: 'warning' as NoteCategory,
      },

      // Whole Foods Market notes
      {
        text: 'Hot bar just restocked, mac and cheese is fresh',
        placeName: 'Whole Foods Market',
        placeId: 'whole-foods-reston',
        latitude: 38.9615838,
        longitude: -77.3556267,
        radius: 45.72 as Radius, // 150ft
        duration: '30m' as Duration,
        category: 'info' as NoteCategory,
      },
      {
        text: 'Parking garage level 1 is full - go straight to level 2',
        placeName: 'Whole Foods Market',
        placeId: 'whole-foods-reston',
        latitude: 38.9615838,
        longitude: -77.3556267,
        radius: 91.44 as Radius, // 300ft
        duration: '1h' as Duration,
        category: 'warning' as NoteCategory,
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
        category: (data as any).category,
      };

      notes.push(note);
    });

    console.log(`Seeded ${seedData.length} notes at various locations`);
  },
};
