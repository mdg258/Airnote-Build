import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { PlaceGroup, Note } from '../types/note';
import { spacing, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistance, formatTimeLeft } from '../utils/location';
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
  const { theme } = useTheme();
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());

  // Load comment counts when modal opens
  useEffect(() => {
    if (!placeGroup || !visible) return;

    const noteIds = placeGroup.notes.map(n => n.id);
    const counts = commentsService.getCommentCounts(noteIds);
    setCommentCounts(counts);
  }, [placeGroup, visible]);

  if (!placeGroup) return null;

  // Calculate distance to place from user
  const distanceToPlace =
    userLatitude !== null && userLongitude !== null
      ? formatDistance(placeGroup.closestDistance)
      : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView style={[styles.modal, { backgroundColor: theme.card }]} edges={['bottom']}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: theme.text.primary }]}>
                {placeGroup.placeName}
              </Text>
              {placeGroup.placeAddress && (
                <Text style={[styles.address, { color: theme.text.secondary }]} numberOfLines={1}>
                  {placeGroup.placeAddress}
                </Text>
              )}
              <View style={styles.metadataRow}>
                {distanceToPlace && (
                  <Text style={[styles.distance, { color: theme.text.tertiary }]}>
                    {distanceToPlace} away
                  </Text>
                )}
                <Text style={[styles.noteCount, { color: theme.primaryDark }]}>
                  {placeGroup.noteCount} {placeGroup.noteCount === 1 ? 'note' : 'notes'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeIcon, { color: theme.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Notes List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {placeGroup.notes.map((note, index) => {
              const commentCount = commentCounts.get(note.id) || 0;
              return (
                <TouchableOpacity
                  key={note.id}
                  style={[
                    styles.noteItem,
                    { backgroundColor: theme.background, borderColor: theme.cardBorder },
                    index === placeGroup.notes.length - 1 && { marginBottom: 0 },
                  ]}
                  onPress={() => onNotePress?.(note)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.noteText, { color: theme.text.primary }]}>
                    {note.text}
                  </Text>
                  <View style={styles.noteMeta}>
                    <Text style={[styles.noteMetaText, { color: theme.text.tertiary }]}>
                      {Math.round(note.radius * 3.28084)}ft · {formatTimeLeft(note.timeLeft)}
                    </Text>
                    {commentCount > 0 && (
                      <>
                        <Text style={[styles.noteMetaText, { color: theme.text.tertiary }]}> · </Text>
                        <Text style={[styles.noteMetaText, { color: theme.primaryDark }]}>
                          {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  distance: {
    fontSize: 13,
  },
  noteCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  noteItem: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
  },
  noteText: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '400',
    marginBottom: spacing.xs,
  },
  noteMeta: {
    flexDirection: 'row',
  },
  noteMetaText: {
    fontSize: 14,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: spacing.md,
  },
});
