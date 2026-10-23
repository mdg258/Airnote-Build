import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface MapPulseAnimationProps {
  isVisible: boolean;
}

export const MapPulseAnimation: React.FC<MapPulseAnimationProps> = ({ isVisible }) => {
  const { theme } = useTheme();

  // Create animated values for 4 rings
  const ring1 = useRef(new Animated.Value(1)).current;
  const ring2 = useRef(new Animated.Value(1)).current;
  const ring3 = useRef(new Animated.Value(1)).current;
  const ring4 = useRef(new Animated.Value(1)).current;

  const opacity1 = useRef(new Animated.Value(0.15)).current;
  const opacity2 = useRef(new Animated.Value(0.12)).current;
  const opacity3 = useRef(new Animated.Value(0.1)).current;
  const opacity4 = useRef(new Animated.Value(0.08)).current;

  useEffect(() => {
    if (!isVisible) return;

    // Create a single inward pulse animation (no loop)
    // Each ring animates inward over ~1.2 seconds with staggered delays
    const animations = Animated.parallel([
      Animated.sequence([
        Animated.delay(0),
        Animated.parallel([
          Animated.timing(ring1, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(opacity1, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(ring2, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(240),
        Animated.parallel([
          Animated.timing(ring3, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(360),
        Animated.parallel([
          Animated.timing(ring4, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity4, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const rings = [
    { scale: ring1, opacity: opacity1, size: 280 },
    { scale: ring2, opacity: opacity2, size: 220 },
    { scale: ring3, opacity: opacity3, size: 160 },
    { scale: ring4, opacity: opacity4, size: 100 },
  ];

  return (
    <View style={styles.container}>
      {rings.map((ring, index) => (
        <Animated.View
          key={index}
          style={[
            styles.ring,
            {
              width: ring.size,
              height: ring.size,
              borderRadius: ring.size / 2,
              borderColor: theme.primaryDark,
              opacity: ring.opacity,
              transform: [{ scale: ring.scale }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
});
