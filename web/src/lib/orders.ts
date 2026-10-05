/**
 * تسجيل الطلب — نفس الكود بيخدم الموقع (Server Action) والأبلكيشن
 * (POST /api/orders)، وبعد الطلب بتتبعت رسالة واتساب للعميل.
 */
import { after } from 'next/server';
import { getDictionary, hasLocale } from '@/i18n';
import { localizeMessage } from './messages-en';
import { getProductsByIds, placeOrder, type PlaceOrderResult } from './store';
import { sendOrderConfirmation, whatsappEnabled } from './whatsapp';
import { shortName } from './localize';
import type { PaymentMethod } from './types';

export interface CheckoutPayload {
  lang: string;
  fullName: string;
  phone: string;
  altPhone: string;
  email: string;
  governorate: string;
  city: string;
  street: string;
  building: string;
  addressNotes: string;
  notes: string;
  paymentMethod: PaymentMethod;
  couponCode: string;
  isGift: boolean;
  giftMessage: string;
  items: { productId: string; quantity: number; sizeMl?: number }[];
}

const PHONE = /^01[0125][0-9]{8}$/;

/** بيشيل المسافات والشرط من الرقم ويحوّل الأرقام العربي لإنجليزي. */
export function cleanPhone(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/^\+?20/, '0')
    .replace(/[\s-]/g, '')
    .trim();
}

const str = (v: unknown, max = 500) => (typeof v === 'string' ? v : '').slice(0, max);

export async function processOrder(
  raw: Partial<CheckoutPayload>,
  source: 'web' | 'app' = 'web',
): Promise<PlaceOrderResult> {
  const lang = hasLocale(str(raw.lang)) ? (raw.lang as 'ar' | 'en') : 'ar';
  const errors = getDictionary(lang).checkout.errors;
  const phone = cleanPhone(str(raw.phone, 40));
  const altPhone = cleanPhone(str(raw.altPhone, 40));
  const items = Array.isArray(raw.items)
    ? raw.items
        .filter((i) => i && typeof i.productId === 'string')
        .slice(0, 50)
        .map((i) => ({
          productId: i.productId,
          quantity: Math.max(1, Math.min(99, Math.floor(Number(i.quantity) || 1))),
          sizeMl: i.sizeMl ? Number(i.sizeMl) : undefined,
        }))
    : [];
  const fullName = str(raw.fullName, 120).trim();
  const governorate = str(raw.governorate, 60);
  const city = str(raw.city, 120).trim();
  const street = str(raw.street, 300).trim();

  if (!items.length) return { ok: false, error: errors.empty };
  if (fullName.length < 3) return { ok: false, error: errors.name };
  if (!PHONE.test(phone)) return { ok: false, error: errors.phone };
  if (altPhone && !PHONE.test(altPhone)) return { ok: false, error: errors.phone };
  if (!governorate || !city || !street) return { ok: false, error: errors.address };

  const isGift = Boolean(raw.isGift);
  const result = await placeOrder({
    address: {
      fullName,
      phone,
      altPhone,
      governorate,
      city,
      street,
      building: str(raw.building, 100).trim(),
      notes: str(raw.addressNotes, 300).trim(),
    },
    email: str(raw.email, 200).trim() || undefined,
    items,
    paymentMethod: raw.paymentMethod === 'card' ? 'card' : 'cod',
    couponCode: str(raw.couponCode, 40).trim() || undefined,
    notes: str(raw.notes, 500).trim(),
    isGift,
    giftMessage: isGift ? str(raw.giftMessage, 300).trim() : '',
    source,
  });

  if (!result.ok) {
    return { ...result, error: localizeMessage(result.error, lang) ?? errors.generic };
  }

  // رسالة واتساب للعميل — بعد ما الرد يتبعت عشان العميل ميستناش.
  if (!result.demo && whatsappEnabled() && result.orderNumber) {
    const orderNumber = result.orderNumber;
    const total = result.total ?? 0;
    after(async () => {
      const products = await getProductsByIds(items.map((i) => i.productId));
      const summary = items
        .map((i) => {
          const p = products.find((x) => x.id === i.productId);
          if (!p) return null;
          const size = p.kind === 'bottle' && i.sizeMl ? ` ${i.sizeMl}ml` : '';
          return `${shortName(p)}${size} (×${i.quantity})`;
        })
        .filter(Boolean)
        .join('، ');
      await sendOrderConfirmation({
        phone,
        name: fullName,
        orderNumber,
        items: summary,
        total,
        address: [street, city, governorate].filter(Boolean).join('، '),
      });
    });
  }

  return result;
}
