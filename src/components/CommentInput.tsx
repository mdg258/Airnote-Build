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
  placeholder = 'Add a quiet reply...',
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
  const canSubmit = text.trim().length > 0 && !isOverLimit && !disabled;

  return (
    <View style={styles.container}>
      {disabledMessage && (
        <View style={[styles.disabledBanner, { backgroundColor: theme.background }]}>
          <Text style={[styles.disabledText, { color: theme.text.tertiary, fontSize: 12 * textScale }]}>
            {disabledMessage}
          </Text>
        </View>
      )}
      <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
        <TextInput
          style={[
            styles.input,
            { color: theme.text.primary, fontSize: 17 * textScale },
            disabled && styles.disabledInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.text.secondary}
          value={text}
          onChangeText={setText}
          maxLength={100}
          editable={!disabled}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        {canSubmit && (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primaryDark }]}
            onPress={handleSubmit}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.xl,
    paddingTop: spacing.md,
  },
  disabledBanner: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  disabledText: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.6,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    padding: 0,
    margin: 0,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  disabledInput: {
    opacity: 0.4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
