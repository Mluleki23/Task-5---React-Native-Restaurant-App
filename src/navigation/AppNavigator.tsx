import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import AdminDashboard from "../screens/admin/AdminDashboard";
import Analytics from "../screens/admin/Analytics";
import MenuManagement from "../screens/admin/MenuManagement";
import OrdersManagement from "../screens/admin/OrdersManagement";
import Cart from "../screens/user/Cart";
import Checkout from "../screens/user/Checkout";
import ProfileScreen from "../screens/user/ProfileScreen";
import UserDashboard from "../screens/user/UserDashboard";
import ViewItem from "../screens/user/ViewItem";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : role === "admin" ? (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="MenuManagement" component={MenuManagement} />
          <Stack.Screen name="OrdersManagement" component={OrdersManagement} />
          <Stack.Screen name="Analytics" component={Analytics} />
        </>
      ) : (
        <>
          <Stack.Screen name="UserDashboard" component={UserDashboard} />
          <Stack.Screen name="ViewItem" component={ViewItem} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="Checkout" component={Checkout} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
