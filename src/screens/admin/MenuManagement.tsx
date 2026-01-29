import { Ionicons } from '@expo/vector-icons';

import React, { useEffect, useState } from 'react';

import {
    Alert,

    Modal,

    RefreshControl,

    ScrollView,

    StyleSheet,

    Text,

    TextInput,

    TouchableOpacity,

    View
} from 'react-native';

import Button from '../../components/Button';

import { foodService } from '../../services/foodService';

import { FoodItem } from '../../types';



export default function MenuManagement() {

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({

    name: '',

    description: '',

    price: '',

    category: '',

    imageUrl: '',

  });



  const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Alcohol', 'Burgers'];



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



  const handleAddItem = () => {

    setEditMode(false);

    setFormData({

      name: '',

      description: '',

      price: '',

      category: categories[0],

      imageUrl: '',

    });

    setSelectedItem(null);

    setModalVisible(true);

  };



  const handleEditItem = (item: FoodItem) => {

    setEditMode(true);

    setFormData({

      name: item.name,

      description: item.description,

      price: item.price.toString(),

      category: item.category,

      imageUrl: item.imageUrl || '',

    });

    setSelectedItem(item);

    setModalVisible(true);

  };



  const handleDeleteItem = (item: FoodItem) => {

    Alert.alert(

      'Delete Item',

      `Are you sure you want to delete "${item.name}"?`,

      [

        { text: 'Cancel', style: 'cancel' },

        {

          text: 'Delete',

          style: 'destructive',

          onPress: async () => {

            try {

              await foodService.deleteFoodItem(item.id!);

              Alert.alert('Success', 'Item deleted successfully');

              loadMenuItems();

            } catch (error) {

              console.error('Error deleting item:', error);

              Alert.alert('Error', 'Failed to delete item');

            }

          }

        }

      ]

    );

  };



  const handleSaveItem = async () => {

    if (!formData.name || !formData.price || !formData.category) {

      Alert.alert('Error', 'Please fill in all required fields');

      return;

    }



    try {

      const itemData = {

        name: formData.name,

        description: formData.description,

        price: parseFloat(formData.price),

        category: formData.category,

        imageUrl: formData.imageUrl || 'https://via.placeholder.com/300x200?text=Food+Item',

        available: true,

      };



      if (editMode && selectedItem) {

        await foodService.updateFoodItem(selectedItem.id!, itemData);

        Alert.alert('Success', 'Item updated successfully');

      } else {

        await foodService.createFoodItem(itemData);

        Alert.alert('Success', 'Item added successfully');

      }



      setModalVisible(false);

      loadMenuItems();

    } catch (error) {

      console.error('Error saving item:', error);

      Alert.alert('Error', 'Failed to save item');

    }

  };



  const groupedItems = categories.reduce((acc, category) => {

    acc[category] = foodItems.filter(item => item.category === category);

    return acc;

  }, {} as Record<string, FoodItem[]>);



  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <Text style={styles.loadingText}>Loading Menu Items...</Text>

      </View>

    );

  }



  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>Menu Management</Text>

        <Button title="Add Item" onPress={handleAddItem} />

      </View>



      <ScrollView

        style={styles.content}

        refreshControl={

          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />

        }

      >

        {categories.map(category => (

          <View key={category} style={styles.categorySection}>

            <Text style={styles.categoryTitle}>{category}</Text>

            {groupedItems[category].length === 0 ? (

              <Text style={styles.emptyText}>No items in this category</Text>

            ) : (

              groupedItems[category].map(item => (

                <View key={item.id} style={styles.itemCard}>

                  <View style={styles.itemInfo}>

                    <Text style={styles.itemName}>{item.name}</Text>

                    <Text style={styles.itemDescription} numberOfLines={2}>

                      {item.description}

                    </Text>

                    <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>

                  </View>

                  <View style={styles.itemActions}>

                    <TouchableOpacity

                      style={[styles.actionButton, styles.editButton]}

                      onPress={() => handleEditItem(item)}

                    >

                      <Ionicons name="create" size={20} color="white" />

                    </TouchableOpacity>

                    <TouchableOpacity

                      style={[styles.actionButton, styles.deleteButton]}

                      onPress={() => handleDeleteItem(item)}

                    >

                      <Ionicons name="trash" size={20} color="white" />

                    </TouchableOpacity>

                  </View>

                </View>

              ))

            )}

          </View>

        ))}

      </ScrollView>



      {/* Add/Edit Modal */}

      <Modal

        animationType="slide"

        transparent={true}

        visible={modalVisible}

        onRequestClose={() => setModalVisible(false)}

      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>

              {editMode ? 'Edit Item' : 'Add New Item'}

            </Text>



            <TextInput

              style={styles.input}

              placeholder="Item Name *"

              value={formData.name}

              onChangeText={(text) => setFormData({ ...formData, name: text })}

            />



            <TextInput

              style={[styles.input, styles.textArea]}

              placeholder="Description"

              value={formData.description}

              onChangeText={(text) => setFormData({ ...formData, description: text })}

              multiline

              numberOfLines={3}

            />



            <TextInput

              style={styles.input}

              placeholder="Price *"

              value={formData.price}

              onChangeText={(text) => setFormData({ ...formData, price: text })}

              keyboardType="decimal-pad"

            />



            <Text style={styles.label}>Category *</Text>

            <ScrollView horizontal style={styles.categorySelector}>

              {categories.map(category => (

                <TouchableOpacity

                  key={category}

                  style={[

                    styles.categoryChip,

                    formData.category === category && styles.selectedCategory

                  ]}

                  onPress={() => setFormData({ ...formData, category })}

                >

                  <Text style={[

                    styles.categoryChipText,

                    formData.category === category && styles.selectedCategoryText

                  ]}>

                    {category}

                  </Text>

                </TouchableOpacity>

              ))}

            </ScrollView>



            <TextInput

              style={styles.input}

              placeholder="Image URL"

              value={formData.imageUrl}

              onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}

            />



            <View style={styles.modalActions}>

              <Button

                title="Cancel"

                onPress={() => setModalVisible(false)}

                variant="outline"

              />

              <Button title={editMode ? 'Update' : 'Add'} onPress={handleSaveItem} />

            </View>

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

    padding: 15,

    borderRadius: 10,

    marginBottom: 10,

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    elevation: 3,

  },

  itemInfo: {

    flex: 1,

    marginRight: 15,

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

    marginBottom: 5,

  },

  itemPrice: {

    fontSize: 16,

    fontWeight: 'bold',

    color: '#ff6b6b',

  },

  itemActions: {

    flexDirection: 'row',

  },

  actionButton: {

    width: 40,

    height: 40,

    borderRadius: 20,

    justifyContent: 'center',

    alignItems: 'center',

    marginLeft: 10,

  },

  editButton: {

    backgroundColor: '#4ecdc4',

  },

  deleteButton: {

    backgroundColor: '#ff6b6b',

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

    padding: 25,

    width: '90%',

    maxHeight: '80%',

  },

  modalTitle: {

    fontSize: 20,

    fontWeight: 'bold',

    color: '#2c3e50',

    marginBottom: 20,

    textAlign: 'center',

  },

  input: {

    borderWidth: 1,

    borderColor: '#ddd',

    borderRadius: 8,

    padding: 12,

    fontSize: 16,

    marginBottom: 15,

    backgroundColor: '#f8f9fa',

  },

  textArea: {

    height: 80,

    textAlignVertical: 'top',

  },

  label: {

    fontSize: 16,

    fontWeight: 'bold',

    color: '#2c3e50',

    marginBottom: 10,

  },

  categorySelector: {

    marginBottom: 15,

  },

  categoryChip: {

    backgroundColor: '#f1f3f4',

    paddingHorizontal: 15,

    paddingVertical: 8,

    borderRadius: 20,

    marginRight: 10,

  },

  selectedCategory: {

    backgroundColor: '#ff6b6b',

  },

  categoryChipText: {

    fontSize: 14,

    color: '#666',

  },

  selectedCategoryText: {

    color: '#fff',

    fontWeight: 'bold',

  },

  modalActions: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    marginTop: 20,

  },

});

