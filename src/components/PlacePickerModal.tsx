import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme/colors';
import { placesService, PlaceWithDistance } from '../services/placesService';
import { formatDistance } from '../utils/location';

interface PlacePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (place: PlaceWithDistance) => void;
  currentLatitude: number | null;
  currentLongitude: number | null;
}

export const PlacePickerModal: React.FC<PlacePickerModalProps> = ({
  visible,
  onClose,
  onSelectPlace,
  currentLatitude,
  currentLongitude,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<PlaceWithDistance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && currentLatitude !== null && currentLongitude !== null) {
      loadNearbyPlaces();
    }
  }, [visible, currentLatitude, currentLongitude]);

  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
    }
  }, [visible]);

  const loadNearbyPlaces = async () => {
    if (currentLatitude === null || currentLongitude === null) return;

    setLoading(true);
    try {
      const nearby = await placesService.nearbyPlaces(currentLatitude, currentLongitude);
      setPlaces(nearby);
    } catch (error) {
      console.error('Failed to load nearby places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (currentLatitude === null || currentLongitude === null) return;

    if (query.trim().length === 0) {
      loadNearbyPlaces();
      return;
    }

    if (query.trim().length < 2) return;

    setLoading(true);
    try {
      const results = await placesService.searchPlaces(query, currentLatitude, currentLongitude);
      setPlaces(results);
    } catch (error) {
      console.error('Failed to search places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = (place: PlaceWithDistance) => {
    onSelectPlace(place);
    setSearchQuery('');
    onClose();
  };

  const renderPlace = ({ item }: { item: PlaceWithDistance }) => {
    const isTooFar = item.distance > 100; // 100 meters

    return (
      <TouchableOpacity
        style={[
          styles.placeItem,
          { borderBottomColor: theme.cardBorder },
          isTooFar && { opacity: 0.5 },
        ]}
        onPress={() => handleSelectPlace(item)}
        activeOpacity={0.7}
        disabled={isTooFar}
      >
        <View style={styles.placeIconContainer}>
          <Text style={styles.placeIcon}>📍</Text>
        </View>
        <View style={styles.placeInfo}>
          <Text style={[styles.placeName, { color: theme.text.primary }]}>{item.name}</Text>
          <Text style={[styles.placeDetails, { color: theme.text.secondary }]}>
            {item.address || item.neighborhood}
            {item.category && ` · ${item.category}`}
          </Text>
          {isTooFar && (
            <Text style={[styles.tooFarMessage, { color: theme.text.tertiary }]}>
              Move closer to tag this place
            </Text>
          )}
        </View>
        <Text style={[styles.placeDistance, { color: theme.text.tertiary }]}>
          {formatDistance(item.distance)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={[styles.listHeaderText, { color: theme.text.secondary }]}>
        {searchQuery.trim() ? 'Search Results' : 'Nearby Places'}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: theme.text.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Add Location</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.background,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: theme.text.primary }]}
              placeholder="Search places..."
              placeholderTextColor={theme.text.tertiary}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
                <Text style={[styles.clearIcon, { color: theme.text.tertiary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Places List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primaryDark} />
            <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
              {searchQuery.trim() ? 'Searching...' : 'Loading nearby places...'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={places}
            renderItem={renderPlace}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                  {searchQuery.trim() ? 'No places found' : 'No nearby places'}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    minWidth: 60,
  },
  closeText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearIcon: {
    fontSize: 18,
  },
  listContent: {
    flexGrow: 1,
  },
  listHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  placeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  placeIcon: {
    fontSize: 20,
  },
  placeInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  placeDetails: {
    fontSize: 14,
  },
  tooFarMessage: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  placeDistance: {
    fontSize: 13,
    minWidth: 50,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
  },
});
