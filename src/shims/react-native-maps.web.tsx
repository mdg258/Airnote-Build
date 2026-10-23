import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';

// Web stand-in for react-native-maps (native-only). Wired up in metro.config.js.

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

class MapView extends React.Component<ViewProps & Record<string, any>> {
  fitToCoordinates() {}
  animateToRegion() {}
  animateCamera() {}

  render() {
    const { style } = this.props;
    return (
      <View style={[style, styles.placeholder]}>
        <Text style={styles.text}>Map is available on iOS and Android</Text>
      </View>
    );
  }
}

export const Marker = (_props: Record<string, any>) => null;
export const Circle = (_props: Record<string, any>) => null;

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EEED',
  },
  text: {
    color: '#5A5A5A',
    fontSize: 14,
  },
});

export default MapView;
