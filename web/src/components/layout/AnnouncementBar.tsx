'use client';

import { Gift } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { priceNumber } from '@/lib/format';

export function AnnouncementBar() {
  const { dict } = useI18n();
  return (
    <aside
      aria-label="Announcement"
      className="bg-bordeaux text-linen-light text-[11px] tracking-wider uppercase py-2.5 px-4 flex items-center justify-center gap-6 text-center"
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <span>{fill(dict.announcement.delivery, { amount: priceNumber(FREE_SHIPPING_THRESHOLD) })}</span>
      </div>
      <span className="hidden md:inline text-white/30">•</span>
      <div className="hidden md:flex items-center gap-2">
        <Gift className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
        <span>{dict.announcement.sample}</span>
      </div>
    </aside>
  );
}
