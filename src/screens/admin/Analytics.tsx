import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
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
      
      // Load all data
      const orders = await orderService.getAllOrders();
      const foodItems = await foodService.getAllFoodItems();
      const users = await userService.getAllUsers();

      // Calculate daily revenue for last 7 days
      const dailyRevenue = calculateDailyRevenue(orders);
      
      // Calculate top selling items
      const topSellingItems = calculateTopSellingItems(orders);
      
      // Calculate order status distribution
      const orderStatusDistribution = calculateOrderStatusDistribution(orders);
      
      // Calculate monthly stats
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
      
      const dayOrders = orders.filter(order => {
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
    
    orders.forEach(order => {
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
      pending: '#ff6b6b',
      preparing: '#feca57',
      ready: '#48dbfb',
      delivered: '#1dd1a1',
      cancelled: '#ee5a6f',
    };
    
    orders.forEach(order => {
      if (statusCount[order.status]) {
        statusCount[order.status]++;
      } else {
        statusCount[order.status] = 1;
      }
    });
    
    return Object.entries(statusCount).map(([name, population]) => ({
      name,
      population,
      color: colors[name as keyof typeof colors] || '#999',
    }));
  };

  const calculateMonthlyStats = (orders: any[], users: any[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const totalRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = monthOrders.length > 0 ? totalRevenue / monthOrders.length : 0;
    
    // Calculate active users (users who placed orders this month)
    const activeUserIds = new Set(monthOrders.map(order => order.userId));
    
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

  const StatCard = ({ title, value, subtitle, color }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
      </View>

      {/* Monthly Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Performance</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Orders" 
            value={analyticsData.monthlyStats.totalOrders}
            color="#ff6b6b"
          />
          <StatCard 
            title="Revenue" 
            value={`R${analyticsData.monthlyStats.totalRevenue.toFixed(2)}`}
            color="#4ecdc4"
          />
          <StatCard 
            title="Avg Order Value" 
            value={`R${analyticsData.monthlyStats.averageOrderValue.toFixed(2)}`}
            color="#45b7d1"
          />
          <StatCard 
            title="Active Users" 
            value={`${analyticsData.monthlyStats.activeUsers}/${analyticsData.monthlyStats.totalUsers}`}
            subtitle="This month"
            color="#96ceb4"
          />
        </View>
      </View>

      {/* Daily Revenue Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Revenue (Last 7 Days)</Text>
        <View style={styles.chartContainer}>
          {analyticsData.dailyRevenue.map((item, index) => (
            <View key={index} style={styles.revenueItem}>
              <Text style={styles.revenueDay}>{item.day}</Text>
              <Text style={styles.revenueAmount}>R{item.revenue.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Selling Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Selling Items</Text>
        <View style={styles.chartContainer}>
          {analyticsData.topSellingItems.map((item, index) => (
            <View key={index} style={styles.topItem}>
              <Text style={styles.topItemName}>{item.name}</Text>
              <Text style={styles.topItemQuantity}>{item.quantity} sold</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Order Status Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status Distribution</Text>
        <View style={styles.chartContainer}>
          {analyticsData.orderStatusDistribution.map((item, index) => (
            <View key={index} style={styles.statusItem}>
              <View style={[styles.statusColor, { backgroundColor: item.color }]} />
              <Text style={styles.statusText}>{item.name}: {item.population}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  revenueDay: {
    fontSize: 14,
    color: '#666',
  },
  revenueAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  topItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  topItemName: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  topItemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ecdc4',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
});
