'use client';

import { Truck } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n/fill';
import { priceNumber } from '@/lib/format';
import { pick } from '@/lib/site-content';
import { useSite } from '@/components/site/SiteProvider';

/** شريط الإعلانات: جملة الشحن المجاني (بتتعدل من لوحة التحكم ← تصميم الموقع). */
export function AnnouncementBar() {
  const { lang, dict } = useI18n();
  const { announcement, shipping } = useSite();
  const text = pick(announcement, lang) || dict.announcement.delivery;
  if (!text.trim()) return null;
  return (
    <aside
      aria-label="Announcement"
      className="bg-bordeaux-dark text-linen-light text-[13px] sm:text-sm py-2.5 px-4 flex items-center justify-center gap-2.5 text-center"
    >
      <Truck className="w-4 h-4 text-gold shrink-0" strokeWidth={1.6} />
      <span>{fill(text, { amount: priceNumber(shipping.freeThreshold) })}</span>
    </aside>
  );
}
