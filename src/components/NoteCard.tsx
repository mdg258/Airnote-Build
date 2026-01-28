import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Note } from '../types/note';
import { formatDistance, formatTimeLeft } from '../utils/location';
import { spacing, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { LEAVE_NOTE_CATEGORIES } from '../constants/noteTemplates';

interface NoteCardProps {
  note: Note;
  distance?: number;
  timeLeft: number;
  showLocation?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, distance, timeLeft, showLocation = false }) => {
  const { theme } = useTheme();
  const categoryInfo = note.category
    ? LEAVE_NOTE_CATEGORIES.find(cat => cat.id === note.category)
    : null;

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
              <Text style={{ color: theme.primaryDark }}>{note.category ? '📍' : '✈️'} </Text>
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
      <View style={styles.textContainer}>
        {categoryInfo && (
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '15' }]}>
            <Text style={styles.categoryEmoji}>{categoryInfo.icon}</Text>
          </View>
        )}
        <Text style={[styles.text, { color: theme.text.primary }]}>{note.text}</Text>
      </View>
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
    borderRadius: 10,
    padding: 12,
    marginHorizontal: spacing.md,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  distance: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  location: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
  },
  placeAddress: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
    opacity: 0.6,
  },
  timeLeft: {
    fontSize: 12,
    lineHeight: 16,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  categoryBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  metadata: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.6,
  },
});
