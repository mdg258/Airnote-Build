import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { PlaceGroup } from '../types/note';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme/colors';
import { formatDistance } from '../utils/location';
import { NoteCard } from './NoteCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PlaceGroupCardProps {
  placeGroup: PlaceGroup;
}

export const PlaceGroupCard: React.FC<PlaceGroupCardProps> = ({ placeGroup }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primaryLight + '40', borderColor: theme.primaryDark }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <View style={styles.locationInfo}>
            <Text style={[styles.locationIcon, { color: theme.primaryDark }]}>📍</Text>
            <View style={styles.locationText}>
              <Text style={[styles.placeName, { color: theme.text.primary }]} numberOfLines={1}>
                {placeGroup.placeName}
              </Text>
              {placeGroup.placeAddress && (
                <Text style={[styles.placeAddress, { color: theme.text.secondary }]} numberOfLines={1}>
                  {placeGroup.placeAddress}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.metadata}>
            <Text style={[styles.distance, { color: theme.primaryDark }]}>
              {formatDistance(placeGroup.closestDistance)}
            </Text>
            <Text style={[styles.noteCount, { color: theme.text.tertiary }]}>
              {placeGroup.noteCount} {placeGroup.noteCount === 1 ? 'note' : 'notes'}
            </Text>
            <Text style={[styles.chevron, { color: theme.text.tertiary }]}>
              {isExpanded ? '⌄' : '›'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.notesContainer, { borderTopColor: theme.cardBorder }]}>
          {placeGroup.notes.map((note) => (
            <View key={note.id} style={styles.noteWrapper}>
              <NoteCard
                note={note}
                timeLeft={note.timeLeft}
                showLocation={true}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: spacing.sm,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
    marginTop: 2,
  },
  locationText: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 13,
  },
  metadata: {
    alignItems: 'flex-end',
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteCount: {
    fontSize: 12,
    marginBottom: 4,
  },
  chevron: {
    fontSize: 18,
  },
  notesContainer: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  noteWrapper: {
    marginBottom: spacing.sm,
  },
});
