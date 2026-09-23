/**
 * 3ripple Hallelujah Ventures - Core Types & Models
 */

export enum GrainType {
  GLUTEN_FREE = "Gluten-Free Cereal Mix",
  RICE_COMBO = "Rice Combo Cereal Mix",
  MAIZE_COMBO = "Maize Combo Cereal Mix",
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string; // e.g. "500g"
  stock: number;
  grainType: GrainType;
  image: string;
  isPopular?: boolean;
  ingredients?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Unit price at time of purchase
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: any;
  customerName?: string;
  customerPhone?: string;
  subtotal?: number;
  shippingFee?: number;
  tax?: number;
  deliveryMethod?: "standard" | "express";
  shippingAddress?: Address;
  paymentMethod?: "card" | "momo" | "whatsapp";
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  phone?: string;
  isAdmin?: boolean;
  wishlist?: string[];
  savedAddresses: Address[];
}
