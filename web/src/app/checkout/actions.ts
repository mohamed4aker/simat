'use server';

import { placeOrder, validateCoupon, type PlaceOrderResult } from '@/lib/store';
import type { PaymentMethod } from '@/lib/types';

export interface CheckoutPayload {
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  street: string;
  building: string;
  addressNotes: string;
  notes: string;
  paymentMethod: PaymentMethod;
  couponCode: string;
  items: { productId: string; quantity: number }[];
}

/**
 * بيتنفّذ على السيرفر. الأسعار والشحن والخصم بيتحسبوا في قاعدة
 * البيانات، فحتى لو حد عدّل الطلب من المتصفح مش هيأثر على الحساب.
 */
export async function submitOrder(
  payload: CheckoutPayload,
): Promise<PlaceOrderResult> {
  if (!payload.items?.length) {
    return { ok: false, error: 'العربة فاضية' };
  }
  if (!/^01[0125][0-9]{8}$/.test(payload.phone.trim())) {
    return { ok: false, error: 'رقم موبايل غير صحيح (مثال: 01012345678)' };
  }
  if (payload.fullName.trim().length < 3) {
    return { ok: false, error: 'اكتب اسمك بالكامل' };
  }
  if (!payload.governorate || !payload.city.trim() || !payload.street.trim()) {
    return { ok: false, error: 'اكمل بيانات العنوان' };
  }

  return placeOrder({
    address: {
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      governorate: payload.governorate,
      city: payload.city.trim(),
      street: payload.street.trim(),
      building: payload.building.trim(),
      notes: payload.addressNotes.trim(),
    },
    email: payload.email.trim() || undefined,
    items: payload.items,
    paymentMethod: payload.paymentMethod,
    couponCode: payload.couponCode.trim() || undefined,
    notes: payload.notes.trim(),
  });
}

export async function checkCoupon(code: string, subtotal: number) {
  return validateCoupon(code, subtotal);
}
