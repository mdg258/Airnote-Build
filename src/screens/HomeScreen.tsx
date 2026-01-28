import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { LocationChip } from '../components/LocationChip';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { CreateNoteModal } from '../components/CreateNoteModal';
import { useLocation } from '../hooks/useLocation';
import { notesService } from '../services/notesService';
import { Duration, Radius, Note, NoteCategory } from '../types/note';
import { spacing, typography, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistance, formatTimeLeft } from '../utils/location';
import { LEAVE_NOTE_CATEGORIES } from '../constants/noteTemplates';

interface NoteGroup {
  placeId: string;
  placeName: string;
  placeAddress?: string;
  notes: Array<Note & { distance: number; timeLeft: number }>;
  closestDistance: number;
}

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [nearbyNotes, setNearbyNotes] = useState<
    Array<Note & { distance: number; timeLeft: number }>
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [radius, setRadius] = useState<91 | 1609>(91); // 300 ft or 1 mile
  const [sortMode, setSortMode] = useState<'closest' | 'ending-soon'>('closest');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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

  // Get unique locations
  const uniqueLocations = useMemo(() => {
    const locationMap = new Map<string, { id: string; name: string }>();
    nearbyNotes.forEach(note => {
      if (note.placeId && note.placeName && !locationMap.has(note.placeId)) {
        locationMap.set(note.placeId, {
          id: note.placeId,
          name: note.placeName,
        });
      }
    });
    return Array.from(locationMap.values());
  }, [nearbyNotes]);

  // Group notes by place and sort
  const noteGroups = useMemo(() => {
    let filtered = nearbyNotes;

    // Filter by selected location
    if (selectedLocation) {
      filtered = filtered.filter(note => note.placeId === selectedLocation);
    }

    // Group by place
    const groups = new Map<string, NoteGroup>();
    filtered.forEach(note => {
      const key = note.placeId || note.placeName || 'unknown';

      if (!groups.has(key)) {
        groups.set(key, {
          placeId: key,
          placeName: note.placeName || 'Unknown Location',
          placeAddress: note.placeAddress,
          notes: [],
          closestDistance: note.distance,
        });
      }

      const group = groups.get(key)!;
      group.notes.push(note);
      if (note.distance < group.closestDistance) {
        group.closestDistance = note.distance;
      }
    });

    // Convert to array and sort groups
    const groupArray = Array.from(groups.values());

    if (sortMode === 'ending-soon') {
      // Sort groups by earliest expiring note
      groupArray.forEach(group => {
        group.notes.sort((a, b) => a.timeLeft - b.timeLeft);
      });
      groupArray.sort((a, b) => a.notes[0].timeLeft - b.notes[0].timeLeft);
    } else {
      // Sort groups by closest distance, then sort notes within each group
      groupArray.forEach(group => {
        group.notes.sort((a, b) => {
          const aBoost = a.timeLeft < 3600000 ? -50 : 0;
          const bBoost = b.timeLeft < 3600000 ? -50 : 0;
          return (a.distance + aBoost) - (b.distance + bBoost);
        });
      });
      groupArray.sort((a, b) => a.closestDistance - b.closestDistance);
    }

    return groupArray;
  }, [nearbyNotes, selectedLocation, sortMode]);

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

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.text.tertiary + '20' }]}
        onPress={() => setRadius(radius === 91 ? 1609 : 91)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, { color: theme.text.secondary }]}>
          {radius === 91 ? 'Here · 300 ft' : 'Nearby · 1 mi'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.chip,
          {
            backgroundColor: sortMode === 'closest' ? theme.primaryDark : theme.card,
            borderColor: sortMode === 'closest' ? theme.primaryDark : theme.text.tertiary + '20',
          },
        ]}
        onPress={() => setSortMode(sortMode === 'closest' ? 'ending-soon' : 'closest')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: sortMode === 'closest' ? '#FFFFFF' : theme.text.secondary,
              fontWeight: sortMode === 'closest' ? '500' : '400',
            },
          ]}
        >
          {sortMode === 'closest' ? 'Closest' : 'Ending Soon'}
        </Text>
      </TouchableOpacity>

      {uniqueLocations.length > 0 && (
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: selectedLocation ? theme.primaryDark : theme.card,
              borderColor: selectedLocation ? theme.primaryDark : theme.text.tertiary + '20',
            },
          ]}
          onPress={() => setLocationPickerVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.chipWithIcon}>
            <Text
              style={[
                styles.chipText,
                {
                  color: selectedLocation ? '#FFFFFF' : theme.text.secondary,
                  fontWeight: selectedLocation ? '500' : '400',
                },
              ]}
            >
              {selectedLocation
                ? uniqueLocations.find(l => l.id === selectedLocation)?.name || 'Location'
                : 'All Locations'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={selectedLocation ? '#FFFFFF' : theme.text.secondary}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  const toggleGroupCollapse = (placeId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  };

  const renderNoteGroup = (group: NoteGroup) => {
    const categoryInfo = (noteCategory: string | undefined) =>
      noteCategory ? LEAVE_NOTE_CATEGORIES.find(cat => cat.id === noteCategory) : null;

    const isCollapsed = collapsedGroups.has(group.placeId);

    return (
      <View
        key={group.placeId}
        style={[styles.noteGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      >
        {/* Place Header */}
        <TouchableOpacity
          style={[styles.placeHeader, { backgroundColor: theme.primaryDark + '25' }]}
          onPress={() => toggleGroupCollapse(group.placeId)}
          activeOpacity={0.7}
        >
          <View style={styles.placeInfo}>
            <Text style={[styles.placeName, { color: theme.text.primary }]}>
              {group.notes[0]?.category ? '📍' : '✈️'} {group.placeName}
            </Text>
            {group.placeAddress && (
              <Text style={[styles.placeAddress, { color: theme.text.tertiary }]} numberOfLines={1}>
                {group.placeAddress}
              </Text>
            )}
          </View>
          <View style={styles.placeMetaContainer}>
            <Text style={[styles.placeDistance, { color: theme.primaryDark }]}>
              {formatDistance(group.closestDistance)}
            </Text>
            <Text style={[styles.noteCount, { color: theme.text.tertiary }]}>
              {group.notes.length} {group.notes.length === 1 ? 'note' : 'notes'}
            </Text>
            <Ionicons
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
              color={theme.text.tertiary}
              style={{ marginTop: 2 }}
            />
          </View>
        </TouchableOpacity>

        {/* Notes List */}
        {!isCollapsed && group.notes.map((note, index) => {
          const catInfo = categoryInfo(note.category);
          const isLast = index === group.notes.length - 1;

          return (
            <View key={note.id}>
              <View style={styles.noteItem}>
                <Text style={[styles.noteText, { color: theme.text.primary }]}>
                  {note.text}
                </Text>
                <View style={styles.noteMeta}>
                  <Text style={[styles.noteMetaText, { color: theme.text.tertiary }]}>
                    {Math.round(note.radius * 3.28084)}ft · {formatTimeLeft(note.timeLeft)}
                  </Text>
                </View>
              </View>
              {!isLast && <View style={[styles.noteDivider, { backgroundColor: theme.cardBorder }]} />}
            </View>
          );
        })}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (location.isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.primaryDark} />
          <Text style={[styles.emptyText, { color: theme.text.secondary }]}>Getting your location...</Text>
        </View>
      );
    }
    if (!location.hasPermission) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.text.secondary }]}>Location permission needed</Text>
          <Text style={[styles.emptySubtext, { color: theme.text.tertiary }]}>Enable location access to see nearby notes</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No notes nearby</Text>
        <Text style={[styles.emptySubtext, { color: theme.text.tertiary }]}>
          Notes within {radius === 91 ? '300 feet' : '1 mile'} will appear here
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Header />
      <LocationChip placeName={location.placeName} hasPermission={location.hasPermission} />
      {renderFilterChips()}
      {noteGroups.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {noteGroups.map(renderNoteGroup)}
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

      {/* Location Picker Modal */}
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
          <View style={[styles.locationPickerContainer, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[styles.locationOption, { borderBottomColor: theme.cardBorder }]}
              onPress={() => {
                setSelectedLocation(null);
                setLocationPickerVisible(false);
              }}
            >
              <Text style={[styles.locationOptionText, { color: theme.text.primary }]}>
                All Locations
              </Text>
              {!selectedLocation && (
                <Ionicons name="checkmark" size={20} color={theme.primaryDark} />
              )}
            </TouchableOpacity>

            {uniqueLocations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={[styles.locationOption, { borderBottomColor: theme.cardBorder }]}
                onPress={() => {
                  setSelectedLocation(loc.id);
                  setLocationPickerVisible(false);
                }}
              >
                <Text style={[styles.locationOptionText, { color: theme.text.primary }]}>
                  {loc.name}
                </Text>
                {selectedLocation === loc.id && (
                  <Ionicons name="checkmark" size={20} color={theme.primaryDark} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
    gap: spacing.md,
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
  filterContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 0.5,
  },
  chipText: {
    fontSize: 14,
  },
  chipWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteGroup: {
    marginHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 14,
    lineHeight: 18,
  },
  placeMetaContainer: {
    alignItems: 'flex-end',
  },
  placeDistance: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  noteItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  noteCategoryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  noteCategoryEmoji: {
    fontSize: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '400',
  },
  noteMeta: {
    paddingLeft: 26,
  },
  noteMetaText: {
    fontSize: 14,
    lineHeight: 18,
  },
  noteDivider: {
    height: 0.5,
    marginLeft: spacing.md,
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
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  locationOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
