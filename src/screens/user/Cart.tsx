import { Ionicons } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import React, { useState } from 'react';

import {
    Alert,

    Image,

    ScrollView,

    StyleSheet,

    Text,

    TouchableOpacity,

    View,
} from 'react-native';

import Button from '../../components/Button';

import { CartItem, useCart } from '../../context/CartContext';

import { FoodItem } from '../../types';



type UserStackParamList = {

  UserDashboard: undefined;

  ViewItem: { item: FoodItem };

  Cart: undefined;

  Checkout: undefined;

  Profile: undefined;

};



type UserNavigationProp = NativeStackNavigationProp<UserStackParamList>;



export default function Cart() {

  const navigation = useNavigation<UserNavigationProp>();

  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const [editingItem, setEditingItem] = useState<CartItem | null>(null);



  const handleRemoveItem = (itemId: string, itemName: string) => {

    Alert.alert(

      'Remove Item',

      `Are you sure you want to remove ${itemName} from cart?`,

      [

        { text: 'Cancel', style: 'cancel' },

        {

          text: 'Remove',

          style: 'destructive',

          onPress: () => removeFromCart(itemId),

        },

      ]

    );

  };



  const handleClearCart = () => {

    Alert.alert(

      'Clear Cart',

      'Are you sure you want to clear all items from cart?',

      [

        { text: 'Cancel', style: 'cancel' },

        {

          text: 'Clear',

          style: 'destructive',

          onPress: clearCart,

        },

      ]

    );

  };



  const handleEditItem = (item: CartItem) => {

    // Navigate back to ViewItem with the item for editing

    navigation.navigate('ViewItem', { item: item.foodItem });

  };



  const handleCheckout = () => {

    navigation.navigate('Checkout');

  };



  const formatCustomizations = (item: CartItem) => {

    const customizations = [];

    

    if (item.sides.length > 0) {

      customizations.push(`Sides: ${item.sides.join(', ')}`);

    }

    

    if (item.drinks.length > 0) {

      customizations.push(`Drinks: ${item.drinks.join(', ')}`);

    }

    

    if (item.extras.length > 0) {

      const extraNames = item.extras.map(extra => extra.name);

      customizations.push(`Extras: ${extraNames.join(', ')}`);

    }

    

    if (item.removedIngredients.length > 0) {

      customizations.push(`No: ${item.removedIngredients.join(', ')}`);

    }

    

    return customizations;

  };



  if (cart.items.length === 0) {

    return (

      <View style={styles.emptyContainer}>

        <Ionicons name="cart-outline" size={80} color="#ccc" />

        <Text style={styles.emptyTitle}>Your cart is empty</Text>

        <Text style={styles.emptySubtitle}>Add some delicious items to get started!</Text>

        <Button 

          title="Browse Menu" 

          onPress={() => navigation.navigate('UserDashboard')}

          style={styles.browseButton}

        />

      </View>

    );

  }



  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>Cart ({cart.totalItems})</Text>

        {cart.items.length > 0 && (

          <TouchableOpacity onPress={handleClearCart}>

            <Text style={styles.clearButton}>Clear All</Text>

          </TouchableOpacity>

        )}

      </View>



      <ScrollView style={styles.content}>

        {cart.items.map((item) => (

          <View key={item.id} style={styles.cartItem}>

            <Image 
              source={{ uri: item.foodItem.imageUrl }} 
              style={styles.itemImage}
              defaultSource={require('../../../assets/images/FoodApp-logo.png')}
            />


            <View style={styles.itemInfo}>

              <View style={styles.itemHeader}>

                <Text style={styles.itemName}>{item.foodItem.name}</Text>

                <TouchableOpacity

                  style={styles.removeButton}

                  onPress={() => handleRemoveItem(item.id, item.foodItem.name)}

                >

                  <Ionicons name="trash-outline" size={20} color="#ff6b6b" />

                </TouchableOpacity>

              </View>

              

              <Text style={styles.itemCategory}>{item.foodItem.category}</Text>

              

              {/* Customizations */}

              {formatCustomizations(item).map((customization, index) => (

                <Text key={index} style={styles.customizationText}>

                  • {customization}

                </Text>

              ))}

              

              <View style={styles.itemFooter}>

                <View style={styles.quantityControls}>

                  <TouchableOpacity

                    style={styles.quantityButton}

                    onPress={() => updateQuantity(item.id, item.quantity - 1)}

                    disabled={item.quantity === 1}

                  >

                    <Ionicons 

                      name="remove" 

                      size={16} 

                      color={item.quantity === 1 ? '#ccc' : '#ff6b6b'} 

                    />

                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity

                    style={styles.quantityButton}

                    onPress={() => updateQuantity(item.id, item.quantity + 1)}

                  >

                    <Ionicons name="add" size={16} color="#ff6b6b" />

                  </TouchableOpacity>

                </View>

                

                <View style={styles.priceSection}>

                  <Text style={styles.itemPrice}>R{item.totalPrice.toFixed(2)}</Text>

                  <TouchableOpacity

                    style={styles.editButton}

                    onPress={() => handleEditItem(item)}

                  >

                    <Ionicons name="create-outline" size={16} color="#ff6b6b" />

                  </TouchableOpacity>

                </View>

              </View>

            </View>

          </View>

        ))}

      </ScrollView>



      <View style={styles.footer}>

        <View style={styles.totalSection}>

          <Text style={styles.totalLabel}>Total Amount:</Text>

          <Text style={styles.totalPrice}>R{cart.totalPrice.toFixed(2)}</Text>

        </View>

        

        <Button 

          title="Proceed to Checkout"

          onPress={handleCheckout}

          style={styles.checkoutButton}

        />

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#f8f9fa',

  },

  emptyContainer: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    padding: 40,

  },

  emptyTitle: {

    fontSize: 24,

    fontWeight: 'bold',

    color: '#2c3e50',

    marginTop: 20,

    marginBottom: 10,

  },

  emptySubtitle: {

    fontSize: 16,

    color: '#666',

    textAlign: 'center',

    marginBottom: 30,

  },

  browseButton: {

    paddingHorizontal: 40,

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

  clearButton: {

    fontSize: 16,

    color: '#ff6b6b',

    fontWeight: '500',

  },

  content: {

    flex: 1,

    padding: 20,

  },

  cartItem: {

    flexDirection: 'row',

    backgroundColor: '#fff',

    borderRadius: 12,

    padding: 15,

    marginBottom: 15,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    elevation: 3,

  },

  itemImage: {

    width: 80,

    height: 80,

    borderRadius: 8,

    backgroundColor: '#f1f3f4',

    marginRight: 15,

  },

  itemInfo: {

    flex: 1,

  },

  itemHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    marginBottom: 5,

  },

  itemName: {

    fontSize: 16,

    fontWeight: 'bold',

    color: '#2c3e50',

    flex: 1,

    marginRight: 10,

  },

  removeButton: {

    padding: 4,

  },

  itemCategory: {

    fontSize: 12,

    color: '#ff6b6b',

    marginBottom: 8,

  },

  customizationText: {

    fontSize: 12,

    color: '#666',

    marginBottom: 2,

  },

  itemFooter: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginTop: 10,

  },

  quantityControls: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  quantityButton: {

    width: 28,

    height: 28,

    borderRadius: 14,

    backgroundColor: '#f1f3f4',

    justifyContent: 'center',

    alignItems: 'center',

  },

  quantityText: {

    fontSize: 16,

    fontWeight: 'bold',

    color: '#2c3e50',

    marginHorizontal: 12,

  },

  priceSection: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  itemPrice: {

    fontSize: 16,

    fontWeight: 'bold',

    color: '#ff6b6b',

    marginRight: 10,

  },

  editButton: {

    padding: 4,

  },

  footer: {

    backgroundColor: '#fff',

    padding: 20,

    borderTopWidth: 1,

    borderTopColor: '#e9ecef',

  },

  totalSection: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 20,

  },

  totalLabel: {

    fontSize: 18,

    color: '#2c3e50',

  },

  totalPrice: {

    fontSize: 24,

    fontWeight: 'bold',

    color: '#ff6b6b',

  },

  checkoutButton: {

    marginBottom: 10,

  },

});

