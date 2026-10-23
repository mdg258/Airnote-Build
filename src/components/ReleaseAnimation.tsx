import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ReleaseAnimation: React.FC = () => {
  const { theme } = useTheme();

  // Create 8 particles with different properties for organic feel
  const particles = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0.6),
      scale: new Animated.Value(1),
      // Random properties for organic motion
      angle: (i * 45) + (Math.random() * 30 - 15), // Spread in different directions
      distance: 80 + Math.random() * 60, // How far they travel sideways
      delay: i * 80, // Stagger the start
      size: 6 + Math.random() * 6, // Vary particle sizes
    }))
  ).current;

  useEffect(() => {
    // Start all particle animations
    const animations = particles.map((particle) => {
      // Calculate horizontal drift based on angle
      const drift = Math.sin((particle.angle * Math.PI) / 180) * particle.distance;

      return Animated.sequence([
        // Initial delay for stagger effect
        Animated.delay(particle.delay),
        // Parallel animations for organic motion
        Animated.parallel([
          // Gentle upward motion
          Animated.timing(particle.translateY, {
            toValue: -SCREEN_HEIGHT * 0.5, // Rise to middle of screen
            duration: 1400,
            useNativeDriver: true,
          }),
          // Horizontal drift (dispersion)
          Animated.timing(particle.translateX, {
            toValue: drift,
            duration: 1400,
            useNativeDriver: true,
          }),
          // Fade out
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
          // Slight scale down as it fades
          Animated.timing(particle.scale, {
            toValue: 0.3,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.particleContainer}>
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                backgroundColor: theme.primaryDark,
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.translateX },
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  particleContainer: {
    position: 'absolute',
    bottom: '30%', // Start from lower-middle area
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});
