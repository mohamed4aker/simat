'use server';

import { validateCoupon } from '@/lib/store';
import { localizeMessage } from '@/lib/messages-en';
import { processOrder, type CheckoutPayload } from '@/lib/orders';

export type { CheckoutPayload };

/**
 * بيتنفّذ على السيرفر. الأسعار والشحن والخصم بيتحسبوا في قاعدة
 * البيانات، فحتى لو حد عدّل الطلب من المتصفح مش هيأثر على الحساب.
 */
export async function submitOrder(payload: CheckoutPayload) {
  return processOrder(payload, 'web');
}

export async function checkCoupon(code: string, subtotal: number, lang: string) {
  const result = await validateCoupon(code, subtotal);
  return {
    ...result,
    error: localizeMessage(result.error, lang),
    label: localizeMessage(result.label, lang),
  };
}
