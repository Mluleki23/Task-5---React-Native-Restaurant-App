import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { db } from '../../services/firebase';
import { orderService } from '../../services/orderService';
import {
  PaymentMethod,
  PaymentPreparationResult,
  paymentService,
} from '../../services/paymentService';

interface CheckoutProfileData {
  name?: string;
  surname?: string;
  contactNumber?: string;
  address?: string;
  cardNumber?: string;
}

type UserStackParamList = {
  UserDashboard: undefined;
  Cart: undefined;
  Checkout: undefined;
  Profile: undefined;
  OrderTracking: { orderId: string };
  Login: undefined;
};

export default function Checkout() {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const deliveryFee = 15;
  const taxAmount = cart.totalPrice * 0.15;
  const orderTotal = cart.totalPrice + deliveryFee + taxAmount;

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('cash_on_delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [profile, setProfile] = useState<CheckoutProfileData | null>(null);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [paystackHtml, setPaystackHtml] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, 'users', user.uid));
        if (snapshot.exists()) {
          const data = snapshot.data() as CheckoutProfileData;
          setProfile(data);
          if (!deliveryAddress && data.address) {
            setDeliveryAddress(data.address);
          }
        }
      } catch (error) {
        console.error('Error loading checkout profile:', error);
      }
    };

    loadProfile();
  }, [user?.uid]);

  const paymentMethods: {
    id: PaymentMethod;
    label: string;
    description: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }[] = [
    {
      id: 'cash_on_delivery',
      label: 'Cash on Delivery',
      description: 'Customer pays when the order arrives.',
      icon: 'cash-outline',
    },
    {
      id: 'paystack',
      label: 'Paystack',
      description: 'Pay securely with card, bank, or wallet through Paystack.',
      icon: 'card-outline',
    },
    {
      id: 'eft',
      label: 'EFT / Bank Transfer',
      description: 'Mark order as awaiting transfer confirmation.',
      icon: 'business-outline',
    },
  ];

  const getPaymentMethodLabel = (method: PaymentMethod) =>
    paymentMethods.find((paymentMethod) => paymentMethod.id === method)?.label || method;

  const formatPaymentStatus = (status: string) =>
    status
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const customerName =
    [profile?.name, profile?.surname].filter(Boolean).join(' ') || user?.displayName || 'User';

  const createOrderFromPayment = async (payment: PaymentPreparationResult) => {
    if (!user) {
      throw new Error('User session is no longer available.');
    }

    const now = new Date();

    const orderId = await orderService.createOrder({
      userId: user.uid,
      items: cart.items.map((item) => ({
        id: item.id,
        name: item.foodItem.name,
        price: item.totalPrice / item.quantity,
        quantity: item.quantity,
      })),
      total: orderTotal,
      status: 'pending',
      deliveryAddress: deliveryAddress.trim(),
      customerName,
      customerEmail: user.email || '',
      customerPhone: profile?.contactNumber || user.phoneNumber || '',
      subtotal: cart.totalPrice,
      tax: taxAmount,
      deliveryFee,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: payment.status,
      paymentReference: payment.reference,
      createdAt: now,
      updatedAt: now,
    });

    setIsProcessing(false);

    Alert.alert(
      'Order Placed Successfully!',
      `Order #${orderId.slice(-6)} has been placed.\n\nDelivery address:\n${deliveryAddress}\n\nOrder total: R${orderTotal.toFixed(2)}\nPayment: ${getPaymentMethodLabel(selectedPaymentMethod)}\nStatus: ${formatPaymentStatus(payment.status)}${payment.message ? `\n\n${payment.message}` : ''}`,
      [
        {
          text: 'Track Order',
          onPress: () => {
            clearCart();
            navigation.navigate('OrderTracking', { orderId });
          },
        },
        {
          text: 'Continue Shopping',
          onPress: () => {
            clearCart();
            navigation.navigate('UserDashboard');
          },
        },
      ]
    );
  };

  const resetPaystackState = () => {
    setShowPaystackModal(false);
    setPaystackHtml(null);
    setIsProcessing(false);
  };

  const handlePaystackMessage = async (event: WebViewMessageEvent) => {
    let payload: { type?: string; reference?: string; message?: string } = {};

    try {
      payload = JSON.parse(event.nativeEvent.data);
    } catch {
      payload = {};
    }

    if (payload.type === 'cancel') {
      resetPaystackState();
      Alert.alert('Payment Cancelled', payload.message || 'Paystack checkout was cancelled.');
      return;
    }

    if (payload.type === 'error') {
      resetPaystackState();
      Alert.alert('Payment Error', payload.message || 'Unable to complete Paystack payment.');
      return;
    }

    if (payload.type !== 'success' || !payload.reference) {
      return;
    }

    try {
      await createOrderFromPayment({
        status: 'paid',
        reference: payload.reference,
        message: payload.message || 'Paystack payment completed successfully.',
      });
      resetPaystackState();
    } catch (error) {
      console.error('Error finalizing Paystack order:', error);
      resetPaystackState();
      Alert.alert(
        'Error',
        'Payment succeeded, but we could not save the order. Please contact support.'
      );
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to place an order. Would you like to login?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Missing Information', 'Please enter a delivery address');
      return;
    }

    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checking out.');
      return;
    }

    if (selectedPaymentMethod === 'paystack' && !user.email) {
      Alert.alert(
        'Email Required',
        'Paystack requires an email address on your account before payment can start.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedPaymentMethod === 'paystack') {
        const request = paymentService.createPaystackPaymentRequest(orderTotal, {
          email: user.email || '',
          firstname: profile?.name,
          lastname: profile?.surname,
          phone: profile?.contactNumber || user.phoneNumber || undefined,
        });

        Alert.alert(
          'Paystack Debug',
          `Key: ${request.key.slice(0, 12)}...\nEmail: ${request.email}\nAmount: ${request.amount}\nReference: ${request.reference}\nCurrency: ${request.currency || 'default account currency'}`
        );

        setPaystackHtml(paymentService.createPaystackCheckoutHtml(request));
        setShowPaystackModal(true);
        return;
      }

      const payment = await paymentService.preparePayment(selectedPaymentMethod, orderTotal);
      await createOrderFromPayment(payment);
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.foodItem.name}
                </Text>
                <Text style={styles.itemDetails}>
                  {item.sides.length > 0 ? `Sides: ${item.sides.join(', ')}` : 'Sides: None'}
                </Text>
                <Text style={styles.itemDetails}>
                  {item.extras.length > 0
                    ? `Extras: ${item.extras.map((extra) => extra.name).join(', ')}`
                    : 'Extras: None'}
                </Text>
              </View>
              <Text style={styles.itemPrice}>R{item.totalPrice.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>R{cart.totalPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>R{deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>R{taxAmount.toFixed(2)}</Text>
          </View>

          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total</Text>
            <Text style={styles.finalTotalValue}>R{orderTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            style={styles.addressInput}
            placeholder="Enter delivery address"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.savedCardBanner}>
            <Ionicons name="lock-closed-outline" size={18} color="#102a43" />
            <Text style={styles.savedCardText}>
              Paystack opens a secure checkout page for card and online payments.
            </Text>
          </View>

          {!user?.email && (
            <View style={styles.savedCardBannerMuted}>
              <Ionicons name="alert-circle-outline" size={18} color="#c96c3a" />
              <Text style={styles.savedCardMutedText}>
                Add an email address to your account before using Paystack.
              </Text>
            </View>
          )}

          {paymentMethods.map((paymentMethod) => (
            <TouchableOpacity
              key={paymentMethod.id}
              style={[
                styles.paymentOption,
                selectedPaymentMethod === paymentMethod.id && styles.selectedPayment,
              ]}
              onPress={() => setSelectedPaymentMethod(paymentMethod.id)}
            >
              <View style={styles.cardInfo}>
                <Ionicons name={paymentMethod.icon} size={20} color="#ff6b6b" />
                <View style={styles.paymentTextGroup}>
                  <Text style={styles.cardText}>{paymentMethod.label}</Text>
                  <Text style={styles.paymentDescription}>{paymentMethod.description}</Text>
                </View>
              </View>
              <Ionicons
                name={
                  selectedPaymentMethod === paymentMethod.id
                    ? 'checkmark-circle'
                    : 'ellipse-outline'
                }
                size={20}
                color={selectedPaymentMethod === paymentMethod.id ? '#ff6b6b' : '#ccc'}
              />
            </TouchableOpacity>
          ))}

        </View>

        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userText}>Name: {user.displayName || 'User'}</Text>
              <Text style={styles.userText}>Email: {user.email}</Text>
              <Text style={styles.userText}>
                Phone: {profile?.contactNumber || 'Not provided'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isProcessing ? 'Processing...' : 'Place Order'}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
          style={styles.placeOrderButton}
        />
      </View>

      <Modal
        animationType="slide"
        visible={showPaystackModal}
        onRequestClose={resetPaystackState}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={resetPaystackState}>
            <Ionicons name="close" size={24} color="#102a43" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Paystack Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {paystackHtml ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: paystackHtml }}
            onMessage={handlePaystackMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webViewLoader}>
                <ActivityIndicator size="large" color="#ff6b6b" />
                <Text style={styles.webViewLoaderText}>Loading secure payment...</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.webViewLoader}>
            <ActivityIndicator size="large" color="#ff6b6b" />
            <Text style={styles.webViewLoaderText}>Preparing payment...</Text>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
    padding: 20,
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  itemInfo: {
    flex: 1,
    marginRight: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  finalTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedPayment: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentTextGroup: {
    marginLeft: 10,
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  paymentDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  savedCardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf7f5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  savedCardText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#102a43',
    fontWeight: '600',
    flex: 1,
  },
  savedCardBannerMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  savedCardMutedText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#7a3f22',
    fontWeight: '600',
    flex: 1,
  },
  userInfo: {
    gap: 8,
  },
  userText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  placeOrderButton: {
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102a43',
  },
  webViewLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  webViewLoaderText: {
    marginTop: 12,
    fontSize: 15,
    color: '#486581',
    textAlign: 'center',
  },
});
