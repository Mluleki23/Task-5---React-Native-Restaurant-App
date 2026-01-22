import { Button, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function UserDashboard() {
  const { logout } = useAuth();

  return (
    <View>
      <Text>User Dashboard</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
