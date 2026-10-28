'use client';

import { createContext, use } from 'react';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES, STORE } from '@/lib/constants';
import type { Bi, ShippingConfig, SiteContact } from '@/lib/site-content';

export interface SiteValue {
  contact: SiteContact;
  shipping: ShippingConfig;
  announcement: Bi;
}

const SiteContext = createContext<SiteValue | null>(null);

/** بيوصّل بيانات التواصل والشحن (من لوحة التحكم) للمكونات اللي في المتصفح. */
export function SiteProvider({ value, children }: { value: SiteValue; children: React.ReactNode }) {
  return <SiteContext value={value}>{children}</SiteContext>;
}

const FALLBACK: SiteValue = {
  contact: { ...STORE },
  shipping: { freeThreshold: FREE_SHIPPING_THRESHOLD, rates: SHIPPING_RATES },
  announcement: { ar: '', en: '' },
};

export function useSite(): SiteValue {
  return use(SiteContext) ?? FALLBACK;
}
