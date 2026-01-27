import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Airnote</Text>
      <View style={styles.bellIcon}>
        <Text style={styles.bellIconText}>🔔</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  bellIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIconText: {
    fontSize: 20,
    opacity: 0.7,
  },
});
