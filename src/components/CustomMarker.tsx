import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();

  return (
    <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={false}>
      <View style={[styles.markerContainer, {
        backgroundColor: theme.primaryDark,
        borderColor: theme.background,
      }]}>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});
