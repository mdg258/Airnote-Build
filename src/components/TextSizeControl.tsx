import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/colors';

const TEXT_SIZES = [
  { id: 'small', label: 'A', scale: 0.85 },
  { id: 'medium', label: 'A', scale: 1.0 },
  { id: 'large', label: 'A', scale: 1.15 },
  { id: 'extra-large', label: 'A', scale: 1.3 },
] as const;

export const TextSizeControl: React.FC = () => {
  const { theme, textSize, setTextSize } = useTheme();

  return (
    <View style={styles.container}>
      {TEXT_SIZES.map((size) => (
        <TouchableOpacity
          key={size.id}
          style={[
            styles.button,
            {
              backgroundColor: textSize === size.id ? theme.primaryDark : theme.background,
              borderColor: textSize === size.id ? theme.primaryDark : theme.cardBorder,
            },
          ]}
          onPress={() => setTextSize(size.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: textSize === size.id ? '#FFFFFF' : theme.text.secondary,
                fontSize: 14 * size.scale,
                fontWeight: textSize === size.id ? '600' : '500',
              },
            ]}
          >
            {size.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: '600',
  },
});
