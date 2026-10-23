import React, { createContext, useContext, useState, ReactNode } from 'react';
import { lightTheme, darkTheme } from '../theme/colors';

type Theme = typeof lightTheme | typeof darkTheme;
type ThemeMode = 'light' | 'dark';
type TextSize = 'medium' | 'large' | 'extra-large' | 'extra-extra-large';

const TEXT_SIZE_SCALES: Record<TextSize, number> = {
  'medium': 1.0,
  'large': 1.15,
  'extra-large': 1.3,
  'extra-extra-large': 1.5,
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  textScale: number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [textSize, setTextSize] = useState<TextSize>('large');

  const theme = themeMode === 'light' ? lightTheme : darkTheme;
  const textScale = TEXT_SIZE_SCALES[textSize];

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, textSize, setTextSize, textScale }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
