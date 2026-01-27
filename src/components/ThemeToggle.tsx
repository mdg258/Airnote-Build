import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.toggle}
      onPress={toggleTheme}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name={themeMode === 'light' ? 'moon-outline' : 'sunny-outline'}
        size={24}
        color={theme.text.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    padding: 4,
  },
});
