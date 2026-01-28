import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
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
      style={[
        styles.fab,
        {
          bottom: 16 + insets.bottom,
          backgroundColor: theme.primaryDark,
          opacity: 0.85,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={require('../../assets/logo-transparent-bg.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
  },
});
