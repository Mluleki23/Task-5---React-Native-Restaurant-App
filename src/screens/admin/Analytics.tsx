import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { foodService } from '../../services/foodService';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';

interface AnalyticsData {
  dailyRevenue: { day: string; revenue: number }[];
  topSellingItems: { name: string; quantity: number }[];
  orderStatusDistribution: { name: string; population: number; color: string }[];
  monthlyStats: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalUsers: number;
    activeUsers: number;
  };
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailyRevenue: [],
    topSellingItems: [],
    orderStatusDistribution: [],
    monthlyStats: {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      totalUsers: 0,
      activeUsers: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      const orders = await orderService.getAllOrders();
      await foodService.getAllFoodItems();
      const users = await userService.getAllUsers();

      const dailyRevenue = calculateDailyRevenue(orders);
      const topSellingItems = calculateTopSellingItems(orders);
      const orderStatusDistribution = calculateOrderStatusDistribution(orders);
      const monthlyStats = calculateMonthlyStats(orders, users);

      setAnalyticsData({
        dailyRevenue,
        topSellingItems,
        orderStatusDistribution,
        monthlyStats,
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDailyRevenue = (orders: any[]) => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });

      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      last7Days.push({ day: dayName, revenue: dayRevenue });
    }

    return last7Days;
  };

  const calculateTopSellingItems = (orders: any[]) => {
    const itemSales: { [key: string]: number } = {};

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        if (itemSales[item.name]) {
          itemSales[item.name] += item.quantity;
        } else {
          itemSales[item.name] = item.quantity;
        }
      });
    });

    return Object.entries(itemSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const calculateOrderStatusDistribution = (orders: any[]) => {
    const statusCount: { [key: string]: number } = {};
    const colors = {
      pending: '#ff7a59',
      preparing: '#f5a623',
      ready: '#2bb0ed',
      delivered: '#20a39e',
      cancelled: '#d64545',
    };

    orders.forEach((order) => {
      if (statusCount[order.status]) {
        statusCount[order.status]++;
      } else {
        statusCount[order.status] = 1;
      }
    });

    return Object.entries(statusCount).map(([name, population]) => ({
      name,
      population,
      color: colors[name as keyof typeof colors] || '#94a3b8',
    }));
  };

  const calculateMonthlyStats = (orders: any[], users: any[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const totalRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue =
      monthOrders.length > 0 ? totalRevenue / monthOrders.length : 0;

    const activeUserIds = new Set(monthOrders.map((order) => order.userId));

    return {
      totalOrders: monthOrders.length,
      totalRevenue,
      averageOrderValue,
      totalUsers: users.length,
      activeUsers: activeUserIds.size,
    };
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const maxDailyRevenue = Math.max(
    ...analyticsData.dailyRevenue.map((item) => item.revenue),
    1
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEyebrow}>Analytics</Text>
          <Text style={styles.loadingText}>Crunching the numbers...</Text>
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
          <Text style={styles.heroEyebrow}>Revenue Intelligence</Text>
          <Text style={styles.heroTitle}>Analytics Dashboard</Text>
          <Text style={styles.heroSubtitle}>
            A cleaner view of monthly performance, daily revenue movement, and product demand.
          </Text>

          <View style={styles.heroMetrics}>
            <MetricBadge
              label="Monthly Revenue"
              value={`R${analyticsData.monthlyStats.totalRevenue.toFixed(0)}`}
            />
            <MetricBadge
              label="Monthly Orders"
              value={`${analyticsData.monthlyStats.totalOrders}`}
            />
            <MetricBadge
              label="Active Users"
              value={`${analyticsData.monthlyStats.activeUsers}`}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Performance</Text>
          <Text style={styles.sectionSubtitle}>Core operational benchmarks</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Revenue"
            value={`R${analyticsData.monthlyStats.totalRevenue.toFixed(2)}`}
            accent="#20a39e"
            icon="cash-outline"
          />
          <StatCard
            title="Total Orders"
            value={`${analyticsData.monthlyStats.totalOrders}`}
            accent="#1f6feb"
            icon="receipt-outline"
          />
          <StatCard
            title="Avg Order Value"
            value={`R${analyticsData.monthlyStats.averageOrderValue.toFixed(2)}`}
            accent="#7c3aed"
            icon="stats-chart-outline"
          />
          <StatCard
            title="Users Active"
            value={`${analyticsData.monthlyStats.activeUsers}/${analyticsData.monthlyStats.totalUsers}`}
            accent="#d94f30"
            icon="people-outline"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Revenue</Text>
          <Text style={styles.sectionSubtitle}>Last 7 days</Text>
        </View>

        <View style={styles.panel}>
          {analyticsData.dailyRevenue.map((item, index) => (
            <View key={index} style={styles.revenueRow}>
              <View style={styles.revenueRowHeader}>
                <Text style={styles.revenueDay}>{item.day}</Text>
                <Text style={styles.revenueAmount}>R{item.revenue.toFixed(2)}</Text>
              </View>
              <View style={styles.revenueTrack}>
                <View
                  style={[
                    styles.revenueFill,
                    { width: `${(item.revenue / maxDailyRevenue) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Selling Items</Text>
          <Text style={styles.sectionSubtitle}>Best performers by quantity sold</Text>
        </View>

        <View style={styles.panel}>
          {analyticsData.topSellingItems.length === 0 ? (
            <EmptyState text="No sales data available yet." />
          ) : (
            analyticsData.topSellingItems.map((item, index) => (
              <View key={index} style={styles.listRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.listPrimary}>{item.name}</Text>
                <Text style={styles.listSecondary}>{item.quantity} sold</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order Status Mix</Text>
          <Text style={styles.sectionSubtitle}>How orders are distributed right now</Text>
        </View>

        <View style={styles.panel}>
          {analyticsData.orderStatusDistribution.length === 0 ? (
            <EmptyState text="No order status data available yet." />
          ) : (
            analyticsData.orderStatusDistribution.map((item, index) => (
              <View key={index} style={styles.statusRow}>
                <View style={styles.statusLabelWrap}>
                  <View style={[styles.statusColor, { backgroundColor: item.color }]} />
                  <Text style={styles.statusText}>
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Text>
                </View>
                <Text style={styles.statusCount}>{item.population}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MetricBadge = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metricBadge}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const StatCard = ({
  title,
  value,
  accent,
  icon,
}: {
  title: string;
  value: string;
  accent: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: accent }]}>
      <Ionicons name={icon} size={18} color="#fff" />
    </View>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const EmptyState = ({ text }: { text: string }) => (
  <View style={styles.emptyState}>
    <Ionicons name="analytics-outline" size={22} color="#94a3b8" />
    <Text style={styles.emptyText}>{text}</Text>
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
    paddingBottom: 28,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f6',
    padding: 20,
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
    backgroundColor: '#102a43',
    borderRadius: 30,
    padding: 22,
    marginBottom: 24,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7dd3fc',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#cbd5e1',
    marginBottom: 20,
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBadge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 21,
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
  statCard: {
    width: '48.2%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627d98',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102a43',
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 18,
    marginBottom: 24,
  },
  revenueRow: {
    marginBottom: 14,
  },
  revenueRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  revenueDay: {
    fontSize: 14,
    color: '#334e68',
    fontWeight: '600',
  },
  revenueAmount: {
    fontSize: 14,
    color: '#102a43',
    fontWeight: '700',
  },
  revenueTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e6ecf2',
    overflow: 'hidden',
  },
  revenueFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#4c6fff',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#102a43',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listPrimary: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334e68',
  },
  listSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#20a39e',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f6',
  },
  statusLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334e68',
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102a43',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#627d98',
    marginTop: 10,
  },
});
