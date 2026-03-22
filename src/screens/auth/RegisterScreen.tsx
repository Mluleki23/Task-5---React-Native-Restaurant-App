import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((current: any) => ({ ...current, [field]: value }));
  };

  const handleRegister = async () => {
    try {
      if (!form.email || !form.password) {
        Alert.alert("Error", "Email and password are required");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }

      setIsSubmitting(true);
      await register(form.email.trim(), form.password, form);

      Alert.alert("Success", "Registration complete! Please login.");
      navigation.navigate("Login");
    } catch (err: any) {
      Alert.alert("Registration Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    placeholder: string,
    field: string,
    options?: {
      keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
      secureTextEntry?: boolean;
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
      autoCorrect?: boolean;
      multiline?: boolean;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, options?.multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor="#9aa3ad"
        value={form[field] || ""}
        onChangeText={(text) =>
          updateField(field, field === "email" ? text.trim() : text)
        }
        keyboardType={options?.keyboardType}
        secureTextEntry={options?.secureTextEntry}
        autoCapitalize={options?.autoCapitalize ?? "words"}
        autoCorrect={options?.autoCorrect ?? false}
        multiline={options?.multiline}
        textAlignVertical={options?.multiline ? "top" : "center"}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Create Account</Text>
          <Text style={styles.title}>Register to start ordering</Text>
          <Text style={styles.subtitle}>
            Add your details once so checkout and delivery are faster.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderInput("First Name", "Enter your first name", "name")}
            </View>
            <View style={styles.halfWidth}>
              {renderInput("Surname", "Enter your surname", "surname")}
            </View>
          </View>
          {renderInput("Email Address", "Enter your email", "email", {
            keyboardType: "email-address",
            autoCapitalize: "none",
          })}
          {renderInput("Password", "Create a password", "password", {
            secureTextEntry: true,
            autoCapitalize: "none",
          })}

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
            Contact Details
          </Text>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderInput("Contact Number", "Enter your phone number", "contactNumber", {
                keyboardType: "phone-pad",
                autoCapitalize: "none",
              })}
            </View>
            <View style={styles.halfWidth}>
              {renderInput("Card Number", "Optional card", "cardNumber", {
                keyboardType: "number-pad",
                autoCapitalize: "none",
              })}
            </View>
          </View>
          {renderInput("Delivery Address", "Enter your full delivery address", "address", {
            multiline: true,
          })}

          <Button
            title={isSubmitting ? "Creating Account..." : "Register"}
            onPress={handleRegister}
            disabled={isSubmitting}
            style={styles.registerButton}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#eef2f6",
  },
  content: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "#1f2933",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#ffb199",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#d9e2ec",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: 14,
  },
  sectionSpacing: {
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#52606d",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#d9e2ec",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1f2933",
  },
  multilineInput: {
    minHeight: 110,
  },
  registerButton: {
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 16,
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff6347",
  },
});
