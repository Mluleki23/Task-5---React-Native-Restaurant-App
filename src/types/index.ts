export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: 'customer' | 'admin' | 'staff';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
