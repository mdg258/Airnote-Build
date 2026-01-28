import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { notesService } from '../services/notesService';
import { Note } from '../types/note';
import { formatTimeLeft } from '../utils/location';
import { LEAVE_NOTE_CATEGORIES } from '../constants/noteTemplates';

interface ProfileScreenProps {
  navigation: any;
}

interface NoteGroup {
  placeId: string;
  placeName: string;
  placeAddress?: string;
  notes: Array<Note & { timeLeft: number }>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [userNotes, setUserNotes] = useState<Array<Note & { timeLeft: number }>>([]);

  const loadUserNotes = () => {
    const notes = notesService.getUserNotes();
    setUserNotes(notes);
  };

  useEffect(() => {
    // Load notes on mount
    loadUserNotes();

    // Refresh notes every 10 seconds
    const interval = setInterval(loadUserNotes, 10000);

    return () => clearInterval(interval);
  }, []);

  // Group notes by place
  const noteGroups = useMemo(() => {
    const groups = new Map<string, NoteGroup>();

    userNotes.forEach(note => {
      const key = note.placeId || note.placeName || 'unknown';

      if (!groups.has(key)) {
        groups.set(key, {
          placeId: key,
          placeName: note.placeName || 'Unknown Location',
          placeAddress: note.placeAddress,
          notes: [],
        });
      }

      groups.get(key)!.notes.push(note);
    });

    return Array.from(groups.values());
  }, [userNotes]);

  const renderEmpty = () => (
    <View style={styles.emptyContent}>
      <Text style={styles.placeholderText}>📝</Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>No notes yet</Text>
      <Text style={[styles.description, { color: theme.text.tertiary }]}>
        Your posted notes will appear here
      </Text>
    </View>
  );

  const renderNoteGroup = (group: NoteGroup) => {
    const categoryInfo = (noteCategory: string | undefined) =>
      noteCategory ? LEAVE_NOTE_CATEGORIES.find(cat => cat.id === noteCategory) : null;

    return (
      <View
        key={group.placeId}
        style={[styles.noteGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      >
        {/* Place Header */}
        <View style={styles.placeHeader}>
          <View style={styles.placeInfo}>
            <Text style={[styles.placeName, { color: theme.text.primary }]}>
              📍 {group.placeName}
            </Text>
            {group.placeAddress && (
              <Text style={[styles.placeAddress, { color: theme.text.tertiary }]} numberOfLines={1}>
                {group.placeAddress}
              </Text>
            )}
          </View>
          <Text style={[styles.noteCount, { color: theme.text.tertiary }]}>
            {group.notes.length} {group.notes.length === 1 ? 'note' : 'notes'}
          </Text>
        </View>

        {/* Notes List */}
        {group.notes.map((note, index) => {
          const catInfo = categoryInfo(note.category);
          const isLast = index === group.notes.length - 1;

          return (
            <View key={note.id}>
              <View style={styles.noteItem}>
                <View style={styles.noteContent}>
                  {catInfo && (
                    <View style={[styles.noteCategoryBadge, { backgroundColor: catInfo.color + '15' }]}>
                      <Text style={styles.noteCategoryEmoji}>{catInfo.icon}</Text>
                    </View>
                  )}
                  <Text style={[styles.noteText, { color: theme.text.primary }]}>
                    {note.text}
                  </Text>
                </View>
                <View style={styles.noteMeta}>
                  <Text style={[styles.noteMetaText, { color: theme.text.tertiary }]}>
                    {Math.round(note.radius * 3.28084)}ft · {formatTimeLeft(note.timeLeft)}
                  </Text>
                </View>
              </View>
              {!isLast && <View style={[styles.noteDivider, { backgroundColor: theme.cardBorder }]} />}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>My Notes</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text.primary} />
        </TouchableOpacity>
      </View>
      {userNotes.length === 0 ? (
        renderEmpty()
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {noteGroups.map(renderNoteGroup)}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 40,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.heading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
  },
  noteGroup: {
    marginHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 12,
    lineHeight: 16,
  },
  noteCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  noteCategoryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  noteCategoryEmoji: {
    fontSize: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  noteMeta: {
    paddingLeft: 26,
  },
  noteMetaText: {
    fontSize: 12,
    lineHeight: 16,
  },
  noteDivider: {
    height: 0.5,
    marginLeft: spacing.md,
  },
});
