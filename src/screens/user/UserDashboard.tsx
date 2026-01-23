import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { foodService } from '../../services/foodService';
import { FoodItem } from '../../types';

type UserStackParamList = {
  UserDashboard: undefined;
  ViewItem: { item: FoodItem };
  Cart: undefined;
  Checkout: undefined;
  Profile: undefined;
};

type UserNavigationProp = NativeStackNavigationProp<UserStackParamList>;

const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Alcohol', 'Burgers'];

export default function UserDashboard() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigation = useNavigation<UserNavigationProp>();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await foodService.getAllFoodItems();
      setFoodItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMenuItems();
  };

  const handleViewItem = (item: FoodItem) => {
    navigation.navigate('ViewItem', { item });
  };

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = foodItems.filter(item => 
      item.category === category && item.available
    );
    return acc;
  }, {} as Record<string, FoodItem[]>);

  const filteredItems = selectedCategory 
    ? groupedItems[selectedCategory] || []
    : foodItems.filter(item => item.available);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurant Menu</Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        style={styles.categoryContainer}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.selectedCategory
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === null && styles.selectedCategoryText
          ]}>
            All Items
          </Text>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category}
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
        {selectedCategory ? (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{selectedCategory}</Text>
            {filteredItems.length === 0 ? (
              <Text style={styles.emptyText}>No items available in this category</Text>
            ) : (
              filteredItems.map(item => (
                <FoodItemCard 
                  key={item.id} 
                  item={item} 
                  onViewItem={handleViewItem} 
                />
              ))
            )}
          </View>
        ) : (
          categories.map(category => (
            groupedItems[category].length > 0 && (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {groupedItems[category].map(item => (
                  <FoodItemCard 
                    key={item.id} 
                    item={item} 
                    onViewItem={handleViewItem} 
                  />
                ))}
              </View>
            )
          ))
        )}
      </ScrollView>
    </View>
  );
}

const FoodItemCard = ({ 
  item, 
  onViewItem 
}: { 
  item: FoodItem; 
  onViewItem: (item: FoodItem) => void;
}) => (
  <TouchableOpacity 
    style={styles.itemCard}
    onPress={() => onViewItem(item)}
  >
    <Image 
      source={{ uri: item.imageUrl }} 
      style={styles.itemImage}
      defaultSource={require('../../../assets/images/FoodApp logo.png')}
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.itemFooter}>
        <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => onViewItem(item)}
        >
          <Ionicons name="eye" size={16} color="white" />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

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
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#ff6b6b',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#ff6b6b',
    paddingBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f1f3f4',
  },
  itemInfo: {
    padding: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
