import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Note } from '../types/note';
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatTimeLeft, calculateDistance } from '../utils/location';
import { commentsService } from '../services/commentsService';
import { CommentsList } from './CommentsList';
import { CommentInput } from './CommentInput';

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
  const { theme, textScale } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
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
          <SafeAreaView style={[styles.modal, { backgroundColor: theme.card }]} edges={['bottom']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
              <View style={styles.headerContent}>
                <Text style={[styles.noteText, { color: theme.text.primary, fontSize: 17 * textScale }]}>
                  {note.text}
                </Text>
                <View style={styles.metadataRow}>
                  <Text style={[styles.metadata, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
                    {radiusInFeet}ft radius
                  </Text>
                  {distanceText && (
                    <>
                      <Text style={[styles.metadata, { color: theme.text.tertiary, fontSize: 13 * textScale }]}> · </Text>
                      <Text style={[styles.metadata, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
                        {distanceText}
                      </Text>
                    </>
                  )}
                  <Text style={[styles.metadata, { color: theme.text.tertiary, fontSize: 13 * textScale }]}> · </Text>
                  <Text style={[styles.metadata, { color: theme.primaryDark, fontSize: 13 * textScale }]}>
                    {formatTimeLeft(note.timeLeft)}
                  </Text>
                </View>
                <Text style={[styles.commentCount, { color: theme.text.secondary, fontSize: 14 * textScale }]}>
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeIcon, { color: theme.text.secondary }]}>✕</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  headerContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  noteText: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metadata: {
    fontSize: 13,
    lineHeight: 18,
  },
  commentCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
