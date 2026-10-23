import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { Duration, Radius } from '../types/note';
import { LocationOption } from '../utils/location';
import { LeaveNoteCategory } from '../constants/noteTemplates';
import { lightMapStyle, darkMapStyle } from '../theme/mapStyles';

interface LeaveNoteComposerProps {
  onBack: () => void;
  onCreate: (text: string, duration: Duration, radius: Radius, category: LeaveNoteCategory) => void;
  locationName: string;
  locationDescription?: string;
  coordinates?: { latitude: number; longitude: number } | null;
  locationOptions: LocationOption[];
  selectedLocation: LocationOption | null;
  onLocationChange: (location: LocationOption) => void;
}

export const LeaveNoteComposer: React.FC<LeaveNoteComposerProps> = ({
  onBack,
  onCreate,
  locationName,
  coordinates,
  locationOptions,
  selectedLocation,
  onLocationChange,
}) => {
  const { theme, themeMode, textScale } = useTheme();
  const [text, setText] = useState('');
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);

  const latitude = coordinates?.latitude ?? 37.7749;
  const longitude = coordinates?.longitude ?? -122.4194;
  const radius = 15.24; // Fixed at 50ft for leave notes

  const handleSubmit = () => {
    if (text.trim()) {
      onCreate(text.trim(), '1h', radius, 'info');
    }
  };

  const showCharCount = text.length > 80;

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

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
              showsPointsOfInterests={false}
              showsBuildings={false}
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

        {/* Location Picker - Natural language */}
        {locationOptions.length > 1 && (
          <TouchableOpacity
            style={styles.locationSection}
            onPress={() => setLocationPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.locationLabel, { color: theme.text.secondary, fontSize: 16 * textScale }]}>
              {selectedLocation?.name || locationName}
            </Text>
            {selectedLocation?.description && (
              <Text style={[styles.locationSubtext, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
                {selectedLocation.description}
              </Text>
            )}
          </TouchableOpacity>
        )}

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
            maxLength={100}
            autoFocus
          />
          {showCharCount && (
            <Text style={[styles.charCount, { color: theme.text.tertiary, fontSize: 12 * textScale }]}>
              {text.length}/100
            </Text>
          )}
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

      {/* Location Picker Modal */}
      <Modal
        visible={locationPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLocationPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLocationPickerVisible(false)}
        >
          <View style={[styles.locationPickerContainer, { backgroundColor: theme.background }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.text.primary, fontSize: 18 * textScale }]}>
                Choose location
              </Text>
            </View>
            {locationOptions.map((location, index) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationOption,
                  { backgroundColor: theme.card },
                  index === locationOptions.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => {
                  onLocationChange(location);
                  setLocationPickerVisible(false);
                }}
              >
                <View style={styles.locationOptionContent}>
                  {location.id === 'current' && (
                    <View style={[styles.currentLocationDot, { backgroundColor: theme.primaryDark }]} />
                  )}
                  <View style={styles.locationOptionTextContainer}>
                    <Text style={[styles.locationOptionText, { color: theme.text.primary, fontSize: 16 * textScale }]}>
                      {location.name}
                    </Text>
                    {location.description && (
                      <Text style={[styles.locationOptionSubtext, { color: theme.text.tertiary, fontSize: 14 * textScale }]} numberOfLines={1}>
                        {location.description}
                      </Text>
                    )}
                  </View>
                </View>
                {selectedLocation?.id === location.id && location.id !== 'current' && (
                  <View style={[styles.selectedIndicator, { backgroundColor: theme.primaryDark }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  scrollContent: {
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
    minHeight: 70,
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
  locationSection: {
    paddingVertical: spacing.sm,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.2,
    opacity: 0.85,
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  locationPickerContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  pickerHeader: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    position: 'relative',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 12,
  },
  locationOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currentLocationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  locationOptionTextContainer: {
    flex: 1,
  },
  locationOptionText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  locationOptionSubtext: {
    fontSize: 14,
    opacity: 0.5,
    letterSpacing: -0.1,
  },
  selectedIndicator: {
    position: 'absolute',
    right: spacing.xl,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
