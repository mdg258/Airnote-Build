import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = 'Add a comment...',
  disabled = false,
  disabledMessage,
}) => {
  const { theme, textScale } = useTheme();
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  const isOverLimit = text.length > 100;
  const isNearLimit = text.length >= 80;
  const canSubmit = text.trim().length > 0 && !isOverLimit && !disabled;

  const charCountColor = isOverLimit
    ? '#E74C3C'
    : isNearLimit
    ? theme.primaryDark
    : theme.text.tertiary;

  return (
    <View style={styles.container}>
      {disabledMessage && (
        <View style={[styles.disabledBanner, { backgroundColor: theme.primaryDark + '15' }]}>
          <Ionicons name="information-circle" size={16} color={theme.primaryDark} />
          <Text style={[styles.disabledText, { color: theme.primaryDark, fontSize: 13 * textScale }]}>
            {disabledMessage}
          </Text>
        </View>
      )}
      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <TextInput
          style={[
            styles.input,
            { color: theme.text.primary, fontSize: 15 * textScale },
            disabled && styles.disabledInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.text.tertiary + '80'}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={110} // Allow typing slightly over to show error state
          editable={!disabled}
          textAlignVertical="top"
        />
        <View style={styles.inputFooter}>
          <Text style={[styles.charCount, { color: charCountColor, fontSize: 12 * textScale }]}>
            {text.length}/100
          </Text>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: canSubmit ? theme.primaryDark : theme.cardBorder,
                opacity: canSubmit ? 1 : 0.5,
              },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.lg,
    paddingTop: spacing.sm,
  },
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  disabledText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: spacing.sm,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    minHeight: 40,
    maxHeight: 80,
    padding: 0,
    margin: 0,
  },
  disabledInput: {
    opacity: 0.5,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
