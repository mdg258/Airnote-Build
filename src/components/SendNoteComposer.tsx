import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
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
  coordinates?: { latitude: number; longitude: number } | null;
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
  coordinates,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [radius, setRadius] = useState<Radius>(45.72);
  const [urgencyIndex, setUrgencyIndex] = useState(1);

  const latitude = coordinates?.latitude ?? 37.7749;
  const longitude = coordinates?.longitude ?? -122.4194;

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
        <Text style={[styles.locationName, { color: theme.text.tertiary }]} numberOfLines={1}>
          {locationName}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Text Input */}
        <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
          <TextInput
            style={[
              styles.textInput,
              { color: theme.text.primary },
            ]}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.text.tertiary + '80'}
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
            <Text style={[styles.controlLabel, { color: theme.text.tertiary }]}>Urgency</Text>
            <View style={[styles.urgencyBadge, { backgroundColor: currentUrgency.color + '18' }]}>
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
            maximumTrackTintColor={theme.cardBorder + '60'}
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
                    fontWeight: urgencyIndex === index ? '600' : '400',
                    opacity: urgencyIndex === index ? 1 : 0.5,
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
            <Text style={[styles.controlLabel, { color: theme.text.tertiary }]}>Range</Text>
            <Text style={[styles.rangeValue, { color: currentUrgency.color }]}>
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
                    backgroundColor: radius === r.value ? currentUrgency.color + '15' : theme.card,
                    borderColor: radius === r.value ? currentUrgency.color + '50' : theme.cardBorder + '60',
                  },
                ]}
                onPress={() => setRadius(r.value)}
              >
                <Text
                  style={[
                    styles.rangeText,
                    {
                      color: radius === r.value ? currentUrgency.color : theme.text.secondary,
                      fontWeight: radius === r.value ? '600' : '500',
                    },
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Map Preview */}
        <View style={styles.mapSection}>
          <View style={[styles.mapContainer, { backgroundColor: theme.background }]}>
            <MapView
              style={styles.map}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              region={{
                latitude,
                longitude,
                latitudeDelta: (radius * 4) / 111000,
                longitudeDelta: (radius * 4) / 111000,
              }}
            >
              <Circle
                center={{ latitude, longitude }}
                radius={radius}
                fillColor={currentUrgency.color + '18'}
                strokeColor={currentUrgency.color + 'CC'}
                strokeWidth={1.5}
              />
            </MapView>
          </View>
          <Text style={[styles.mapCaption, { color: theme.text.tertiary }]}>
            Broadcast range: {RADII.find(r => r.value === radius)?.label} · {currentUrgency.label}
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: text.trim() ? currentUrgency.color : theme.cardBorder,
              opacity: text.trim() ? 1 : 0.5,
            },
          ]}
          onPress={handleSubmit}
          disabled={!text.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Send Note</Text>
          <Ionicons name="paper-plane" size={17} color="#FFFFFF" />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  locationName: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xl,
  },
  inputCard: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  textInput: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 26,
    minHeight: 100,
    maxHeight: 140,
    textAlignVertical: 'top',
    padding: 0,
    margin: 0,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: spacing.xs,
    opacity: 0.5,
  },
  controlSection: {
    gap: spacing.md,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
  },
  urgencyEmoji: {
    fontSize: 14,
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginTop: -spacing.xs,
  },
  sliderLabel: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  rangeGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  rangeOption: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  mapSection: {
    gap: spacing.sm,
  },
  mapContainer: {
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapCaption: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: -0.1,
    opacity: 0.6,
  },
});
