'use server';

import { trackOrder } from '@/lib/store';
import { localizeMessage } from '@/lib/messages-en';
import { getDictionary, hasLocale } from '@/i18n';

export async function lookupOrder(orderNumber: string, phone: string, lang: string) {
  const locale = hasLocale(lang) ? lang : 'ar';
  if (!orderNumber.trim() || !phone.trim()) {
    return { ok: false as const, error: getDictionary(locale).track.missing };
  }
  const result = await trackOrder(orderNumber, phone);
  return { ...result, error: localizeMessage(result.error, locale) };
}
