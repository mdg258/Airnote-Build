import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { notesService } from '../services/notesService';
import { Note } from '../types/note';
import { NoteCard } from '../components/NoteCard';

interface ProfileScreenProps {
  navigation: any;
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
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text.primary} />
        </TouchableOpacity>
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
