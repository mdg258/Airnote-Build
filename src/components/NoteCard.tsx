import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Note } from '../types/note';
import { formatDistance, formatTimeLeft } from '../utils/location';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface NoteCardProps {
  note: Note;
  distance: number;
  timeLeft: number;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, distance, timeLeft }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, {
      backgroundColor: theme.card,
      borderColor: theme.cardBorder,
      shadowColor: theme.shadow,
    }]}>
      <View style={styles.header}>
        <Text style={[styles.distance, { color: theme.primaryDark }]}>{formatDistance(distance)} away</Text>
        <Text style={[styles.timeLeft, { color: theme.text.secondary }]}>{formatTimeLeft(timeLeft)}</Text>
      </View>
      <Text style={[styles.text, { color: theme.text.primary }]}>{note.text}</Text>
      <View style={styles.footer}>
        <Text style={[styles.metadata, { color: theme.text.tertiary }]}>Radius: {note.radius}m</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  distance: {
    ...typography.small,
    fontWeight: '600',
  },
  timeLeft: {
    ...typography.small,
  },
  text: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  metadata: {
    ...typography.small,
  },
});
