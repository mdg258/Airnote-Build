import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { PlaceGroup } from '../types/note';
import { spacing, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistance } from '../utils/location';
import { NoteCard } from './NoteCard';

interface PlaceNotesModalProps {
  visible: boolean;
  onClose: () => void;
  placeGroup: PlaceGroup | null;
  userLatitude: number | null;
  userLongitude: number | null;
}

export const PlaceNotesModal: React.FC<PlaceNotesModalProps> = ({
  visible,
  onClose,
  placeGroup,
  userLatitude,
  userLongitude,
}) => {
  const { theme } = useTheme();

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
            {placeGroup.notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                timeLeft={note.timeLeft}
                showLocation={false}
              />
            ))}
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
  },
  bottomSpacer: {
    height: spacing.md,
  },
});
