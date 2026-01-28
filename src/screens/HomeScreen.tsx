import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { LocationChip } from '../components/LocationChip';
import { NoteCard } from '../components/NoteCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { CreateNoteModal } from '../components/CreateNoteModal';
import { useLocation } from '../hooks/useLocation';
import { notesService } from '../services/notesService';
import { Duration, Radius, Note } from '../types/note';
import { spacing, typography, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

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

  // Filter and sort notes
  const displayedNotes = useMemo(() => {
    let filtered = nearbyNotes;

    // Filter by selected location
    if (selectedLocation) {
      filtered = filtered.filter(note => note.placeId === selectedLocation);
    }

    // Sort based on selected mode
    if (sortMode === 'ending-soon') {
      return [...filtered].sort((a, b) => a.timeLeft - b.timeLeft);
    } else {
      return [...filtered].sort((a, b) => {
        // Boost score if expiring within 1 hour (3600000ms)
        const aBoost = a.timeLeft < 3600000 ? -50 : 0;
        const bBoost = b.timeLeft < 3600000 ? -50 : 0;
        return (a.distance + aBoost) - (b.distance + bBoost);
      });
    }
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
    }
  ) => {
    notesService.createNote({
      text,
      duration,
      radius,
      location: { latitude: locationOption.latitude, longitude: locationOption.longitude },
      placeName: locationOption.name,
      placeAddress: locationOption.description,
      placeId: locationOption.id,
    });
    setRefreshKey((prev) => prev + 1);
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: theme.background, borderColor: theme.primaryDark }]}
        onPress={() => setRadius(radius === 91 ? 1609 : 91)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, { color: theme.text.primary }]}>
          {radius === 91 ? 'Here · 300 ft' : 'Nearby · 1 mi'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.chip,
          {
            backgroundColor: sortMode === 'closest' ? theme.primaryDark : theme.background,
            borderColor: theme.primaryDark,
          },
        ]}
        onPress={() => setSortMode(sortMode === 'closest' ? 'ending-soon' : 'closest')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: sortMode === 'closest' ? '#FFFFFF' : theme.text.primary,
              fontWeight: sortMode === 'closest' ? '600' : '400',
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
              backgroundColor: selectedLocation ? theme.primaryDark : theme.background,
              borderColor: theme.primaryDark,
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
                  color: selectedLocation ? '#FFFFFF' : theme.text.primary,
                  fontWeight: selectedLocation ? '600' : '400',
                },
              ]}
            >
              {selectedLocation
                ? uniqueLocations.find(l => l.id === selectedLocation)?.name || 'Location'
                : 'All Locations'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={selectedLocation ? '#FFFFFF' : theme.text.primary}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

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
      <FlatList
        data={displayedNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            timeLeft={item.timeLeft}
            showLocation={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderFilterChips}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.heading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  chipWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
