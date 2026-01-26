import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { FoodItem } from '../../types';

type ViewItemRouteProp = RouteProp<{ ViewItem: { item: FoodItem } }, 'ViewItem'>;

// Customization options
const sideOptions = [
  { name: 'Pap', included: true },
  { name: 'Chips', included: true },
  { name: 'Salad', included: true },
  { name: 'Rice', included: true },
  { name: 'Vegetables', included: true },
];

const drinkOptions = [
  { name: 'Coke', price: 15, included: false },
  { name: 'Fanta', price: 15, included: false },
  { name: 'Sprite', price: 15, included: false },
  { name: 'Water', price: 10, included: false },
  { name: 'Juice', price: 20, included: false },
];

const extraOptions = [
  { name: 'Extra Chips', price: 12, selected: false },
  { name: 'Extra Salad', price: 15, selected: false },
  { name: 'Cheese', price: 8, selected: false },
  { name: 'Bacon', price: 15, selected: false },
  { name: 'Avocado', price: 18, selected: false },
  { name: 'Extra Sauce', price: 5, selected: false },
];

const ingredientOptions = [
  { name: 'Lettuce', included: true },
  { name: 'Tomato', included: true },
  { name: 'Onion', included: true },
  { name: 'Pickles', included: true },
  { name: 'Cheese', included: true },
  { name: 'Bacon', included: false },
];

export default function ViewItem() {
  const route = useRoute<ViewItemRouteProp>();
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [showCustomization, setShowCustomization] = useState(false);

  const [customizations, setCustomizations] = useState({
    sides: sideOptions,
    drinks: drinkOptions,
    extras: extraOptions,
    ingredients: ingredientOptions,
  });

  const calculateTotalPrice = () => {
    let total = item.price;

    // Add extras
    customizations.extras.forEach(extra => {
      if (extra.selected) {
        total += extra.price;
      }
    });

    // Add drinks
    customizations.drinks.forEach(drink => {
      if (drink.included) {
        total += drink.price;
      }
    });

    return total * quantity;
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      foodItem: item,
      quantity,
      sides: customizations.sides.filter(side => side.included).map(side => side.name),
      drinks: customizations.drinks.filter(drink => drink.included).map(drink => drink.name),
      extras: customizations.extras.filter(extra => extra.selected).map(extra => ({
        name: extra.name,
        price: extra.price,
      })),
      removedIngredients: customizations.ingredients
        .filter(ingredient => !ingredient.included)
        .map(ingredient => ingredient.name),
      customizations,
      totalPrice: calculateTotalPrice(),
    };

    addToCart(cartItem);

    Alert.alert(
      'Added to Cart',
      `${quantity} x ${item.name} added to cart`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('Cart' as never),
        },
      ]
    );
  };

  const toggleSide = (index: number) => {
    const newSides = [...customizations.sides];
    const includedCount = newSides.filter(side => side.included).length;

    // Allow maximum of 2 sides
    if (!newSides[index].included && includedCount >= 2) {
      Alert.alert('Maximum Sides', 'You can select maximum 2 sides');
      return;
    }

    newSides[index].included = !newSides[index].included;
    setCustomizations({ ...customizations, sides: newSides });
  };

  const toggleDrink = (index: number) => {
    const newDrinks = [...customizations.drinks];
    newDrinks[index].included = !newDrinks[index].included;
    setCustomizations({ ...customizations, drinks: newDrinks });
  };

  const toggleExtra = (index: number) => {
    const newExtras = [...customizations.extras];
    newExtras[index].selected = !newExtras[index].selected;
    setCustomizations({ ...customizations, extras: newExtras });
  };

  const toggleIngredient = (index: number) => {
    const newIngredients = [...customizations.ingredients];
    newIngredients[index].included = !newIngredients[index].included;
    setCustomizations({ ...customizations, ingredients: newIngredients });
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

          <TouchableOpacity
            style={styles.customizeButton}
            onPress={() => setShowCustomization(true)}
          >
            <Ionicons name="settings-outline" size={20} color="#ff6b6b" />
            <Text style={styles.customizeButtonText}>Customize Order</Text>
            <Ionicons name="chevron-forward" size={20} color="#ff6b6b" />
          </TouchableOpacity>

          <View style={styles.priceSection}>
            <Text style={styles.price}>R{calculateTotalPrice().toFixed(2)}</Text>
            <Text style={styles.priceLabel}>total</Text>
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

          <Button
            title={`Add ${quantity} to Cart`}
            onPress={handleAddToCart}
            style={styles.addToCartButton}
          />
        </View>
      </ScrollView>

      {/* Customization Modal */}
      <Modal
        visible={showCustomization}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomization(false)}>
              <Ionicons name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Customize Your Order</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sides Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Sides (Max 2)</Text>
              {customizations.sides.map((side, index) => (
                <TouchableOpacity
                  key={side.name}
                  style={[
                    styles.optionItem,
                    side.included && styles.selectedOption,
                  ]}
                  onPress={() => toggleSide(index)}
                >
                  <Text style={[
                    styles.optionText,
                    side.included && styles.selectedOptionText,
                  ]}>
                    {side.name}
                  </Text>
                  <Ionicons
                    name={side.included ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={side.included ? '#ff6b6b' : '#ccc'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Drinks Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Drinks</Text>
              {customizations.drinks.map((drink, index) => (
                <TouchableOpacity
                  key={drink.name}
                  style={[
                    styles.optionItem,
                    drink.included && styles.selectedOption,
                  ]}
                  onPress={() => toggleDrink(index)}
                >
                  <View>
                    <Text style={[
                      styles.optionText,
                      drink.included && styles.selectedOptionText,
                    ]}>
                      {drink.name}
                    </Text>
                    <Text style={styles.optionPrice}>+R{drink.price.toFixed(2)}</Text>
                  </View>
                  <Ionicons
                    name={drink.included ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={drink.included ? '#ff6b6b' : '#ccc'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Extras Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Extras</Text>
              {customizations.extras.map((extra, index) => (
                <TouchableOpacity
                  key={extra.name}
                  style={[
                    styles.optionItem,
                    extra.selected && styles.selectedOption,
                  ]}
                  onPress={() => toggleExtra(index)}
                >
                  <View>
                    <Text style={[
                      styles.optionText,
                      extra.selected && styles.selectedOptionText,
                    ]}>
                      {extra.name}
                    </Text>
                    <Text style={styles.optionPrice}>+R{extra.price.toFixed(2)}</Text>
                  </View>
                  <Ionicons
                    name={extra.selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={extra.selected ? '#ff6b6b' : '#ccc'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Ingredients Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {customizations.ingredients.map((ingredient, index) => (
                <TouchableOpacity
                  key={ingredient.name}
                  style={[
                    styles.optionItem,
                    !ingredient.included && styles.removedOption,
                  ]}
                  onPress={() => toggleIngredient(index)}
                >
                  <Text style={[
                    styles.optionText,
                    !ingredient.included && styles.removedOptionText,
                  ]}>
                    {ingredient.name}
                  </Text>
                  <Ionicons
                    name={ingredient.included ? 'checkmark-circle' : 'remove-circle'}
                    size={20}
                    color={ingredient.included ? '#ff6b6b' : '#ff6b6b'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Text style={styles.modalTotal}>Total: R{calculateTotalPrice().toFixed(2)}</Text>
            <Button
              title="Apply Customization"
              onPress={() => setShowCustomization(false)}
              style={styles.applyButton}
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
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  customizeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ff6b6b',
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
  addToCartButton: {
    marginBottom: 20,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  removedOption: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  selectedOptionText: {
    color: '#ff6b6b',
    fontWeight: '500',
  },
  removedOptionText: {
    color: '#ff6b6b',
    textDecorationLine: 'line-through',
  },
  optionPrice: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  modalTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  applyButton: {
    marginBottom: 10,
  },
});
