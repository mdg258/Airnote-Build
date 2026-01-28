import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/colors';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export const Header: React.FC = () => {
  const { theme, textScale } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.text.primary, fontSize: 34 * textScale }]}>Airnote</Text>
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
  title: {
    fontSize: 34,
    fontWeight: '600' as const,
    lineHeight: 40,
  },
});
