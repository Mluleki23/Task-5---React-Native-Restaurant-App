import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { Text, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import AdminStack from "../src/navigation/AdminStack";
import LoginScreen from "../src/screens/auth/LoginScreen";
import RegisterScreen from "../src/screens/auth/RegisterScreen";

// Import UserStack and CartProvider inline to avoid import issues
const UserStack = require("../src/navigation/UserStack").default;
const { CartProvider } = require("../src/context/CartContext");

const Stack = createNativeStackNavigator();

// Placeholder HomeScreen
function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>🏠 Home Screen</Text>
      <Text>You are logged in!</Text>
    </View>
  );
}

// Root Navigator that switches based on user login
function RootNavigator() {
  const { user, role } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // If user is logged in, show appropriate dashboard based on role
        role === "admin" ? (
          <Stack.Screen name="AdminStack" component={AdminStack} />
        ) : (
          <Stack.Screen name="UserStack" component={UserStack} />
        )
      ) : (
        // Otherwise, show Auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Main App
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
