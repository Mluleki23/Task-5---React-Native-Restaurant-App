import { View, TextInput, Button } from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState<any>({});

  return (
    <View>
      <TextInput
        placeholder="Name"
        onChangeText={(t) => setForm({ ...form, name: t })}
      />
      <TextInput
        placeholder="Surname"
        onChangeText={(t) => setForm({ ...form, surname: t })}
      />
      <TextInput
        placeholder="Email"
        onChangeText={(t) => setForm({ ...form, email: t })}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={(t) => setForm({ ...form, password: t })}
      />
      <TextInput
        placeholder="Contact Number"
        onChangeText={(t) => setForm({ ...form, contactNumber: t })}
      />
      <TextInput
        placeholder="Address"
        onChangeText={(t) => setForm({ ...form, address: t })}
      />
      <TextInput
        placeholder="Card Number"
        onChangeText={(t) => setForm({ ...form, cardNumber: t })}
      />

      <Button
        title="Register"
        onPress={() => register(form.email, form.password, form)}
      />
    </View>
  );
}
