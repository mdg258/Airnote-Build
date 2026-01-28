import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Note } from '../types/note';
import { formatDistance, formatTimeLeft } from '../utils/location';
import { spacing, borderRadius } from '../theme/colors';
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
            <Text style={[styles.location, { color: theme.text.primary }]}>
              <Text style={{ color: theme.primaryDark }}>📍 </Text>
              {note.placeName || 'Unknown location'}
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
    padding: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  distance: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  placeAddress: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  timeLeft: {
    fontSize: 13,
    lineHeight: 18,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  metadata: {
    fontSize: 13,
    lineHeight: 18,
  },
});
