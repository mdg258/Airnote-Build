import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { notesService } from '../services/notesService';
import { Note } from '../types/note';
import { NoteCard } from '../components/NoteCard';

export const ProfileScreen: React.FC = () => {
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

  const renderEmpty = () => (
    <View style={styles.emptyContent}>
      <Text style={styles.placeholderText}>📝</Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>No notes yet</Text>
      <Text style={[styles.description, { color: theme.text.tertiary }]}>
        Your posted notes will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>My Notes</Text>
      </View>
      <FlatList
        data={userNotes}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            timeLeft={item.timeLeft}
            showLocation={true}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={userNotes.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 40,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  emptyList: {
    flex: 1,
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
});
