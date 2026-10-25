import type { Dictionary } from '@/i18n';

/** القائمة الرئيسية (نفس الترتيب في الكمبيوتر والموبايل). «تسوق» ليها قائمة منسدلة. */
export const navLinks = (nav: Dictionary['nav']) =>
  [
    [nav.home, '/'],
    [nav.shop, '/shop'],
    [nav.findScent, '/find-your-scent'],
    [nav.story, '/about'],
    [nav.faq, '/faq'],
    [nav.contact, '/contact'],
  ] as const;

/** روابط القائمة المنسدلة بتاعة «تسوق». */
export const shopLinks = (dict: Pick<Dictionary, 'footer' | 'categories'>) =>
  [
    [dict.footer.allProducts, '/shop'],
    [dict.categories.women.title, '/shop?gender=women'],
    [dict.categories.men.title, '/shop?gender=men'],
    [dict.categories.unisex.title, '/shop?gender=unisex'],
  ] as const;
