export const lightTheme = {
  background: '#F0F0F0',
  primaryLight: '#C9E7E4',
  primary: '#86CAC3',
  primaryMedium: '#77BEB7',
  primaryDark: '#74B7B1',

  // Semantic colors
  text: {
    primary: '#1A1A1A',
    secondary: '#444444',
    tertiary: '#5A5A5A',
    inverse: '#FFFFFF',
  },

  // UI elements
  card: '#FFFFFF',
  cardBorder: '#E5E5E5',
  shadow: 'rgba(0, 0, 0, 0.08)',

  // Status
  error: '#FF3B30',
  success: '#34C759',
} as const;

export const darkTheme = {
  background: '#121212',
  primaryLight: '#C9E7E4',
  primary: '#86CAC3',
  primaryMedium: '#77BEB7',
  primaryDark: '#74B7B1',

  // Semantic colors
  text: {
    primary: '#FFFFFF',
    secondary: '#D4D4D4',
    tertiary: '#ABABAB',
    inverse: '#1A1A1A',
  },

  // UI elements
  card: '#1C1C1E',
  cardBorder: '#38383A',
  shadow: 'rgba(0, 0, 0, 0.3)',

  // Status
  error: '#FF453A',
  success: '#32D74B',
} as const;

// Default to light theme for backward compatibility
export const colors = lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  title: {
    fontSize: 30,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  heading: {
    fontSize: 21,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 23,
  },
  caption: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 19,
  },
  small: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 17,
  },
} as const;

export const logoSizes = {
  small: 22,
  medium: 32,
  large: 48,
} as const;
