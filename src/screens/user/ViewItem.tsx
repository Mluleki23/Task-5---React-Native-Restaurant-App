import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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
import { FoodItem } from '../../types';

type ViewItemRouteProp = RouteProp<{ ViewItem: { item: FoodItem } }, 'ViewItem'>;

export default function ViewItem() {
  const route = useRoute<ViewItemRouteProp>();
  const navigation = useNavigation();
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    Alert.alert(
      'Added to Cart',
      `${quantity} x ${item.name} added to cart`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.itemImage}
          defaultSource={require('../../../assets/images/FoodApp logo.png')}
        />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          
          <Text style={styles.description}>{item.description}</Text>
          
          <View style={styles.priceSection}>
            <Text style={styles.price}>R{item.price.toFixed(2)}</Text>
            <Text style={styles.priceLabel}>per item</Text>
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={decreaseQuantity}
                disabled={quantity === 1}
              >
                <Ionicons name="remove" size={20} color={quantity === 1 ? '#ccc' : '#ff6b6b'} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Ionicons name="add" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>R{(item.price * quantity).toFixed(2)}</Text>
          </View>

          <Button 
            title={`Add ${quantity} to Cart`}
            onPress={handleAddToCart}
            style={styles.addToCartButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  itemImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f1f3f4',
  },
  itemInfo: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  itemCategory: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '500',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 25,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  priceLabel: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 20,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2c3e50',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  addToCartButton: {
    marginBottom: 20,
  },
});
