import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { adminFonts } from '../fonts';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'لوحة التحكم', template: '%s | سِمة' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#6b1f2a',
  width: 'device-width',
  initialScale: 1,
};

/** لوحة التحكم ليها layout مستقل — عربي دايماً وبخطوطها القديمة. */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${adminFonts} h-full`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        {children}
      </body>
    </html>
  );
}
