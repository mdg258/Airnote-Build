import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface NoteModeSelectorProps {
  onSelectMode: (mode: 'leave' | 'send') => void;
  onClose?: () => void;
}

export const NoteModeSelector: React.FC<NoteModeSelectorProps> = ({ onSelectMode, onClose }) => {
  const { theme, textScale } = useTheme();
  const opacityLeave = React.useRef(new Animated.Value(1)).current;
  const opacitySend = React.useRef(new Animated.Value(1)).current;
  const translateSend = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = (opacity: Animated.Value) => {
    Animated.timing(opacity, {
      toValue: 0.4,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (opacity: Animated.Value) => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    // Subtle floating animation for Send
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateSend, {
          toValue: -3,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateSend, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={[styles.closeText, { color: theme.text.tertiary }]}>✕</Text>
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        {/* Send - Light, Airborne */}
        <Animated.View
          style={[
            styles.choiceWrapper,
            styles.sendWrapper,
            { opacity: opacitySend, transform: [{ translateY: translateSend }] },
          ]}
        >
          <TouchableOpacity
            style={styles.choice}
            onPress={() => onSelectMode('send')}
            onPressIn={() => handlePressIn(opacitySend)}
            onPressOut={() => handlePressOut(opacitySend)}
            activeOpacity={1}
          >
            <Text style={[styles.sendText, { color: theme.text.primary, fontSize: 44 * textScale }]}>
              Send
            </Text>
            <Text style={[styles.sendHint, { color: theme.text.tertiary, fontSize: 15 * textScale }]}>
              Broadcast a message nearby
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Leave - Grounded, Stable */}
        <Animated.View style={[styles.choiceWrapper, styles.leaveWrapper, { opacity: opacityLeave }]}>
          <TouchableOpacity
            style={styles.choice}
            onPress={() => onSelectMode('leave')}
            onPressIn={() => handlePressIn(opacityLeave)}
            onPressOut={() => handlePressOut(opacityLeave)}
            activeOpacity={1}
          >
            <Text style={[styles.leaveText, { color: theme.text.primary, fontSize: 48 * textScale }]}>
              Leave
            </Text>
            <Text style={[styles.leaveHint, { color: theme.text.secondary, fontSize: 15 * textScale }]}>
              Pin a note to this place
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl * 1.5,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl * 2,
  },
  choiceWrapper: {
    alignItems: 'center',
  },
  sendWrapper: {
    paddingBottom: spacing.xl,
  },
  leaveWrapper: {
    paddingTop: spacing.lg,
  },
  choice: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sendText: {
    fontSize: 44,
    fontWeight: '300',
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  sendHint: {
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.5,
    letterSpacing: -0.2,
  },
  leaveText: {
    fontSize: 48,
    fontWeight: '600',
    letterSpacing: -1.5,
    marginBottom: spacing.xs,
  },
  leaveHint: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.7,
    letterSpacing: -0.2,
  },
});
