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
  View,
} from 'react-native';

import Button from '../../components/Button';
import { foodService } from '../../services/foodService';
import { FoodItem } from '../../types';

const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Alcohol', 'Burgers'];

const categoryAccents: Record<string, string> = {
  Starters: '#f97316',
  Mains: '#2563eb',
  Desserts: '#db2777',
  Beverages: '#0f766e',
  Alcohol: '#7c3aed',
  Burgers: '#b45309',
};

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
    category: categories[0],
    imageUrl: '',
  });

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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories[0],
      imageUrl: '',
    });
    setSelectedItem(null);
  };

  const handleAddItem = () => {
    setEditMode(false);
    resetForm();
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
    Alert.alert('Delete Item', `Delete "${item.name}" from the menu?`, [
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
        },
      },
    ]);
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl.trim() || 'https://via.placeholder.com/300x200?text=Food+Item',
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
      resetForm();
      loadMenuItems();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = foodItems.filter((item) => item.category === category);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  const totalItems = foodItems.length;
  const averagePrice =
    foodItems.length > 0
      ? foodItems.reduce((sum, item) => sum + item.price, 0) / foodItems.length
      : 0;

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEyebrow}>Menu Studio</Text>
          <Text style={styles.loadingText}>Loading menu inventory...</Text>
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

          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Menu Studio</Text>
              <Text style={styles.heroTitle}>Shape the dishes customers see first</Text>
              <Text style={styles.heroSubtitle}>
                Manage pricing, descriptions, and category coverage from one focused screen.
              </Text>
            </View>
            <TouchableOpacity style={styles.addAction} onPress={handleAddItem} activeOpacity={0.88}>
              <Ionicons name="add" size={18} color="#0f172a" />
              <Text style={styles.addActionText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroMetrics}>
            <MetricCard label="Menu Items" value={`${totalItems}`} />
            <MetricCard label="Categories" value={`${categories.length}`} />
            <MetricCard label="Average Price" value={`R${averagePrice.toFixed(0)}`} />
          </View>
        </View>

        {categories.map((category) => {
          const accent = categoryAccents[category] || '#2563eb';
          const items = groupedItems[category];

          return (
            <View key={category} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View>
                  <View style={[styles.categoryBadge, { backgroundColor: accent }]}>
                    <Text style={styles.categoryBadgeText}>{category}</Text>
                  </View>
                  <Text style={styles.categoryTitle}>{items.length} item{items.length === 1 ? '' : 's'} live</Text>
                </View>
                <View style={[styles.categoryCountPill, { borderColor: accent }]}>
                  <Text style={[styles.categoryCountText, { color: accent }]}>
                    {items.length.toString().padStart(2, '0')}
                  </Text>
                </View>
              </View>

              {items.length === 0 ? (
                <View style={styles.emptyCategory}>
                  <Ionicons name="grid-outline" size={24} color="#94a3b8" />
                  <Text style={styles.emptyTitle}>No items in this category</Text>
                  <Text style={styles.emptySubtitle}>Add a dish to keep the menu balanced.</Text>
                </View>
              ) : (
                items.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemMain}>
                      <View style={[styles.itemAccent, { backgroundColor: accent }]} />
                      <View style={styles.itemInfo}>
                        <View style={styles.itemHeadingRow}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <View style={styles.availabilityPill}>
                            <Text style={styles.availabilityText}>
                              {item.available ? 'Live' : 'Hidden'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.itemDescription} numberOfLines={2}>
                          {item.description || 'No description added yet.'}
                        </Text>
                        <View style={styles.itemFooterRow}>
                          <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
                          <Text style={styles.itemMeta}>
                            {item.imageUrl ? 'Image linked' : 'Placeholder image'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.editAction}
                        onPress={() => handleEditItem(item)}
                        activeOpacity={0.88}
                      >
                        <Ionicons name="create-outline" size={16} color="#0f172a" />
                        <Text style={styles.editActionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteAction}
                        onPress={() => handleDeleteItem(item)}
                        activeOpacity={0.88}
                      >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                        <Text style={styles.deleteActionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalEyebrow}>{editMode ? 'Update Dish' : 'New Dish'}</Text>
                <Text style={styles.modalTitle}>{editMode ? 'Refine menu details' : 'Add a new menu item'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#334155" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Item Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Crispy chicken burger"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the taste, texture, or combo."
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="89.99"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((category) => {
                    const selected = formData.category === category;
                    const accent = categoryAccents[category] || '#2563eb';

                    return (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          selected && { backgroundColor: accent, borderColor: accent },
                        ]}
                        onPress={() => setFormData({ ...formData, category })}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selected && styles.selectedCategoryChipText,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/food.jpg"
                  value={formData.imageUrl}
                  onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="outline" style={styles.modalButton} />
              <Button title={editMode ? 'Save Changes' : 'Add Item'} onPress={handleSaveItem} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
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
    padding: 20,
    backgroundColor: '#eef2f6',
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
    color: '#0f766e',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#102a43',
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 32,
    padding: 22,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -26,
    right: -18,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#14b8a6',
    opacity: 0.22,
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -46,
    left: -22,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#f97316',
    opacity: 0.18,
  },
  heroTopRow: {
    marginBottom: 22,
  },
  heroCopy: {
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#99f6e4',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 10,
    maxWidth: '85%',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#cbd5e1',
    maxWidth: '92%',
  },
  addAction: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
  },
  addActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#102a43',
  },
  categoryCountPill: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  categoryCountText: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyCategory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334e68',
    marginTop: 10,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7b8794',
  },
  itemCard: {
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 12,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  itemAccent: {
    width: 6,
    borderRadius: 999,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102a43',
    flex: 1,
  },
  availabilityPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#627d98',
    marginBottom: 12,
  },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d94f30',
  },
  itemMeta: {
    fontSize: 12,
    color: '#7b8794',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 10,
  },
  editAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  editActionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  deleteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deleteActionText: {
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#0f766e',
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334e68',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#102a43',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#dbe2ea',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#486581',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  modalButton: {
    flex: 1,
  },
});
