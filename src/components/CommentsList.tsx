import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Comment } from '../types/note';
import { spacing } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface CommentsListProps {
  comments: Comment[];
}

// Helper to format relative timestamp
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  const { theme } = useTheme();

  if (comments.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: theme.text.tertiary }]}>
          No comments yet
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.text.tertiary }]}>
          Be the first to comment
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {comments.map((comment, index) => (
        <View
          key={comment.id}
          style={[
            styles.commentItem,
            { backgroundColor: theme.background, borderColor: theme.cardBorder },
            index === comments.length - 1 && { marginBottom: 0 },
          ]}
        >
          <Text style={[styles.commentText, { color: theme.text.primary }]}>
            {comment.text}
          </Text>
          <Text style={[styles.commentTime, { color: theme.text.tertiary }]}>
            {formatRelativeTime(comment.createdAt)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs,
  },
  commentItem: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 0.5,
    marginBottom: spacing.sm,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  commentTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
});
