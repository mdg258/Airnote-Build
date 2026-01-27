import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface LocationChipProps {
  placeName: string | null;
  hasPermission: boolean;
}

export const LocationChip: React.FC<LocationChipProps> = ({ placeName, hasPermission }) => {
  const displayText = hasPermission && placeName ? `Here · ${placeName}` : 'Here · Location Off';

  return (
    <View style={styles.container}>
      <View style={styles.chip}>
        <Text style={styles.text}>{displayText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '500',
  },
});
