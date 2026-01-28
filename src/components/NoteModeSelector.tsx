import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface NoteModeSelectorProps {
  onSelectMode: (mode: 'leave' | 'send') => void;
  onClose?: () => void;
}

export const NoteModeSelector: React.FC<NoteModeSelectorProps> = ({ onSelectMode, onClose }) => {
  const { theme } = useTheme();
  const scaleLeave = React.useRef(new Animated.Value(1)).current;
  const scaleSend = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      {onClose && (
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.headerSection}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Create a note</Text>
        <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
          Choose how you want to communicate
        </Text>
      </View>

      {/* Leave Mode - Anchored, Grounded */}
      <Animated.View style={[styles.modeWrapper, { transform: [{ scale: scaleLeave }] }]}>
        <TouchableOpacity
          style={[
            styles.modeCard,
            styles.leaveCard,
            { backgroundColor: theme.card, borderColor: '#4A90E2' },
          ]}
          onPress={() => onSelectMode('leave')}
          onPressIn={() => handlePressIn(scaleLeave)}
          onPressOut={() => handlePressOut(scaleLeave)}
          activeOpacity={1}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: '#4A90E2' }]}>
              <Text style={styles.modeIcon}>📍</Text>
            </View>
            <View style={styles.cardTitle}>
              <Text style={[styles.modeTitle, { color: theme.text.primary }]}>Leave</Text>
              <Text style={[styles.modeType, { color: theme.text.tertiary }]}>UTILITY</Text>
            </View>
          </View>
          <Text style={[styles.modeDescription, { color: theme.text.secondary }]}>
            Pin a helpful note to this exact location
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Send Mode - Directional, Expressive */}
      <Animated.View style={[styles.modeWrapper, { transform: [{ scale: scaleSend }] }]}>
        <TouchableOpacity
          style={[
            styles.modeCard,
            styles.sendCard,
            { backgroundColor: theme.card, borderColor: '#E74C3C' },
          ]}
          onPress={() => onSelectMode('send')}
          onPressIn={() => handlePressIn(scaleSend)}
          onPressOut={() => handlePressOut(scaleSend)}
          activeOpacity={1}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: '#E74C3C' }]}>
              <Text style={styles.modeIcon}>✈️</Text>
            </View>
            <View style={styles.cardTitle}>
              <Text style={[styles.modeTitle, { color: theme.text.primary }]}>Send</Text>
              <Text style={[styles.modeType, { color: theme.text.tertiary }]}>BROADCAST</Text>
            </View>
          </View>
          <Text style={[styles.modeDescription, { color: theme.text.secondary }]}>
            Broadcast a message to people nearby
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeWrapper: {
    width: '100%',
  },
  modeCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: spacing.sm,
  },
  leaveCard: {
    // Grounded, stable feeling
  },
  sendCard: {
    // Light, directional feeling
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIcon: {
    fontSize: 28,
  },
  cardTitle: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeType: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  modeDescription: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
});
