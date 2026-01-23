import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdminDashboard from '../screens/admin/AdminDashboard';
import Analytics from '../screens/admin/Analytics';
import MenuManagement from '../screens/admin/MenuManagement';
import OrdersManagement from '../screens/admin/OrdersManagement';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
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
        name="AdminDashboard" 
        component={AdminDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="MenuManagement" 
        component={MenuManagement}
        options={{ title: 'Menu Management' }}
      />
      <Stack.Screen 
        name="OrdersManagement" 
        component={OrdersManagement}
        options={{ title: 'Orders Management' }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={Analytics}
        options={{ title: 'Analytics' }}
      />
    </Stack.Navigator>
  );
}
