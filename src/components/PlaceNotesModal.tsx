import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { PlaceGroup, Note } from '../types/note';
import { spacing, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatTimeLeft } from '../utils/location';
import { commentsService } from '../services/commentsService';

interface PlaceNotesModalProps {
  visible: boolean;
  onClose: () => void;
  placeGroup: PlaceGroup | null;
  userLatitude: number | null;
  userLongitude: number | null;
  onNotePress?: (note: Note & { distance: number; timeLeft: number }) => void;
}

export const PlaceNotesModal: React.FC<PlaceNotesModalProps> = ({
  visible,
  onClose,
  placeGroup,
  userLatitude,
  userLongitude,
  onNotePress,
}) => {
  const { theme, textScale } = useTheme();
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());
  const noteOpacities = useRef<Animated.Value[]>([]).current;

  // Load comment counts when modal opens
  useEffect(() => {
    if (!placeGroup || !visible) return;

    const noteIds = placeGroup.notes.map(n => n.id);
    const counts = commentsService.getCommentCounts(noteIds);
    setCommentCounts(counts);

    // Initialize animation values for each note
    noteOpacities.length = 0;
    placeGroup.notes.forEach(() => {
      noteOpacities.push(new Animated.Value(0));
    });

    // Stagger fade-in animation for notes
    const animations = noteOpacities.map((opacity, index) => {
      return Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 60, // 60ms stagger between notes
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations).start();
  }, [placeGroup, visible]);

  if (!placeGroup) return null;

  // Get soft language for note count
  const getSoftCount = (count: number): string => {
    if (count === 1) return 'A note here';
    if (count === 2) return 'A couple notes here';
    if (count <= 4) return 'A few notes here';
    if (count <= 8) return 'Several notes here';
    return 'Many notes here';
  };

  // Get human phrasing for distance
  const getHumanDistance = (meters: number): string => {
    if (meters < 50) return 'very close';
    if (meters < 200) return 'nearby';
    if (meters < 500) return 'close by';
    return 'in the area';
  };

  // Format time quietly
  const getQuietTime = (ms: number): string => {
    const timeStr = formatTimeLeft(ms);
    // Convert "2h 30m left" to "2h 30m"
    return timeStr.replace(' left', '');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView style={[styles.modal, { backgroundColor: theme.background }]} edges={['bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: theme.text.primary, fontSize: 22 * textScale }]}>
                {placeGroup.placeName}
              </Text>
              <Text style={[styles.subtitle, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
                {getSoftCount(placeGroup.noteCount)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
              <Text style={[styles.closeIcon, { color: theme.text.tertiary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Green Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.primaryDark }]} />
          </View>

          {/* Notes List - Flat, text-forward */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {placeGroup.notes.map((note, index) => {
              const commentCount = commentCounts.get(note.id) || 0;
              const opacity = noteOpacities[index] || new Animated.Value(1);

              return (
                <Animated.View key={note.id} style={{ opacity }}>
                  <TouchableOpacity
                    style={styles.noteItem}
                    onPress={() => onNotePress?.(note)}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.noteText, { color: theme.text.primary, fontSize: 18 * textScale }]}>
                      {note.text}
                    </Text>
                    <View style={styles.noteMeta}>
                      <Text style={[styles.noteMetaText, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
                        {getHumanDistance(note.distance)} · {getQuietTime(note.timeLeft)}
                      </Text>
                      {commentCount > 0 && (
                        <Text style={[styles.noteMetaText, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
                          {' · '}{commentCount} {commentCount === 1 ? 'reply' : 'replies'}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Minimal dimming
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingTop: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.5,
  },
  closeIcon: {
    fontSize: 20,
    opacity: 0.3,
  },
  dividerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    opacity: 0.2,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  noteItem: {
    paddingVertical: spacing.lg,
  },
  noteText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  noteMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noteMetaText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.4,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
