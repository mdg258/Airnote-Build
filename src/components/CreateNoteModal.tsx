import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Duration, Radius, NoteCategory } from '../types/note';
import { borderRadius } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { getLocationOptions, LocationOption } from '../utils/location';
import { NoteModeSelector } from './NoteModeSelector';
import { LeaveNoteComposer } from './LeaveNoteComposer';
import { SendNoteComposer } from './SendNoteComposer';
import { LeaveNoteCategory } from '../constants/noteTemplates';
import { ReleaseAnimation } from './ReleaseAnimation';

interface CreateNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (
    text: string,
    duration: Duration,
    radius: Radius,
    locationOption: LocationOption,
    category?: NoteCategory
  ) => void;
  currentLatitude: number | null;
  currentLongitude: number | null;
}

type NoteMode = 'leave' | 'send' | null;

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  visible,
  onClose,
  onCreate,
  currentLatitude,
  currentLongitude,
}) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<NoteMode>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [showReleaseAnimation, setShowReleaseAnimation] = useState(false);

  useEffect(() => {
    if (visible && currentLatitude !== null && currentLongitude !== null) {
      loadLocationOptions();
    }
  }, [visible, currentLatitude, currentLongitude]);

  useEffect(() => {
    if (!visible) {
      // Reset mode when modal closes
      setMode(null);
    }
  }, [visible]);

  const loadLocationOptions = async () => {
    if (currentLatitude === null || currentLongitude === null) return;

    try {
      const options = await getLocationOptions(currentLatitude, currentLongitude);
      setLocationOptions(options);
      setSelectedLocation(options[0]);
    } catch (error) {
      console.error('Failed to load location options:', error);
    }
  };

  const handleModeSelect = (selectedMode: 'leave' | 'send') => {
    setMode(selectedMode);
  };

  const handleBack = () => {
    setMode(null);
  };

  const handleLeaveNoteCreate = (
    text: string,
    duration: Duration,
    radius: Radius,
    category: LeaveNoteCategory
  ) => {
    if (!selectedLocation) return;
    onCreate(text, duration, radius, selectedLocation, category);

    // Show release animation
    setShowReleaseAnimation(true);

    // Close modal after animation completes
    setTimeout(() => {
      setShowReleaseAnimation(false);
      setMode(null);
      onClose();
    }, 1800);
  };

  const getLocationCoordinates = () => {
    if (selectedLocation) {
      return {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };
    }
    if (currentLatitude !== null && currentLongitude !== null) {
      return {
        latitude: currentLatitude,
        longitude: currentLongitude,
      };
    }
    return null;
  };

  const handleSendNoteCreate = (text: string, duration: Duration, radius: Radius) => {
    if (!selectedLocation) return;
    onCreate(text, duration, radius, selectedLocation);

    // Show release animation
    setShowReleaseAnimation(true);

    // Close modal after animation completes
    setTimeout(() => {
      setShowReleaseAnimation(false);
      setMode(null);
      onClose();
    }, 1800);
  };

  const handleCancel = () => {
    setMode(null);
    onClose();
  };

  const getLocationName = () => selectedLocation?.name || 'Current Location';
  const getLocationDescription = () => selectedLocation?.description;

  const handleLocationChange = (location: LocationOption) => {
    setSelectedLocation(location);
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
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          {mode === null ? (
            <NoteModeSelector onSelectMode={handleModeSelect} onClose={handleCancel} />
          ) : mode === 'leave' ? (
            <LeaveNoteComposer
              onBack={handleBack}
              onCreate={handleLeaveNoteCreate}
              locationName={getLocationName()}
              locationDescription={getLocationDescription()}
              coordinates={getLocationCoordinates()}
              locationOptions={locationOptions}
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
            />
          ) : (
            <SendNoteComposer
              onBack={handleBack}
              onCreate={handleSendNoteCreate}
              locationName={getLocationName()}
              locationDescription={getLocationDescription()}
              coordinates={getLocationCoordinates()}
            />
          )}

          {/* Release Animation Overlay */}
          {showReleaseAnimation && (
            <ReleaseAnimation />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    height: '95%',
  },
});
