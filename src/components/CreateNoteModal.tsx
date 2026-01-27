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
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface CreateNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (text: string, duration: Duration, radius: Radius) => void;
}

const DURATIONS: Duration[] = ['15m', '30m', '1h', '4h', '24h'];
const RADII: Radius[] = [10, 25, 50, 100];

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [text, setText] = useState('');
  const [duration, setDuration] = useState<Duration>('1h');
  const [radius, setRadius] = useState<Radius>(25);

  const handlePost = () => {
    if (text.trim().length === 0) return;
    onCreate(text.trim(), duration, radius);
    setText('');
    setDuration('1h');
    setRadius(25);
    onClose();
  };

  const handleCancel = () => {
    setText('');
    setDuration('1h');
    setRadius(25);
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
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Note</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Text Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What do you want to say?"
                placeholderTextColor={colors.text.tertiary}
                value={text}
                onChangeText={setText}
                maxLength={200}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{text.length}/200</Text>
            </View>

            {/* Duration Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.optionsRow}>
                {DURATIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.option, duration === d && styles.optionSelected]}
                    onPress={() => setDuration(d)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        duration === d && styles.optionTextSelected,
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
              <Text style={styles.label}>Radius</Text>
              <View style={styles.optionsRow}>
                {RADII.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.option, radius === r && styles.optionSelected]}
                    onPress={() => setRadius(r)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        radius === r && styles.optionTextSelected,
                      ]}
                    >
                      {r}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Photo Placeholder */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.photoButton} disabled>
                <Text style={styles.photoButtonText}>📷 Attach Photo (Coming Soon)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Post Button - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.postButton, text.trim().length === 0 && styles.postButtonDisabled]}
              onPress={handlePost}
              disabled={text.trim().length === 0}
            >
              <Text style={styles.postButtonText}>Send Note</Text>
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
    backgroundColor: colors.card,
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
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.secondary,
    padding: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minHeight: 100,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  charCount: {
    ...typography.small,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  optionSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  optionText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.text.inverse,
  },
  photoButton: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    opacity: 0.5,
  },
  photoButtonText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  postButton: {
    backgroundColor: colors.primaryDark,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
  postButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});
