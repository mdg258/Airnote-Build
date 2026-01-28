import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/colors';

interface MapContextMessageProps {
  noteCount: number;
  placeCount: number;
  isMapMoving?: boolean;
}

export const MapContextMessage: React.FC<MapContextMessageProps> = ({
  noteCount,
  placeCount,
  isMapMoving = false,
}) => {
  const { theme, textScale } = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fade animation based on map movement
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isMapMoving ? 0.45 : 1,
      duration: isMapMoving ? 150 : 300,
      useNativeDriver: true,
    }).start();
  }, [isMapMoving]);

  const getMessage = () => {
    if (noteCount === 0) return '';
    if (noteCount === 1) return 'A note nearby';
    if (noteCount <= 3) return 'A few notes nearby';
    if (noteCount <= 7) return 'Several notes nearby';
    return 'Many notes nearby';
  };

  const message = getMessage();

  if (!message) return null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.card }]}
      edges={['bottom']}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={[styles.message, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
          {message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.5,
  },
});
