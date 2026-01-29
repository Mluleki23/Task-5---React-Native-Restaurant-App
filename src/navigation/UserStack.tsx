import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React from 'react';

import Cart from '../screens/user/Cart';

import Checkout from '../screens/user/Checkout';

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

      <Stack.Screen 

        name="Cart" 

        component={Cart}

        options={{ title: 'Cart' }}

      />

      <Stack.Screen 

        name="Checkout" 

        component={Checkout}

        options={{ title: 'Checkout' }}

      />

    </Stack.Navigator>

  );

}

