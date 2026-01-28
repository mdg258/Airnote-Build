import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { Duration, Radius } from '../types/note';
import { lightMapStyle, darkMapStyle } from '../theme/mapStyles';

interface SendNoteComposerProps {
  onBack: () => void;
  onCreate: (text: string, duration: Duration, radius: Radius) => void;
  locationName: string;
  locationDescription?: string;
  coordinates?: { latitude: number; longitude: number } | null;
}

const RADII: Array<{ value: Radius; spatialLabel: string }> = [
  { value: 91.44, spatialLabel: 'People very close by' },
  { value: 304.8, spatialLabel: 'People nearby' },
  { value: 1609, spatialLabel: 'People within a mile' },
];

const DURATIONS: Array<{ value: Duration; label: string }> = [
  { value: '1h', label: 'For the next hour' },
  { value: '4h', label: 'For a few hours' },
  { value: '24h', label: 'For the rest of the day' },
];

export const SendNoteComposer: React.FC<SendNoteComposerProps> = ({
  onBack,
  onCreate,
  locationName,
  coordinates,
}) => {
  const { theme, themeMode, textScale } = useTheme();
  const [text, setText] = useState('');
  const [radiusIndex, setRadiusIndex] = useState(1);
  const [duration, setDuration] = useState<Duration>('4h');

  const latitude = coordinates?.latitude ?? 37.7749;
  const longitude = coordinates?.longitude ?? -122.4194;
  const radius = RADII[radiusIndex].value;

  const handleSubmit = () => {
    if (text.trim()) {
      onCreate(text.trim(), duration, radius);
    }
  };

  const currentRadiusLabel = RADII[radiusIndex].spatialLabel;
  const showCharCount = text.length > 160;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Ionicons name="chevron-back" size={28} color={theme.text.secondary} style={{ opacity: 0.6 }} />
        </TouchableOpacity>
        <Text style={[styles.locationName, { color: theme.text.tertiary, fontSize: 13 * textScale }]} numberOfLines={1}>
          {locationName}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Map - Confirmational */}
        <View style={styles.mapSection}>
          <View style={[styles.mapContainer, { backgroundColor: theme.background }]}>
            <MapView
              style={styles.map}
              mapType="mutedStandard"
              customMapStyle={themeMode === 'dark' ? darkMapStyle : lightMapStyle}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              showsPointsOfInterest={false}
              showsBuildings={false}
              region={{
                latitude,
                longitude,
                latitudeDelta: (radius * 3) / 111000,
                longitudeDelta: (radius * 3) / 111000,
              }}
            >
              <Circle
                center={{ latitude, longitude }}
                radius={radius}
                fillColor={theme.primaryDark + '12'}
                strokeColor={theme.primaryDark + '80'}
                strokeWidth={1}
              />
            </MapView>
          </View>
          <Text style={[styles.mapCaption, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
            This note will be visible here.
          </Text>
        </View>

        {/* Text Input - Borderless, natural */}
        <View style={styles.textSection}>
          <TextInput
            style={[
              styles.textInput,
              { color: theme.text.primary, fontSize: 22 * textScale },
            ]}
            placeholder="What should someone nearby know?"
            placeholderTextColor={theme.text.tertiary}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={200}
            autoFocus
          />
          {showCharCount && (
            <Text style={[styles.charCount, { color: theme.text.tertiary, fontSize: 12 * textScale }]}>
              {text.length}/200
            </Text>
          )}
        </View>

        {/* Range - Spatial language with slider */}
        <View style={styles.sentenceSection}>
          <Text style={[styles.sentenceLabel, { color: theme.text.secondary, fontSize: 16 * textScale }]}>
            {currentRadiusLabel}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={2}
            step={1}
            value={radiusIndex}
            onValueChange={setRadiusIndex}
            minimumTrackTintColor={theme.primaryDark}
            maximumTrackTintColor={theme.cardBorder + '40'}
            thumbTintColor={theme.primaryDark}
          />
        </View>

        {/* Duration - Natural language buttons */}
        <View style={styles.sentenceSection}>
          <View style={styles.durationOptions}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[
                  styles.durationOption,
                  duration === d.value && styles.durationOptionSelected,
                ]}
                onPress={() => setDuration(d.value)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.durationOptionText,
                    {
                      color: duration === d.value ? theme.text.primary : theme.text.tertiary,
                      fontSize: 15 * textScale,
                      opacity: duration === d.value ? 0.85 : 0.35,
                    },
                  ]}
                >
                  {d.label}
                </Text>
                {duration === d.value && (
                  <View style={[styles.indicator, { backgroundColor: theme.primaryDark }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button - Calm completion */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: text.trim() ? theme.primaryDark : theme.cardBorder,
              opacity: text.trim() ? 1 : 0.4,
            },
          ]}
          onPress={handleSubmit}
          disabled={!text.trim()}
          activeOpacity={0.7}
        >
          <Text style={[styles.submitButtonText, { fontSize: 18 * textScale }]}>Done</Text>
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
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  textSection: {
    gap: spacing.sm,
  },
  textInput: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 32,
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 0,
    margin: 0,
    letterSpacing: -0.3,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    opacity: 0.4,
    letterSpacing: -0.1,
  },
  sentenceSection: {
    gap: spacing.md,
  },
  sentenceLabel: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.2,
    opacity: 0.85,
    lineHeight: 24,
  },
  slider: {
    width: '100%',
    height: 32,
    marginTop: -spacing.xs,
  },
  durationOptions: {
    gap: spacing.sm,
  },
  durationOption: {
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    position: 'relative',
  },
  durationOptionSelected: {
    // Selected state shown via text color and indicator
  },
  durationOptionText: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 1,
  },
  mapSection: {
    gap: spacing.sm,
  },
  mapContainer: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapCaption: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: -0.1,
    opacity: 0.5,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.lg,
    paddingTop: spacing.md,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
});
