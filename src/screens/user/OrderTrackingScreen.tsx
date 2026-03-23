import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { orderService } from '../../services/orderService';
import { Order } from '../../types';

type OrderTrackingRouteProp = RouteProp<
  { OrderTracking: { orderId: string } },
  'OrderTracking'
>;

const statusFlow: Order['status'][] = ['pending', 'preparing', 'ready', 'delivered'];

export default function OrderTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute<OrderTrackingRouteProp>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const foundOrder = await orderService.getOrderById(orderId);
      setOrder(foundOrder);
    } catch (error) {
      console.error('Error loading order tracking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrder();
  };

  const getStatusIndex = (status: Order['status']) => statusFlow.indexOf(status);

  const formatStatus = (value?: string) =>
    (value || '')
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#102a43" />
        <Text style={styles.loadingText}>Loading order...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  const statusIndex = getStatusIndex(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#102a43" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#102a43" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.orderNumber}>Order #{order.id.slice(-6)}</Text>
          <Text style={styles.heroStatus}>{formatStatus(order.status)}</Text>
          <Text style={styles.heroSubtext}>Payment {formatStatus(order.paymentStatus)}</Text>
          <Text style={styles.totalText}>R{order.total.toFixed(2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          {statusFlow.map((step, index) => {
            const complete = statusIndex >= index;
            const current = order.status === step;

            return (
              <View key={step} style={styles.timelineRow}>
                <View
                  style={[
                    styles.timelineDot,
                    complete && styles.timelineDotComplete,
                    current && styles.timelineDotCurrent,
                  ]}
                />
                <View style={styles.timelineTextWrap}>
                  <Text style={[styles.timelineTitle, complete && styles.timelineTitleComplete]}>
                    {formatStatus(step)}
                  </Text>
                  <Text style={styles.timelineSubtitle}>
                    {current ? 'Current order stage' : complete ? 'Completed' : 'Waiting'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <InfoRow label="Delivery Address" value={order.deliveryAddress} />
          <InfoRow label="Payment Method" value={formatStatus(order.paymentMethod)} />
          <InfoRow label="Payment Status" value={formatStatus(order.paymentStatus)} />
          <InfoRow label="Reference" value={order.paymentReference || 'Not available'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View>
                <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                <Text style={styles.itemPrice}>R{item.price.toFixed(2)} each</Text>
              </View>
              <Text style={styles.itemTotal}>R{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f6',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102a43',
  },
  heroCard: {
    backgroundColor: '#102a43',
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  orderNumber: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7dd3fc',
    marginBottom: 12,
  },
  heroStatus: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 14,
  },
  totalText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f7c873',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#d9e2ec',
    marginRight: 14,
  },
  timelineDotComplete: {
    backgroundColor: '#20a39e',
  },
  timelineDotCurrent: {
    backgroundColor: '#ff6347',
  },
  timelineTextWrap: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#52606d',
    marginBottom: 4,
  },
  timelineTitleComplete: {
    color: '#102a43',
  },
  timelineSubtitle: {
    fontSize: 13,
    color: '#7b8794',
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627d98',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#102a43',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#627d98',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ff6347',
  },
});
