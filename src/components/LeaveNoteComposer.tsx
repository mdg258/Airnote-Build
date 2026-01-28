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
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);

  const latitude = coordinates?.latitude ?? 37.7749;
  const longitude = coordinates?.longitude ?? -122.4194;
  const radius = 15.24; // 50ft

  const handleSubmit = () => {
    if (text.trim()) {
      onCreate(text.trim(), '1h', 15.24, 'info');
    }
  };

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

        {/* Location Picker */}
        {locationOptions.length > 1 && (
          <View style={styles.locationSection}>
            <Text style={[styles.sectionLabel, { color: theme.text.tertiary }]}>LOCATION</Text>
            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => setLocationPickerVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.locationButtonContent}>
                <Ionicons name="location" size={18} color={theme.primaryDark} />
                <View style={styles.locationTextContainer}>
                  <Text style={[styles.locationButtonText, { color: theme.text.primary }]} numberOfLines={1}>
                    {selectedLocation?.name || locationName}
                  </Text>
                  {selectedLocation?.description && (
                    <Text style={[styles.locationButtonSubtext, { color: theme.text.tertiary }]} numberOfLines={1}>
                      {selectedLocation.description}
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.text.tertiary} />
            </TouchableOpacity>
          </View>
        )}

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
                fillColor={theme.primaryDark + '18'}
                strokeColor={theme.primaryDark + 'CC'}
                strokeWidth={1.5}
              />
            </MapView>
          </View>
          <Text style={[styles.mapCaption, { color: theme.text.tertiary }]}>
            Visible within 50 ft · 1 hour
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: text.trim() ? theme.primaryDark : theme.cardBorder,
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
          <View style={[styles.locationPickerContainer, { backgroundColor: theme.card }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.pickerTitle, { color: theme.text.primary }]}>Choose Location</Text>
            </View>
            {locationOptions.map((location, index) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationOption,
                  { borderBottomColor: theme.cardBorder },
                  index === locationOptions.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => {
                  onLocationChange(location);
                  setLocationPickerVisible(false);
                }}
              >
                <View style={styles.locationOptionContent}>
                  <Ionicons
                    name={location.id === 'current' ? 'navigate' : 'location'}
                    size={20}
                    color={selectedLocation?.id === location.id ? theme.primaryDark : theme.text.secondary}
                  />
                  <View style={styles.locationOptionTextContainer}>
                    <Text style={[styles.locationOptionText, { color: theme.text.primary }]}>
                      {location.name}
                    </Text>
                    {location.description && (
                      <Text style={[styles.locationOptionSubtext, { color: theme.text.tertiary }]} numberOfLines={1}>
                        {location.description}
                      </Text>
                    )}
                  </View>
                </View>
                {selectedLocation?.id === location.id && (
                  <Ionicons name="checkmark" size={20} color={theme.primaryDark} />
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
  locationSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.7,
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationButtonSubtext: {
    fontSize: 12,
    opacity: 0.6,
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
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerHeader: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
  },
  locationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  locationOptionTextContainer: {
    flex: 1,
  },
  locationOptionText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationOptionSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
});
