import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
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

type SortMode = 'distance' | 'time' | 'comments';

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
  const [sortMode, setSortMode] = useState<SortMode>('distance');
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
    // Mark initial load as complete after first successful load
    if (!initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  };

  // Get unique places with notes
  const placesWithNotes = useMemo(() => {
    const placeMap = new Map<string, { id: string; name: string; count: number }>();

    nearbyNotes.forEach(note => {
      const placeId = note.placeId || 'unknown';
      const placeName = note.placeName || 'Unknown Location';

      if (placeMap.has(placeId)) {
        const place = placeMap.get(placeId)!;
        place.count += 1;
      } else {
        placeMap.set(placeId, { id: placeId, name: placeName, count: 1 });
      }
    });

    return Array.from(placeMap.values()).sort((a, b) => b.count - a.count);
  }, [nearbyNotes]);

  // Filter and sort notes
  const sortedNotes = useMemo(() => {
    let filtered = [...nearbyNotes];

    // Filter by selected place
    if (selectedPlaceId) {
      filtered = filtered.filter(note => (note.placeId || 'unknown') === selectedPlaceId);
    }

    // Comments mode: only show notes with comments
    if (sortMode === 'comments') {
      filtered = filtered.filter(note => (commentCounts.get(note.id) || 0) > 0);
    }

    return filtered.sort((a, b) => {
      if (sortMode === 'distance') {
        // Boost notes that are expiring soon (< 1 hour)
        const aBoost = a.timeLeft < 3600000 ? -200 : 0;
        const bBoost = b.timeLeft < 3600000 ? -200 : 0;
        return (a.distance + aBoost) - (b.distance + bBoost);
      } else if (sortMode === 'time') {
        return b.createdAt.getTime() - a.createdAt.getTime(); // Most recent first
      } else {
        // Sort by comment count
        const aCount = commentCounts.get(a.id) || 0;
        const bCount = commentCounts.get(b.id) || 0;
        return bCount - aCount; // Most comments first
      }
    });
  }, [nearbyNotes, sortMode, commentCounts, selectedPlaceId]);

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
    // Only show permission denied if permission is explicitly false (not undefined) and not loading
    if (location.hasPermission === false && !location.isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.text.secondary, fontSize: 18 * textScale }]}>Location permission needed</Text>
          <Text style={[styles.emptySubtext, { color: theme.text.tertiary, fontSize: 15 * textScale }]}>Enable location access to see nearby notes</Text>
        </View>
      );
    }

    // Don't show empty states until initial load is complete
    if (!initialLoadComplete) {
      return null;
    }

    // Special message for comments mode
    if (sortMode === 'comments') {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={[styles.emptyText, { color: theme.text.secondary, fontSize: 18 * textScale }]}>No notes with replies nearby</Text>
          <Text style={[styles.emptySubtext, { color: theme.text.tertiary, fontSize: 15 * textScale }]}>
            Notes with replies will appear here
          </Text>
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

        {/* Sort Chips */}
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: sortMode === 'distance' ? theme.primaryDark : theme.card,
              },
            ]}
            onPress={() => setSortMode('distance')}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: sortMode === 'distance' ? '#FFFFFF' : theme.text.secondary,
                  fontSize: 15 * textScale,
                },
              ]}
            >
              Nearest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: sortMode === 'time' ? theme.primaryDark : theme.card,
              },
            ]}
            onPress={() => setSortMode('time')}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: sortMode === 'time' ? '#FFFFFF' : theme.text.secondary,
                  fontSize: 15 * textScale,
                },
              ]}
            >
              Recent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: sortMode === 'comments' ? theme.primaryDark : theme.card,
              },
            ]}
            onPress={() => setSortMode('comments')}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: sortMode === 'comments' ? '#FFFFFF' : theme.text.secondary,
                  fontSize: 15 * textScale,
                },
              ]}
            >
              Replies
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: selectedPlaceId ? theme.primaryDark : theme.card,
              },
            ]}
            onPress={() => setLocationPickerVisible(true)}
            activeOpacity={0.6}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: selectedPlaceId ? '#FFFFFF' : theme.text.secondary,
                  fontSize: 15 * textScale,
                },
              ]}
            >
              Places
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={selectedPlaceId ? '#FFFFFF' : theme.text.secondary}
              style={{ opacity: selectedPlaceId ? 1 : 0.6, marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        {/* Selected Place Indicator */}
        {selectedPlaceId && (
          <Text style={[styles.placeIndicator, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
            Showing: {placesWithNotes.find(p => p.id === selectedPlaceId)?.name || 'Selected place'}
          </Text>
        )}
      </View>

      {/* Places Picker Modal */}
      <Modal
        visible={locationPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLocationPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLocationPickerVisible(false)}
        >
          <View style={[styles.locationPickerContainer, { backgroundColor: theme.background }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.text.primary, fontSize: 18 * textScale }]}>
                Filter by place
              </Text>
            </View>

            {/* All places option */}
            <TouchableOpacity
              style={[
                styles.locationOption,
                { backgroundColor: selectedPlaceId === null ? theme.primaryDark + '20' : theme.card },
              ]}
              onPress={() => {
                setSelectedPlaceId(null);
                setLocationPickerVisible(false);
              }}
            >
              <View style={styles.placeOptionContent}>
                <Text style={[styles.locationOptionText, { color: theme.text.primary, fontSize: 16 * textScale }]}>
                  All places
                </Text>
                <Text style={[styles.locationOptionSubtext, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
                  {nearbyNotes.length} {nearbyNotes.length === 1 ? 'note' : 'notes'}
                </Text>
              </View>
              {selectedPlaceId === null && (
                <View style={[styles.selectedIndicator, { backgroundColor: theme.primaryDark }]} />
              )}
            </TouchableOpacity>

            {/* Individual places */}
            {placesWithNotes.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={[
                  styles.locationOption,
                  { backgroundColor: selectedPlaceId === place.id ? theme.primaryDark + '20' : theme.card },
                ]}
                onPress={() => {
                  setSelectedPlaceId(place.id);
                  setLocationPickerVisible(false);
                }}
              >
                <View style={styles.placeOptionContent}>
                  <Text style={[styles.locationOptionText, { color: theme.text.primary, fontSize: 16 * textScale }]} numberOfLines={1}>
                    {place.name}
                  </Text>
                  <Text style={[styles.locationOptionSubtext, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
                    {place.count} {place.count === 1 ? 'note' : 'notes'}
                  </Text>
                </View>
                {selectedPlaceId === place.id && (
                  <View style={[styles.selectedIndicator, { backgroundColor: theme.primaryDark }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {sortedNotes.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedNotes.map((note, index) => (
            <React.Fragment key={note.id}>
              {renderNoteCard(note, index)}
              {index < sortedNotes.length - 1 && (
                <View style={styles.dividerContainer}>
                  <View style={[styles.noteDivider, { backgroundColor: theme.primaryDark }]} />
                </View>
              )}
            </React.Fragment>
          ))}
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
    paddingBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
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
  },
  dividerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  noteDivider: {
    height: 1,
    opacity: 0.2,
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
  filterChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  placeIndicator: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  locationPickerContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  pickerHeader: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    position: 'relative',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 12,
  },
  placeOptionContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  locationOptionText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  locationOptionSubtext: {
    fontSize: 14,
    opacity: 0.5,
    letterSpacing: -0.1,
  },
  selectedIndicator: {
    position: 'absolute',
    right: spacing.xl,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
