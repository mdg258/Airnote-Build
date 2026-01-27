import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface LocationChipProps {
  placeName: string | null;
  hasPermission: boolean;
}

export const LocationChip: React.FC<LocationChipProps> = ({ placeName, hasPermission }) => {
  const { theme } = useTheme();
  const displayText = hasPermission && placeName ? `Here · ${placeName}` : 'Here · Location Off';

  return (
    <View style={styles.container}>
      <View style={[styles.chip, { backgroundColor: theme.primaryLight }]}>
        <Text style={[styles.text, { color: theme.text.primary }]}>{displayText}</Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '500',
  },
});
