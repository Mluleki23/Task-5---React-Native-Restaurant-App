import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

type UserStackParamList = {
  UserDashboard: undefined;
  OrderTracking: { orderId: string };
};

type UserNavigationProp = NativeStackNavigationProp<UserStackParamList>;

const statusTone: Record<Order['status'], string> = {
  pending: '#f59e0b',
  preparing: '#2563eb',
  ready: '#0ea5e9',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function MyOrdersScreen() {
  const navigation = useNavigation<UserNavigationProp>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [user?.uid]);

  const loadOrders = async () => {
    if (!user?.uid) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const userOrders = await orderService.getOrdersByUserId(user.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading user orders:', error);
      Alert.alert('Error', 'Failed to load your orders. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const formatStatus = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#102a43" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>
            {orders.length} order{orders.length === 1 ? '' : 's'} found
          </Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={34} color="#9fb3c8" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Place your first order and it will appear here for tracking.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('UserDashboard')}
            >
              <Text style={styles.browseButtonText}>Browse Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate('OrderTracking', { orderId: order.id })
              }
            >
              <View style={styles.orderTopRow}>
                <Text style={styles.orderNumber}>Order #{order.id.slice(-6)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusTone[order.status] || '#94a3b8' },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{formatStatus(order.status)}</Text>
                </View>
              </View>

              <Text style={styles.orderMeta}>
                {order.items.length} item{order.items.length === 1 ? '' : 's'}
              </Text>
              <Text style={styles.orderTotal}>R{order.total.toFixed(2)}</Text>

              <View style={styles.footerRow}>
                <Text style={styles.paymentText}>
                  Payment: {formatStatus(order.paymentStatus || 'pending')}
                </Text>
                <Text style={styles.trackText}>Track</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f6',
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#52606d',
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#627d98',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#627d98',
    textAlign: 'center',
    marginBottom: 18,
  },
  browseButton: {
    backgroundColor: '#102a43',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102a43',
  },
  statusBadge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  orderMeta: {
    fontSize: 13,
    color: '#627d98',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 13,
    color: '#627d98',
    fontWeight: '600',
  },
  trackText: {
    fontSize: 14,
    color: '#ff6347',
    fontWeight: '700',
  },
});
