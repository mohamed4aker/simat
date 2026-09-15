'use server';

import { trackOrder } from '@/lib/store';

export async function lookupOrder(orderNumber: string, phone: string) {
  if (!orderNumber.trim() || !phone.trim()) {
    return { ok: false as const, error: 'اكتب رقم الطلب ورقم الموبايل' };
  }
  return trackOrder(orderNumber, phone);
}
