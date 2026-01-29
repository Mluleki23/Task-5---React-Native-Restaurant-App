import React, { useState } from "react";

import {
    Alert,
    StyleSheet,
    Text,

    TextInput,

    TouchableOpacity,
    View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";



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

  },

  title: {

    fontSize: 26,

    fontWeight: "bold",

    marginBottom: 30,

    textAlign: "center",

  },

  input: {

    borderWidth: 1,

    borderColor: "#ccc",

    borderRadius: 8,

    padding: 12,

    marginBottom: 12,

  },

  button: {

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

