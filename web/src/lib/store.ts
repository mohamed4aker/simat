/**
 * طبقة البيانات الوحيدة في الموقع.
 *
 * كل الصفحات بتنادي الدوال دي، وهي اللي بتقرر تجيب البيانات من
 * Supabase (لو متظبّطة) ولا من البيانات المحليّة. يعني لو غيّرنا
 * الباك إند بعدين، الملف ده بس هو اللي بيتغيّر.
 */
import { normalizeArabic } from './format';
import * as seed from './seed';
import { supabase, isLive } from './supabase';
import type {
  Category,
  Concentration,
  Coupon,
  Gender,
  Product,
  Review,
} from './types';

export { isLive };

// ── تحويل صفوف قاعدة البيانات لنماذج الموقع ──────────────────

type Row = Record<string, unknown>;

function toProduct(r: Row): Product {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    nameEn: String(r.name_en ?? ''),
    brand: String(r.brand ?? 'SIMAT'),
    categoryId: String(r.category_id ?? ''),
    description: String(r.description ?? ''),
    price: Number(r.price),
    oldPrice: r.old_price === null ? null : Number(r.old_price),
    sizeMl: Number(r.size_ml ?? 100),
    gender: (r.gender ?? 'unisex') as Gender,
    concentration: (r.concentration ?? 'edp') as Concentration,
    topNotes: (r.top_notes as string[]) ?? [],
    heartNotes: (r.heart_notes as string[]) ?? [],
    baseNotes: (r.base_notes as string[]) ?? [],
    longevityHours: Number(r.longevity_hours ?? 8),
    stock: Number(r.stock ?? 0),
    rating: Number(r.rating ?? 0),
    ratingCount: Number(r.rating_count ?? 0),
    soldCount: Number(r.sold_count ?? 0),
    isFeatured: Boolean(r.is_featured),
    isActive: r.is_active !== false,
    imageUrl: (r.image_url as string | null) ?? null,
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

function toCategory(r: Row): Category {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    nameEn: String(r.name_en ?? ''),
    description: String(r.description ?? ''),
    iconKey: String(r.icon_key ?? 'bottle'),
    sortOrder: Number(r.sort_order ?? 0),
  };
}

function toReview(r: Row): Review {
  return {
    id: String(r.id),
    productId: String(r.product_id),
    userName: String(r.user_name ?? 'عميل'),
    rating: Number(r.rating),
    comment: String(r.comment ?? ''),
    createdAt: String(r.created_at),
  };
}

// ── التصنيفات ────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const db = supabase();
  if (!db) {
    return [...seed.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const { data, error } = await db
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error || !data) return [];
  return data.map(toCategory);
}

// ── المنتجات ─────────────────────────────────────────────────

export interface ProductQuery {
  search?: string;
  category?: string;      // slug
  gender?: Gender;
  concentration?: Concentration;
  minPrice?: number;
  maxPrice?: number;
  onlyOffers?: boolean;
  inStock?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'best-selling';
}

async function allProducts(): Promise<Product[]> {
  const db = supabase();
  if (!db) return seed.products.filter((p) => p.isActive);
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('is_active', true);
  if (error || !data) return [];
  return data.map(toProduct);
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const categories = await getCategories();
  let list = await allProducts();

  if (query.search?.trim()) {
    const needle = normalizeArabic(query.search);
    list = list.filter((p) =>
      normalizeArabic(
        [p.name, p.nameEn, p.brand, p.description,
         ...p.topNotes, ...p.heartNotes, ...p.baseNotes].join(' '),
      ).includes(needle),
    );
  }

  if (query.category) {
    const cat = categories.find((c) => c.slug === query.category);
    if (cat) list = list.filter((p) => p.categoryId === cat.id);
    else return [];
  }
  if (query.gender) list = list.filter((p) => p.gender === query.gender);
  if (query.concentration) {
    list = list.filter((p) => p.concentration === query.concentration);
  }
  if (query.minPrice !== undefined) {
    list = list.filter((p) => p.price >= query.minPrice!);
  }
  if (query.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= query.maxPrice!);
  }
  if (query.onlyOffers) {
    list = list.filter((p) => p.oldPrice !== null && p.oldPrice > p.price);
  }
  if (query.inStock) list = list.filter((p) => p.stock > 0);

  switch (query.sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
    case 'best-selling':
      list.sort((a, b) => b.soldCount - a.soldCount);
      break;
    default:
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = supabase();
  if (!db) return seed.products.find((p) => p.slug === slug) ?? null;
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) return null;
  return toProduct(data as Row);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const db = supabase();
  if (!db) return seed.products.filter((p) => ids.includes(p.id));
  const { data, error } = await db
    .from('products')
    .select('*')
    .in('id', ids);
  if (error || !data) return [];
  return data.map(toProduct);
}

export async function getFeatured(limit = 8): Promise<Product[]> {
  const list = await allProducts();
  return list
    .filter((p) => p.isFeatured)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const list = await allProducts();
  return [...list].sort((a, b) => b.soldCount - a.soldCount).slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const list = await allProducts();
  return [...list]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}

export async function getOffers(limit = 8): Promise<Product[]> {
  const list = await allProducts();
  return list
    .filter((p) => p.oldPrice !== null && p.oldPrice > p.price)
    .slice(0, limit);
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const list = await allProducts();
  return list
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.categoryId === product.categoryId || p.gender === product.gender),
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export async function getReviews(productId: string): Promise<Review[]> {
  const db = supabase();
  if (!db) {
    return seed.reviews.filter((r) => r.productId === productId);
  }
  const { data, error } = await db
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return data.map(toReview);
}

// ── الكوبونات ────────────────────────────────────────────────

export interface CouponResult {
  ok: boolean;
  code?: string;
  discount?: number;
  label?: string;
  error?: string;
}

function localCoupon(code: string, subtotal: number): CouponResult {
  const c: Coupon | undefined = seed.coupons.find(
    (x) => x.code.toUpperCase() === code.trim().toUpperCase(),
  );
  if (!c) return { ok: false, error: 'الكود ده مش موجود' };
  if (!c.isActive) return { ok: false, error: 'الكود ده متوقّف حالياً' };
  if (new Date(c.expiresAt) < new Date()) {
    return { ok: false, error: 'الكود ده انتهت صلاحيته' };
  }
  if (subtotal < c.minOrder) {
    return { ok: false, error: `الكود ده للطلبات من ${c.minOrder} ج.م` };
  }
  const raw = c.type === 'percent' ? subtotal * (c.value / 100) : c.value;
  const discount = Math.min(raw, c.maxDiscount ?? raw, subtotal);
  return {
    ok: true,
    code: c.code,
    discount: Math.round(discount * 100) / 100,
    label:
      c.type === 'percent' ? `خصم ${c.value}%` : `خصم ${c.value} ج.م`,
  };
}

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponResult> {
  if (!code.trim()) return { ok: false, error: 'اكتب كود الخصم' };
  const db = supabase();
  if (!db) return localCoupon(code, subtotal);

  const { data, error } = await db.rpc('validate_coupon', {
    p_code: code.trim(),
    p_subtotal: subtotal,
  });
  if (error) return { ok: false, error: 'مش قادرين نتحقق من الكود دلوقتي' };
  return data as CouponResult;
}

// ── الطلبات ──────────────────────────────────────────────────

import type { OrderStatus, PaymentMethod, ShippingAddress } from './types';

export interface PlaceOrderInput {
  address: ShippingAddress;
  email?: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: string;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  total?: number;
  demo?: boolean;
  error?: string;
}

/**
 * بيسجّل الطلب في قاعدة البيانات من خلال دالة محميّة على السيرفر،
 * والأسعار بتتحسب هناك — فمحدش يقدر يبعت سعر من المتصفح.
 */
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const db = supabase();

  if (!db) {
    // وضع العرض: بنحسب الطلب ونرجّع رقم من غير ما نحفظه.
    const products = await getProductsByIds(
      input.items.map((i) => i.productId),
    );
    const subtotal = input.items.reduce((sum, i) => {
      const p = products.find((x) => x.id === i.productId);
      return sum + (p ? p.price * i.quantity : 0);
    }, 0);
    const { shippingFor } = await import('./constants');
    const shipping = shippingFor(input.address.governorate, subtotal);
    const coupon = input.couponCode
      ? await validateCoupon(input.couponCode, subtotal)
      : null;
    const discount = coupon?.ok ? coupon.discount! : 0;
    return {
      ok: true,
      demo: true,
      orderNumber: `DEMO-${Date.now().toString().slice(-6)}`,
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
    };
  }

  const { data, error } = await db.rpc('create_order', {
    p_name: input.address.fullName,
    p_phone: input.address.phone,
    p_email: input.email ?? null,
    p_governorate: input.address.governorate,
    p_city: input.address.city,
    p_street: input.address.street,
    p_building: input.address.building,
    p_addr_notes: input.address.notes,
    p_items: input.items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
    })),
    p_payment: input.paymentMethod,
    p_coupon: input.couponCode ?? null,
    p_notes: input.notes ?? '',
    p_source: 'web',
  });

  if (error) {
    return { ok: false, error: 'حصلت مشكلة وإحنا بنسجّل الطلب، جرّب تاني' };
  }
  const result = data as Record<string, unknown>;
  if (!result.ok) {
    return { ok: false, error: String(result.error ?? 'مش قادرين نكمّل الطلب') };
  }
  return {
    ok: true,
    orderNumber: String(result.order_number),
    subtotal: Number(result.subtotal),
    shipping: Number(result.shipping),
    discount: Number(result.discount),
    total: Number(result.total),
  };
}

export interface TrackedOrder {
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  governorate: string;
  city: string;
  street: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: { name: string; quantity: number; unitPrice: number; sizeMl: number }[];
  events: { status: OrderStatus; createdAt: string }[];
}

export async function trackOrder(
  orderNumber: string,
  phone: string,
): Promise<{ ok: boolean; order?: TrackedOrder; error?: string }> {
  const db = supabase();
  if (!db) {
    return {
      ok: false,
      error:
        'تتبّع الطلبات بيشتغل بعد ربط قاعدة البيانات — راجع خطوات الإعداد.',
    };
  }

  const { data, error } = await db.rpc('track_order', {
    p_number: orderNumber.trim(),
    p_phone: phone.trim(),
  });
  if (error) return { ok: false, error: 'مش قادرين نجيب الطلب دلوقتي' };

  const result = data as Record<string, unknown>;
  if (!result.ok) {
    return { ok: false, error: String(result.error ?? 'الطلب مش موجود') };
  }
  const o = result.order as Record<string, unknown>;
  return {
    ok: true,
    order: {
      orderNumber: String(o.order_number),
      status: o.status as OrderStatus,
      customerName: String(o.customer_name),
      governorate: String(o.governorate),
      city: String(o.city),
      street: String(o.street),
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      discount: Number(o.discount),
      total: Number(o.total),
      paymentMethod: o.payment_method as PaymentMethod,
      createdAt: String(o.created_at),
      items: (o.items as Record<string, unknown>[]).map((i) => ({
        name: String(i.name),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        sizeMl: Number(i.size_ml),
      })),
      events: (o.events as Record<string, unknown>[]).map((e) => ({
        status: e.status as OrderStatus,
        createdAt: String(e.created_at),
      })),
    },
  };
}
