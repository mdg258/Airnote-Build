import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TabNavigator } from './src/navigation/TabNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
