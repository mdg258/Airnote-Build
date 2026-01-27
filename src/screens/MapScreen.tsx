import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

export const MapScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Map</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>🗺️</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>Map view coming soon</Text>
        <Text style={[styles.description, { color: theme.text.tertiary }]}>
          See nearby notes on an interactive map
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.heading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
  },
});
