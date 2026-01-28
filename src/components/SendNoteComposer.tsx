import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { spacing, borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { Duration, Radius } from '../types/note';

interface SendNoteComposerProps {
  onBack: () => void;
  onCreate: (text: string, duration: Duration, radius: Radius) => void;
  locationName: string;
  locationDescription?: string;
}

const RADII: Array<{ value: Radius; label: string }> = [
  { value: 9.14, label: '30ft' },
  { value: 22.86, label: '75ft' },
  { value: 45.72, label: '150ft' },
  { value: 91.44, label: '300ft' },
];

const URGENCY_LEVELS = [
  { value: 0, label: 'Low', duration: '24h' as Duration, color: '#95A5A6', emoji: '🕐' },
  { value: 1, label: 'Soon', duration: '4h' as Duration, color: '#3498DB', emoji: '⏰' },
  { value: 2, label: 'Now', duration: '1h' as Duration, color: '#E74C3C', emoji: '🔥' },
];

export const SendNoteComposer: React.FC<SendNoteComposerProps> = ({
  onBack,
  onCreate,
  locationName,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [radius, setRadius] = useState<Radius>(45.72);
  const [urgencyIndex, setUrgencyIndex] = useState(1);

  const handleSubmit = () => {
    if (text.trim()) {
      const urgency = URGENCY_LEVELS[urgencyIndex];
      onCreate(text.trim(), urgency.duration, radius);
    }
  };

  const currentUrgency = URGENCY_LEVELS[urgencyIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={26} color={theme.text.secondary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.locationName, { color: theme.text.primary }]} numberOfLines={1}>
            {locationName}
          </Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Text Input */}
        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.background,
                color: theme.text.primary,
              },
            ]}
            placeholder="What do you want to share?"
            placeholderTextColor={theme.text.tertiary}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={200}
            autoFocus
          />
          <Text style={[styles.charCount, { color: theme.text.tertiary }]}>
            {text.length}/200
          </Text>
        </View>

        {/* Urgency Control */}
        <View style={styles.controlSection}>
          <View style={styles.controlHeader}>
            <Text style={[styles.controlLabel, { color: theme.text.secondary }]}>Urgency</Text>
            <View style={[styles.urgencyBadge, { backgroundColor: currentUrgency.color + '15' }]}>
              <Text style={styles.urgencyEmoji}>{currentUrgency.emoji}</Text>
              <Text style={[styles.urgencyText, { color: currentUrgency.color }]}>
                {currentUrgency.label}
              </Text>
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={2}
            step={1}
            value={urgencyIndex}
            onValueChange={setUrgencyIndex}
            minimumTrackTintColor={currentUrgency.color}
            maximumTrackTintColor={theme.cardBorder}
            thumbTintColor={currentUrgency.color}
          />
          <View style={styles.sliderLabels}>
            {URGENCY_LEVELS.map((level, index) => (
              <Text
                key={level.value}
                style={[
                  styles.sliderLabel,
                  {
                    color: urgencyIndex === index ? level.color : theme.text.tertiary,
                    fontWeight: urgencyIndex === index ? '600' : '500',
                  },
                ]}
              >
                {level.label}
              </Text>
            ))}
          </View>
        </View>

        {/* Range Control */}
        <View style={styles.controlSection}>
          <View style={styles.controlHeader}>
            <Text style={[styles.controlLabel, { color: theme.text.secondary }]}>Range</Text>
            <Text style={[styles.rangeValue, { color: theme.primaryDark }]}>
              {RADII.find((r) => r.value === radius)?.label}
            </Text>
          </View>
          <View style={styles.rangeGrid}>
            {RADII.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.rangeOption,
                  {
                    backgroundColor: radius === r.value ? theme.primaryDark : theme.background,
                    borderColor: radius === r.value ? theme.primaryDark : theme.cardBorder,
                  },
                ]}
                onPress={() => setRadius(r.value)}
              >
                <Text
                  style={[
                    styles.rangeText,
                    {
                      color: radius === r.value ? '#FFFFFF' : theme.text.secondary,
                      fontWeight: radius === r.value ? '700' : '500',
                    },
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: text.trim() ? currentUrgency.color : theme.cardBorder,
            },
          ]}
          onPress={handleSubmit}
          disabled={!text.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Send</Text>
          <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl * 1.5,
  },
  inputSection: {
    gap: spacing.xs,
  },
  textInput: {
    fontSize: 17,
    lineHeight: 24,
    minHeight: 160,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    fontSize: 13,
    textAlign: 'right',
  },
  controlSection: {
    gap: spacing.md,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  urgencyEmoji: {
    fontSize: 16,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sliderLabel: {
    fontSize: 12,
  },
  rangeValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  rangeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rangeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 14,
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
