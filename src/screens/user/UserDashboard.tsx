import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { foodService } from '../../services/foodService';
import { FoodItem } from '../../types';

const { useCart } = require('../../context/CartContext');
const { useAuth } = require('../../context/AuthContext');

type UserStackParamList = {
  UserDashboard: undefined;
  ViewItem: { item: FoodItem };
  Cart: undefined;
  Checkout: undefined;
  Profile: undefined;
};

type UserNavigationProp = NativeStackNavigationProp<UserStackParamList>;

const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Alcohol', 'Burgers'];

const categoryAccent: Record<string, string> = {
  Starters: '#c96c3a',
  Mains: '#d94f30',
  Desserts: '#e39a44',
  Beverages: '#2f7a78',
  Alcohol: '#6c4ab6',
  Burgers: '#7a3f22',
};

export default function UserDashboard() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigation = useNavigation<UserNavigationProp>();
  const { cart } = useCart();
  const { logout, user } = useAuth();

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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = foodItems.filter(
      (item) => item.category === category && item.available
    );
    return acc;
  }, {} as Record<string, FoodItem[]>);

  const filteredItems = selectedCategory
    ? groupedItems[selectedCategory] || []
    : foodItems.filter((item) => item.available);

  const featuredItems = foodItems.filter((item) => item.available).slice(0, 4);
  const availableItems = foodItems.filter((item) => item.available);
  const firstName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Guest';

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEyebrow}>Preparing your menu</Text>
          <Text style={styles.loadingText}>Loading fresh items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroShell}>
          <View style={styles.heroBackgroundOne} />
          <View style={styles.heroBackgroundTwo} />

          <View style={styles.topBar}>
            <View>
              <Text style={styles.welcomeLabel}>Good food, fast</Text>
              <Text style={styles.heroTitle}>Hello, {firstName}</Text>
            </View>

            <View style={styles.topActions}>
              <TouchableOpacity style={styles.logoutAction} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#102a43" />
                <Text style={styles.logoutActionText}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cartAction}
                onPress={() => navigation.navigate('Cart')}
              >
                <Ionicons name="bag-handle-outline" size={22} color="#fffaf2" />
                {cart.totalItems > 0 && (
                  <View style={styles.heroCartBadge}>
                    <Text style={styles.heroCartBadgeText}>{cart.totalItems}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.heroSubtitle}>
            Explore curated plates, quick drinks, and desserts that actually look worth ordering.
          </Text>

          <View style={styles.heroStats}>
            <StatCard label="Available Today" value={`${availableItems.length}`} />
            <StatCard label="In Cart" value={`${cart.totalItems}`} />
            <StatCard label="Categories" value={`${categories.length}`} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse By Category</Text>
          <Text style={styles.sectionCaption}>Pick a lane or explore everything</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRail}
        >
          <CategoryPill
            label="All"
            accent="#102a43"
            active={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
          />
          {categories.map((category) => (
            <CategoryPill
              key={category}
              label={category}
              accent={categoryAccent[category] || '#d94f30'}
              active={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>

        {!selectedCategory && featuredItems.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Picks</Text>
              <Text style={styles.sectionCaption}>A quick start if you do not want to scroll forever</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredRail}
            >
              {featuredItems.map((item, index) => (
                <FeaturedFoodCard
                  key={item.id}
                  item={item}
                  onPress={handleViewItem}
                  accent={index % 2 === 0 ? '#f97316' : '#0f766e'}
                />
              ))}
            </ScrollView>
          </>
        )}

        {selectedCategory ? (
          <MenuSection
            title={selectedCategory}
            caption={`${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'} ready to order`}
          >
            {filteredItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={28} color="#9fb3c8" />
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptyText}>Try another category or refresh the menu.</Text>
              </View>
            ) : (
              filteredItems.map((item, index) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onViewItem={handleViewItem}
                />
              ))
            )}
          </MenuSection>
        ) : (
          categories.map(
            (category) =>
              groupedItems[category].length > 0 && (
                <MenuSection
                  key={category}
                  title={category}
                  caption={`${groupedItems[category].length} item${groupedItems[category].length === 1 ? '' : 's'}`}
                >
                  {groupedItems[category].slice(0, 4).map((item, index) => (
                    <FoodItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      onViewItem={handleViewItem}
                    />
                  ))}
                </MenuSection>
              )
          )
        )}
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
          <View style={[styles.navIconWrap, styles.navIconWrapActive]}>
            <Ionicons name="home" size={20} color="#fffaf2" />
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.85}
        >
          <View style={styles.navIconWrap}>
            <Ionicons name="bag-handle-outline" size={20} color="#52606d" />
            {cart.totalItems > 0 && (
              <View style={styles.bottomNavBadge}>
                <Text style={styles.bottomNavBadgeText}>{cart.totalItems}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
        >
          <View style={styles.navIconWrap}>
            <Ionicons name="person-outline" size={20} color="#52606d" />
          </View>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const CategoryPill = ({
  label,
  accent,
  active,
  onPress,
}: {
  label: string;
  accent: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.categoryPill,
      active && { backgroundColor: accent, borderColor: accent },
    ]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text
      style={[
        styles.categoryPillText,
        active && styles.categoryPillTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const FeaturedFoodCard = ({
  item,
  onPress,
  accent,
}: {
  item: FoodItem;
  onPress: (item: FoodItem) => void;
  accent: string;
}) => (
  <TouchableOpacity
    style={[styles.featuredCard, { backgroundColor: accent }]}
    onPress={() => onPress(item)}
    activeOpacity={0.88}
  >
    <View style={styles.featuredTextBlock}>
      <Text style={styles.featuredLabel}>Chef Highlight</Text>
      <Text style={styles.featuredName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.featuredDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.featuredPrice}>R{item.price.toFixed(2)}</Text>
    </View>

    <Image
      source={{ uri: item.imageUrl }}
      style={styles.featuredImage}
      defaultSource={require('../../../assets/images/FoodApp-logo.png')}
    />
  </TouchableOpacity>
);

const MenuSection = ({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) => (
  <View style={styles.menuSection}>
    <View style={styles.menuSectionHeader}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      <Text style={styles.menuSectionCaption}>{caption}</Text>
    </View>
    {children}
  </View>
);

const FoodItemCard = ({
  item,
  index,
  onViewItem,
}: {
  item: FoodItem;
  index: number;
  onViewItem: (item: FoodItem) => void;
}) => (
  <TouchableOpacity
    style={styles.itemCard}
    onPress={() => onViewItem(item)}
    activeOpacity={0.9}
  >
    <Image
      source={{ uri: item.imageUrl }}
      style={styles.itemImage}
      defaultSource={require('../../../assets/images/FoodApp-logo.png')}
    />

    <View style={styles.itemOverlay}>
      <View style={styles.itemMetaRow}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexBadgeText}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
        <Text style={styles.itemCategoryText}>{item.category}</Text>
      </View>

      <View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.itemFooter}>
        <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Dish</Text>
          <Ionicons name="arrow-forward" size={14} color="#102a43" />
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4efe6',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 120,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4efe6',
    padding: 24,
  },
  loadingCard: {
    backgroundColor: '#fffaf2',
    paddingHorizontal: 28,
    paddingVertical: 30,
    borderRadius: 28,
    alignItems: 'center',
  },
  loadingEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#c96c3a',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#102a43',
  },
  heroShell: {
    backgroundColor: '#fffaf2',
    borderRadius: 30,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroBackgroundOne: {
    position: 'absolute',
    top: -18,
    right: -12,
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: '#f7c873',
    opacity: 0.35,
  },
  heroBackgroundTwo: {
    position: 'absolute',
    bottom: -44,
    left: -34,
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: '#f08c5a',
    opacity: 0.16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  welcomeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c96c3a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#102a43',
  },
  topActions: {
    alignItems: 'flex-end',
    gap: 10,
  },
  logoutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    gap: 6,
  },
  logoutActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102a43',
  },
  cartAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#102a43',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroCartBadge: {
    position: 'absolute',
    top: -3,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: '#d94f30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#52606d',
    maxWidth: '88%',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7b8794',
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 4,
  },
  sectionCaption: {
    fontSize: 14,
    color: '#7b8794',
  },
  categoryRail: {
    paddingBottom: 8,
    paddingRight: 8,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#fffaf2',
    borderWidth: 1,
    borderColor: '#eadfce',
    marginRight: 10,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334e68',
  },
  categoryPillTextActive: {
    color: '#fffaf2',
  },
  featuredRail: {
    paddingBottom: 8,
    paddingRight: 8,
  },
  featuredCard: {
    width: 300,
    minHeight: 188,
    borderRadius: 28,
    padding: 18,
    marginRight: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  featuredTextBlock: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'space-between',
  },
  featuredLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#fff5ea',
    marginBottom: 10,
  },
  featuredName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fffaf2',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#fff0e6',
    marginBottom: 12,
  },
  featuredPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fffaf2',
  },
  featuredImage: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuSection: {
    marginBottom: 26,
  },
  menuSectionHeader: {
    marginBottom: 14,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 4,
  },
  menuSectionCaption: {
    fontSize: 13,
    color: '#7b8794',
  },
  emptyState: {
    backgroundColor: '#fffaf2',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334e68',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#7b8794',
    textAlign: 'center',
  },
  itemCard: {
    height: 208,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#d9e2ec',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#d9e2ec',
  },
  itemOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 42, 67, 0.44)',
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indexBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 250, 242, 0.18)',
  },
  indexBadgeText: {
    color: '#fffaf2',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  itemCategoryText: {
    color: '#fff0e6',
    fontSize: 12,
    fontWeight: '600',
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fffaf2',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#f0f4f8',
    maxWidth: '90%',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffd36a',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffaf2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102a43',
  },
  bottomNavigation: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fffaf2',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: '#102a43',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1e9dc',
    position: 'relative',
    marginBottom: 6,
  },
  navIconWrapActive: {
    backgroundColor: '#102a43',
  },
  navText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7b8794',
  },
  activeNavText: {
    color: '#102a43',
  },
  bottomNavBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#d94f30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
