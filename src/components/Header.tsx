import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { AirnoteLogo } from './AirnoteLogo';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <AirnoteLogo size="medium" />
        <Text style={styles.title}>Airnote</Text>
      </View>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // 10px gap between logo and text for better balance
  },
  title: {
    fontSize: 34,
    fontWeight: '600' as const,
    lineHeight: 40,
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
