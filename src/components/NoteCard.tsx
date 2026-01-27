import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Note } from '../types/note';
import { formatDistance, formatTimeLeft } from '../utils/location';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface NoteCardProps {
  note: Note;
  distance?: number;
  timeLeft: number;
  showLocation?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, distance, timeLeft, showLocation = false }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, {
      backgroundColor: theme.card,
      borderColor: theme.cardBorder,
      shadowColor: theme.shadow,
    }]}>
      <View style={styles.header}>
        {showLocation ? (
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Text style={[styles.location, { color: theme.text.secondary }]}>
              📍 {note.placeName || 'Unknown location'}
            </Text>
            {note.placeAddress && (
              <Text style={[styles.placeAddress, { color: theme.text.tertiary }]} numberOfLines={1}>
                {note.placeAddress}
              </Text>
            )}
          </View>
        ) : distance !== undefined ? (
          <Text style={[styles.distance, { color: theme.primaryDark }]}>{formatDistance(distance)} away</Text>
        ) : (
          <View />
        )}
        <Text style={[styles.timeLeft, { color: theme.text.secondary }]}>{formatTimeLeft(timeLeft)}</Text>
      </View>
      <Text style={[styles.text, { color: theme.text.primary }]}>{note.text}</Text>
      <View style={styles.footer}>
        <Text style={[styles.metadata, { color: theme.text.tertiary }]}>
          Radius: {Math.round(note.radius * 3.28084)}ft
        </Text>
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
  location: {
    ...typography.small,
    fontWeight: '500',
  },
  placeAddress: {
    ...typography.small,
    fontSize: 11,
    marginTop: 2,
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
