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
    View
} from 'react-native';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const statusOptions = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'];

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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#ff6b6b';
      case 'preparing': return '#feca57';
      case 'ready': return '#48dbfb';
      case 'delivered': return '#1dd1a1';
      case 'cancelled': return '#ee5a6f';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'time';
      case 'preparing': return 'restaurant';
      case 'ready': return 'checkmark-circle';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatPrice = (price: number) => `R${price.toFixed(2)}`;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders Management</Text>
        <Text style={styles.orderCount}>{filteredOrders.length} orders</Text>
      </View>

      {/* Status Filter */}
      <ScrollView 
        horizontal 
        style={styles.filterContainer}
        showsHorizontalScrollIndicator={false}
      >
        {statusOptions.map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filterStatus === status && styles.selectedFilter
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[
              styles.filterText,
              filterStatus === status && styles.selectedFilterText
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id?.slice(-8)}</Text>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  <Text style={styles.customerEmail}>{order.customerEmail}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Ionicons 
                      name={getStatusIcon(order.status)} 
                      size={16} 
                      color="white" 
                    />
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.detailLabel}>Items: {order.items.length}</Text>
                <Text style={styles.detailLabel}>Total: {formatPrice(order.total)}</Text>
                <Text style={styles.detailLabel}>Payment: {order.paymentStatus}</Text>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={() => handleViewOrderDetails(order)}
                >
                  <Ionicons name="eye" size={16} color="white" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {order.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.prepareButton]}
                    onPress={() => handleUpdateOrderStatus(order.id!, 'preparing')}
                  >
                    <Ionicons name="restaurant" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Prepare</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'preparing' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.readyButton]}
                    onPress={() => handleUpdateOrderStatus(order.id!, 'ready')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Ready</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'ready' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deliverButton]}
                    onPress={() => handleUpdateOrderStatus(order.id!, 'delivered')}
                  >
                    <Ionicons name="checkmark-done-circle" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Deliver</Text>
                  </TouchableOpacity>
                )}

                {(order.status === 'pending' || order.status === 'preparing') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleUpdateOrderStatus(order.id!, 'cancelled')}
                  >
                    <Ionicons name="close-circle" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Customer Information</Text>
                  <Text style={styles.detailText}>Name: {selectedOrder.customerName}</Text>
                  <Text style={styles.detailText}>Email: {selectedOrder.customerEmail}</Text>
                  <Text style={styles.detailText}>Phone: {selectedOrder.customerPhone}</Text>
                  <Text style={styles.detailText}>Address: {selectedOrder.deliveryAddress}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Order Items</Text>
                  {selectedOrder.items.map((item: any, index: number) => (
                    <View key={index} style={styles.itemDetail}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>
                        {item.quantity} x {formatPrice(item.price)} = {formatPrice(item.price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Order Summary</Text>
                  <Text style={styles.detailText}>Subtotal: {formatPrice(selectedOrder.subtotal)}</Text>
                  <Text style={styles.detailText}>Tax: {formatPrice(selectedOrder.tax)}</Text>
                  <Text style={styles.detailText}>Delivery Fee: {formatPrice(selectedOrder.deliveryFee)}</Text>
                  <Text style={styles.totalText}>Total: {formatPrice(selectedOrder.total)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Payment Information</Text>
                  <Text style={styles.detailText}>Method: {selectedOrder.paymentMethod}</Text>
                  <Text style={styles.detailText}>Status: {selectedOrder.paymentStatus}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  orderCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterChip: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedFilter: {
    backgroundColor: '#ff6b6b',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  customerEmail: {
    fontSize: 12,
    color: '#999',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: '#4ecdc4',
  },
  prepareButton: {
    backgroundColor: '#feca57',
  },
  readyButton: {
    backgroundColor: '#48dbfb',
  },
  deliverButton: {
    backgroundColor: '#1dd1a1',
  },
  cancelButton: {
    backgroundColor: '#ee5a6f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  itemName: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
});
