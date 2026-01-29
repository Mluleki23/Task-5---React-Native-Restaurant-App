import { Alert, Button, TextInput, View } from "react-native";

import { useState } from "react";

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

    <View style={{ padding: 20 }}>

      <TextInput

        placeholder="Name"

        onChangeText={(t) => setForm({ ...form, name: t })}

        style={{

          marginBottom: 10,

          borderWidth: 1,

          padding: 10,

          borderRadius: 8,

        }}

      />

      <TextInput

        placeholder="Surname"

        onChangeText={(t) => setForm({ ...form, surname: t })}

        style={{

          marginBottom: 10,

          borderWidth: 1,

          padding: 10,

          borderRadius: 8,

        }}

      />

      <TextInput

        placeholder="Email"

        keyboardType="email-address"

        autoCapitalize="none"

        autoCorrect={false}

        onChangeText={(t) => setForm({ ...form, email: t.trim() })}

        style={{

          marginBottom: 10,

          borderWidth: 1,

          padding: 10,

          borderRadius: 8,

        }}

      />

      <TextInput

        placeholder="Password"

        secureTextEntry

        onChangeText={(t) => setForm({ ...form, password: t })}

        style={{

          marginBottom: 10,

          borderWidth: 1,

          padding: 10,

          borderRadius: 8,

        }}

      />

      <TextInput

        placeholder="Contact Number"

        keyboardType="phone-pad"

        onChangeText={(t) => setForm({ ...form, contactNumber: t })}

        style={{

          marginBottom: 10,

          borderWidth: 1,

          padding: 10,

          borderRadius: 8,

        }}

      />

      <TextInput

        placeholder="Address"

        onChangeText={(t) => setForm({ ...form, address: t })}

        style={{

          marginBottom: 10,

          borderWidth: 1,

          padding: 10,

          borderRadius: 8,

        }}

      />

      <TextInput

        placeholder="Card Number"

        keyboardType="number-pad"

        onChangeText={(t) => setForm({ ...form, cardNumber: t })}

        style={{

          marginBottom: 20,

          borderWidth: 1,

          padding: 10,

          borderRadius: 8,

        }}

      />



      <Button title="Register" onPress={handleRegister} />

    </View>

  );

}

