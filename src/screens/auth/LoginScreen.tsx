import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
// Import React Native components inline to avoid TypeScript conflicts
const {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} = require("react-native");

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>🍽️</Text>
        <Text style={styles.logoBrand}>FoodApp</Text>
      </View>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  logoPlaceholder: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 60,
    marginBottom: 10,
  },
  logoBrand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    marginTop: 15,
    color: "#555",
  },
});
