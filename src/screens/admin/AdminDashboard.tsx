import { signOut } from "firebase/auth";
import { Button, StyleSheet, Text, View } from "react-native";
import { auth } from "../../services/firebase";

export default function AdminDashboard() {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.item}>📋 Manage Users</Text>
        <Text style={styles.item}>🍔 Manage Menu Items</Text>
        <Text style={styles.item}>📦 View Orders</Text>
        <Text style={styles.item}>⚙️ App Settings</Text>
      </View>

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  item: {
    fontSize: 18,
    marginBottom: 10,
  },
});
