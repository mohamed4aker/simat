/**
 * التتبع عن طريق Google Tag Manager.
 *
 * الموقع بيبعت أحداث GA4 الجاهزة على dataLayer، والعميل بيربطها من GTM
 * بأي منصة (Google Analytics، Meta Pixel، TikTok …) من غير ما الكود يتغير:
 *   view_item · add_to_cart · begin_checkout · purchase
 */
import { priceFor } from './pricing';
import type { CartLine, Product } from './types';

/** كود الـ GTM بتاع العميل. */
export const GTM_ID = 'GTM-KLF7JVKW';

export const CURRENCY = 'EGP';

export interface TrackItem {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price: number;
  quantity: number;
}

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

function push(event: string, ecommerce: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  // GTM بيدمج الـ ecommerce القديم مع الجديد لو متمسحش الأول.
  w.dataLayer.push({ ecommerce: null });
  w.dataLayer.push({ event, ecommerce });
}

export const productItem = (p: Product, sizeMl: number, quantity = 1): TrackItem => ({
  item_id: p.id,
  item_name: p.nameEn || p.name,
  item_variant: `${sizeMl} ml`,
  price: priceFor(p, sizeMl),
  quantity,
});

export const lineItem = (l: CartLine): TrackItem => ({
  item_id: l.productId,
  item_name: l.nameEn || l.name,
  item_variant: `${l.sizeMl} ml`,
  price: l.price,
  quantity: l.quantity,
});

const valueOf = (items: TrackItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export function trackViewItem(item: TrackItem) {
  push('view_item', { currency: CURRENCY, value: item.price, items: [item] });
}

export function trackAddToCart(item: TrackItem) {
  push('add_to_cart', { currency: CURRENCY, value: valueOf([item]), items: [item] });
}

export function trackBeginCheckout(items: TrackItem[]) {
  push('begin_checkout', { currency: CURRENCY, value: valueOf(items), items });
}

export function trackPurchase(order: {
  transactionId: string;
  value: number;
  shipping: number;
  coupon?: string;
  items: TrackItem[];
}) {
  push('purchase', {
    transaction_id: order.transactionId,
    currency: CURRENCY,
    value: order.value,
    shipping: order.shipping,
    ...(order.coupon ? { coupon: order.coupon } : {}),
    items: order.items,
  });
}
