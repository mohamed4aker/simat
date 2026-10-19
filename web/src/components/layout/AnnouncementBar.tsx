'use client';

import { Truck, Banknote, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n/fill';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { priceNumber } from '@/lib/format';

/** شريط الإعلانات: رسايل بتتحرك بهدوء (وبتقف لما الماوس يقف عليها). */
export function AnnouncementBar() {
  const { dict } = useI18n();
  const t = dict.announcement;
  const messages = [
    { icon: Truck, text: fill(t.delivery, { amount: priceNumber(FREE_SHIPPING_THRESHOLD) }) },
    { icon: Banknote, text: t.cod },
    { icon: Sparkles, text: t.quality },
  ];
  // نسختين ورا بعض عشان الحركة تلف من غير ما يبان فيها قطع.
  const group = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {messages.map(({ icon: Icon, text }) => (
        <span key={text} className="flex items-center gap-2.5 px-10 whitespace-nowrap">
          <Icon className="w-4 h-4 text-gold shrink-0" strokeWidth={1.6} />
          <span>{text}</span>
        </span>
      ))}
    </div>
  );

  return (
    <aside
      aria-label="Announcement"
      className="marquee bg-bordeaux-dark text-linen-light text-[13px] sm:text-sm py-2.5 overflow-hidden"
    >
      <div className="marquee-track flex w-max">
        {group(false)}
        {group(true)}
        {group(true)}
        {group(true)}
      </div>
    </aside>
  );
}
