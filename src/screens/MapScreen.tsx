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
import { MapContextMessage } from '../components/MapContextMessage';

export const MapScreen: React.FC = () => {
  const { theme, themeMode, textScale } = useTheme();
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
  const [isMapMoving, setIsMapMoving] = useState(false);
  const mapSettleTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!location.latitude || !location.longitude) return;
    const interval = setInterval(() => {
      refreshNotes();
    }, 10000);
    return () => clearInterval(interval);
  }, [location.latitude, location.longitude]);

  // Cleanup map settle timer on unmount
  useEffect(() => {
    return () => {
      if (mapSettleTimer.current) {
        clearTimeout(mapSettleTimer.current);
      }
    };
  }, []);

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

  // Handle note press from PlaceNotesModal
  const handleNotePress = useCallback((note: Note & { distance: number; timeLeft: number }) => {
    setModalVisible(false); // Close the place modal first
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

  // Handle map region change (user is panning/zooming)
  const handleRegionChange = useCallback(() => {
    setIsMapMoving(true);
    // Clear any existing timer
    if (mapSettleTimer.current) {
      clearTimeout(mapSettleTimer.current);
    }
  }, []);

  // Handle map region change complete (map settled)
  const handleRegionChangeComplete = useCallback(() => {
    // Wait a bit before fading back in
    mapSettleTimer.current = setTimeout(() => {
      setIsMapMoving(false);
    }, 400);
  }, []);


  // Loading state
  if (location.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primaryDark} />
          <Text style={[styles.statusText, { color: theme.text.secondary, fontSize: 17 * textScale }]}>
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
        <View style={styles.centerContent}>
          <Text style={styles.permissionIcon}>📍</Text>
          <Text style={[styles.statusText, { color: theme.text.secondary, fontSize: 17 * textScale }]}>
            Location permission needed
          </Text>
          <Text style={[styles.statusSubtext, { color: theme.text.tertiary, fontSize: 15 * textScale }]}>
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
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primaryDark} />
          <Text style={[styles.statusText, { color: theme.text.secondary, fontSize: 17 * textScale }]}>
            Loading map...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
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
              <Text style={[styles.emptyText, { color: theme.text.secondary, fontSize: 17 * textScale }]}>
                No notes nearby
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.text.tertiary, fontSize: 15 * textScale }]}>
                Notes within 1 mile will appear on the map
              </Text>
            </View>
          </View>
        )}

        {/* Context Message */}
        <MapContextMessage
          noteCount={nearbyNotes.length}
          placeCount={placeGroups.length}
          isMapMoving={isMapMoving}
        />
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
