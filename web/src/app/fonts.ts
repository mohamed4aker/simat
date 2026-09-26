import {
  Cairo,
  Cormorant_Garamond,
  Montserrat,
  Noto_Kufi_Arabic,
  Playfair_Display,
} from 'next/font/google';

// ── خطوط الواجهة (نفس الـ Prototype) ──

export const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const kufi = Noto_Kufi_Arabic({
  variable: '--font-kufi',
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

// ── خطوط لوحة التحكم ──

export const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const storefrontFonts = `${montserrat.variable} ${cormorant.variable} ${kufi.variable}`;
export const adminFonts = `${cairo.variable} ${playfair.variable}`;
