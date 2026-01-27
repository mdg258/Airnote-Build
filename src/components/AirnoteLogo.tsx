import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { logoSizes } from '../theme/colors';

type LogoSize = 'small' | 'medium' | 'large';

interface AirnoteLogoProps {
  size: LogoSize;
}

export const AirnoteLogo: React.FC<AirnoteLogoProps> = ({ size }) => {
  const dimension = logoSizes[size];

  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[styles.logo, { width: dimension, height: dimension, borderRadius: dimension * 0.22 }]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    overflow: 'hidden',
  },
});
