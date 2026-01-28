import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { CreateNoteModal } from '../components/CreateNoteModal';
import { NoteDetailModal } from '../components/NoteDetailModal';
import { useLocation } from '../hooks/useLocation';
import { notesService } from '../services/notesService';
import { commentsService } from '../services/commentsService';
import { Duration, Radius, Note, NoteCategory } from '../types/note';
import { spacing, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistance, formatTimeLeft } from '../utils/location';

export const HomeScreen: React.FC = () => {
  const { theme, textScale } = useTheme();
  const location = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<(Note & { distance: number; timeLeft: number }) | null>(null);
  const [noteDetailModalVisible, setNoteDetailModalVisible] = useState(false);
  const [nearbyNotes, setNearbyNotes] = useState<
    Array<Note & { distance: number; timeLeft: number }>
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [radius, setRadius] = useState<91 | 1609>(1609); // 300 ft or 1 mile
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!location.latitude || !location.longitude) return;
    const interval = setInterval(() => {
      refreshNotes();
    }, 10000);
    return () => clearInterval(interval);
  }, [location.latitude, location.longitude, radius]);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      refreshNotes();
    }
  }, [location.latitude, location.longitude, refreshKey, radius]);

  // Load comment counts when notes change
  useEffect(() => {
    if (nearbyNotes.length > 0) {
      const noteIds = nearbyNotes.map(n => n.id);
      const counts = commentsService.getCommentCounts(noteIds);
      setCommentCounts(counts);
    }
  }, [nearbyNotes]);

  // Auto-seed on first load if no notes exist
  useEffect(() => {
    const allNotes = notesService.getAllNotes();
    if (allNotes.length === 0) {
      // Seed with actual locations
      notesService.seedNotes();
      setRefreshKey((prev) => prev + 1);
    }
  }, []);

  const refreshNotes = () => {
    if (!location.latitude || !location.longitude) return;
    notesService.purgeExpiredNotes();
    const notes = notesService.getAllNotesWithinDistance(location.latitude, location.longitude, radius);
    setNearbyNotes(notes);
  };

  // Sort notes by distance with urgency boost
  const sortedNotes = useMemo(() => {
    return [...nearbyNotes].sort((a, b) => {
      // Boost notes that are expiring soon (< 1 hour)
      const aBoost = a.timeLeft < 3600000 ? -200 : 0;
      const bBoost = b.timeLeft < 3600000 ? -200 : 0;
      return (a.distance + aBoost) - (b.distance + bBoost);
    });
  }, [nearbyNotes]);

  const handleCreateNote = (
    text: string,
    duration: Duration,
    radius: Radius,
    locationOption: {
      id: string;
      name: string;
      description?: string;
      latitude: number;
      longitude: number;
    },
    category?: NoteCategory
  ) => {
    notesService.createNote({
      text,
      duration,
      radius,
      location: { latitude: locationOption.latitude, longitude: locationOption.longitude },
      placeName: locationOption.name,
      placeAddress: locationOption.description,
      placeId: locationOption.id,
      category,
    });
    setRefreshKey((prev) => prev + 1);
  };

  const renderNoteCard = (note: Note & { distance: number; timeLeft: number }, index: number) => {
    const commentCount = commentCounts.get(note.id) || 0;
    const isExpiringSoon = note.timeLeft < 3600000; // Less than 1 hour

    return (
      <TouchableOpacity
        key={note.id}
        style={styles.noteItem}
        onPress={() => {
          setSelectedNote(note);
          setNoteDetailModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        {/* Message Text - Primary */}
        <Text
          style={[
            styles.noteText,
            {
              color: theme.text.primary,
              fontSize: 19 * textScale,
              opacity: isExpiringSoon ? 1 : 0.95,
              fontWeight: isExpiringSoon ? '500' : '400',
            }
          ]}
        >
          {note.text}
        </Text>

        {/* Metadata Row - Secondary */}
        <View style={styles.metadataContainer}>
          <View style={styles.primaryMeta}>
            <Text style={[styles.timeDistance, { color: theme.text.secondary, fontSize: 13 * textScale }]}>
              {formatTimeLeft(note.timeLeft)} · {formatDistance(note.distance)}
            </Text>
            {commentCount > 0 && (
              <View style={styles.commentBadge}>
                <Ionicons name="chatbubble" size={11} color={theme.text.secondary} style={{ opacity: 0.7 }} />
                <Text style={[styles.commentCount, { color: theme.text.secondary, fontSize: 12 * textScale }]}>
                  {commentCount}
                </Text>
              </View>
            )}
          </View>
          {/* Location - Tertiary */}
          <Text style={[styles.locationText, { color: theme.text.tertiary, fontSize: 12 * textScale }]} numberOfLines={1}>
            {note.placeName || 'Unknown Location'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (location.isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.primaryDark} />
          <Text style={[styles.emptyText, { color: theme.text.secondary, fontSize: 18 * textScale }]}>Getting your location...</Text>
        </View>
      );
    }
    if (!location.hasPermission) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.text.secondary, fontSize: 18 * textScale }]}>Location permission needed</Text>
          <Text style={[styles.emptySubtext, { color: theme.text.tertiary, fontSize: 15 * textScale }]}>Enable location access to see nearby notes</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={[styles.emptyText, { color: theme.text.secondary, fontSize: 18 * textScale }]}>No notes nearby</Text>
        <Text style={[styles.emptySubtext, { color: theme.text.tertiary, fontSize: 15 * textScale }]}>
          Notes within {radius === 91 ? '300 feet' : '1 mile'} will appear here
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Simplified Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: theme.text.primary, fontSize: 36 * textScale }]}>
          airnote
        </Text>
        <View style={styles.locationRow}>
          <Text style={[styles.locationHeader, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
            Here
          </Text>
          <View style={[styles.greenDot, { backgroundColor: theme.primaryDark }]} />
          <Text style={[styles.locationHeader, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
            {location.placeName || 'Finding location...'}
          </Text>
        </View>
      </View>

      {sortedNotes.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedNotes.map((note, index) => renderNoteCard(note, index))}
        </ScrollView>
      )}

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <CreateNoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateNote}
        currentLatitude={location.latitude}
        currentLongitude={location.longitude}
      />

      <NoteDetailModal
        visible={noteDetailModalVisible}
        onClose={() => {
          setNoteDetailModalVisible(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
        userLatitude={location.latitude}
        userLongitude={location.longitude}
        onCommentAdded={() => setRefreshKey(prev => prev + 1)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontFamily: 'Coolvetica',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.7,
  },
  locationHeader: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.45,
    letterSpacing: -0.1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  noteItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xs,
  },
  noteText: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  metadataContainer: {
    gap: 4,
  },
  primaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeDistance: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
    opacity: 0.75,
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  commentCount: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: -0.05,
    opacity: 0.55,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.6,
  },
});
