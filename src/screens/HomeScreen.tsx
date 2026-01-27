import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  ActivityIndicator,
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
import { spacing, typography } from '../theme/colors';
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

  useEffect(() => {
    if (!location.latitude || !location.longitude) return;
    const interval = setInterval(() => {
      refreshNotes();
    }, 10000);
    return () => clearInterval(interval);
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      refreshNotes();
    }
  }, [location.latitude, location.longitude, refreshKey]);

  const refreshNotes = () => {
    if (!location.latitude || !location.longitude) return;
    notesService.purgeExpiredNotes();
    const notes = notesService.getAllNotesWithinDistance(location.latitude, location.longitude, 1609);
    setNearbyNotes(notes);
  };

  const placeGroups = useMemo(() => {
    return groupNotesByPlace(nearbyNotes, 1609);
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
        <Text style={[styles.emptySubtext, { color: theme.text.tertiary }]}>Notes within 1 mile will appear here</Text>
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
});
