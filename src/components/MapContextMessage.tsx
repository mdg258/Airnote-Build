import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/colors';

interface MapContextMessageProps {
  opacity: Animated.AnimatedInterpolation<number>;
  isLoading?: boolean;
}

export const MapContextMessage: React.FC<MapContextMessageProps> = ({
  opacity,
  isLoading = false,
}) => {
  const { theme, textScale } = useTheme();

  const getMessage = () => {
    if (isLoading) return 'Listening nearby';
    // No contextual messages during or after transition - keep it minimal
    return '';
  };

  const message = getMessage();

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.messageBox, { backgroundColor: theme.card + 'F0', borderColor: theme.cardBorder }]}>
        <Text style={[styles.message, { color: theme.text.secondary, fontSize: 15 * textScale }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBox: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
