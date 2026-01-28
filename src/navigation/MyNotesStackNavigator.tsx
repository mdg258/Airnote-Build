import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyNotesScreen } from '../screens/MyNotesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type MyNotesStackParamList = {
  MyNotesMain: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MyNotesStackParamList>();

export const MyNotesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyNotesMain" component={MyNotesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
