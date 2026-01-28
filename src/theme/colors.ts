export const lightTheme = {
  background: '#F0F0F0',
  primaryLight: '#C9E7E4',
  primary: '#86CAC3',
  primaryMedium: '#77BEB7',
  primaryDark: '#74B7B1',

  // Semantic colors
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
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
    secondary: '#B3B3B3',
    tertiary: '#808080',
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
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 34,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

export const logoSizes = {
  small: 22,
  medium: 32,
  large: 48,
} as const;
