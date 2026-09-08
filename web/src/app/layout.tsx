import type { Metadata, Viewport } from 'next';
import { Cairo, Playfair_Display } from 'next/font/google';
import './globals.css';

import { CartProvider } from '@/components/cart/CartProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { STORE, SITE_URL } from '@/lib/constants';
import { getCategories } from '@/lib/store';

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${STORE.name} — سِمة | ${STORE.tagline}`,
    template: `%s | ${STORE.name} سِمة`,
  },
  description: STORE.description,
  keywords: [
    'عطور', 'برفانات', 'عطور رجالي', 'عطور حريمي', 'عود',
    'دهن عود', 'ورد طائفي', 'بادي ميست', 'عطور مصر', 'سِمة', 'SIMAT',
  ],
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    siteName: `${STORE.name} — سِمة`,
    title: `${STORE.name} — سِمة | ${STORE.tagline}`,
    description: STORE.description,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${STORE.name} — سِمة`,
    description: STORE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#6b1f2a',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer categories={categories} />
        </CartProvider>
      </body>
    </html>
  );
}
