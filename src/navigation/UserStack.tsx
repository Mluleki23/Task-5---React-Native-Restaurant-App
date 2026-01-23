import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import UserDashboard from '../screens/user/UserDashboard';
import ViewItem from '../screens/user/ViewItem';

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ff6b6b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="UserDashboard" 
        component={UserDashboard}
        options={{ title: 'Menu' }}
      />
      <Stack.Screen 
        name="ViewItem" 
        component={ViewItem}
        options={{ title: 'Item Details' }}
      />
    </Stack.Navigator>
  );
}
