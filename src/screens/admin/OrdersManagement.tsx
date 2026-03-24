import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { orderService } from '../../services/orderService';
import { Order } from '../../types';

const statusOptions = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'] as const;

const statusStyles: Record<Order['status'], { color: string; icon: React.ComponentProps<typeof Ionicons>['name']; label: string }> = {
  pending: { color: '#f97316', icon: 'time-outline', label: 'Pending' },
  preparing: { color: '#eab308', icon: 'restaurant-outline', label: 'Preparing' },
  ready: { color: '#0ea5e9', icon: 'checkmark-circle-outline', label: 'Ready' },
  delivered: { color: '#16a34a', icon: 'checkmark-done-circle-outline', label: 'Delivered' },
  cancelled: { color: '#dc2626', icon: 'close-circle-outline', label: 'Cancelled' },
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await orderService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', 'Order status updated successfully');
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((order) => order.status === filterStatus);

  const formatPrice = (price: number | undefined) => (price === undefined ? 'R0.00' : `R${price.toFixed(2)}`);

  const formatStatus = (value: string | undefined) =>
    value
      ? value
          .split('_')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')
      : 'Not available';

  const activeOrders = orders.filter(
    (order) => order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
  ).length;
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEyebrow}>Orders Queue</Text>
          <Text style={styles.loadingText}>Loading live order traffic...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroGlowPrimary} />
          <View style={styles.heroGlowSecondary} />

          <Text style={styles.heroEyebrow}>Fulfilment Desk</Text>
          <Text style={styles.heroTitle}>Watch the queue and move orders faster</Text>
          <Text style={styles.heroSubtitle}>
            Filter active tickets, inspect customer details, and advance each order through the kitchen flow.
          </Text>

          <View style={styles.metricsRow}>
            <HeroMetric label="Visible" value={`${filteredOrders.length}`} />
            <HeroMetric label="Active" value={`${activeOrders}`} />
            <HeroMetric label="Delivered" value={`${deliveredOrders}`} />
          </View>
        </View>

        <View style={styles.filtersCard}>
          <View style={styles.filtersHeader}>
            <View>
              <Text style={styles.filtersTitle}>Filter queue</Text>
              <Text style={styles.filtersSubtitle}>Pending orders right now: {pendingOrders}</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map((status) => {
              const selected = filterStatus === status;
              const statusConfig =
                status === 'all'
                  ? { color: '#334155', icon: 'apps-outline' as const, label: 'All' }
                  : statusStyles[status];

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    selected && { backgroundColor: statusConfig.color, borderColor: statusConfig.color },
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Ionicons
                    name={statusConfig.icon}
                    size={15}
                    color={selected ? '#fff' : statusConfig.color}
                  />
                  <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                    {statusConfig.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={34} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No orders match this filter</Text>
            <Text style={styles.emptySubtitle}>Switch status views or pull to refresh the queue.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = statusStyles[order.status];

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderTopRow}>
                  <View style={styles.orderIdentity}>
                    <Text style={styles.orderNumber}>Order #{order.id?.slice(-8)}</Text>
                    <Text style={styles.customerName}>{order.customerName || 'Customer'}</Text>
                    <Text style={styles.customerMeta}>{order.customerEmail || 'No email provided'}</Text>
                  </View>

                  <View style={[styles.statusPill, { backgroundColor: statusConfig.color }]}>
                    <Ionicons name={statusConfig.icon} size={14} color="#fff" />
                    <Text style={styles.statusPillText}>{statusConfig.label}</Text>
                  </View>
                </View>

                <View style={styles.summaryGrid}>
                  <SummaryBlock label="Items" value={`${order.items.length}`} />
                  <SummaryBlock label="Total" value={formatPrice(order.total)} />
                  <SummaryBlock label="Payment" value={formatStatus(order.paymentStatus)} />
                </View>

                <Text style={styles.addressText}>{order.deliveryAddress}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.viewAction} onPress={() => handleViewOrderDetails(order)}>
                    <Ionicons name="eye-outline" size={16} color="#0f172a" />
                    <Text style={styles.viewActionText}>View Details</Text>
                  </TouchableOpacity>

                  {order.status === 'pending' && (
                    <ActionPill
                      label="Start Prep"
                      icon="restaurant-outline"
                      color="#f59e0b"
                      onPress={() => handleUpdateOrderStatus(order.id!, 'preparing')}
                    />
                  )}

                  {order.status === 'preparing' && (
                    <ActionPill
                      label="Mark Ready"
                      icon="checkmark-circle-outline"
                      color="#0ea5e9"
                      onPress={() => handleUpdateOrderStatus(order.id!, 'ready')}
                    />
                  )}

                  {order.status === 'ready' && (
                    <ActionPill
                      label="Complete"
                      icon="checkmark-done-circle-outline"
                      color="#16a34a"
                      onPress={() => handleUpdateOrderStatus(order.id!, 'delivered')}
                    />
                  )}

                  {(order.status === 'pending' || order.status === 'preparing') && (
                    <ActionPill
                      label="Cancel"
                      icon="close-circle-outline"
                      color="#dc2626"
                      onPress={() => handleUpdateOrderStatus(order.id!, 'cancelled')}
                    />
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalEyebrow}>Order Insight</Text>
                <Text style={styles.modalTitle}>Customer and fulfilment details</Text>
              </View>
              <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#334155" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Customer</Text>
                  <DetailRow label="Name" value={selectedOrder.customerName || 'Not provided'} />
                  <DetailRow label="Email" value={selectedOrder.customerEmail || 'Not provided'} />
                  <DetailRow label="Phone" value={selectedOrder.customerPhone || 'Not provided'} />
                  <DetailRow label="Address" value={selectedOrder.deliveryAddress} />
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Items</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={`${item.id}-${index}`} style={styles.itemRow}>
                      <View style={styles.itemRowCopy}>
                        <Text style={styles.itemRowName}>{item.name}</Text>
                        <Text style={styles.itemRowMeta}>
                          {item.quantity} x {formatPrice(item.price)}
                        </Text>
                      </View>
                      <Text style={styles.itemRowTotal}>{formatPrice(item.price * item.quantity)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Payment and totals</Text>
                  <DetailRow label="Payment Method" value={formatStatus(selectedOrder.paymentMethod)} />
                  <DetailRow label="Payment Status" value={formatStatus(selectedOrder.paymentStatus)} />
                  <DetailRow label="Reference" value={selectedOrder.paymentReference || 'Not available'} />
                  <DetailRow label="Subtotal" value={formatPrice(selectedOrder.subtotal)} />
                  <DetailRow label="Tax" value={formatPrice(selectedOrder.tax)} />
                  <DetailRow label="Delivery Fee" value={formatPrice(selectedOrder.deliveryFee)} />
                  <DetailRow label="Grand Total" value={formatPrice(selectedOrder.total)} emphasized />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const HeroMetric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.heroMetricCard}>
    <Text style={styles.heroMetricValue}>{value}</Text>
    <Text style={styles.heroMetricLabel}>{label}</Text>
  </View>
);

const SummaryBlock = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.summaryBlock}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const ActionPill = ({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={[styles.dynamicAction, { backgroundColor: color }]} onPress={onPress}>
    <Ionicons name={icon} size={16} color="#fff" />
    <Text style={styles.dynamicActionText}>{label}</Text>
  </TouchableOpacity>
);

const DetailRow = ({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, emphasized && styles.detailValueEmphasized]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f6',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#f97316',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#102a43',
  },
  heroCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 22,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -32,
    right: -10,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f97316',
    opacity: 0.22,
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -54,
    left: -20,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#38bdf8',
    opacity: 0.16,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#fdba74',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 10,
    maxWidth: '86%',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#cbd5e1',
    marginBottom: 18,
    maxWidth: '92%',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroMetricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  heroMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  heroMetricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  filtersCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 18,
    marginBottom: 16,
  },
  filtersHeader: {
    marginBottom: 14,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 4,
  },
  filtersSubtitle: {
    fontSize: 14,
    color: '#627d98',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe2ea',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334e68',
    marginLeft: 6,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 34,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334e68',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7b8794',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  orderIdentity: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334e68',
    marginBottom: 3,
  },
  customerMeta: {
    fontSize: 13,
    color: '#7b8794',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryBlock: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#627d98',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102a43',
  },
  addressText: {
    fontSize: 14,
    color: '#486581',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  viewActionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  dynamicAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dynamicActionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '88%',
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#f97316',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#102a43',
    maxWidth: '88%',
  },
  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  detailCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#627d98',
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#102a43',
    fontWeight: '600',
    flex: 1.3,
    textAlign: 'right',
  },
  detailValueEmphasized: {
    color: '#d94f30',
    fontSize: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  itemRowCopy: {
    flex: 1,
  },
  itemRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 4,
  },
  itemRowMeta: {
    fontSize: 12,
    color: '#627d98',
  },
  itemRowTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d94f30',
  },
});
