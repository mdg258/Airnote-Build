import { Comment, CreateCommentInput, Note } from '../types/note';
import { calculateDistance } from '../utils/location';

// In-memory storage for comments
let comments: Comment[] = [];

// Current user ID (same as notesService - would come from auth in production)
const CURRENT_USER_ID = 'current-user';

// Generate a simple unique ID (same pattern as notesService)
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const commentsService = {
  /**
   * Create a new comment on a note
   * Validates user is within note's radius before creating
   */
  createComment: (input: CreateCommentInput, note: Note): Comment | null => {
    // Verify user is within note's radius
    const distance = calculateDistance(
      input.userLocation.latitude,
      input.userLocation.longitude,
      note.location.latitude,
      note.location.longitude
    );

    if (distance > note.radius) {
      return null; // User not in range
    }

    const comment: Comment = {
      id: generateId(),
      noteId: input.noteId,
      text: input.text,
      userId: CURRENT_USER_ID,
      userLocation: input.userLocation,
      createdAt: new Date(),
      expiresAt: note.expiresAt, // Inherit from note
    };

    comments.push(comment);
    return comment;
  },

  /**
   * Get all comments for a specific note
   * Returns only non-expired comments, sorted chronologically
   */
  getCommentsForNote: (noteId: string): Comment[] => {
    const now = new Date();
    return comments
      .filter(c => c.noteId === noteId && c.expiresAt > now)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },

  /**
   * Get comment count for a single note
   */
  getCommentCount: (noteId: string): number => {
    const now = new Date();
    return comments.filter(
      c => c.noteId === noteId && c.expiresAt > now
    ).length;
  },

  /**
   * Get comment counts for multiple notes (batch operation)
   * Returns Map<noteId, count> for efficient lookup
   */
  getCommentCounts: (noteIds: string[]): Map<string, number> => {
    const now = new Date();
    const counts = new Map<string, number>();

    // Initialize all counts to 0
    noteIds.forEach(id => counts.set(id, 0));

    // Count comments for each note
    comments.forEach(comment => {
      if (comment.expiresAt > now && noteIds.includes(comment.noteId)) {
        const current = counts.get(comment.noteId) || 0;
        counts.set(comment.noteId, current + 1);
      }
    });

    return counts;
  },

  /**
   * Purge expired comments
   */
  purgeExpiredComments: (): void => {
    const now = new Date();
    comments = comments.filter(c => c.expiresAt > now);
  },

  /**
   * Clear all comments (for testing/debugging)
   */
  clearAllComments: (): void => {
    comments = [];
  },

  /**
   * Get all comments (for debugging)
   */
  getAllComments: (): Comment[] => {
    return comments;
  },
};
