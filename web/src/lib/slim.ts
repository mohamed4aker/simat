import type { Product } from './types';

/**
 * نسخة خفيفة من المنتج للكروت والبحث والمفضلة: من غير الأوصاف الطويلة
 * (عربي وإنجليزي). المكونات والأسعار والصور زي ما هي. بتصغّر حجم كل
 * صفحة كتير لأن الهيدر والكروت بيستلموا المنتجات كلها.
 */
export function cardProduct(p: Product): Product {
  return {
    ...p,
    description: '',
    descriptionEn: '',
    tagline: '',
    taglineAr: '',
    shortDescription: '',
    shortDescriptionAr: '',
    scentCharacter: '',
    scentCharacterAr: '',
    wearProfile: '',
    wearProfileAr: '',
    occasion: '',
    occasionAr: '',
    related: [],
  };
}
