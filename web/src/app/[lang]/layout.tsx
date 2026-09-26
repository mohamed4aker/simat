import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import { storefrontFonts } from '../fonts';
import { dirOf, getDictionary, hasLocale, locales } from '@/i18n';
import { I18nProvider } from '@/i18n/I18nProvider';
import { SITE_URL } from '@/lib/constants';
import { getProducts } from '@/lib/store';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Toaster } from '@/components/ui/Toaster';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.title, template: t.titleTemplate },
    description: t.description,
    keywords: t.keywords,
    alternates: {
      canonical: `/${lang}`,
      languages: { ar: '/ar', en: '/en', 'x-default': '/ar' },
    },
    openGraph: {
      type: 'website',
      locale: lang === 'ar' ? 'ar_EG' : 'en_US',
      siteName: 'SIMAT — سِمة',
      title: t.title,
      description: t.description,
      url: `${SITE_URL}/${lang}`,
    },
    twitter: { card: 'summary_large_image', title: t.title, description: t.description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#58111a',
  width: 'device-width',
  initialScale: 1,
};

export default async function StorefrontLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  // المنتجات بتتبعت للهيدر عشان البحث والمفضلة والـ Mega Menu.
  const products = await getProducts();

  return (
    <html lang={lang} dir={dirOf(lang)} className={storefrontFonts}>
      <body className="min-h-screen flex flex-col font-sans selection:bg-bordeaux">
        <I18nProvider lang={lang} dict={dict}>
          <AnnouncementBar />
          <Header products={products} />
          <main className="flex-1">{children}</main>
          <Footer lang={lang} />
          <CartDrawer />
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
