/**
 * قراية محتوى الموقع وإعدادات الشحن من قاعدة البيانات (للسيرفر بس).
 * من غير Supabase (وضع العرض) بيرجع القيم الافتراضية.
 */
import { cache } from 'react';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from './constants';
import {
  parseSiteContent,
  SITE_CONTENT_KEY,
  type ShippingConfig,
  type SiteContent,
} from './site-content';
import { supabase } from './supabase';

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const db = supabase();
  if (!db) return parseSiteContent(null);
  const { data } = await db
    .from('settings')
    .select('value')
    .eq('key', SITE_CONTENT_KEY)
    .maybeSingle();
  return parseSiteContent(data?.value ?? null);
});

export const getShipping = cache(async (): Promise<ShippingConfig> => {
  const fallback: ShippingConfig = { freeThreshold: FREE_SHIPPING_THRESHOLD, rates: { ...SHIPPING_RATES } };
  const db = supabase();
  if (!db) return fallback;
  const [rates, free] = await Promise.all([
    db.from('shipping_rates').select('governorate, price'),
    db.from('settings').select('value').eq('key', 'free_shipping_threshold').maybeSingle(),
  ]);
  const out: ShippingConfig = { ...fallback, rates: { ...fallback.rates } };
  for (const r of rates.data ?? []) out.rates[String(r.governorate)] = Number(r.price);
  const threshold = Number(free.data?.value);
  if (free.data && Number.isFinite(threshold)) out.freeThreshold = threshold;
  return out;
});
