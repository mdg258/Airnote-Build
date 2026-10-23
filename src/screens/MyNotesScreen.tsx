import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/colors';
import { privateNotesService } from '../services/privateNotesService';
import { Note, Duration, Radius } from '../types/note';
import { formatTimeLeft, getLocationOptions } from '../utils/location';
import { MyNotesStackParamList } from '../navigation/MyNotesStackNavigator';

type MyNotesScreenNavigationProp = NativeStackNavigationProp<MyNotesStackParamList, 'MyNotesMain'>;

export const MyNotesScreen: React.FC = () => {
  const { theme, textScale } = useTheme();
  const navigation = useNavigation<MyNotesScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [groupedNotes, setGroupedNotes] = useState<
    Map<string, Array<Note & { timeLeft: number }>>
  >(new Map());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);

  useEffect(() => {
    loadNotes();
    getCurrentLocation();
    // Refresh notes every 30 seconds to update time left
    const interval = setInterval(loadNotes, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotes = () => {
    const notes = privateNotesService.getPrivateNotesGroupedByPlace();
    setGroupedNotes(notes);
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);

      // Load location options
      const options = await getLocationOptions(coords.latitude, coords.longitude);
      setLocationOptions(options);
      setSelectedLocation(options[0]);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleCreatePrivateNote = async () => {
    if (!noteText.trim() || !selectedLocation) return;

    try {
      // Create private note with quiet save (no animation)
      privateNotesService.createPrivateNote({
        text: noteText.trim(),
        location: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        },
        placeName: selectedLocation.name,
        placeAddress: selectedLocation.description,
        placeId: selectedLocation.id,
        radius: 15.24, // 50ft default
        duration: '24h', // 24h default for private notes
        isPrivate: true,
      });

      // Quiet close - no animation
      setNoteText('');
      setShowCreateModal(false);
      loadNotes();
    } catch (error) {
      console.error('Error creating private note:', error);
      Alert.alert('Error', 'Failed to create note. Please try again.');
    }
  };

  const handleDeleteNote = (noteId: string, noteText: string) => {
    Alert.alert(
      'Delete Note',
      `Delete "${noteText.substring(0, 50)}${noteText.length > 50 ? '...' : ''}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            privateNotesService.deletePrivateNote(noteId);
            loadNotes();
          },
        },
      ]
    );
  };

  const getTotalNoteCount = () => {
    let count = 0;
    groupedNotes.forEach((notes) => {
      count += notes.length;
    });
    return count;
  };

  const totalNotes = getTotalNoteCount();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with privacy message */}
      <View style={styles.header}>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={12} color={theme.text.tertiary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.title, { color: theme.text.primary, fontSize: 22 * textScale }]}>
            My Notes
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
            Private notes — just for you
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {totalNotes === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={theme.text.tertiary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.text.secondary, fontSize: 16 * textScale }]}>
              No private notes yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
              Create a private note to save location-bound reminders just for yourself
            </Text>
          </View>
        ) : (
          <>
            {Array.from(groupedNotes.entries()).map(([placeName, notes]) => (
              <View key={placeName} style={styles.placeGroup}>
                {/* Place Name Header */}
                <View style={styles.placeHeader}>
                  <Ionicons name="location" size={14} color={theme.text.tertiary} />
                  <Text style={[styles.placeName, { color: theme.text.secondary, fontSize: 15 * textScale }]}>
                    {placeName}
                  </Text>
                  <Text style={[styles.noteCount, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                  </Text>
                </View>

                {/* Notes for this place */}
                {notes.map((note, index) => (
                  <View
                    key={note.id}
                    style={[
                      styles.noteItem,
                      index === notes.length - 1 && styles.lastNoteItem,
                    ]}
                  >
                    <View style={styles.noteContent}>
                      <Text style={[styles.noteText, { color: theme.text.primary, fontSize: 17 * textScale }]}>
                        {note.text}
                      </Text>
                      <Text style={[styles.noteMeta, { color: theme.text.tertiary, fontSize: 13 * textScale }]}>
                        {formatTimeLeft(note.timeLeft)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteNote(note.id, note.text)}
                      style={styles.deleteButton}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.text.tertiary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {currentLocation && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              bottom: 23 + insets.bottom,
              backgroundColor: theme.primaryDark,
            },
          ]}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Create Private Note Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setNoteText('');
              setShowCreateModal(false);
            }}
          />
          <View style={[styles.createNoteCard, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <View style={styles.privacyBadge}>
                <Ionicons name="lock-closed" size={10} color={theme.text.tertiary} />
                <Text style={[styles.privacyText, { color: theme.text.tertiary, fontSize: 12 * textScale }]}>
                  Private
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setNoteText('');
                  setShowCreateModal(false);
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={[styles.closeText, { color: theme.text.tertiary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Location Picker - Natural language */}
            {locationOptions.length > 1 && (
              <TouchableOpacity
                style={styles.locationSection}
                onPress={() => setLocationPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.locationLabel, { color: theme.text.secondary, fontSize: 16 * textScale }]}>
                  {selectedLocation?.name || 'Current Location'}
                </Text>
                {selectedLocation?.description && (
                  <Text style={[styles.locationSubtext, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
                    {selectedLocation.description}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TextInput
              style={[styles.noteInput, { color: theme.text.primary, fontSize: 18 * textScale }]}
              placeholder="Write a private note for this location..."
              placeholderTextColor={theme.text.tertiary}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              maxLength={100}
              autoFocus
            />

            <View style={styles.modalFooter}>
              {noteText.length > 80 && (
                <Text style={[styles.charCount, { color: theme.text.tertiary, fontSize: 12 * textScale }]}>
                  {noteText.length}/100
                </Text>
              )}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: noteText.trim() ? theme.primaryDark : theme.cardBorder,
                    opacity: noteText.trim() ? 1 : 0.4,
                  },
                ]}
                onPress={handleCreatePrivateNote}
                disabled={!noteText.trim()}
                activeOpacity={0.7}
              >
                <Text style={[styles.saveButtonText, { fontSize: 16 * textScale }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Location Picker Modal */}
      <Modal
        visible={locationPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLocationPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.locationModalOverlay}
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
                  setSelectedLocation(location);
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    opacity: 0.2,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  placeGroup: {
    marginBottom: spacing.xl,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
    flex: 1,
  },
  noteCount: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.4,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    gap: spacing.md,
  },
  lastNoteItem: {
    borderBottomWidth: 0,
  },
  noteContent: {
    flex: 1,
    gap: spacing.xs,
  },
  noteText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  noteMeta: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.4,
  },
  deleteButton: {
    padding: spacing.xs,
    marginTop: -2,
  },
  bottomSpacer: {
    height: spacing.xl * 2,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  createNoteCard: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.6,
  },
  closeText: {
    fontSize: 20,
    opacity: 0.4,
  },
  locationSection: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
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
  noteInput: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
  },
  charCount: {
    fontSize: 12,
    opacity: 0.4,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  locationModalOverlay: {
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
