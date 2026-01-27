import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';

interface UserProfile {
  displayName: string;
  email: string;
  address: string;
  phoneNumber: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<keyof UserProfile | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    address: '',
    phoneNumber: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
  });

  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    loadUserOrders();
  }, []);

  const loadUserOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userOrders = await orderService.getOrdersByUserId(user.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field: keyof UserProfile) => {
    setEditingField(field);
    setTempValue(profile[field]);
    setShowEditModal(true);
  };

  const handleSaveField = () => {
    if (editingField) {
      setProfile(prev => ({
        ...prev,
        [editingField]: tempValue
      }));
      setShowEditModal(false);
      setEditingField(null);
      
      Alert.alert('Success', `${editingField} updated successfully`);
    }
  };

  const formatCardNumber = (number: string) => {
    // Show only last 4 digits
    if (number.length <= 4) return number;
    return `**** **** **** ${number.slice(-4)}`;
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff6b6b';
      case 'preparing': return '#ffa500';
      case 'ready': return '#4ecdc4';
      case 'delivered': return '#96ceb4';
      case 'cancelled': return '#ff6b6b';
      default: return '#666';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-outline" size={80} color="#ccc" />
          <Text style={styles.notLoggedInTitle}>Please Login</Text>
          <Text style={styles.notLoggedInSubtitle}>
            You need to be logged in to view your profile
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.userName}>{profile.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{profile.displayName || 'Not set'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleEditField('displayName')}>
              <Ionicons name="create-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleEditField('email')}>
              <Ionicons name="create-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{profile.address || 'Not set'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleEditField('address')}>
              <Ionicons name="create-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contact Number</Text>
                <Text style={styles.infoValue}>{profile.phoneNumber || 'Not set'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleEditField('phoneNumber')}>
              <Ionicons name="create-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="card-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Card Number</Text>
                <Text style={styles.infoValue}>
                  {profile.cardNumber ? formatCardNumber(profile.cardNumber) : 'Not set'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleEditField('cardNumber')}>
              <Ionicons name="create-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          {profile.cardNumber && (
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Expiry Date</Text>
                    <Text style={styles.infoValue}>{profile.cardExpiry || 'Not set'}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleEditField('cardExpiry')}>
                  <Ionicons name="create-outline" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>CVV</Text>
                    <Text style={styles.infoValue}>***</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleEditField('cardCVV')}>
                  <Ionicons name="create-outline" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Order History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order History</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>Loading orders...</Text>
          ) : orders.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet</Text>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{order.id.slice(-8)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>
                
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                <Text style={styles.orderItems}>{order.items.length} items</Text>
                <Text style={styles.orderTotal}>R{order.total.toFixed(2)}</Text>
                
                {order.deliveryAddress && (
                  <View style={styles.orderAddress}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.orderAddressText}>{order.deliveryAddress}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit {editingField}</Text>
            <TouchableOpacity onPress={handleSaveField}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.textInput}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={`Enter ${editingField}`}
              multiline={editingField === 'address'}
              numberOfLines={editingField === 'address' ? 3 : 1}
              keyboardType={
                editingField === 'phoneNumber' ? 'phone-pad' :
                editingField === 'cardNumber' || editingField === 'cardCVV' ? 'numeric' : 'default'
              }
              secureTextEntry={editingField === 'cardCVV'}
            />
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
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  notLoggedInSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  orderCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  orderAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderAddressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    flex: 1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  saveButton: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
    textAlignVertical: 'top',
  },
});
