import Button from '@/src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { foodService } from '../../services/foodService';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import { Order } from '../../types';

type AdminStackParamList = {
  MenuManagement: undefined;
  OrdersManagement: undefined;
  Analytics: undefined;
  AdminDashboard: undefined;
};

type AdminNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalMenuItems: number;
  totalRevenue: number;
  preparingOrders: number;
  readyOrders: number;
}

export default function AdminDashboard() {
  const navigation = useNavigation<AdminNavigationProp>();
  const { logout, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    totalRevenue: 0,
    preparingOrders: 0,
    readyOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [menuItems, orders, users] = await Promise.all([
        foodService.getAllFoodItems(),
        orderService.getAllOrders(),
        userService.getAllUsers(),
      ]);

      const totalRevenue = orders
        .filter((order: Order) => order.status === 'delivered')
        .reduce((sum: number, order: Order) => sum + order.total, 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((order: Order) => order.status === 'pending').length,
        completedOrders: orders.filter((order: Order) => order.status === 'delivered').length,
        totalUsers: users.length,
        totalMenuItems: menuItems.length,
        totalRevenue,
        preparingOrders: orders.filter((order: Order) => order.status === 'preparing').length,
        readyOrders: orders.filter((order: Order) => order.status === 'ready').length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout },
    ]);
  };

  const adminName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Admin';

  const completionRate =
    stats.totalOrders > 0
      ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
      : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEyebrow}>Admin Console</Text>
          <Text style={styles.loadingText}>Loading live operations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>Operations Center</Text>
              <Text style={styles.heroTitle}>Welcome back, {adminName}</Text>
            </View>
            <Button title="Logout" onPress={handleLogout} variant="outline" style={styles.logoutButton} />
          </View>

          <Text style={styles.heroSubtitle}>
            Track orders, revenue, and platform activity from one place with live store metrics.
          </Text>

          <View style={styles.heroMetricsRow}>
            <HeroMetric label="Revenue" value={`R${stats.totalRevenue.toFixed(0)}`} />
            <HeroMetric label="Orders" value={`${stats.totalOrders}`} />
            <HeroMetric label="Completion" value={`${completionRate}%`} />
          </View>
        </View>

        <SectionHeader
          title="Operational Overview"
          subtitle="The numbers that matter right now"
        />

        <View style={styles.statsGrid}>
          <InsightCard
            title="Pending Orders"
            value={`${stats.pendingOrders}`}
            subtitle="Need kitchen attention"
            accent="#ff7a59"
            icon="time-outline"
          />
          <InsightCard
            title="Preparing"
            value={`${stats.preparingOrders}`}
            subtitle="Currently in progress"
            accent="#f5a623"
            icon="restaurant-outline"
          />
          <InsightCard
            title="Ready For Pickup"
            value={`${stats.readyOrders}`}
            subtitle="Prepared and waiting"
            accent="#2bb0ed"
            icon="checkmark-done-outline"
          />
          <InsightCard
            title="Menu Coverage"
            value={`${stats.totalMenuItems}`}
            subtitle="Published food items"
            accent="#20a39e"
            icon="grid-outline"
          />
        </View>

        <SectionHeader
          title="Admin Shortcuts"
          subtitle="Move quickly across the important workflows"
        />

        <View style={styles.actionGrid}>
          <QuickActionCard
            title="Manage Menu"
            subtitle="Add, refine, and retire dishes"
            icon="restaurant"
            accent="#1f6feb"
            onPress={() => navigation.navigate('MenuManagement')}
          />
          <QuickActionCard
            title="Orders Queue"
            subtitle={`${stats.pendingOrders + stats.preparingOrders} active orders`}
            icon="receipt"
            accent="#d94f30"
            onPress={() => navigation.navigate('OrdersManagement')}
          />
          <QuickActionCard
            title="Analytics"
            subtitle="Review revenue and sales movement"
            icon="bar-chart"
            accent="#6f42c1"
            onPress={() => navigation.navigate('Analytics')}
          />
          <QuickActionCard
            title="Customers"
            subtitle={`${stats.totalUsers} registered accounts`}
            icon="people"
            accent="#13795b"
            onPress={() => {}}
          />
        </View>

        <SectionHeader
          title="Live Snapshot"
          subtitle="A compact view of current platform health"
        />

        <View style={styles.snapshotCard}>
          <SnapshotRow
            label="Delivered Orders"
            value={`${stats.completedOrders}`}
            tone="#13795b"
          />
          <SnapshotRow
            label="Registered Users"
            value={`${stats.totalUsers}`}
            tone="#1f6feb"
          />
          <SnapshotRow
            label="Average Revenue / Order"
            value={
              stats.totalOrders > 0
                ? `R${(stats.totalRevenue / stats.totalOrders).toFixed(2)}`
                : 'R0.00'
            }
            tone="#7a3e00"
          />
          <SnapshotRow
            label="Store Status"
            value="Live"
            tone="#d94f30"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionSubtitle}>{subtitle}</Text>
  </View>
);

const HeroMetric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.heroMetricCard}>
    <Text style={styles.heroMetricValue}>{value}</Text>
    <Text style={styles.heroMetricLabel}>{label}</Text>
  </View>
);

const InsightCard = ({
  title,
  value,
  subtitle,
  accent,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) => (
  <View style={styles.insightCard}>
    <View style={[styles.insightIconWrap, { backgroundColor: accent }]}>
      <Ionicons name={icon} size={18} color="#fff" />
    </View>
    <Text style={styles.insightTitle}>{title}</Text>
    <Text style={styles.insightValue}>{value}</Text>
    <Text style={styles.insightSubtitle}>{subtitle}</Text>
  </View>
);

const QuickActionCard = ({
  title,
  subtitle,
  icon,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.quickActionCard}
    onPress={onPress}
    activeOpacity={0.88}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: accent }]}>
      <Ionicons name={icon} size={18} color="#fff" />
    </View>
    <Text style={styles.quickActionTitle}>{title}</Text>
    <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const SnapshotRow = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) => (
  <View style={styles.snapshotRow}>
    <View style={styles.snapshotLabelWrap}>
      <View style={[styles.snapshotDot, { backgroundColor: tone }]} />
      <Text style={styles.snapshotLabel}>{label}</Text>
    </View>
    <Text style={styles.snapshotValue}>{value}</Text>
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
    backgroundColor: '#eef2f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#4c6fff',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#102a43',
  },
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 32,
    padding: 22,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroGlowOne: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#4c6fff',
    opacity: 0.28,
  },
  heroGlowTwo: {
    position: 'absolute',
    bottom: -48,
    left: -26,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#00bcd4',
    opacity: 0.16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#93c5fd',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#f8fafc',
    maxWidth: '82%',
  },
  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: '92%',
  },
  logoutButton: {
    borderColor: '#475569',
    minWidth: 92,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroMetricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  heroMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  heroMetricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#627d98',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  insightCard: {
    width: '48.2%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
  },
  insightIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 13,
    color: '#627d98',
    fontWeight: '600',
    marginBottom: 6,
  },
  insightValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 6,
  },
  insightSubtitle: {
    fontSize: 12,
    color: '#7b8794',
    lineHeight: 18,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionCard: {
    width: '48.2%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    minHeight: 140,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 8,
  },
  quickActionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#627d98',
  },
  snapshotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 18,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  snapshotLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  snapshotDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  snapshotLabel: {
    fontSize: 14,
    color: '#334e68',
    fontWeight: '600',
  },
  snapshotValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102a43',
  },
});
