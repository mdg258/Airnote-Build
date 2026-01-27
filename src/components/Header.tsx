import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/colors';
import { AirnoteLogo } from './AirnoteLogo';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export const Header: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <AirnoteLogo size="medium" />
        <Text style={[styles.title, { color: theme.text.primary }]}>Airnote</Text>
      </View>
      <ThemeToggle />
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
  },
});
