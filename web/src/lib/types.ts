// أنواع البيانات المشتركة بين الموقع وقاعدة البيانات.
// مطابقة لنماذج التطبيق في app/lib/data/models/.

export type Gender = 'men' | 'women' | 'unisex';

export type Concentration = 'parfum' | 'edp' | 'edt' | 'oil' | 'mist';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'cod' | 'card' | 'wallet' | 'instapay';

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  iconKey: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  brand: string;
  categoryId: string;
  description: string;
  price: number;
  oldPrice: number | null;
  sizeMl: number;
  gender: Gender;
  concentration: Concentration;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  longevityHours: number;
  stock: number;
  rating: number;
  ratingCount: number;
  soldCount: number;
  isFeatured: boolean;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number;
  sizeMl: number;
  quantity: number;
  imageUrl: string | null;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  building: string;
  notes: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  sizeMl: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode: string | null;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

// ── تسميات عربية ──────────────────────────────────────────────

export const genderLabels: Record<Gender, string> = {
  men: 'رجالي',
  women: 'حريمي',
  unisex: 'للجنسين',
};

export const concentrationLabels: Record<Concentration, string> = {
  parfum: 'Parfum — عطر مركّز',
  edp: 'EDP — أو دو بارفان',
  edt: 'EDT — أو دو تواليت',
  oil: 'زيت عطري',
  mist: 'بادي ميست',
};

export const concentrationShort: Record<Concentration, string> = {
  parfum: 'Parfum',
  edp: 'EDP',
  edt: 'EDT',
  oil: 'زيت',
  mist: 'ميست',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'تم التأكيد',
  preparing: 'جاري التجهيز',
  shipped: 'في الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  returned: 'مرتجع',
};

export const paymentLabels: Record<PaymentMethod, string> = {
  cod: 'الدفع عند الاستلام',
  card: 'بطاقة ائتمانية',
  wallet: 'محفظة إلكترونية',
  instapay: 'إنستا باي',
};
