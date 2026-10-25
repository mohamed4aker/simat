'use client';

import { Truck } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n/fill';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { priceNumber } from '@/lib/format';

/** شريط الإعلانات: جملة الشحن المجاني بس (طلب العميلة). */
export function AnnouncementBar() {
  const { dict } = useI18n();
  return (
    <aside
      aria-label="Announcement"
      className="bg-bordeaux-dark text-linen-light text-[13px] sm:text-sm py-2.5 px-4 flex items-center justify-center gap-2.5 text-center"
    >
      <Truck className="w-4 h-4 text-gold shrink-0" strokeWidth={1.6} />
      <span>{fill(dict.announcement.delivery, { amount: priceNumber(FREE_SHIPPING_THRESHOLD) })}</span>
    </aside>
  );
}
