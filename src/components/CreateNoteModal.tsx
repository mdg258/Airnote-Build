import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Duration, Radius } from '../types/note';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { getLocationOptions, LocationOption } from '../utils/location';
import { PlacePickerModal } from './PlacePickerModal';
import { PlaceWithDistance } from '../services/placesService';

interface CreateNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (
    text: string,
    duration: Duration,
    radius: Radius,
    locationOption: LocationOption
  ) => void;
  currentLatitude: number | null;
  currentLongitude: number | null;
}

const DURATIONS: Duration[] = ['15m', '30m', '1h', '4h', '24h'];
const RADII: Radius[] = [9.14, 22.86, 45.72, 91.44];

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  visible,
  onClose,
  onCreate,
  currentLatitude,
  currentLongitude,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [duration, setDuration] = useState<Duration>('1h');
  const [radius, setRadius] = useState<Radius>(22.86);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDistance | null>(null);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showPlacePicker, setShowPlacePicker] = useState(false);

  useEffect(() => {
    if (visible && currentLatitude !== null && currentLongitude !== null) {
      loadLocationOptions();
    }
  }, [visible, currentLatitude, currentLongitude]);

  const loadLocationOptions = async () => {
    if (currentLatitude === null || currentLongitude === null) return;

    setLoadingLocations(true);
    try {
      const options = await getLocationOptions(currentLatitude, currentLongitude);
      setLocationOptions(options);
      setSelectedLocation(options[0]); // Select first option by default
    } catch (error) {
      console.error('Failed to load location options:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleSelectPlace = (place: PlaceWithDistance) => {
    // Validate place is within 100m
    if (place.distance > 100) {
      return;
    }

    setSelectedPlace(place);
    // Store place info as metadata ONLY (not coordinates)
    // IMPORTANT: Use user's current coordinates, not place coordinates
    setSelectedLocation({
      id: place.id,
      name: place.name,
      description: place.address || place.neighborhood,
      latitude: currentLatitude!,
      longitude: currentLongitude!,
    });
  };

  const handlePost = () => {
    if (text.trim().length === 0 || !selectedLocation) return;
    onCreate(text.trim(), duration, radius, selectedLocation);
    setText('');
    setDuration('1h');
    setRadius(22.86);
    setSelectedPlace(null);
    setShowLocationPicker(false);
    onClose();
  };

  const handleCancel = () => {
    setText('');
    setDuration('1h');
    setRadius(22.86);
    setSelectedPlace(null);
    setShowLocationPicker(false);
    onClose();
  };

  const getLocationDisplayName = () => {
    if (selectedPlace) {
      return selectedPlace.name;
    }
    return selectedLocation?.name || 'Select location';
  };

  const getLocationDisplayDescription = () => {
    if (selectedPlace) {
      return selectedPlace.address || selectedPlace.neighborhood;
    }
    return selectedLocation?.description;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleCancel} />
        <View style={[styles.modal, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Create Note</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={[styles.closeButton, { color: theme.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Text Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text.primary }]}>Message</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text.primary,
                    borderColor: theme.cardBorder,
                  },
                ]}
                placeholder="What do you want to say?"
                placeholderTextColor={theme.text.tertiary}
                value={text}
                onChangeText={setText}
                maxLength={200}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: theme.text.tertiary }]}>{text.length}/200</Text>
            </View>

            {/* Location Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text.primary }]}>Location</Text>
              {loadingLocations ? (
                <View style={styles.locationLoading}>
                  <ActivityIndicator size="small" color={theme.primaryDark} />
                  <Text style={[styles.locationLoadingText, { color: theme.text.secondary }]}>
                    Loading locations...
                  </Text>
                </View>
              ) : (
                <>
                  {/* Current Location Display */}
                  <View
                    style={[
                      styles.locationDisplay,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.locationDisplayContent}>
                      <Text style={[styles.locationName, { color: theme.text.primary }]}>
                        📍 {getLocationDisplayName()}
                      </Text>
                      {getLocationDisplayDescription() && (
                        <Text style={[styles.locationDescription, { color: theme.text.secondary }]}>
                          {getLocationDisplayDescription()}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Add Place Button */}
                  <TouchableOpacity
                    style={[
                      styles.addPlaceButton,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                    onPress={() => setShowPlacePicker(true)}
                  >
                    <Text style={[styles.addPlaceText, { color: theme.primaryDark }]}>
                      ✨ Add place
                    </Text>
                  </TouchableOpacity>

                  {/* Fallback Options Dropdown */}
                  {!selectedPlace && (
                    <>
                      <TouchableOpacity
                        style={styles.toggleOptionsButton}
                        onPress={() => setShowLocationPicker(!showLocationPicker)}
                      >
                        <Text style={[styles.toggleOptionsText, { color: theme.text.secondary }]}>
                          {showLocationPicker ? 'Hide' : 'Show'} area options
                        </Text>
                      </TouchableOpacity>

                      {showLocationPicker && (
                        <View
                          style={[
                            styles.locationDropdown,
                            {
                              backgroundColor: theme.background,
                              borderColor: theme.cardBorder,
                            },
                          ]}
                        >
                          {locationOptions.map((option) => (
                            <TouchableOpacity
                              key={option.id}
                              style={[
                                styles.locationOption,
                                selectedLocation?.id === option.id && {
                                  backgroundColor: theme.primaryDark + '15',
                                },
                              ]}
                              onPress={() => {
                                setSelectedLocation(option);
                                setSelectedPlace(null);
                                setShowLocationPicker(false);
                              }}
                            >
                              <Text style={[styles.locationOptionName, { color: theme.text.primary }]}>
                                {option.name}
                              </Text>
                              {option.description && (
                                <Text style={[styles.locationOptionDesc, { color: theme.text.secondary }]}>
                                  {option.description}
                                </Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </>
              )}
            </View>

            {/* Duration Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text.primary }]}>Duration</Text>
              <View style={styles.optionsRow}>
                {DURATIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.option,
                      {
                        backgroundColor: duration === d ? theme.primaryDark : theme.background,
                        borderColor: duration === d ? theme.primaryDark : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setDuration(d)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: duration === d ? theme.text.inverse : theme.text.primary,
                        },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Radius Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text.primary }]}>Radius</Text>
              <View style={styles.optionsRow}>
                {RADII.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.option,
                      {
                        backgroundColor: radius === r ? theme.primaryDark : theme.background,
                        borderColor: radius === r ? theme.primaryDark : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setRadius(r)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: radius === r ? theme.text.inverse : theme.text.primary,
                        },
                      ]}
                    >
                      {Math.round(r * 3.28084)}ft
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Photo Placeholder */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.photoButton,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.cardBorder,
                  },
                ]}
                disabled
              >
                <Text style={[styles.photoButtonText, { color: theme.text.secondary }]}>
                  📷 Attach Photo (Coming Soon)
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Post Button - Fixed at bottom */}
          <View
            style={[
              styles.buttonContainer,
              {
                borderTopColor: theme.cardBorder,
                backgroundColor: theme.card,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.postButton,
                {
                  backgroundColor: text.trim().length === 0 ? theme.text.tertiary : theme.primaryDark,
                },
                text.trim().length === 0 && styles.postButtonDisabled,
              ]}
              onPress={handlePost}
              disabled={text.trim().length === 0}
            >
              <Text style={[styles.postButtonText, { color: theme.text.inverse }]}>Send Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Place Picker Modal */}
      <PlacePickerModal
        visible={showPlacePicker}
        onClose={() => setShowPlacePicker(false)}
        onSelectPlace={handleSelectPlace}
        currentLatitude={currentLatitude}
        currentLongitude={currentLongitude}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: 0,
    maxHeight: '85%',
  },
  scrollContent: {
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContentContainer: {
    paddingBottom: spacing.sm,
  },
  buttonContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 28,
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    ...typography.body,
    fontSize: 16,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    minHeight: 120,
    borderWidth: 1,
  },
  charCount: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flex: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  optionText: {
    ...typography.body,
    fontWeight: '600',
  },
  photoButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    opacity: 0.5,
    minHeight: 56,
  },
  photoButtonText: {
    fontSize: 16,
  },
  postButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    minHeight: 56,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  locationLoadingText: {
    fontSize: 14,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    minHeight: 56,
  },
  locationSelectorContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationDescription: {
    fontSize: 13,
  },
  dropdownArrow: {
    fontSize: 14,
  },
  locationDropdown: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  locationOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  locationOptionName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationOptionDesc: {
    fontSize: 13,
  },
  locationDisplay: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    minHeight: 56,
    marginBottom: spacing.sm,
  },
  locationDisplayContent: {
    flex: 1,
  },
  addPlaceButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  addPlaceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleOptionsButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  toggleOptionsText: {
    fontSize: 13,
  },
});
