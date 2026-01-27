import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { LocationChip } from '../components/LocationChip';
import { NoteCard } from '../components/NoteCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { CreateNoteModal } from '../components/CreateNoteModal';
import { PlaceGroupCard } from '../components/PlaceGroupCard';
import { useLocation } from '../hooks/useLocation';
import { notesService } from '../services/notesService';
import { Duration, Radius, Note, PlaceGroup } from '../types/note';
import { spacing, typography, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { groupNotesByPlace } from '../utils/location';

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

  const placeGroups = useMemo(() => {
    const groups = groupNotesByPlace(nearbyNotes, radius);

    // Sort groups based on selected mode
    if (sortMode === 'ending-soon') {
      // Sort by soonest expiration (shortest time left)
      return groups.sort((a, b) => {
        const aMinTime = Math.min(...a.notes.map(n => n.timeLeft));
        const bMinTime = Math.min(...b.notes.map(n => n.timeLeft));
        return aMinTime - bMinTime;
      });
    } else {
      // Sort by closest distance (with slight boost for expiring soon)
      return groups.sort((a, b) => {
        const aMinTime = Math.min(...a.notes.map(n => n.timeLeft));
        const bMinTime = Math.min(...b.notes.map(n => n.timeLeft));

        // Boost score if expiring within 1 hour (3600000ms)
        const aBoost = aMinTime < 3600000 ? -50 : 0; // Subtract 50m from distance
        const bBoost = bMinTime < 3600000 ? -50 : 0;

        return (a.closestDistance + aBoost) - (b.closestDistance + bBoost);
      });
    }
  }, [nearbyNotes, radius, sortMode]);

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
        data={placeGroups}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => <PlaceGroupCard placeGroup={item} />}
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
});
