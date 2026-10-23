import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types/note';
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatTimeLeft, calculateDistance } from '../utils/location';
import { commentsService } from '../services/commentsService';
import { CommentsList } from './CommentsList';
import { CommentInput } from './CommentInput';
import { lightMapStyle, darkMapStyle } from '../theme/mapStyles';

interface NoteDetailModalProps {
  visible: boolean;
  onClose: () => void;
  note: (Note & { distance?: number; timeLeft: number }) | null;
  userLatitude: number | null;
  userLongitude: number | null;
  onCommentAdded?: () => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  visible,
  onClose,
  note,
  userLatitude,
  userLongitude,
  onCommentAdded,
}) => {
  const { theme, textScale, themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isInRange, setIsInRange] = useState(false);

  useEffect(() => {
    if (!note || !visible) return;

    // Load comments
    const loadedComments = commentsService.getCommentsForNote(note.id);
    setComments(loadedComments);

    // Check if user is in range
    if (userLatitude !== null && userLongitude !== null) {
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        note.location.latitude,
        note.location.longitude
      );
      setIsInRange(distance <= note.radius);
    } else {
      setIsInRange(false);
    }

    // Auto-scroll to bottom to show latest comments
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [note, visible, userLatitude, userLongitude]);

  const handleAddComment = (text: string) => {
    if (!note || !userLatitude || !userLongitude) return;

    const comment = commentsService.createComment(
      {
        noteId: note.id,
        text,
        userLocation: {
          latitude: userLatitude,
          longitude: userLongitude,
        },
      },
      note
    );

    if (comment) {
      setComments([...comments, comment]);

      // Scroll to bottom to show new comment
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Notify parent to refresh
      onCommentAdded?.();
    }
  };

  const handleGetDirections = () => {
    if (!note) return;

    const { latitude, longitude } = note.location;
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${latitude},${longitude}`
      : `geo:${latitude},${longitude}`;

    Linking.openURL(url);
  };

  if (!note) return null;

  const radiusInFeet = Math.round(note.radius * 3.28084);
  const distanceText = note.distance !== undefined
    ? `${Math.round(note.distance * 3.28084)}ft away`
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <SafeAreaView style={[styles.modal, { backgroundColor: theme.background }]} edges={['bottom']}>
            {/* Context Note - Floating, Minimal */}
            <View style={styles.contextContainer}>
              <View style={[styles.contextNote, { backgroundColor: theme.card }]}>
                <Text style={[styles.noteText, { color: theme.text.primary, fontSize: 17 * textScale }]}>
                  {note.text}
                </Text>
                <Text style={[styles.metadata, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
                  {formatTimeLeft(note.timeLeft)} · {distanceText || `${radiusInFeet}ft radius`}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={[styles.closeIcon, { color: theme.text.tertiary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Small Location Map */}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={{
                  latitude: note.location.latitude,
                  longitude: note.location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                mapType="mutedStandard"
                customMapStyle={isDark ? darkMapStyle : lightMapStyle}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                showsScale={false}
                showsPointsOfInterests={false}
                showsBuildings={false}
              >
                {/* Note location marker */}
                <Marker
                  coordinate={{
                    latitude: note.location.latitude,
                    longitude: note.location.longitude,
                  }}
                >
                  <View style={[styles.marker, { backgroundColor: theme.primaryDark }]} />
                </Marker>

                {/* Radius circle */}
                <Circle
                  center={{
                    latitude: note.location.latitude,
                    longitude: note.location.longitude,
                  }}
                  radius={note.radius}
                  fillColor={theme.primaryDark + '20'}
                  strokeColor={theme.primaryDark + '40'}
                  strokeWidth={1}
                />
              </MapView>

              {/* Get Directions Button */}
              <TouchableOpacity
                style={[styles.directionsButton, { backgroundColor: theme.card }]}
                onPress={handleGetDirections}
                activeOpacity={0.7}
              >
                <Ionicons name="navigate" size={16} color={theme.primaryDark} />
                <Text style={[styles.directionsText, { color: theme.text.primary, fontSize: 13 * textScale }]}>
                  Directions
                </Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <CommentsList comments={comments} />
            </ScrollView>

            {/* Comment Input */}
            <CommentInput
              onSubmit={handleAddComment}
              disabled={!isInRange}
              disabledMessage={
                !isInRange
                  ? `You need to be within ${radiusInFeet}ft to comment`
                  : undefined
              }
            />
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modal: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  contextContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  contextNote: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 16,
    gap: spacing.xs,
  },
  noteText: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 23,
    letterSpacing: -0.2,
    opacity: 0.85,
  },
  metadata: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.4,
    letterSpacing: -0.05,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -2,
  },
  closeIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  mapContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  directionsButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  directionsText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});
