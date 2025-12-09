export interface Region {
  id: string;
  name: string;
  flag: string;
  customInput?: CustomInputConfig;
}

export interface Denomination {
  id: string;
  label: string;
  price: number;
}

export interface ApiConfig {
  type: 'manual' | 'api';
  providerName?: string;
  serviceId?: string;
  autoApprove?: boolean;
}

export interface CustomInputConfig {
  enabled: boolean;
  label: string;
  placeholder?: string;
  required: boolean;
  type?: 'text' | 'number';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageColor: string;
  imageUrl?: string;
  tag?: string;
  description?: string;
  stock?: number;
  regions?: Region[];
  denominations?: Denomination[];
  apiConfig?: ApiConfig;
  autoDeliverStock?: boolean;
  customInput?: CustomInputConfig;
}

export interface InventoryCode {
  id: string;
  productId: string;
  regionId?: string;
  denominationId?: string;
  code: string;
  isUsed: boolean;
  dateAdded: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category?: string;
  price: number;
  imageUrl?: string;
  imageColor: string;
  selectedRegion?: Region;
  selectedDenomination?: Denomination;
  quantity: number;
  apiConfig?: ApiConfig;
  customInputValue?: string;
  customInputLabel?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productName: string;
  productCategory?: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  deliveredCode?: string;
  fulfillmentType: 'manual' | 'api' | 'stock';
  rejectionReason?: string;
  regionName?: string;
  quantityLabel?: string;
  customInputValue?: string;
  customInputLabel?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: any;
}

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending';
  icon: any;
}

export interface Currency {
  code: string;
  name: string;
  flag: string;
  rate: number;
  symbol: string;
}

export interface AppTerms {
  contentAr: string; 
  contentEn: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  bg: string;
  pattern?: string;
  imageUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  joinedDate: string;
  status: 'active' | 'banned';
  ip?: string;
  avatar?: string;
  password?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'alert' | 'info' | 'ad';
  isActive: boolean;
  date: string;
}

export enum View {
  HOME = 'home',
  SEARCH = 'search',
  WALLET = 'wallet',
  ORDERS = 'orders',
  PROFILE = 'profile',
  NOTIFICATIONS = 'notifications',
  CART = 'cart',
  ADMIN = 'admin'
}