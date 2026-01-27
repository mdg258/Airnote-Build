import React, { useState } from 'react';
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
} from 'react-native';
import { Duration, Radius } from '../types/note';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface CreateNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (text: string, duration: Duration, radius: Radius) => void;
}

const DURATIONS: Duration[] = ['15m', '30m', '1h', '4h', '24h'];
const RADII: Radius[] = [9.14, 22.86, 45.72, 91.44];

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [duration, setDuration] = useState<Duration>('1h');
  const [radius, setRadius] = useState<Radius>(22.86);

  const handlePost = () => {
    if (text.trim().length === 0) return;
    onCreate(text.trim(), duration, radius);
    setText('');
    setDuration('1h');
    setRadius(22.86);
    onClose();
  };

  const handleCancel = () => {
    setText('');
    setDuration('1h');
    setRadius(22.86);
    onClose();
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
});
