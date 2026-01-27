import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: 23 + insets.bottom, backgroundColor: theme.primaryDark }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.plusIcon, { color: theme.text.inverse }]}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIcon: {
    fontSize: 52,
    fontWeight: '700',
    lineHeight: 52,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
