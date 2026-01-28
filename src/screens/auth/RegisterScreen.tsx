import { useState } from "react";
// Import React Native components inline to avoid TypeScript conflicts
const {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
} = require("react-native");

import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState<any>({});

  const handleRegister = async () => {
    try {
      // Basic validation
      if (!form.email || !form.password) {
        Alert.alert("Error", "Email and password are required");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }

      // Call register function
      await register(form.email.trim(), form.password, form);

      // Navigate to Login after successful registration
      Alert.alert("Success", "Registration complete! Please login.");
      navigation.navigate("Login");
    } catch (err: any) {
      Alert.alert("Registration Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>🍽️</Text>
        <Text style={styles.logoBrand}>FoodApp</Text>
      </View>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        placeholder="Name"
        onChangeText={(t: string) => setForm({ ...form, name: t })}
        style={styles.input}
      />
      <TextInput
        placeholder="Surname"
        onChangeText={(t: string) => setForm({ ...form, surname: t })}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(t: string) => setForm({ ...form, email: t.trim() })}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={(t: string) => setForm({ ...form, password: t })}
        style={styles.input}
      />
      <TextInput
        placeholder="Contact Number"
        keyboardType="phone-pad"
        onChangeText={(t: string) => setForm({ ...form, contactNumber: t })}
        style={styles.input}
      />
      <TextInput
        placeholder="Address"
        onChangeText={(t: string) => setForm({ ...form, address: t })}
        style={styles.input}
      />
      <TextInput
        placeholder="Card Number"
        keyboardType="number-pad"
        onChangeText={(t: string) => setForm({ ...form, cardNumber: t })}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    color: "#555",
  },
});
