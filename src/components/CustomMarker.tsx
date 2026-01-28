import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '../contexts/ThemeContext';

interface CustomMarkerProps {
  coordinate: { latitude: number; longitude: number };
  noteCount: number;
  onPress: () => void;
  zoomScale?: number;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  noteCount,
  onPress,
  zoomScale = 1.0,
}) => {
  const { theme } = useTheme();

  // Animation values - only opacity (no transforms to avoid map positioning issues)
  const breatheOpacity = useRef(new Animated.Value(1.1)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;

  // Size and opacity based on note count
  // Subtle presence indicators - no explicit counts
  const getMarkerSize = () => {
    if (noteCount === 1) return 12;
    if (noteCount === 2) return 16;
    if (noteCount <= 4) return 20;
    if (noteCount <= 7) return 24;
    return 28;
  };

  const getMarkerOpacity = () => {
    if (noteCount === 1) return 0.5;
    if (noteCount === 2) return 0.6;
    if (noteCount <= 4) return 0.7;
    if (noteCount <= 7) return 0.85;
    return 1;
  };

  const baseSize = getMarkerSize();
  const size = baseSize * zoomScale; // Scale size based on zoom level
  const baseOpacity = getMarkerOpacity();

  // Entry animation (once on mount)
  useEffect(() => {
    Animated.timing(entryOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // After entry, start breathing animation
      startBreathing();
    });
  }, []);

  // Breathing animation (continuous, slow, subtle)
  const startBreathing = () => {
    // Randomize duration per dot (4-7 seconds)
    const breathDuration = 4000 + Math.random() * 3000;
    // Randomize initial delay so dots aren't synchronized
    const initialDelay = Math.random() * breathDuration;

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          // Breathe out (get brighter)
          Animated.timing(breatheOpacity, {
            toValue: 1.35,
            duration: breathDuration / 4,
            useNativeDriver: true,
          }),
          // Return to middle
          Animated.timing(breatheOpacity, {
            toValue: 1.1,
            duration: breathDuration / 4,
            useNativeDriver: true,
          }),
          // Breathe in (get dimmer)
          Animated.timing(breatheOpacity, {
            toValue: 0.85,
            duration: breathDuration / 4,
            useNativeDriver: true,
          }),
          // Return to middle
          Animated.timing(breatheOpacity, {
            toValue: 1.1,
            duration: breathDuration / 4,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, initialDelay);
  };

  // Extended hit area for easier tapping (1.7x visual size)
  const hitAreaSize = size * 1.7;

  return (
    <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={false}>
      <Animated.View
        style={{
          width: hitAreaSize,
          height: hitAreaSize,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[
            styles.markerContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.primaryDark,
              opacity: Animated.multiply(
                Animated.multiply(entryOpacity, breatheOpacity),
                baseOpacity
              ),
            },
          ]}
        />
      </Animated.View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
