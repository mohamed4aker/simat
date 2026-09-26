'use server';

import { placeOrder, validateCoupon, type PlaceOrderResult } from '@/lib/store';
import { localizeMessage } from '@/lib/messages-en';
import { getDictionary, hasLocale } from '@/i18n';
import type { PaymentMethod } from '@/lib/types';

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
  items: { productId: string; quantity: number }[];
}

const PHONE = /^01[0125][0-9]{8}$/;

/** بيشيل المسافات والشرط من الرقم ويحوّل الأرقام العربي لإنجليزي. */
function cleanPhone(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/^\+?20/, '0')
    .replace(/[\s-]/g, '')
    .trim();
}

/**
 * بيتنفّذ على السيرفر. الأسعار والشحن والخصم بيتحسبوا في قاعدة
 * البيانات، فحتى لو حد عدّل الطلب من المتصفح مش هيأثر على الحساب.
 */
export async function submitOrder(
  payload: CheckoutPayload,
): Promise<PlaceOrderResult> {
  const lang = hasLocale(payload.lang) ? payload.lang : 'ar';
  const errors = getDictionary(lang).checkout.errors;
  const phone = cleanPhone(payload.phone);
  const altPhone = cleanPhone(payload.altPhone ?? '');

  if (!payload.items?.length) return { ok: false, error: errors.empty };
  if (payload.fullName.trim().length < 3) return { ok: false, error: errors.name };
  if (!PHONE.test(phone)) return { ok: false, error: errors.phone };
  if (altPhone && !PHONE.test(altPhone)) return { ok: false, error: errors.phone };
  if (!payload.governorate || !payload.city.trim() || !payload.street.trim()) {
    return { ok: false, error: errors.address };
  }

  const result = await placeOrder({
    address: {
      fullName: payload.fullName.trim(),
      phone,
      altPhone,
      governorate: payload.governorate,
      city: payload.city.trim(),
      street: payload.street.trim(),
      building: payload.building.trim(),
      notes: payload.addressNotes.trim(),
    },
    email: payload.email.trim() || undefined,
    items: payload.items,
    paymentMethod: payload.paymentMethod === 'card' ? 'card' : 'cod',
    couponCode: payload.couponCode.trim() || undefined,
    notes: payload.notes.trim(),
    isGift: Boolean(payload.isGift),
    giftMessage: payload.isGift ? payload.giftMessage.trim().slice(0, 300) : '',
  });

  return result.ok
    ? result
    : { ...result, error: localizeMessage(result.error, lang) ?? errors.generic };
}

export async function checkCoupon(code: string, subtotal: number, lang: string) {
  const result = await validateCoupon(code, subtotal);
  return {
    ...result,
    error: localizeMessage(result.error, lang),
    label: localizeMessage(result.label, lang),
  };
}
