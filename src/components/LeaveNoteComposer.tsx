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
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { Duration, Radius } from '../types/note';
import {
  LeaveNoteCategory,
  LEAVE_NOTE_CATEGORIES,
} from '../constants/noteTemplates';

interface LeaveNoteComposerProps {
  onBack: () => void;
  onCreate: (text: string, duration: Duration, radius: Radius, category: LeaveNoteCategory) => void;
  locationName: string;
  locationDescription?: string;
  coordinates?: { latitude: number; longitude: number } | null;
}

export const LeaveNoteComposer: React.FC<LeaveNoteComposerProps> = ({
  onBack,
  onCreate,
  locationName,
  coordinates,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [category, setCategory] = useState<LeaveNoteCategory>('info');

  const latitude = coordinates?.latitude ?? 37.7749;
  const longitude = coordinates?.longitude ?? -122.4194;
  const radius = 91.44; // 300ft

  const handleSubmit = () => {
    if (text.trim()) {
      onCreate(text.trim(), '1h', 91.44, category);
    }
  };

  const selectedCategory = LEAVE_NOTE_CATEGORIES.find((c) => c.id === category);

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

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
            placeholder="What's happening here?"
            placeholderTextColor={theme.text.tertiary + '80'}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={100}
            autoFocus
          />
          <Text style={[styles.charCount, { color: theme.text.tertiary }]}>
            {text.length}/100
          </Text>
        </View>

        {/* Category Pills */}
        <View style={styles.categoryContainer}>
          {LEAVE_NOTE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: category === cat.id ? cat.color + '20' : theme.card,
                  borderColor: category === cat.id ? cat.color + '40' : theme.cardBorder + '60',
                },
              ]}
              onPress={() => setCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: category === cat.id ? cat.color : theme.text.secondary,
                    fontWeight: category === cat.id ? '600' : '500',
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
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
                fillColor={(selectedCategory?.color || '#2ECC71') + '18'}
                strokeColor={(selectedCategory?.color || '#2ECC71') + 'CC'}
                strokeWidth={1.5}
              />
            </MapView>
          </View>
          <Text style={[styles.mapCaption, { color: theme.text.tertiary }]}>
            Visible within 300 ft · 1 hour
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: text.trim() ? (selectedCategory?.color || theme.primaryDark) : theme.cardBorder,
              opacity: text.trim() ? 1 : 0.5,
            },
          ]}
          onPress={handleSubmit}
          disabled={!text.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Place Note</Text>
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
    borderBottomWidth: 0,
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  inputCard: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  textInput: {
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 28,
    minHeight: 70,
    maxHeight: 110,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 0.5,
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 15,
  },
  categoryText: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  mapSection: {
    gap: spacing.sm,
  },
  mapContainer: {
    height: 180,
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
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    paddingTop: spacing.md,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
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
});
