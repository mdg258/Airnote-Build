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
  const { theme, textScale } = useTheme();

  if (comments.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: theme.text.tertiary, fontSize: 14 * textScale }]}>
          No replies yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {comments.map((comment, index) => (
        <React.Fragment key={comment.id}>
          <View style={styles.commentItem}>
            <Text style={[styles.commentText, { color: theme.text.primary, fontSize: 15 * textScale }]}>
              {comment.text}
            </Text>
            <Text style={[styles.commentTime, { color: theme.text.tertiary, fontSize: 11 * textScale }]}>
              {formatRelativeTime(comment.createdAt)}
            </Text>
          </View>
          {index < comments.length - 1 && (
            <View style={styles.dividerContainer}>
              <View style={[styles.commentDivider, { backgroundColor: theme.primaryDark }]} />
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  commentItem: {
    gap: 6,
    paddingVertical: spacing.sm,
  },
  dividerContainer: {
    paddingVertical: spacing.sm,
  },
  commentDivider: {
    height: 1,
    opacity: 0.15,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    letterSpacing: -0.2,
    opacity: 0.9,
  },
  commentTime: {
    fontSize: 11,
    fontWeight: '400',
    opacity: 0.35,
    letterSpacing: -0.05,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.4,
  },
});
