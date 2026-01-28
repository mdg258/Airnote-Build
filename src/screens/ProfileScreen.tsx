import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { notesService } from '../services/notesService';
import { commentsService } from '../services/commentsService';
import { Note } from '../types/note';
import { formatTimeLeft } from '../utils/location';
import { NoteDetailModal } from '../components/NoteDetailModal';
import { useLocation } from '../hooks/useLocation';

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
  const location = useLocation();
  const [userNotes, setUserNotes] = useState<Array<Note & { timeLeft: number }>>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedNote, setSelectedNote] = useState<(Note & { timeLeft: number; distance?: number }) | null>(null);
  const [noteDetailModalVisible, setNoteDetailModalVisible] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());

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

  // Load comment counts when notes change
  useEffect(() => {
    if (userNotes.length > 0) {
      const noteIds = userNotes.map(n => n.id);
      const counts = commentsService.getCommentCounts(noteIds);
      setCommentCounts(counts);
    }
  }, [userNotes]);

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

  const toggleGroupCollapse = (placeId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  };

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
    const isCollapsed = collapsedGroups.has(group.placeId);

    return (
      <View
        key={group.placeId}
        style={[styles.noteGroup, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      >
        {/* Place Header */}
        <TouchableOpacity
          style={[styles.placeHeader, { backgroundColor: theme.primaryDark + '40' }]}
          onPress={() => toggleGroupCollapse(group.placeId)}
          activeOpacity={0.7}
        >
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
          <View style={styles.placeHeaderRight}>
            <Text style={[styles.noteCount, { color: theme.text.tertiary }]}>
              {group.notes.length} {group.notes.length === 1 ? 'note' : 'notes'}
            </Text>
            <Ionicons
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
              color={theme.text.tertiary}
            />
          </View>
        </TouchableOpacity>

        {/* Notes List */}
        {!isCollapsed && group.notes.map((note, index) => {
          const isLast = index === group.notes.length - 1;
          const commentCount = commentCounts.get(note.id) || 0;

          return (
            <View key={note.id}>
              <TouchableOpacity
                style={styles.noteItem}
                onPress={() => {
                  setSelectedNote(note);
                  setNoteDetailModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.noteText, { color: theme.text.primary }]}>
                  {!note.category && '✈️ '}{note.text}
                </Text>
                <View style={styles.noteMeta}>
                  <Text style={[styles.noteMetaText, { color: theme.text.tertiary }]}>
                    {Math.round(note.radius * 3.28084)}ft · {formatTimeLeft(note.timeLeft)}
                  </Text>
                  {commentCount > 0 && (
                    <>
                      <Text style={[styles.noteMetaText, { color: theme.text.tertiary }]}> · </Text>
                      <Text style={[styles.noteMetaText, { color: theme.primaryDark }]}>
                        {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
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

      {/* Note Detail Modal */}
      <NoteDetailModal
        visible={noteDetailModalVisible}
        onClose={() => {
          setNoteDetailModalVisible(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
        userLatitude={location.latitude}
        userLongitude={location.longitude}
        onCommentAdded={loadUserNotes}
      />
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
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 14,
    lineHeight: 18,
  },
  placeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  noteItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noteText: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '400',
    marginBottom: spacing.xs,
  },
  noteMeta: {
    flexDirection: 'row',
  },
  noteMetaText: {
    fontSize: 14,
    lineHeight: 18,
  },
  noteDivider: {
    height: 0.5,
    marginLeft: spacing.md,
  },
});
