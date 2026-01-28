import React, { createContext, useContext, useState, ReactNode } from 'react';
import { lightTheme, darkTheme } from '../theme/colors';

type Theme = typeof lightTheme;
type ThemeMode = 'light' | 'dark';
type TextSize = 'small' | 'medium' | 'large' | 'extra-large';

const TEXT_SIZE_SCALES: Record<TextSize, number> = {
  'small': 0.9,
  'medium': 1.0,
  'large': 1.1,
  'extra-large': 1.2,
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
  const [textSize, setTextSize] = useState<TextSize>('medium');

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
