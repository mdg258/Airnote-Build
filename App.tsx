import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from './src/components/Header';
import { LocationChip } from './src/components/LocationChip';
import { NoteCard } from './src/components/NoteCard';
import { FloatingActionButton } from './src/components/FloatingActionButton';
import { CreateNoteModal } from './src/components/CreateNoteModal';
import { useLocation } from './src/hooks/useLocation';
import { notesService } from './src/services/notesService';
import { Duration, Radius, Note } from './src/types/note';
import { colors, spacing, typography } from './src/theme/colors';

export default function App() {
  const location = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [nearbyNotes, setNearbyNotes] = useState<
    Array<Note & { distance: number; timeLeft: number }>
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh notes every 10 seconds to update distances and time left
  useEffect(() => {
    if (!location.latitude || !location.longitude) return;

    const interval = setInterval(() => {
      refreshNotes();
    }, 10000);

    return () => clearInterval(interval);
  }, [location.latitude, location.longitude]);

  // Refresh notes whenever location changes or refreshKey updates
  useEffect(() => {
    if (location.latitude && location.longitude) {
      refreshNotes();
    }
  }, [location.latitude, location.longitude, refreshKey]);

  const refreshNotes = () => {
    if (!location.latitude || !location.longitude) return;

    // Purge expired notes
    notesService.purgeExpiredNotes();

    // Get nearby notes with filtering applied by the service
    const notes = notesService.getNearbyNotes(location.latitude, location.longitude);
    setNearbyNotes(notes);
  };

  const handleCreateNote = (text: string, duration: Duration, radius: Radius) => {
    if (!location.latitude || !location.longitude) {
      console.log('Cannot create note without location');
      return;
    }

    notesService.createNote({
      text,
      duration,
      radius,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });

    // Refresh the feed
    setRefreshKey((prev) => prev + 1);
  };

  const renderEmptyState = () => {
    if (location.isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text style={styles.emptyText}>Getting your location...</Text>
        </View>
      );
    }

    if (!location.hasPermission) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Location permission needed</Text>
          <Text style={styles.emptySubtext}>
            Enable location access to see nearby notes
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No notes nearby</Text>
        <Text style={styles.emptySubtext}>Be the first to leave a note here!</Text>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header />
        <LocationChip
          placeName={location.placeName}
          hasPermission={location.hasPermission}
        />

        <FlatList
          data={nearbyNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard note={item} distance={item.distance} timeLeft={item.timeLeft} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        <FloatingActionButton onPress={() => setModalVisible(true)} />

        <CreateNoteModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreate={handleCreateNote}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100, // Space for FAB
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.heading,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
