import type { Dictionary } from '@/i18n';

/** القائمة الرئيسية (نفس الترتيب في الكمبيوتر والموبايل). */
export const navLinks = (nav: Dictionary['nav']) =>
  [
    [nav.home, '/'],
    [nav.shop, '/shop'],
    [nav.story, '/about'],
    [nav.faq, '/faq'],
    [nav.contact, '/contact'],
  ] as const;
