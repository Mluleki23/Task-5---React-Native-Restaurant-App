import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { Text, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import LoginScreen from "../src/screens/auth/LoginScreen";
import RegisterScreen from "../src/screens/auth/RegisterScreen";

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
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // If user is logged in, show HomeScreen
        <Stack.Screen name="Home" component={HomeScreen} />
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
      <RootNavigator />
    </AuthProvider>
  );
}
