import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlaceGroup } from '../types/note';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme/colors';
import { formatDistance } from '../utils/location';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MapBottomDrawerProps {
  placeGroups: PlaceGroup[];
  onPlacePress: (place: PlaceGroup) => void;
  sortMode: 'distance' | 'recent';
  onSortChange: (mode: 'distance' | 'recent') => void;
}

export const MapBottomDrawer: React.FC<MapBottomDrawerProps> = ({
  placeGroups,
  onPlacePress,
  sortMode,
  onSortChange,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  const sortedPlaceGroups = React.useMemo(() => {
    if (sortMode === 'distance') {
      return [...placeGroups].sort((a, b) => a.closestDistance - b.closestDistance);
    }
    return placeGroups;
  }, [placeGroups, sortMode]);

  const renderPlaceItem = useCallback(
    ({ item }: { item: PlaceGroup }) => (
      <TouchableOpacity
        style={[styles.placeItem, { borderBottomColor: theme.cardBorder }]}
        onPress={() => {
          onPlacePress(item);
          setIsExpanded(false);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.placeItemContent}>
          <Text style={[styles.placeTitle, { color: theme.text.primary }]} numberOfLines={1}>
            {item.placeName}
          </Text>
          {item.placeAddress && (
            <Text style={[styles.placeSubtitle, { color: theme.text.secondary }]} numberOfLines={1}>
              {item.placeAddress}
            </Text>
          )}
          <Text style={[styles.placeMetadata, { color: theme.text.tertiary }]}>
            {formatDistance(item.closestDistance)} • {item.noteCount} {item.noteCount === 1 ? 'note' : 'notes'}
          </Text>
        </View>
        <View style={styles.chevronContainer}>
          <Text style={[styles.chevron, { color: theme.text.tertiary }]}>›</Text>
        </View>
      </TouchableOpacity>
    ),
    [theme, onPlacePress]
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          maxHeight: isExpanded ? '70%' : undefined,
        },
      ]}
      edges={['bottom']}
    >
      <TouchableOpacity
        style={[styles.header, { borderBottomColor: theme.cardBorder }]}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.handleBar} />
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            Nearby notes • {placeGroups.length} {placeGroups.length === 1 ? 'place' : 'places'}
          </Text>
          <Text style={[styles.chevron, { color: theme.text.secondary }]}>
            {isExpanded ? '⌄' : '⌃'}
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View style={styles.filterContainer}>
            <View style={[styles.chip, { backgroundColor: theme.background }]}>
              <Text style={[styles.chipText, { color: theme.text.secondary }]}>Within 1 mi</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: sortMode === 'distance' ? theme.primaryDark : theme.background,
                },
              ]}
              onPress={() => onSortChange(sortMode === 'distance' ? 'recent' : 'distance')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: sortMode === 'distance' ? '#FFFFFF' : theme.text.secondary,
                    fontWeight: sortMode === 'distance' ? '600' : '400',
                  },
                ]}
              >
                {sortMode === 'distance' ? 'Closest' : 'Recent'}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={sortedPlaceGroups}
            renderItem={renderPlaceItem}
            keyExtractor={(item) => item.placeId}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                  No nearby notes
                </Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  chipText: {
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  placeItemContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  placeSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  placeMetadata: {
    fontSize: 13,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
