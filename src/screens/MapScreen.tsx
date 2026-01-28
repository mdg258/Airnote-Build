import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';
import { spacing, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from '../hooks/useLocation';
import { notesService } from '../services/notesService';
import { PlaceGroup, Note } from '../types/note';
import { groupNotesByPlace, getMapRegion } from '../utils/location';
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
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sleek opening animation sequence
  const mapScale = useRef(new Animated.Value(1.3)).current;
  const mapOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const messageOpacity = useRef(new Animated.Value(1)).current; // Start visible
  const hasAnimated = useRef(false);

  // Trigger coordinated opening animation once when map is ready
  useEffect(() => {
    if (!location.latitude || !location.longitude || hasAnimated.current) return;

    hasAnimated.current = true;

    // Brief delay to let notes load, then start animation
    const timer = setTimeout(() => {
      // Sequence: message visible → hold → message fades + map reveals
      Animated.sequence([
        // 1. Hold message visible so user can read it
        Animated.delay(1800),
        // 2. Fade out message while map zooms in
        Animated.parallel([
          Animated.timing(messageOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(mapScale, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(mapOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 300);

    return () => clearTimeout(timer);
  }, [location.latitude, location.longitude]);

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
  }, [location.latitude, location.longitude]);

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
  const handleRegionChange = useCallback((region: any) => {
    // Calculate zoom level from latitudeDelta (smaller delta = more zoomed in)
    // latitudeDelta ranges from ~0.001 (very zoomed in) to ~100+ (very zoomed out)
    // We'll map this to a scale factor between 1.0 and 1.6
    if (region && region.latitudeDelta) {
      const delta = region.latitudeDelta;
      // Map delta to zoom scale: smaller delta (zoomed in) = larger scale
      // delta 0.001 -> scale 1.6, delta 0.1 -> scale 1.0
      const minDelta = 0.001;
      const maxDelta = 0.1;
      const minScale = 1.0;
      const maxScale = 1.6;

      const clampedDelta = Math.max(minDelta, Math.min(maxDelta, delta));
      const normalized = (clampedDelta - minDelta) / (maxDelta - minDelta);
      const scale = maxScale - normalized * (maxScale - minScale);

      setZoomLevel(scale);
    }
  }, []);


  // Only show permission denied state if we're not loading and permission is actually denied
  if (!location.isLoading && !location.hasPermission) {
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

  // Show loading message while getting location
  const isLoadingLocation = location.isLoading || !location.latitude || !location.longitude || !mapRegion;

  // Use a default region if still loading
  const displayRegion = mapRegion || {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.mapContainer}>
        <Animated.View
          style={[
            styles.mapWrapper,
            {
              opacity: mapOpacity,
              transform: [{ scale: mapScale }],
            },
          ]}
        >
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={displayRegion}
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
          >
            {!isLoadingLocation && placeGroups.map((group) => (
              <CustomMarker
                key={group.placeId}
                coordinate={{ latitude: group.latitude, longitude: group.longitude }}
                noteCount={group.noteCount}
                onPress={() => handleMarkerPress(group)}
                zoomScale={zoomLevel}
              />
            ))}
          </MapView>
        </Animated.View>

        {/* Empty state overlay */}
        {!isLoadingLocation && placeGroups.length === 0 && (
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

        {/* Futuristic opening overlay */}
        <Animated.View
          style={[
            styles.openingOverlay,
            {
              backgroundColor: theme.background,
              opacity: overlayOpacity,
            },
          ]}
          pointerEvents="none"
        />

        {/* Context message - appears on top of everything before map reveals */}
        <MapContextMessage
          noteCount={nearbyNotes.length}
          opacity={messageOpacity}
          isLoading={isLoadingLocation}
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
  mapWrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  openingOverlay: {
    ...StyleSheet.absoluteFillObject,
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
