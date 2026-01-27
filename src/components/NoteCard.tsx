import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Note } from '../types/note';
import { formatDistance, formatTimeLeft } from '../utils/location';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface NoteCardProps {
  note: Note;
  distance: number;
  timeLeft: number;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, distance, timeLeft }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.distance}>{formatDistance(distance)} away</Text>
        <Text style={styles.timeLeft}>{formatTimeLeft(timeLeft)}</Text>
      </View>
      <Text style={styles.text}>{note.text}</Text>
      <View style={styles.footer}>
        <Text style={styles.metadata}>Radius: {note.radius}m</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  distance: {
    ...typography.small,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  timeLeft: {
    ...typography.small,
    color: colors.text.secondary,
  },
  text: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  metadata: {
    ...typography.small,
    color: colors.text.tertiary,
  },
});
