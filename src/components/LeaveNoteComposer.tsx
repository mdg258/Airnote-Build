import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme/colors';
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
}

export const LeaveNoteComposer: React.FC<LeaveNoteComposerProps> = ({
  onBack,
  onCreate,
  locationName,
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [category, setCategory] = useState<LeaveNoteCategory>('info');

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
        <View style={styles.headerContent}>
          <Text style={[styles.locationName, { color: theme.text.primary }]} numberOfLines={1}>
            {locationName}
          </Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {LEAVE_NOTE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: category === cat.id ? cat.color : theme.background,
                  borderColor: category === cat.id ? cat.color : theme.cardBorder,
                },
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: category === cat.id ? '#FFFFFF' : theme.text.secondary,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Text Input */}
        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.background,
                color: theme.text.primary,
              },
            ]}
            placeholder="What should people know?"
            placeholderTextColor={theme.text.tertiary}
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

        {/* Footer Info */}
        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={theme.text.tertiary} />
            <Text style={[styles.infoText, { color: theme.text.tertiary }]}>300ft radius</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={theme.text.tertiary} />
            <Text style={[styles.infoText, { color: theme.text.tertiary }]}>1 hour</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: text.trim() ? selectedCategory?.color || '#4A90E2' : theme.cardBorder,
            },
          ]}
          onPress={handleSubmit}
          disabled={!text.trim()}
          activeOpacity={0.7}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  categoryContainer: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.sm,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputSection: {
    gap: spacing.xs,
  },
  textInput: {
    fontSize: 17,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    fontSize: 13,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  submitButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
