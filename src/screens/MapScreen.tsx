import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { spacing, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from '../hooks/useLocation';
import { notesService } from '../services/notesService';
import { PlaceGroup, Note } from '../types/note';
import { groupNotesByPlace, getMarkerColor, getMapRegion } from '../utils/location';
import { PlaceNotesModal } from '../components/PlaceNotesModal';
import { NoteDetailModal } from '../components/NoteDetailModal';
import { lightMapStyle, darkMapStyle } from '../theme/mapStyles';
import { CustomMarker } from '../components/CustomMarker';
import { MapBottomDrawer } from '../components/MapBottomDrawer';

export const MapScreen: React.FC = () => {
  const { theme, themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const location = useLocation();
  const mapRef = useRef<MapView>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceGroup | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<(Note & { distance: number; timeLeft: number }) | null>(null);
  const [noteDetailModalVisible, setNoteDetailModalVisible] = useState(false);
  const [nearbyNotes, setNearbyNotes] = useState<
    Array<Note & { distance: number; timeLeft: number }>
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!location.latitude || !location.longitude) return;
    const interval = setInterval(() => {
      refreshNotes();
    }, 10000);
    return () => clearInterval(interval);
  }, [location.latitude, location.longitude]);

  // Refresh on location change
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

  // Group notes by place (memoized for performance)
  const placeGroups = useMemo(() => {
    return groupNotesByPlace(nearbyNotes, 1609); // 1 mile in meters
  }, [nearbyNotes]);

  // Get map region (memoized)
  const mapRegion = useMemo(() => {
    if (!location.latitude || !location.longitude) return null;
    return getMapRegion(location.latitude, location.longitude, 1);
  }, [location.latitude, location.longitude]);

  // Fit map to show all markers
  useEffect(() => {
    if (placeGroups.length > 0 && mapRef.current && location.latitude && location.longitude) {
      const coordinates = [
        { latitude: location.latitude, longitude: location.longitude },
        ...placeGroups.map(g => ({ latitude: g.latitude, longitude: g.longitude }))
      ];

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 100);
    }
  }, [placeGroups, location.latitude, location.longitude]);

  // Handle marker press
  const handleMarkerPress = useCallback((place: PlaceGroup) => {
    setSelectedPlace(place);
    setModalVisible(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedPlace(null);
  }, []);

  // Handle drawer place press
  const handleDrawerPlacePress = useCallback((place: PlaceGroup) => {
    // Center map on place
    mapRef.current?.animateToRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 300);

    // Open modal after brief delay
    setTimeout(() => {
      setSelectedPlace(place);
      setModalVisible(true);
    }, 350);
  }, []);

  // Handle note press from PlaceNotesModal
  const handleNotePress = useCallback((note: Note & { distance: number; timeLeft: number }) => {
    setSelectedNote(note);
    setNoteDetailModalVisible(true);
  }, []);

  // Handle note detail modal close
  const handleNoteDetailClose = useCallback(() => {
    setNoteDetailModalVisible(false);
    setSelectedNote(null);
  }, []);

  // Handle comment added - refresh notes
  const handleCommentAdded = useCallback(() => {
    refreshNotes();
  }, []);


  // Loading state
  if (location.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Map</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primaryDark} />
          <Text style={[styles.statusText, { color: theme.text.secondary }]}>
            Getting your location...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied state
  if (!location.hasPermission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Map</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.permissionIcon}>📍</Text>
          <Text style={[styles.statusText, { color: theme.text.secondary }]}>
            Location permission needed
          </Text>
          <Text style={[styles.statusSubtext, { color: theme.text.tertiary }]}>
            Enable location access to see notes on the map
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // No location yet
  if (!location.latitude || !location.longitude || !mapRegion) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Map</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primaryDark} />
          <Text style={[styles.statusText, { color: theme.text.secondary }]}>
            Loading map...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Map</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          mapType="mutedStandard"
          customMapStyle={isDark ? darkMapStyle : lightMapStyle}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsPointsOfInterest={false}
          showsBuildings={false}
          loadingEnabled={true}
          loadingIndicatorColor={theme.primaryDark}
        >
          {placeGroups.map((group) => (
            <CustomMarker
              key={group.placeId}
              coordinate={{ latitude: group.latitude, longitude: group.longitude }}
              noteCount={group.noteCount}
              onPress={() => handleMarkerPress(group)}
            />
          ))}
        </MapView>

        {/* Empty state overlay */}
        {placeGroups.length === 0 && (
          <View style={[styles.emptyOverlay, { backgroundColor: theme.background + 'CC' }]}>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                No notes nearby
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.text.tertiary }]}>
                Notes within 1 mile will appear on the map
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Drawer */}
        {placeGroups.length > 0 && (
          <MapBottomDrawer
            placeGroups={placeGroups}
            onPlacePress={handleDrawerPlacePress}
          />
        )}
      </View>

      {/* Place Notes Modal */}
      <PlaceNotesModal
        visible={modalVisible}
        onClose={handleModalClose}
        placeGroup={selectedPlace}
        userLatitude={location.latitude}
        userLongitude={location.longitude}
        onNotePress={handleNotePress}
      />

      {/* Note Detail Modal */}
      <NoteDetailModal
        visible={noteDetailModalVisible}
        onClose={handleNoteDetailClose}
        note={selectedNote}
        userLatitude={location.latitude}
        userLongitude={location.longitude}
        onCommentAdded={handleCommentAdded}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 40,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  statusText: {
    ...typography.heading,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statusSubtext: {
    ...typography.body,
    textAlign: 'center',
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
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
