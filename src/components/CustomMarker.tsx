import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

interface CustomMarkerProps {
  coordinate: { latitude: number; longitude: number };
  noteCount: number;
  onPress: () => void;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  noteCount,
  onPress,
}) => {
  const getMarkerColor = (count: number): string => {
    if (count >= 10) return '#FF3B30'; // Red
    if (count >= 5) return '#FF9500';  // Orange
    if (count >= 2) return '#FFCC00';  // Yellow
    return '#74B7B1';                  // Primary teal
  };

  const markerColor = getMarkerColor(noteCount);

  return (
    <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={false}>
      <View style={[styles.markerContainer, { backgroundColor: markerColor }]}>
        {noteCount > 1 ? (
          <Text style={styles.markerText}>{noteCount}</Text>
        ) : (
          <View style={styles.markerDot} />
        )}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
